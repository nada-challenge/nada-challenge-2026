# 灘チャレンジ2026 公式ウェブサイト

テーマ: **ともに響き合う灘の心と未来の風**（青系カラーテーマ）

純粋な HTML / CSS / Vanilla JS のみで構築。GitHub Pages で公開可能。

## ファイル構成

```
├── index.html      トップページ
├── about.html      灘チャレンジって？（詳細）
├── spot.html       灘区おすすめスポット一覧
├── access.html     アクセス・会場図
├── donation.html   カンパのお願い
├── css/style.css   共通CSS（カラーはCSS変数で管理）
├── js/main.js      ナビ・アニメーション・フィルター
└── img/shop/       スポット写真（差し替え用）
```

## 更新方法

- **ニュース**: `index.html` 内の `<!-- ▼▼▼ ここを編集：新しいお知らせ -->` の箇所にカードを追加
- **スポット**: `spot.html` / `index.html` のスポットカードブロックを複製して編集。写真は `img/shop/` に配置（`.jpg`）。画像がない場合は自動でカラー背景にフォールバック
- **協賛・口座情報**: `donation.html` のプレースホルダーを差し替え
- **地図**: `access.html` の iframe `src` を実際の Google Maps embed URL に差し替え
- **カラー変更**: `css/style.css` の `:root` 内の CSS 変数を編集

## GitHub Pages 公開

Settings → Pages → Branch: `main` / フォルダ: `/ (root)` を設定すると
`https://nada-challenge.github.io/nada-challenge-2026/` で公開されます。
