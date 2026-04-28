-- habitsテーブルにカテゴリーカラムを追加
alter table public.habits
  add column category text
    check (category in ('energy','focus','calm','recovery','social'))
    default null;

-- キャラクターステータステーブル
create table public.character_stats (
  user_id      uuid primary key references public.profiles(id) on delete cascade,
  energy       numeric not null default 0 check (energy >= 0),
  focus        numeric not null default 0 check (focus >= 0),
  calm         numeric not null default 0 check (calm >= 0),
  recovery     numeric not null default 0 check (recovery >= 0),
  social       numeric not null default 0 check (social >= 0),
  warmth       numeric not null default 50 check (warmth >= 0),
  last_updated date not null default current_date
);

alter table public.character_stats enable row level security;

create policy "自分のキャラクターだけ見られる" on public.character_stats
  for select using (auth.uid() = user_id);
create policy "自分のキャラクターだけ作成できる" on public.character_stats
  for insert with check (auth.uid() = user_id);
create policy "自分のキャラクターだけ更新できる" on public.character_stats
  for update using (auth.uid() = user_id);

-- 既存ユーザーへのバックフィル
insert into public.character_stats (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- 新規ユーザー自動作成トリガーを更新（character_statsも同時作成）
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
    values (new.id, split_part(new.email, '@', 1));
  insert into public.character_stats (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;
