import BottomNav from '@/components/BottomNav'
import {
  CheckCircle, CalendarDays, Users, BarChart2,
  Sparkles, Flame, Star, Zap, BookOpen, Moon,
  Heart, Globe, HelpCircle,
} from 'lucide-react'

type Section = {
  icon: React.ReactNode
  title: string
  items: { label: string; description: string }[]
}

const SECTIONS: Section[] = [
  {
    icon: <CheckCircle className="w-5 h-5 text-indigo-500" />,
    title: '今日の習慣',
    items: [
      { label: '習慣を追加する', description: '右上の「追加」ボタンから習慣を作成できます。名前・アイコン・カラー・カテゴリーを設定しましょう。' },
      { label: 'チェックイン', description: '習慣カードのチェックボタンをタップして今日の完了を記録します。もう一度タップすると取り消せます。' },
      { label: 'ストリーク（🔥連続記録）', description: '毎日チェックインを続けると連続日数が増えます。途切れるとリセットされるので注意！' },
      { label: '達成率', description: '画面上部のプログレスバーで今日の達成率を確認できます。全部完了すると達成メッセージが表示されます。' },
    ],
  },
  {
    icon: <CalendarDays className="w-5 h-5 text-indigo-500" />,
    title: 'カレンダー',
    items: [
      { label: '月間カレンダー', description: '月単位で習慣の達成履歴を確認できます。◯ = 全完了、扇形 = 一部完了、点 = 未達成。' },
      { label: '日付タップ', description: 'カレンダーの日付をタップすると、その日の習慣ごとの完了状況を確認できます。' },
      { label: '月の移動', description: '左右の矢印ボタンで前月・翌月に移動できます。未来の月は表示できません。' },
    ],
  },
  {
    icon: <Users className="w-5 h-5 text-indigo-500" />,
    title: 'グループ',
    items: [
      { label: 'グループを作る', description: '「グループを作成」ボタンから名前と説明を入力してグループを作れます。作成すると招待コードが発行されます。' },
      { label: '招待コードで参加', description: '「コードで参加」から8文字の招待コードを入力すると、友達のグループに参加できます。' },
      { label: 'メンバーの進捗を見る', description: 'グループ詳細ページでメンバー全員の今日の習慣達成状況を確認できます。' },
      { label: '応援スタンプ', description: "メンバーの完了した習慣に 👍🔥💪❤️🎉✨ でリアクションを送れます。自分の習慣には送れません。" },
    ],
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-indigo-500" />,
    title: 'レポート',
    items: [
      { label: '今月のサマリー', description: '全完了日数・継続率・最長ストリークを確認できます。' },
      { label: '過去7日のグラフ', description: '直近7日間の達成率をバーチャートで確認できます。色は達成率によって変わります（緑＝100%、インジゴ＝50%以上、薄紫＝1〜49%）。' },
      { label: '習慣ごとの統計', description: '各習慣の過去30日達成率・現在のストリーク・最長ストリークを確認できます。' },
    ],
  },
  {
    icon: <Sparkles className="w-5 h-5 text-indigo-500" />,
    title: 'キャラクター育成',
    items: [
      { label: 'パラメーターとは', description: '習慣カテゴリーに対応した6つのパラメーターがあります。チェックインするたびに対応パラメーターが成長します。' },
      { label: 'キャラクターのタイプ', description: '最も高いパラメーター（メイン）と2番目（サブ）の組み合わせで20種類のタイプが決まります。最初はデフォルトで、パラメーターが育つにつれ個性が出てきます。' },
      { label: '名前の変更', description: 'キャラクターページの名前部分をタップすると、好きな名前に変更できます。' },
      { label: 'AIの一言', description: 'キャラクターはあなたのパラメーター状態に応じた一言を話しかけてきます。「もう一言」ボタンで新しいメッセージを生成できます。' },
    ],
  },
]

const PARAM_INFO = [
  { icon: <Zap className="w-4 h-4" style={{ color: '#ef4444' }} />, label: '体力（energy）', desc: '運動・筋トレ・ウォーキングなど' },
  { icon: <BookOpen className="w-4 h-4" style={{ color: '#6366f1' }} />, label: '知性（focus）', desc: '読書・勉強・語学など' },
  { icon: <Moon className="w-4 h-4" style={{ color: '#14b8a6' }} />, label: '精神力（calm）', desc: '瞑想・日記・睡眠など' },
  { icon: <Heart className="w-4 h-4" style={{ color: '#22c55e' }} />, label: '健康（recovery）', desc: '食事管理・水分補給・早起きなど' },
  { icon: <Globe className="w-4 h-4" style={{ color: '#f97316' }} />, label: '社交性（social）', desc: '友人と連絡・グループ活動など' },
  { icon: <Star className="w-4 h-4" style={{ color: '#ec4899' }} />, label: '優しさ（warmth）', desc: '毎日チェックインするほど育ちます' },
]

const RULES = [
  '1日3カテゴリーまでパラメーターが上昇します（チェック自体は何個でもOK）',
  '同じカテゴリーを3日連続でチェックすると上昇量が半減します（他も育てましょう）',
  'パラメーターは毎日少しずつ自然に下がります（体力・社交性は特に落ちやすい）',
  'パラメーターが上がるほど次の上昇量は少なくなります（上限付きの対数成長）',
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 pb-24">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          <h1 className="text-lg font-bold text-gray-900">使い方ガイド</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 概要 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-bold text-gray-900">HabitLoop</span> は友達や身内と一緒に習慣を続けるアプリです。
            毎日チェックインしてストリークを伸ばし、グループで互いに応援し合いながらキャラクターを育てましょう。
          </p>
        </div>

        {/* 各機能の説明 */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              {section.icon}
              <h2 className="font-bold text-gray-900">{section.title}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map((item) => (
                <div key={item.label}>
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* パラメーター対応表 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">カテゴリーとパラメーターの対応</h2>
          <div className="space-y-2">
            {PARAM_INFO.map(({ icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* パラメータールール */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">パラメーターのルール</h2>
          <ul className="space-y-2">
            {RULES.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-indigo-400 font-bold flex-shrink-0">•</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

      </main>

      <BottomNav />
    </div>
  )
}
