# HabitLoop - プロジェクト概要

友達や身内と一緒に習慣を続けるためのWebアプリ。

## コンセプト

「一人じゃないから続けられる」をテーマに、グループで習慣の進捗を共有・応援し合える。

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 16.2（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| バックエンド / DB / 認証 | Supabase |
| アイコン | lucide-react |
| 日付処理 | date-fns |

---

## ディレクトリ構成

```
habit-app/
├── app/
│   ├── page.tsx                          # ルート（/login か /dashboard へリダイレクト）
│   ├── layout.tsx                        # ルートレイアウト
│   ├── globals.css                       # グローバルスタイル
│   ├── actions/
│   │   ├── auth.ts                       # 認証 Server Actions（signIn / signUp / signOut）
│   │   └── habits.ts                     # 習慣 Server Actions（create / delete / toggleLog）
│   ├── (auth)/
│   │   └── login/page.tsx               # ログイン・新規登録画面
│   └── (dashboard)/
│       ├── layout.tsx                    # 認証チェック（未ログインなら /login へ）
│       ├── dashboard/page.tsx           # メインダッシュボード（今日の習慣）
│       ├── calendar/page.tsx            # カレンダービュー（月単位の達成履歴）
│       ├── stats/page.tsx               # 週次レポート・統計グラフ
│       └── groups/
│           ├── page.tsx                 # グループ一覧
│           └── [id]/page.tsx            # グループ詳細（メンバー進捗）
├── components/
│   ├── HabitCard.tsx                     # 習慣カード（チェック・削除）
│   ├── AddHabitModal.tsx                 # 習慣追加モーダル
│   ├── BottomNav.tsx                     # 画面下部ナビゲーション（今日・カレンダー・グループ）
│   ├── MonthNavigator.tsx                # カレンダー月切り替えボタン
│   ├── CalendarGrid.tsx                  # カレンダーグリッド本体
│   ├── CreateGroupModal.tsx              # グループ作成モーダル
│   ├── JoinGroupModal.tsx                # 招待コードでグループ参加モーダル
│   ├── CopyInviteCode.tsx               # 招待コードコピーボタン
│   ├── HabitReaction.tsx                # 習慣ログへの応援スタンプ（絵文字ピッカー付き）
│   └── WeeklyBarChart.tsx               # 過去7日達成率のSVGバーチャート
├── lib/
│   ├── supabase.ts                       # ブラウザ用 Supabase クライアント
│   ├── supabase-server.ts               # サーバー用 Supabase クライアント（cookies使用）
│   └── types.ts                          # 型定義
├── supabase/
│   └── schema.sql                        # DB テーブル定義・RLS ポリシー
└── .env.local                            # 環境変数（Git管理外）
```

---

## 環境変数

`.env.local` に以下を設定する：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Supabase ダッシュボード → Settings → API Keys から取得。

---

## 開発サーバーの起動

```bash
cd habit-app
npm run dev
# → http://localhost:3000
```

---

## 実装済み機能

### 認証
- メールアドレス＋パスワードでのサインアップ／ログイン
- Supabase Auth を使用
- ログイン状態はサーバーサイドで Cookie 管理
- 未ログイン時は `/login` へ自動リダイレクト
- 新規登録時にユーザー名を設定、`profiles` テーブルへ保存

### 習慣管理
- 習慣の作成（名前・アイコン12種・カラー8色）
- 習慣の削除（確認ダイアログあり）
- 毎日のチェックイン（タップで完了／未完了をトグル）
- 連続記録（ストリーク）の自動計算・表示

### ダッシュボード
- 今日の達成率をパーセントとプログレスバーで表示
- 全完了時に達成メッセージを表示
- 習慣カードに連続日数（🔥N日連続）を表示

### カレンダービュー（`/calendar`）
- 月ナビゲーション（前月・翌月ボタン、未来月は無効）
- 月間サマリー：全完了日数・実施日数・継続率（%）
- 日付グリッド：全完了→インジゴ丸、一部完了→扇形グラフ、未達成→グレー点
- 日付タップでその日の習慣ごとの完了／未達成リストを表示

### 応援スタンプ（グループ詳細ページ内）
- 完了済みの習慣タグの下に絵文字リアクションを表示
- 😊ボタンからピッカーを開いて 👍🔥💪❤️🎉✨ の6種類から選択
- 同じ絵文字をタップでトグル（追加／取り消し）
- 自分の習慣には応援できない（受け取るだけ）
- リアクション数をカウント表示

### グループ機能（`/groups`）
- グループの作成（名前・説明）
- 招待コード（8文字）でグループに参加
- グループ一覧表示（オーナーバッジ付き）
- グループ詳細ページ：メンバー全員の今日の習慣進捗を一覧表示
- 招待コードのワンタップコピー（オーナーのみ表示）
- グループからの退出（メンバーのみ）

### 週次レポート・統計グラフ（`/stats`）
- 今月のサマリー：全完了日数・継続率・最長ストリーク
- 過去7日の達成率バーチャート（SVG製、外部ライブラリ不要）
  - 100%: 緑 / 50%〜: インジゴ / 1〜49%: 薄紫 / 0%: グレー
- 習慣ごとの達成状況：過去30日達成率バー・現在のストリーク・最長ストリーク

### ナビゲーション
- 画面下部のボトムナビで「今日」「カレンダー」「グループ」「レポート」を切り替え

---

## データベース設計

### テーブル一覧

| テーブル | 説明 |
|----------|------|
| `profiles` | ユーザープロフィール（auth.users と連携） |
| `habits` | 習慣（タイトル・アイコン・カラー・頻度） |
| `habit_logs` | チェックインログ（habit_id + user_id + 日付 でユニーク） |
| `groups` | グループ（招待コード付き）|
| `group_members` | グループメンバー |
| `group_habits` | グループに共有された習慣 |
| `reactions` | 習慣ログへの応援リアクション |

すべてのテーブルに Row Level Security (RLS) を設定済み。

### 新規ユーザー登録トリガー
`auth.users` に INSERT されると自動で `profiles` レコードを作成するトリガーを設定済み。

---

## 今後実装予定の機能

現在、追加予定の機能はありません。
