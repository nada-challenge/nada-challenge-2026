/* ============================================================
   灘チャレンジ2026 スポット詳細ページ生成
   ------------------------------------------------------------
   spot-detail.html 専用のスクリプト。
   URL の ?slug=◯◯ を読み取り、js/spots-data.js（window.NADA_DATA）
   から該当スポットを探してページ各所に流し込む。

   ★ 任意項目（caption / body / info / mapQuery / message）は、
     データがある店だけ表示。無ければ既存の「準備中」表示のまま。
   ★ 読み込み順は spots-data.js → spot-detail.js（このファイル）
     の順であること（spot-detail.html はその順で読み込み済み）。
   ============================================================ */
(function () {
  'use strict';

  var data = window.NADA_DATA;
  if (!data) return;

  /* data属性で1要素を取得する小ヘルパー */
  var q = function (attr) { return document.querySelector('[' + attr + ']'); };

  /* category 内部名 → 表示名 */
  var labelOf = function (cat) {
    return (data.categories && data.categories[cat]) || 'その他';
  };

  /* 文字列 or 配列 → 段落（<p>）の配列に正規化 */
  var toParagraphs = function (val) {
    if (Array.isArray(val)) return val.filter(function (s) { return String(s).trim() !== ''; });
    return String(val).split(/\n{2,}|\n/).filter(function (s) { return s.trim() !== ''; });
  };
  var fillParagraphs = function (el, val) {
    el.innerHTML = '';
    toParagraphs(val).forEach(function (text) {
      var p = document.createElement('p');
      p.textContent = text;
      el.appendChild(p);
    });
  };

  /* --- URL から slug を取得して該当スポットを探す --- */
  var slug = new URLSearchParams(window.location.search).get('slug');
  var spots = data.spots || [];
  var spot = null;
  for (var i = 0; i < spots.length; i++) {
    if (spots[i].slug === slug) { spot = spots[i]; break; }
  }

  /* ====== スポットが見つからない場合 ====== */
  if (!spot) {
    document.title = 'スポットが見つかりません | 灘チャレンジ2026';
    var nameNF = q('data-spot-name');
    if (nameNF) nameNF.textContent = 'スポットが見つかりませんでした';
    var crumbNF = q('data-spot-crumb');
    if (crumbNF) crumbNF.textContent = '見つかりません';
    var bodyNF = q('data-spot-body');
    if (bodyNF) {
      bodyNF.innerHTML = '';
      var pNF = document.createElement('p');
      pNF.className = 'spot-info__empty';
      pNF.textContent = 'お探しのスポットは見つかりませんでした。一覧からお選びください。';
      bodyNF.appendChild(pNF);
    }
    return;
  }

  var label = labelOf(spot.category);

  /* ====== 1. タイトル・メタ（SEO） ====== */
  document.title = spot.name + ' | 灘区おすすめスポット | 灘チャレンジ2026';
  var metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', spot.name + (spot.desc ? '｜' + spot.desc : '') + '（灘チャレンジ2026）');
  var ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', spot.name + ' | 灘チャレンジ2026');
  var ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && spot.desc) ogDesc.setAttribute('content', spot.desc);
  var ogImg = document.querySelector('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', 'https://nada-challenge.github.io/nada-challenge-2026/img/shop/' + spot.slug + '.jpg');

  /* ====== 2. 見出し・パンくず・カテゴリタグ ====== */
  var nameEl = q('data-spot-name');
  if (nameEl) nameEl.textContent = spot.name;

  var crumb = q('data-spot-crumb');
  if (crumb) crumb.textContent = spot.name;

  var tag = q('data-spot-tag');
  if (tag) { tag.textContent = label; tag.hidden = false; }

  /* ====== 3. 外観写真（フォールバックつき） ====== */
  var img = q('data-spot-img');
  var frame = q('data-spot-hero');
  var fallback = q('data-spot-fallback');
  if (fallback) fallback.textContent = label;
  if (img) {
    img.src = 'img/shop/' + spot.slug + '.jpg';
    img.alt = spot.name;
    var showFallback = function () { if (frame) frame.classList.add('is-fallback'); };
    img.addEventListener('error', showFallback);
    if (img.complete && img.naturalWidth === 0) showFallback();
  }

  /* 写真キャプション（任意） */
  var caption = q('data-spot-caption');
  if (caption && spot.caption) {
    caption.textContent = spot.caption;
    caption.hidden = false;
  }

  /* ====== 4. 紹介文 body（任意・文字列でも配列でも可） ====== */
  var body = q('data-spot-body');
  if (body && spot.body) fillParagraphs(body, spot.body);

  /* ====== 5. 店舗情報 info（任意） ====== */
  var info = q('data-spot-info');
  if (info && spot.info) {
    var rows = [
      ['住所', spot.info.address],
      ['電話', spot.info.tel],
      ['営業時間', spot.info.hours],
      ['定休日', spot.info.holiday]
    ];
    var hasAny = rows.some(function (r) { return !!r[1]; }) || !!spot.info.web;
    if (hasAny) {
      info.innerHTML = '';
      var dl = document.createElement('dl');
      dl.className = 'spot-info__dl';
      rows.forEach(function (r) {
        if (!r[1]) return;
        var dt = document.createElement('dt');
        dt.className = 'spot-info__dt';
        dt.textContent = r[0];
        var dd = document.createElement('dd');
        dd.className = 'spot-info__dd';
        dd.textContent = r[1];
        dl.appendChild(dt);
        dl.appendChild(dd);
      });
      if (spot.info.web) {
        var dtW = document.createElement('dt');
        dtW.className = 'spot-info__dt';
        dtW.textContent = 'Web';
        var ddW = document.createElement('dd');
        ddW.className = 'spot-info__dd';
        var a = document.createElement('a');
        a.href = spot.info.web;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = spot.info.web.replace(/^https?:\/\//, '').replace(/\/$/, '');
        ddW.appendChild(a);
        dl.appendChild(dtW);
        dl.appendChild(ddW);
      }
      info.appendChild(dl);
    }
  }

  /* ====== 6. 灘チャレンジとのつながり message（任意） ====== */
  var msgWrap = q('data-spot-message-wrap');
  var msg = q('data-spot-message');
  if (msgWrap && msg && spot.message) {
    fillParagraphs(msg, spot.message);
    msgWrap.hidden = false;
  }

  /* ====== 7. Googleマップ（任意・mapQuery か 住所から生成） ====== */
  var mapWrap = q('data-spot-map-wrap');
  var mapFrame = q('data-spot-map');
  var mapLink = q('data-spot-map-link');
  var mapQuery = spot.mapQuery || (spot.info && spot.info.address) || '';
  if (mapWrap && mapFrame && mapQuery) {
    var encoded = encodeURIComponent(mapQuery);
    mapFrame.src = 'https://www.google.com/maps?q=' + encoded + '&output=embed';
    if (mapLink) mapLink.href = 'https://www.google.com/maps/search/?api=1&query=' + encoded;
    mapWrap.hidden = false;
  }
})();
