import { createClient } from '@/lib/supabase-server'
import { Users } from 'lucide-react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CreateGroupModal from '@/components/CreateGroupModal'
import JoinGroupModal from '@/components/JoinGroupModal'

export default async function GroupsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('group_members')
    .select('role, groups(id, name, description, invite_code, created_by)')
    .eq('user_id', user!.id)

  const groups = memberships?.map((m) => {
    const g = m.groups as unknown as { id: string; name: string; description: string | null; invite_code: string; created_by: string }
    return { ...g, role: m.role }
  }) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <main className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">グループ</h1>
          <div className="flex gap-2">
            <JoinGroupModal />
            <CreateGroupModal />
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-gray-500 font-medium">まだグループがありません</p>
            <p className="text-gray-400 text-sm mt-1">
              グループを作成するか、招待コードで参加しましょう！
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">{group.name}</p>
                    {group.role === 'owner' && (
                      <span className="text-xs bg-indigo-100 text-indigo-600 font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                        オーナー
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="text-sm text-gray-400 truncate mt-0.5">{group.description}</p>
                  )}
                </div>
                <span className="text-gray-300 flex-shrink-0">›</span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
