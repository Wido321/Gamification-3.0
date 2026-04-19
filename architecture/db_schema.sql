-- =============================================================================
-- GAMIFICATION 3.0 — SECURE DATABASE SCHEMA
-- B.L.A.S.T Phase 3: Architect
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- Clean slate (idempotent) — comment out if updating, not creating fresh
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS
-- =============================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('teacher', 'student', 'dev');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_level AS ENUM ('easy', 'normal', 'hard');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE performance_result AS ENUM ('wrong', 'partial', 'correct', 'excellent');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- TABLES
-- =============================================================================

-- Link auth.users to our public profiles
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            user_role   NOT NULL DEFAULT 'student',
  full_name       TEXT        NOT NULL DEFAULT '',
  xp              INTEGER     NOT NULL DEFAULT 0 CHECK (xp >= 0),
  aura_points     INTEGER     NOT NULL DEFAULT 0 CHECK (aura_points >= 0),
  rank            TEXT        NOT NULL DEFAULT 'Novice',
  selection_weight FLOAT      NOT NULL DEFAULT 1.0 CHECK (selection_weight > 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Evaluation responses (XP source of truth)
CREATE TABLE IF NOT EXISTS public.responses (
  id               UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       UUID               NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  difficulty       difficulty_level   NOT NULL,
  result           performance_result NOT NULL,
  evaluation_score INTEGER            NOT NULL CHECK (evaluation_score >= 0 AND evaluation_score <= 100),
  xp_awarded       INTEGER            NOT NULL CHECK (xp_awarded >= 0),
  aura_awarded     INTEGER            NOT NULL DEFAULT 0,
  feedback         TEXT,
  created_at       TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- Dice selection history
CREATE TABLE IF NOT EXISTS public.dice_history (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id   UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  dice_result  INTEGER     NOT NULL CHECK (dice_result >= 1 AND dice_result <= 20),
  action_type  TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Weekly missions
CREATE TABLE IF NOT EXISTS public.missions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT        NOT NULL,
  description  TEXT,
  reward_xp    INTEGER     NOT NULL CHECK (reward_xp > 0),
  requirements JSONB,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ
);

-- Student inventory (power-ups, rewards)
CREATE TABLE IF NOT EXISTS public.inventory (
  id          UUID    PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id  UUID    NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id     TEXT    NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  UNIQUE (student_id, item_id)
);

-- =============================================================================
-- CORE FUNCTION: compute_rank
-- Returns the rank string for a given XP total.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.compute_rank(p_xp INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN CASE
    WHEN p_xp >= 500 THEN 'Master'
    WHEN p_xp >= 350 THEN 'Expert'
    WHEN p_xp >= 220 THEN 'Scholar'
    WHEN p_xp >= 120 THEN 'Student'
    WHEN p_xp >= 50  THEN 'Apprentice'
    ELSE 'Novice'
  END;
END;
$$;

-- =============================================================================
-- CORE FUNCTION: compute_xp
-- Pure XP calculator — difficulty × performance multiplier.
-- Called server-side, never directly from client.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.compute_xp(
  p_difficulty difficulty_level,
  p_result     performance_result
)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE SECURITY DEFINER
AS $$
DECLARE
  v_base        INTEGER;
  v_multiplier  NUMERIC;
BEGIN
  v_base := CASE p_difficulty
    WHEN 'easy'   THEN 10
    WHEN 'normal' THEN 20
    WHEN 'hard'   THEN 35
  END;

  v_multiplier := CASE p_result
    WHEN 'wrong'     THEN 0.0
    WHEN 'partial'   THEN 0.5
    WHEN 'correct'   THEN 1.0
    WHEN 'excellent' THEN 1.25
  END;

  RETURN FLOOR(v_base * v_multiplier)::INTEGER;
END;
$$;

-- =============================================================================
-- CORE FUNCTION: award_xp (the heart of game security)
-- SECURITY DEFINER = runs as the DB owner, bypassing RLS.
-- This is the ONLY way XP can be added. No client can call UPDATE on xp directly.
-- =============================================================================
CREATE OR REPLACE FUNCTION public.award_xp(
  p_student_id   UUID,
  p_difficulty   difficulty_level,
  p_result       performance_result,
  p_feedback     TEXT DEFAULT NULL,
  p_score        INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_gained    INTEGER;
  v_aura_gained  INTEGER;
  v_new_xp       INTEGER;
  v_new_aura     INTEGER;
  v_old_rank     TEXT;
  v_new_rank     TEXT;
  v_ranked_up    BOOLEAN := FALSE;
  v_response_id  UUID;
BEGIN
  -- 1. Compute XP
  v_xp_gained   := public.compute_xp(p_difficulty, p_result);
  v_aura_gained := FLOOR(v_xp_gained * 0.3)::INTEGER;

  -- 2. Lock the student row to prevent concurrent manipulation
  SELECT xp, aura_points, rank INTO STRICT v_new_xp, v_new_aura, v_old_rank
  FROM public.users
  WHERE id = p_student_id
  FOR UPDATE;

  -- 3. Update totals
  v_new_xp   := v_new_xp + v_xp_gained;
  v_new_aura := v_new_aura + v_aura_gained;
  v_new_rank := public.compute_rank(v_new_xp);

  IF v_new_rank IS DISTINCT FROM v_old_rank THEN
    v_ranked_up := TRUE;
  END IF;

  -- 4. Apply changes atomically
  UPDATE public.users SET
    xp              = v_new_xp,
    aura_points     = v_new_aura,
    rank            = v_new_rank,
    -- Lower selection weight when XP gained (they just got selected)
    selection_weight = GREATEST(0.1, selection_weight - 0.15)
  WHERE id = p_student_id;

  -- 5. Log the evaluation
  INSERT INTO public.responses (
    student_id, difficulty, result, evaluation_score,
    xp_awarded, aura_awarded, feedback
  ) VALUES (
    p_student_id, p_difficulty, p_result, COALESCE(p_score, 0),
    v_xp_gained, v_aura_gained, p_feedback
  ) RETURNING id INTO v_response_id;

  -- 6. Return the outcome
  RETURN jsonb_build_object(
    'response_id',  v_response_id,
    'xp_gained',    v_xp_gained,
    'aura_gained',  v_aura_gained,
    'new_xp',       v_new_xp,
    'new_rank',     v_new_rank,
    'ranked_up',    v_ranked_up,
    'old_rank',     v_old_rank
  );
END;
$$;

-- =============================================================================
-- TRIGGER: on new auth signup, create a public profile automatically
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Student'),
    'student'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- TRIGGER: update selection_weight after a dice roll (increase for unselected)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.update_weights_after_dice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Increase weight for ALL students NOT selected (fairness redistribution)
  UPDATE public.users
  SET selection_weight = LEAST(5.0, selection_weight + 0.1)
  WHERE id != NEW.student_id AND role = 'student';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_dice_rolled ON public.dice_history;
CREATE TRIGGER on_dice_rolled
  AFTER INSERT ON public.dice_history
  FOR EACH ROW EXECUTE FUNCTION public.update_weights_after_dice();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- The "force-field" around every table cell.
-- =============================================================================
ALTER TABLE public.users        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory    ENABLE ROW LEVEL SECURITY;

-- ── users ────────────────────────────────────────────────────────────────────
-- Students: read own row only. CANNOT write to this table via RLS (only triggers/functions can)
CREATE POLICY "students_read_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Teachers: read ALL student rows
CREATE POLICY "teachers_read_all" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('teacher', 'dev')
    )
  );

-- ── responses ────────────────────────────────────────────────────────────────
-- Students: read own responses
CREATE POLICY "students_read_own_responses" ON public.responses
  FOR SELECT USING (student_id = auth.uid());

-- Teachers: read all responses
CREATE POLICY "teachers_read_all_responses" ON public.responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('teacher', 'dev')
    )
  );

-- ── dice_history ─────────────────────────────────────────────────────────────
CREATE POLICY "students_read_own_dice" ON public.dice_history
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "teachers_read_all_dice" ON public.dice_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('teacher', 'dev')
    )
  );

CREATE POLICY "teachers_insert_dice" ON public.dice_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('teacher', 'dev')
    )
  );

-- ── missions ─────────────────────────────────────────────────────────────────
-- All authenticated users can read active missions
CREATE POLICY "all_read_active_missions" ON public.missions
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = TRUE);

-- ── inventory ────────────────────────────────────────────────────────────────
CREATE POLICY "students_read_own_inventory" ON public.inventory
  FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "teachers_read_all_inventory" ON public.inventory
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('teacher', 'dev')
    )
  );

-- =============================================================================
-- GRANT: allow the backend to call the award_xp and dice functions
-- =============================================================================
GRANT EXECUTE ON FUNCTION public.award_xp TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_xp TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_rank TO authenticated;
