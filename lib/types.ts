export type User = {
  id: string
  email: string
  username: string
  avatar_url?: string
  created_at: string
}

export type Habit = {
  id: string
  user_id: string
  title: string
  description?: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly'
  target_days?: number[]  // 0=日,1=月,...,6=土（weekly用）
  is_public: boolean
  created_at: string
}

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  logged_at: string  // YYYY-MM-DD
  note?: string
  created_at: string
}

export type Group = {
  id: string
  name: string
  description?: string
  created_by: string
  invite_code: string
  created_at: string
}

export type GroupMember = {
  id: string
  group_id: string
  user_id: string
  role: 'owner' | 'member'
  joined_at: string
}

export type GroupHabit = {
  id: string
  group_id: string
  habit_id: string
  created_at: string
}

export type Reaction = {
  id: string
  habit_log_id: string
  user_id: string
  emoji: string
  created_at: string
}

export type HabitCategory = 'energy' | 'focus' | 'calm' | 'recovery' | 'social'

export type ParameterKey = HabitCategory | 'warmth'

export type CharacterStats = {
  user_id: string
  energy: number
  focus: number
  calm: number
  recovery: number
  social: number
  warmth: number
  last_updated: string  // YYYY-MM-DD
}

export type CharacterType = {
  name: string
  main: HabitCategory
  sub: HabitCategory
}
