-- プッシュ通知の購読情報テーブル
create table public.push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null,
  subscription jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "自分の購読情報だけ参照できる" on public.push_subscriptions
  for select using (auth.uid() = user_id);
create policy "自分の購読情報だけ作成できる" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);
create policy "自分の購読情報だけ削除できる" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

-- habitsテーブルにリマインダー時刻カラムを追加
alter table public.habits add column if not exists reminder_time text;
-- reminder_time は "HH:MM" 形式（例: "08:00"）、nullは通知なし
