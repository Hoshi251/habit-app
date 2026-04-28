-- プロファイルテーブル（Supabaseのauth.usersと連携）
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- 習慣テーブル
create table public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  icon text default '✅',
  color text default '#6366f1',
  frequency text check (frequency in ('daily', 'weekly')) default 'daily',
  target_days integer[] default '{}',
  is_public boolean default false,
  created_at timestamptz default now()
);

-- 習慣ログテーブル
create table public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  logged_at date not null default current_date,
  note text,
  created_at timestamptz default now(),
  unique(habit_id, user_id, logged_at)
);

-- グループテーブル
create table public.groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_by uuid references public.profiles(id) on delete cascade not null,
  invite_code text unique default substring(md5(random()::text), 1, 8),
  created_at timestamptz default now()
);

-- グループメンバーテーブル
create table public.group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'member')) default 'member',
  joined_at timestamptz default now(),
  unique(group_id, user_id)
);

-- グループ習慣テーブル（グループに共有された習慣）
create table public.group_habits (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references public.groups(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(group_id, habit_id)
);

-- リアクションテーブル（習慣ログへの応援）
create table public.reactions (
  id uuid default gen_random_uuid() primary key,
  habit_log_id uuid references public.habit_logs(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  emoji text not null default '👍',
  created_at timestamptz default now(),
  unique(habit_log_id, user_id, emoji)
);

-- RLS（Row Level Security）を有効化
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_habits enable row level security;
alter table public.reactions enable row level security;

-- プロファイルのRLSポリシー
create policy "プロファイルは誰でも見られる" on public.profiles for select using (true);
create policy "自分のプロファイルだけ更新できる" on public.profiles for update using (auth.uid() = id);
create policy "サインアップ時にプロファイル作成" on public.profiles for insert with check (auth.uid() = id);

-- 習慣のRLSポリシー
create policy "自分の習慣は見られる" on public.habits for select using (auth.uid() = user_id);
create policy "公開習慣は誰でも見られる" on public.habits for select using (is_public = true);
create policy "自分の習慣だけ作成できる" on public.habits for insert with check (auth.uid() = user_id);
create policy "自分の習慣だけ更新できる" on public.habits for update using (auth.uid() = user_id);
create policy "自分の習慣だけ削除できる" on public.habits for delete using (auth.uid() = user_id);

-- 習慣ログのRLSポリシー
create policy "自分のログは見られる" on public.habit_logs for select using (auth.uid() = user_id);
create policy "自分のログだけ作成できる" on public.habit_logs for insert with check (auth.uid() = user_id);
create policy "自分のログだけ削除できる" on public.habit_logs for delete using (auth.uid() = user_id);

-- グループのRLSポリシー
create policy "グループは誰でも見られる" on public.groups for select using (true);
create policy "ログイン済みユーザーはグループ作成できる" on public.groups for insert with check (auth.uid() = created_by);
create policy "オーナーだけグループ更新できる" on public.groups for update using (auth.uid() = created_by);

-- グループメンバーのRLSポリシー
create policy "グループメンバーは見られる" on public.group_members for select using (true);
create policy "自分がグループに参加できる" on public.group_members for insert with check (auth.uid() = user_id);
create policy "自分だけグループから退出できる" on public.group_members for delete using (auth.uid() = user_id);

-- グループ習慣のRLSポリシー
create policy "グループ習慣は誰でも見られる" on public.group_habits for select using (true);
create policy "グループメンバーが習慣を共有できる" on public.group_habits for insert with check (
  exists (select 1 from public.group_members where group_id = group_habits.group_id and user_id = auth.uid())
);

-- リアクションのRLSポリシー
create policy "リアクションは誰でも見られる" on public.reactions for select using (true);
create policy "自分のリアクションだけ作成できる" on public.reactions for insert with check (auth.uid() = user_id);
create policy "自分のリアクションだけ削除できる" on public.reactions for delete using (auth.uid() = user_id);

-- 新規ユーザー登録時に自動でprofileを作成するトリガー
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
