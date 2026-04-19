# Project Constitution

## Data Schemas

### 1. User (`users`)
```json
{
  "id": "uuid",
  "role": "ENUM('teacher', 'student', 'dev')",
  "full_name": "string",
  "xp": "integer (default: 0)",
  "rank": "string",
  "selection_weight": "float (default: 1.0)",
  "created_at": "timestamp"
}
```

### 2. Response (`responses`)
```json
{
  "id": "uuid",
  "student_id": "uuid (ref: users.id)",
  "evaluation_score": "integer (0-100)",
  "xp_awarded": "integer",
  "feedback": "string",
  "created_at": "timestamp"
}
```

### 3. Dice History (`dice_history`)
```json
{
  "id": "uuid",
  "student_id": "uuid (ref: users.id)",
  "dice_result": "integer",
  "action_type": "string",
  "created_at": "timestamp"
}
```

### 4. Mission (`missions`)
```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "reward_xp": "integer",
  "requirements": "jsonb"
}
```

### 5. Inventory (`inventory`)
```json
{
  "id": "uuid",
  "student_id": "uuid (ref: users.id)",
  "item_id": "string",
  "quantity": "integer"
}
```

## Behavioral Rules
- **Fairness-First:** Weighted Randomness prevents repeated selections.
- **Server Authority:** XP, rank, rewards computed server-side only via Supabase triggers/functions.
- **Atomic Updates:** Every action updates XP, rank, and history consistently.
- **Anti-Exploit:** Prevent duplicate rewards and power-up abuse.
- **Real-Time Feedback:** UI must reflect state instantly.
- **DO NOT:** Allow client-side manipulation of core systems.

## Architectural Invariants
- 3-Layer A.N.T. Architecture (Architecture, Navigation, Tools).
- Database: Supabase PostgreSQL (Source of Truth).
- Frontend/API: Next.js + Tailwind CSS / Vanilla CSS + Spline integration.
- UI Design: Stitch for prototyping / component structuring.
- Delivery Payload: Web dashboards for Teacher/Student via JSON REST/GraphQL over Real-time subscriptions.

## Maintenance Log
*(To be populated in Phase 5: Trigger)*
