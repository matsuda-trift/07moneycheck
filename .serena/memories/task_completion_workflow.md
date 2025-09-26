# タスク完了時のワークフロー

## 必須チェック項目
1. **ファイル全読み**: 変更前に対象ファイルを完全に読む
2. **TypeScript厳格チェック**: 型エラーなし
3. **単一責任原則**: 1ファイル1機能
4. **300行制限**: ファイルサイズチェック

## 実行必須コマンド
```bash
npm run lint         # ESLint実行
npm run build        # ビルドチェック
```

## 禁止事項チェック
- [ ] DB操作コードなし
- [ ] Pages Router使用なし  
- [ ] ユーザーデータ永続化なし
- [ ] 自動Git操作なし（明示的指示以外）

## App Router必須パターン確認
- [ ] `src/app/` ディレクトリ使用
- [ ] `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx`
- [ ] Server Component デフォルト
- [ ] `"use client"` は必要時のみ

## データ管理確認
- [ ] localStorage使用
- [ ] React Context使用
- [ ] セッション管理のみ
- [ ] 永続化なし

## 品質保証
- [ ] 必須ヘッダー記述
- [ ] 型注釈明示
- [ ] エラーハンドリング
- [ ] レスポンシブ対応