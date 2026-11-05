# iPad向けシフト管理サイト（スターター）

GitHub + Vercel + Neon PostgreSQL で動かす、管理者1人用のシフト管理サイトです。

## できること
- 管理者パスワードでログイン
- 月別カレンダーでAM/PMの出勤者を一覧表示
- シフト編集表のマスをタップして勤務区分を選択
- 変更をNeon PostgreSQLへ保存
- スタッフ一覧の初期データを登録、スタッフ追加

## 1. Neonの準備
1. https://neon.tech/ でプロジェクトを作成
2. SQL Editorを開く
3. `sql/schema.sql` の内容を貼り付けて実行
4. DashboardのConnectから接続文字列をコピー

## 2. GitHubへアップロード
1. https://github.com/new で新しいPrivate repositoryを作成
2. このフォルダ内のファイルをすべてアップロード
3. `node_modules` や `.next` はアップロードしない

## 3. Vercelへ公開
1. https://vercel.com/ でGitHubと連携
2. Add New > Projectから作成したrepositoryをImport
3. Environment Variablesに以下を登録
   - `DATABASE_URL`：Neonの接続文字列
   - `ADMIN_PASSWORD`：管理者用の強いパスワード
   - `SESSION_SECRET`：32文字以上のランダムな文字列
4. Deployを押す

## 4. ローカルで試す場合
Node.js 20以上を用意して、ターミナルでこのフォルダに移動します。

```bash
npm install
cp .env.example .env.local
# .env.local を開いて3つの値を設定
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 注意
- 公開前に必ず強い `ADMIN_PASSWORD` と `SESSION_SECRET` を設定してください。
- `.env.local` はGitHubへ絶対にアップロードしないでください。
- 現在のスターターはシフトの基本入力・表示を優先した初版です。スタッフ名の変更/無効化、Excelの既存シフト取込、月別集計の厳密な再現、バックアップ出力などは次の開発段階です。
- ステータス「出勤」のみをカレンダーに表示し、出勤回数に数えます。

## 1-B. Excelに入力済みの11月・12月シフトも取り込む場合
`sql/schema.sql` を実行した後、Neon SQL Editorで `sql/import-existing-shifts.sql` を実行します。これはExcelファイル内の「シフト」「12月シフト」に実際に入力されている勤務区分を登録するSQLです。初回セットアップ時に1回だけ実行してください。
