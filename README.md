# HabitLoop

友達や身内と一緒に習慣を続けるためのWebアプリ。

「一人じゃないから続けられる」をテーマに、グループで習慣の進捗を共有・応援し合えます。習慣を積み重ねるとAIキャラクターが成長するゲーミフィケーション要素も搭載しています。

---

## 機能一覧

### 習慣管理
- 習慣の作成（名前・アイコン12種・カラー8色・カテゴリー）
- 毎日のチェックイン（タップで完了トグル）
- 連続記録（ストリーク）の自動計算・表示

### ダッシュボード
- 今日の達成率をプログレスバーで表示
- 全完了時に達成メッセージを表示

### カレンダービュー
- 月間サマリー（全完了日数・継続率）
- 日付グリッドで達成状況を視覚表示

### グループ機能
- グループの作成・招待コードで参加
- メンバー全員の今日の習慣進捗を一覧表示
- 習慣に絵文字でリアクション（👍🔥💪❤️🎉✨）

### 週次レポート
- 今月のサマリー（全完了日数・最長ストリーク）
- 過去7日の達成率バーチャート
- 習慣ごとの過去30日達成率

### AIキャラクター育成
- 習慣カテゴリーに応じてキャラクターのパラメーターが成長
- パラメーター（体力・知性・精神力・健康・社交性）の組み合わせで20種類のキャラクタータイプに変化
- パラメーターに基づいた個性でAIが一言メッセージを生成（OpenAI）
- キャラクター名のカスタマイズ

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| フレームワーク | Next.js 16.2（App Router） |
| 言語 | TypeScript |
| スタイリング | Tailwind CSS v4 |
| バックエンド / DB / 認証 | Supabase |
| AI | OpenAI API（gpt-4o-mini） |
| アイコン | lucide-react |
| 日付処理 | date-fns |

---

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd habit-app
npm install
```

### 2. Supabaseの準備

1. [supabase.com](https://supabase.com) でプロジェクトを作成
2. `supabase/` 以下のSQLファイルをSQL Editorで順番に実行：

```
supabase/schema.sql              # テーブル・RLSポリシー
supabase/add_character.sql       # character_statsテーブル・habitsへカテゴリー追加
supabase/add_character_name.sql  # キャラクター名カラム追加
supabase/add_type_tracking.sql   # タイプ変化追跡カラム追加
```

### 3. 環境変数の設定

`.env.local` を作成して以下を記述：

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
```

- Supabase URL・Anon Key: Supabase Dashboard → Settings → API Keys
- OpenAI API Key: [platform.openai.com](https://platform.openai.com)

### 4. 開発サーバーの起動

```bash
npm run dev
# → http://localhost:3000
```

---

## デプロイ（Vercel）

1. GitHubにリポジトリをpush
2. [vercel.com](https://vercel.com) でプロジェクトをインポート
3. 環境変数（`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `OPENAI_API_KEY`）をVercelに設定
4. Supabase Dashboard → Authentication → URL Configuration にVercelのURLを追加

---

## キャラクター画像（任意）

`public/characters/` に画像（PNG）を配置することでキャラクターの見た目をカスタマイズできます。

| ファイル名 | 表示タイミング |
|---|---|
| `default.png` | 初期状態 |
| `energy.png` / `focus.png` / `calm.png` / `recovery.png` / `social.png` | 単体タイプ時 |
| `energy_focus.png` など `{メイン}_{サブ}.png` | 複合タイプ時（20種類） |

画像がない場合は絵文字（🥚/🌱/🌟）で自動的にフォールバックします。

---

## データベース設計

| テーブル | 説明 |
|----------|------|
| `profiles` | ユーザープロフィール |
| `habits` | 習慣（タイトル・アイコン・カラー・カテゴリー） |
| `habit_logs` | チェックインログ |
| `character_stats` | キャラクターパラメーター |
| `groups` | グループ（招待コード付き） |
| `group_members` | グループメンバー |
| `reactions` | 習慣ログへの応援リアクション |

すべてのテーブルにRow Level Security（RLS）を設定済み。
