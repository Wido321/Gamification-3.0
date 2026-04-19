Gamification 2.0 — PROJECT.md

    Overview

        Gamified educational web app (RPG-style) for math oral exams.
        Stack: Next.js, React, Tailwind CSS, Supabase (Auth + PostgreSQL), deployed on Vercel.

    Core Systems

        Student Selection (3D Dice)

            Built with React Three Fiber
            Uses Weighted Randomness (“Fair Play”):
                increase weight if a student has not been selected recently
                increase weight if performance is low
                ensures fair and balanced distribution

            Evaluation Flow

            Teacher inputs: difficulty + outcome
            Backend computes XP → updates rank → logs history

        Progression System

            XP → Rank → Unlocks (shop/avatar)
            All calculations handled server-side

        Gamification Layer

            Weekly missions
            Shop + persistent inventory
            Power-ups:
                Athena Shield: retry a wrong answer
                Seer Lens: preview question topic
                Charisma Potion: bonus XP

        Data & State

            DB tables: users, responses, dice_history, missions, inventory
            Triggers: XP, rank, consistency
            RLS: role-based access control
            Client state: Zustand / TanStack Query (synced with Supabase)

    UI/UX
        Cyber dark gamified interface (glassmorphism, neon accents, real-time feedback,Modern Gradient Wave Background)

    Goal
        Consistent system where every action updates global state (XP, rank, history) in real time, ensuring fairness, engagement, and scalability.
