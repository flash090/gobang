# Gobang Online Implementation Proposal

## Goal Description
Migrate the existing Python-based Gobang game (supporting 1-4 players, custom board sizes, and AI) to a web-based application using **Next.js (TypeScript)** and **Supabase**. The goal is to enable simple online multiplayer functionality for a small group of people while preserving the unique game rules (e.g., 3-4 player restricted zones).

## Feasibility Analysis
**Status: Highly Feasible**
- **Logic Migration**: The Python logic (`Gobang` class) is purely algorithmic (state management, win checking, heuristics). This translates 1:1 to TypeScript classes/functions without external dependencies.
- **Tech Stack Fit**: 
    - **Next.js**: Excellent for hosting the UI and API routes.
    - **Supabase Realtime**: Perfect for "simple online play". It allows clients to subscribe to database changes (moves) instantly, avoiding the complexity of a custom WebSocket server.
    - **TypeScript**: Strong typing will help manage the complex state of 3-4 player boards and restricted zones better than dynamic Python.

## Proposed Architecture

### 1. Directory Structure
```
gobang-0.5/
  app/
    game/
      [id]/           # Game room page
        page.tsx      # Main game UI
        GameCanvas.tsx # Canvas/Grid component for board
        PlayerList.tsx # Sidebar with player info/turn indicator
  lib/
    game/
      engine.ts       # Core Game Logic (Ported from Python)
      ai.ts           # AI Logic (MinMax/Heuristics)
      types.ts        # Shared types (Player, Board, Move)
    supabase/
      client.ts       # Supabase client
      hooks.ts        # Custom hooks for realtime subscription
```

## MVP Goal: "Online Study Room" Style
**Simple, fast, no-login.**
1.  **Enter Nickname**: User visits site, types name.
2.  **Auto-Join**: Automatically connects to a global "Lobby" room.
3.  **Play**: First 4 people sit down. Others watch.

## Revised Architecture

### 1. Directory Structure (gobang-0.5)
```
gobang-0.5/
  app/
    page.tsx          # Main entry: Nickname input -> Game Lobby
    components/
      Lobby.tsx       # Handles Supabase connection & Game state
      Board.tsx       # The board UI (already done)
      PlayerList.tsx  # Shows who is X, O, etc.
  lib/
    game/
      engine.ts       # Core Logic (Done)
    supabase/
      client.ts       # Supabase client
```

### 2. Data Model (Supabase)
We only need **ONE** row in a `rooms` table for the MVP (ID: `public-lobby`).
-   `id`: `public-lobby`
-   `players`: JSON Array `[{ name: "Alice", symbol: "X", id: "socket_id" }, ...]`
-   `board_state`: JSON 2D Array
-   `current_turn_index`: number
-   `last_move`: JSON object

### 3. Development Roadmap (MVP)

#### Phase 1: Core Logic (Done)
- [x] Game Engine & Types

#### Phase 2: Supabase Setup
- [ ] Create `rooms` table in Supabase (SQL Editor).
- [ ] Insert initial `public-lobby` row.
- [ ] Set up `lib/supabase/client.ts`.

#### Phase 3: The Lobby UI
- [ ] Create `Lobby` component.
    -   Fetch initial state from `public-lobby`.
    -   Subscribe to Realtime changes (broadcast moves, presence).
    -   Handle "Sit Down" (update `players` array).
- [ ] Integrate `Board` component with Realtime data.

