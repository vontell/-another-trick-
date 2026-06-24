-- Cryptic Maze — global stats schema (Supabase / Postgres)
-- ===========================================================================
-- Aggregate-only: no accounts, no per-user rows, no IP/device columns. The web
-- client (anon key) can ONLY call the security-definer RPCs below; it has no
-- direct read/write access to the tables. That keeps the anon key safe to ship
-- in a public static build while still allowing anonymous counter bumps.
--
-- Apply with: supabase db execute < supabase/schema.sql
-- (or paste into the Supabase SQL editor).

-- --- tables ----------------------------------------------------------------

create table if not exists public.puzzle_counters (
  puzzle_id   text primary key,
  played      bigint not null default 0,
  maze_solved bigint not null default 0,
  meta_solved bigint not null default 0
);

create table if not exists public.puzzle_runs (
  id         bigint generated always as identity primary key,
  puzzle_id  text   not null,
  maze_ms    integer not null,
  meta_ms    integer not null,
  mistakes   integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists puzzle_runs_puzzle_idx on public.puzzle_runs (puzzle_id);

-- Lock the tables down: RLS on, and NO policies => the anon role cannot select,
-- insert, update or delete directly. Access happens only through the RPCs,
-- which run as the table owner (security definer).
alter table public.puzzle_counters enable row level security;
alter table public.puzzle_runs     enable row level security;

-- --- write RPCs ------------------------------------------------------------

create or replace function public.record_played(p_puzzle text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.puzzle_counters (puzzle_id, played)
  values (p_puzzle, 1)
  on conflict (puzzle_id) do update set played = puzzle_counters.played + 1;
$$;

create or replace function public.record_maze_solved(p_puzzle text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.puzzle_counters (puzzle_id, maze_solved)
  values (p_puzzle, 1)
  on conflict (puzzle_id) do update set maze_solved = puzzle_counters.maze_solved + 1;
$$;

create or replace function public.record_meta_solved(
  p_puzzle   text,
  p_maze_ms  integer,
  p_meta_ms  integer,
  p_mistakes integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.puzzle_counters (puzzle_id, meta_solved)
  values (p_puzzle, 1)
  on conflict (puzzle_id) do update set meta_solved = puzzle_counters.meta_solved + 1;

  -- Basic sanity bounds so a bad client can't poison the histogram.
  if p_maze_ms between 0 and 86400000 and p_meta_ms between 0 and 86400000 then
    insert into public.puzzle_runs (puzzle_id, maze_ms, meta_ms, mistakes)
    values (p_puzzle, p_maze_ms, p_meta_ms, greatest(0, coalesce(p_mistakes, 0)));
  end if;
end;
$$;

-- --- read RPC --------------------------------------------------------------
-- Returns counters plus 30-second-bucketed histograms for maze and meta times.

create or replace function public.get_puzzle_stats(p_puzzle text)
returns json
language sql
security definer
set search_path = public
as $$
  with c as (
    select played, maze_solved, meta_solved
    from public.puzzle_counters
    where puzzle_id = p_puzzle
  ),
  maze as (
    select (floor(maze_ms / 30000) * 30)::int as start, count(*)::int as count
    from public.puzzle_runs
    where puzzle_id = p_puzzle
    group by 1 order by 1
  ),
  meta as (
    select (floor(meta_ms / 30000) * 30)::int as start, count(*)::int as count
    from public.puzzle_runs
    where puzzle_id = p_puzzle
    group by 1 order by 1
  )
  select json_build_object(
    'played',        coalesce((select played from c), 0),
    'maze_solved',   coalesce((select maze_solved from c), 0),
    'meta_solved',   coalesce((select meta_solved from c), 0),
    'bucket_seconds', 30,
    'maze_buckets',  coalesce((select json_agg(maze) from maze), '[]'::json),
    'meta_buckets',  coalesce((select json_agg(meta) from meta), '[]'::json)
  );
$$;

-- --- grants ----------------------------------------------------------------
-- Allow the public web client (anon) and logged-in users to call the RPCs only.

revoke all on function public.record_played(text)                       from public;
revoke all on function public.record_maze_solved(text)                  from public;
revoke all on function public.record_meta_solved(text, integer, integer, integer) from public;
revoke all on function public.get_puzzle_stats(text)                    from public;

grant execute on function public.record_played(text)                       to anon, authenticated;
grant execute on function public.record_maze_solved(text)                  to anon, authenticated;
grant execute on function public.record_meta_solved(text, integer, integer, integer) to anon, authenticated;
grant execute on function public.get_puzzle_stats(text)                    to anon, authenticated;
