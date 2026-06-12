/* ============================================================
   灘チャレンジ2026 スポット・協賛データ
   ------------------------------------------------------------
   ★ 店舗や協賛企業の追加・修正は、このファイルだけを編集します。
     （HTML は触らなくてOK。main.js が自動でカードを描画します）

   ■ スポットを1件追加する手順
     1. 下の spots 配列に { } ブロックを1つ複製して追記する
     2. 写真を img/shop/{slug}.jpg に置く（後日でもOK。
        写真が無い間はカテゴリ名入りの背景が自動表示されます）

   ■ 各項目の意味
     slug     : 画像ファイル名（img/shop/◯◯.jpg の ◯◯ 部分。半角英数）
     name     : 店名・施設名（表示用）
     category : restaurant / apparel / food / medical / other のいずれか
     desc     : 一言説明（spot.html のみに表示。index では省略される）

   ■ 協賛企業を1件追加する手順
     sponsors 配列に { name: "◯◯株式会社" } を追記するだけ。
     （url を付けるとリンクになります。空の間は「随時更新」表示）
   ============================================================ */

window.NADA_DATA = {

  /* カテゴリーの内部名 → 表示名（フィルターのボタンと対応） */
  categories: {
    restaurant: '飲食店',
    apparel:    '衣料・繊維・雑貨',
    food:       '食品販売',
    medical:    '医療・福祉',
    other:      'その他'
  },

  /* ▼▼▼ スポット一覧（ここに追記） ▼▼▼ */
  spots: [
    {
      slug: 'arataya',
      name: '串天と創作家庭料理のお店あらたや',
      category: 'restaurant',
      desc: '揚げたての串天と心のこもった家庭料理が楽しめるお店です。'
    },
    {
      slug: 'emiya',
      name: 'ゑみや洋服店',
      category: 'apparel',
      desc: '地域に親しまれてきた、確かな品揃えの洋服店です。'
    },
    {
      slug: 'marukizu',
      name: 'マルキーズキムラヤ',
      category: 'food',
      desc: '毎日の食卓を支える、地域密着の食品販売店です。'
    },
    {
      slug: 'kanazawa',
      name: '金沢病院',
      category: 'medical',
      desc: '地域の健康を見守り続ける、灘区の医療機関です。'
    },
    {
      slug: 'cafe_gion',
      name: 'Café dé Gion',
      category: 'restaurant',
      desc: 'ゆったりとした時間が流れる、くつろぎのカフェです。'
    },
    {
      slug: 'sowelu',
      name: 'Incubation Studio SoWelu',
      category: 'other',
      desc: '新しい挑戦を応援する、地域のインキュベーション拠点です。'
    }
  ],
  /* ▲▲▲ スポット一覧ここまで ▲▲▲ */

  /* ▼▼▼ 協賛企業一覧（決まり次第ここに追記） ▼▼▼
     例: { name: '◯◯株式会社', url: 'https://example.com' }     */
  sponsors: [
  ]
  /* ▲▲▲ 協賛企業一覧ここまで ▲▲▲ */
};
