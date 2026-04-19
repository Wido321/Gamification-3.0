-- Architecture/SOP for B.L.A.S.T Protocol: Database Schema
-- Deploy this script in your Supabase SQL Editor.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
CREATE TYPE user_role AS ENUM ('teacher', 'student', 'dev');

-- Table: users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    full_name TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    rank TEXT NOT NULL DEFAULT 'Novice',
    selection_weight FLOAT NOT NULL DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: responses
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    evaluation_score INTEGER CHECK (evaluation_score >= 0 AND evaluation_score <= 100),
    xp_awarded INTEGER NOT NULL,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: dice_history
CREATE TABLE dice_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    dice_result INTEGER CHECK (dice_result >= 1 AND dice_result <= 20),
    action_type TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: missions
CREATE TABLE missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    reward_xp INTEGER NOT NULL,
    requirements JSONB
);

-- Table: inventory
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
);

--------------------------------------------------------------------------------
-- Anti-Exploit Row Level Security (RLS)
--------------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE dice_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- (Placeholder for actual strict RLS policies - ensuring students only read/write their own info, teachers read/write all)
