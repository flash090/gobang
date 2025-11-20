-- Create the rooms table
create table public.rooms (
  id text primary key,
  players jsonb default '[]'::jsonb,
  board_state jsonb,
  current_turn_index integer default 0,
  config jsonb,
  last_move jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Realtime
alter publication supabase_realtime add table public.rooms;

-- Insert the public lobby
insert into public.rooms (id, players, board_state, config)
values (
  'public-lobby',
  '[]'::jsonb,
  '[]'::jsonb, -- Will be initialized by the first client or manually
  '{"size": 15, "players": 4, "winCondition": 5}'::jsonb
)
on conflict (id) do nothing;

-- Policy to allow anyone to read/update (for MVP simplicity)
alter table public.rooms enable row level security;

create policy "Public Access"
on public.rooms
for all
using (true)
with check (true);
