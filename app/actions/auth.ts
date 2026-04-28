'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export async function signUp(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  if (!email || !password || !username) {
    return { error: 'すべての項目を入力してください' }
  }
  if (password.length < 6) {
    return { error: 'パスワードは6文字以上にしてください' }
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'このメールアドレスはすでに登録されています' }
    }
    return { error: 'アカウント作成に失敗しました: ' + error.message }
  }

  // usernameをprofilesテーブルに保存（トリガーで作成後に更新）
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('profiles')
      .update({ username })
      .eq('id', user.id)
  }

  redirect('/dashboard')
}

export async function signIn(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'メールアドレスとパスワードを入力してください' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Email not confirmed')) {
      return { error: 'メールアドレスの確認が完了していません。届いたメールのリンクをクリックしてください。（またはSupabaseダッシュボードでメール確認をオフにしてください）' }
    }
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    return { error: 'ログインエラー: ' + error.message }
  }

  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
