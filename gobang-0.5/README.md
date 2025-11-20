# Gobang Online 0.5 (MVP)

This is a simplified "Lobby" version of Gobang Online. No registration required.

## Setup Instructions

### 1. Prerequisites
- Node.js installed.
- A [Supabase](https://supabase.com/) account.

### 2. Supabase Setup
1.  Create a new project in Supabase.
2.  Go to the **SQL Editor** in your Supabase dashboard.
3.  Copy the content of `supabase-schema.sql` (in this folder) and run it.
    - This creates the `rooms` table and initializes the `public-lobby`.

### 3. Environment Configuration
1.  Copy `env.local.template` to a new file named `.env.local` in the **project root** (`/Users/yeahke/Desktop/gobang-online/.env.local`).
    ```bash
    cp gobang-0.5/env.local.template .env.local
    ```
2.  Fill in your Supabase credentials in `.env.local`:
    - `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings -> API.
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings -> API.

### 4. Run the Game
1.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npm run dev
    ```
3.  Open [http://localhost:3000](http://localhost:3000).
4.  Enter a nickname and join the lobby!

## Features
- **Public Lobby**: Everyone joins the same room.
- **Spectator Mode**: The first 4 players sit down (X, O, #, @). Others watch.
- **Real-time Sync**: Moves are broadcasted instantly via Supabase Realtime.
