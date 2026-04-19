# Findings

## Research
- Goal is a gamification framework for a classroom environment.
- Spline 3D is needed for interactive elements, specifically throwing dice.
- Stitch MCP to be used for scaffolding aesthetic, modern React UI.

## Discoveries
- **Server Authority Required:** Must use server-side triggers for `xp` computation. Avoid calculating total XP purely on the frontend to prevent cheating.
- **Fairness First:** Need a weighted calculation algorithm running directly on Supabase (RPC function) to fairly pick students without spamming the same individual.

## Constraints
- Supabase requires Row Level Security (RLS) ensuring students can only view their own stats, while teachers can interact with everybody.
- Real-time Subscriptions require Supabase Websockets to be enabled for `users`, `responses`, and `dice_history`.
