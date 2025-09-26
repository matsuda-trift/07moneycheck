# MoneyCheck 開発コマンド

## 開発サーバー
```bash
npm run dev          # 開発サーバー起動（Turbopack使用）
```
**重要**: 開発サーバーは別ターミナルで実行中、Claude自動実行禁止

## ビルド・本番
```bash
npm run build        # 本番ビルド（Turbopack使用）
npm run start        # 本番サーバー起動
```

## コード品質
```bash
npm run lint         # ESLint実行
```

## Git操作
```bash
git status           # 変更状況確認
git add .            # ステージング
git commit -m "msg"  # コミット
git push             # プッシュ（明示的指示時のみ）
```

## システムコマンド（macOS）
```bash
ls -la               # ファイル一覧（詳細）
find . -name "*.tsx" # ファイル検索
grep -r "pattern"    # パターン検索
cd directory         # ディレクトリ移動
```

## パッケージ管理
```bash
npm install          # 依存関係インストール
npm install package  # パッケージ追加
```