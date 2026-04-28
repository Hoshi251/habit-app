alter table public.character_stats
  add column current_type_key  text        default null,
  add column current_type_name text        default null,
  add column type_updated_at   timestamptz default null;
