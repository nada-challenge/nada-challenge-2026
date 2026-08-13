/* ============================================================
   灘チャレンジ2026 共通スクリプト
   0. スポット／協賛カードのデータ駆動描画（js/spots-data.js 参照）
   1. ヒーロー読み込み演出（orchestrated moment）
   2. ハンバーガーメニュー
   3. スクロール時ヘッダー罫線
   4. Intersection Observer によるフェードイン
   5. リボン・ディバイダーの描画演出
   6. カテゴリーフィルター（spot.html / index.html 共通）
   7. スムーズスクロール
   8. スポット画像フォールバック
   9. 開催日カウントダウン
   10. ヒーローの風演出 ＋ 軽いパララックス
   11. タップ／クリック時の風（ひと吹き）
   ============================================================ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     0. スポット／協賛カードのデータ駆動描画
        データは js/spots-data.js（window.NADA_DATA）に一元管理。
        ・[data-spots-render]    にスポットカードを描画
          - data-spots-limit="6" で先頭◯件のみ（トップページの抜粋用）
          - data-spots-desc      が付いている＝全件一覧ページ（spot.html）。
                                 見出しレベルの判定にのみ使用する。
                                 カードに一言説明を出すかどうかは
                                 下の SHOW_DESC_ON_CARD で制御すること。
          - data-spots-placeholder があれば末尾に「準備中」カードを追加
        ・[data-sponsors-render] に協賛企業を描画（空なら案内文を表示）
        ※ 後続モジュール（フェードイン・フィルター・画像フォールバック）
          より先に実行する必要があるため、必ずこの位置に置くこと。
  ---------------------------------------------------------- */
  (function () {
    var data = window.NADA_DATA;
    if (!data) return;

    /* 一覧カードに一言説明（spot.desc）を表示するか。
       false = 店舗情報は詳細ページ（spot-detail.html）でのみ見せる。
       true に戻せば従来どおりカードにも説明文が出る。 */
    var SHOW_DESC_ON_CARD = false;

    /* --- スポットカード --- */
    document.querySelectorAll('[data-spots-render]').forEach(function (grid) {
      var limit = parseInt(grid.getAttribute('data-spots-limit'), 10);
      var isFullList = grid.hasAttribute('data-spots-desc'); // 全件一覧ページか
      var withDesc = isFullList && SHOW_DESC_ON_CARD;        // 実際に説明文を出すか
      var spots = isNaN(limit) ? data.spots : data.spots.slice(0, limit);
      var nameTag = isFullList ? 'h2' : 'h3'; // 一覧ページは h2、抜粋は h3（既存マークアップ準拠）

      spots.forEach(function (spot) {
        var label = data.categories[spot.category] || 'その他';
        var card = document.createElement('article');
        card.className = 'card-spot fade-in';
        card.setAttribute('data-category', spot.category);
        card.innerHTML =
          '<a class="card-spot__link" href="spot-detail.html?slug=' + encodeURIComponent(spot.slug) + '">' +
            '<div class="card-spot__media">' +
              '<img src="img/shop/' + spot.slug + '.jpg" alt="" class="card-spot__img" loading="lazy" decoding="async">' +
              '<span class="card-spot__fallback"></span>' +
            '</div>' +
            '<div class="card-spot__body">' +
              '<' + nameTag + ' class="card-spot__name"></' + nameTag + '>' +
              '<span class="card-spot__tag"></span>' +
              (withDesc ? '<p class="card-spot__desc"></p>' : '') +
            '</div>' +
          '</a>';
        /* テキストは textContent で安全に流し込む */
        card.querySelector('.card-spot__img').alt = spot.name;
        card.querySelector('.card-spot__fallback').textContent = label;
        card.querySelector('.card-spot__name').textContent = spot.name;
        card.querySelector('.card-spot__tag').textContent = label;
        if (withDesc && spot.desc) {
          card.querySelector('.card-spot__desc').textContent = spot.desc;
        }
        grid.appendChild(card);
      });

      /* 「準備中」カード（spot.html のみ）
         説明文は他カードと足並みを揃えて出さない。 */
      if (grid.hasAttribute('data-spots-placeholder')) {
        var ph = document.createElement('article');
        ph.className = 'card-spot fade-in';
        ph.setAttribute('data-category', 'other');
        ph.innerHTML =
          '<div class="card-spot__media is-fallback">' +
            '<span class="card-spot__fallback">Coming Soon</span>' +
          '</div>' +
          '<div class="card-spot__body">' +
            '<h2 class="card-spot__name">スポット情報 準備中</h2>' +
            '<span class="card-spot__tag">その他</span>' +
            (withDesc ? '<p class="card-spot__desc">新しいおすすめスポットを随時追加していきます。</p>' : '') +
          '</div>';
        grid.appendChild(ph);
      }
    });

    /* --- 協賛企業 --- */
    document.querySelectorAll('[data-sponsors-render]').forEach(function (box) {
      if (!data.sponsors || data.sponsors.length === 0) {
        var p = document.createElement('p');
        p.className = 'card-supporter__placeholder';
        p.textContent = box.getAttribute('data-sponsors-empty') || '随時更新します';
        box.appendChild(p);
        return;
      }
      var ul = document.createElement('ul');
      ul.className = 'sponsor-list';
      data.sponsors.forEach(function (s) {
        var li = document.createElement('li');
        if (s.url) {
          var a = document.createElement('a');
          a.href = s.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = s.name;
          li.appendChild(a);
        } else {
          li.textContent = s.name;
        }
        ul.appendChild(li);
      });
      box.appendChild(ul);
    });
  })();

  /* ----------------------------------------------------------
     1. ヒーロー読み込み演出
        画像フェードイン → コピーが順に立ち上がる
  ---------------------------------------------------------- */
  (function () {
    var heroImg = document.querySelector('.hero__img');

    var reveal = function () {
      document.body.classList.add('is-loaded');
    };

    if (!heroImg || prefersReduced) {
      reveal();
      return;
    }

    if (heroImg.complete) {
      reveal();
    } else {
      heroImg.addEventListener('load', reveal);
      heroImg.addEventListener('error', reveal);
      // 読み込みが遅い場合でもコピーは表示する
      window.setTimeout(reveal, 1800);
    }
  })();

  /* ----------------------------------------------------------
     2. ハンバーガーメニュー（ナビ開閉）
  ---------------------------------------------------------- */
  (function () {
    var navToggle = document.querySelector('.nav__toggle');
    var navList = document.querySelector('.nav__list');

    if (!navToggle || !navList) return;

    navToggle.addEventListener('click', function () {
      var isOpen = navList.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'メニューを閉じる' : 'メニューを開く');
    });

    // ナビリンククリック時にメニューを閉じる（モバイル）
    navList.addEventListener('click', function (e) {
      if (e.target.classList.contains('nav__link')) {
        navList.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  })();

  /* ----------------------------------------------------------
     3. スクロール時ヘッダー罫線
  ---------------------------------------------------------- */
  (function () {
    var header = document.querySelector('.header');
    if (!header) return;

    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  /* ----------------------------------------------------------
     4. Intersection Observer によるフェードイン
        .fade-in を持つ要素がビューポートに入ったら表示
  ---------------------------------------------------------- */
  (function () {
    var fadeTargets = document.querySelectorAll('.fade-in');
    if (fadeTargets.length === 0) return;

    if (!('IntersectionObserver' in window) || prefersReduced) {
      fadeTargets.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    fadeTargets.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ----------------------------------------------------------
     5. リボン・ディバイダーの描画演出
        ビューポートに入ると stroke-dashoffset が解け、
        線が「描かれていく」（このページ第二の動き）
  ---------------------------------------------------------- */
  (function () {
    var ribbons = document.querySelectorAll('.ribbon-divider');
    if (ribbons.length === 0) return;

    /* 各 path の実長を測り、dasharray / dashoffset を実数で設定する。
       これで pathLength 属性の有無や preserveAspectRatio="none" による
       引き伸ばしに依存せず、確実に「描かれていく」演出になる。 */
    var prepare = function (el) {
      var paths = el.querySelectorAll('path');
      paths.forEach(function (p) {
        var len;
        try { len = p.getTotalLength(); } catch (e) { len = 0; }
        if (!len) return;
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = prefersReduced ? 0 : len;
      });
    };

    var draw = function (el) {
      var paths = el.querySelectorAll('path');
      paths.forEach(function (p) { p.style.strokeDashoffset = 0; });
      el.classList.add('is-drawn');
    };

    ribbons.forEach(prepare);

    if (!('IntersectionObserver' in window) || prefersReduced) {
      ribbons.forEach(draw);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            draw(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    ribbons.forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ----------------------------------------------------------
     6. カテゴリーフィルター
        data-category 属性によるスポットカードの絞り込み
  ---------------------------------------------------------- */
  (function () {
    var filterButtons = document.querySelectorAll('.category-filter__btn');
    var spotCards = document.querySelectorAll('.card-spot');

    if (filterButtons.length === 0 || spotCards.length === 0) return;

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var category = btn.getAttribute('data-filter');

        filterButtons.forEach(function (b) {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');

        spotCards.forEach(function (card) {
          var cardCategory = card.getAttribute('data-category');
          var show = category === 'all' || cardCategory === category;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  })();

  /* ----------------------------------------------------------
     7. スムーズスクロール（a[href^="#"] 全リンク）
  ---------------------------------------------------------- */
  (function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: prefersReduced ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      });
    });
  })();

  /* ----------------------------------------------------------
     8. スポット画像フォールバック
        画像が読み込めない場合はカテゴリ名入りの wash 背景を表示
  ---------------------------------------------------------- */
  (function () {
    document.querySelectorAll('.card-spot__img').forEach(function (img) {
      var media = img.closest('.card-spot__media');

      var showFallback = function () {
        if (media) media.classList.add('is-fallback');
      };

      if (img.complete && img.naturalWidth === 0) {
        showFallback();
      } else {
        img.addEventListener('error', showFallback);
      }
    });
  })();

  /* ----------------------------------------------------------
     9. 開催日カウントダウン
        ヒーロー内の [data-countdown] に「開催まであと◯日」を表示。
        当日（11:00〜16:00）・終了後の分岐あり。静的テキストのみ
        （アニメーションなし）なので reduced-motion でもそのまま表示。
  ---------------------------------------------------------- */
  (function () {
    var el = document.querySelector('[data-countdown]');
    if (!el) return;

    /* 開催日時（JST）。+09:00 付き ISO 文字列なので端末の時差に依らない */
    var START = new Date('2026-09-20T11:00:00+09:00');
    var END   = new Date('2026-09-20T16:00:00+09:00');
    var DAY_MS = 24 * 60 * 60 * 1000;

    var now = new Date();
    var text;

    if (now < START) {
      var days = Math.ceil((START - now) / DAY_MS);
      text = (days === 1)
        ? 'いよいよ明日開催'
        : '開催まで あと' + days + '日';
    } else if (now <= END) {
      text = '本日開催中（16:00まで）';
    } else {
      text = '灘チャレンジ2026は終了しました。ご来場ありがとうございました';
    }

    el.textContent = text;
    el.hidden = false;
  })();

  /* ----------------------------------------------------------
     10. ヒーローの風演出 ＋ 軽いパララックス
         <section class="hero" data-wind> がある場合のみ有効。
         （data-wind を外せば機能ごと無効化できる）
         ・canvas に細い流線を生成して左→右へ緩やかに流す
           （色は既存トークン cerulean / deep-blue / teal のみ）
         ・ポインタ位置に応じて画像と風レイヤーを数pxだけ平行移動
           （タッチ端末は追従なし＝ゆっくり自動ドリフトのみ）
         ・画面外／非表示タブでは rAF を停止
         ・prefers-reduced-motion 時は何も生成しない（完全静止）
  ---------------------------------------------------------- */
  (function () {
    var hero = document.querySelector('.hero[data-wind]');
    if (!hero) return;

    var visual = hero.querySelector('.hero__visual');
    var heroImg = hero.querySelector('.hero__img');
    if (!visual) return;

    var SVGNS = 'http://www.w3.org/2000/svg';

    /* --- 装飾レイヤー（SVG の光の束）を .hero__visual の直後に挿入 --- */
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('class', 'hero__wind');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '0 0 1440 600');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

    /* グラデーション定義（色は既存トークン由来：deep-blue / cerulean / teal-ish） */
    var defs = document.createElementNS(SVGNS, 'defs');
    defs.innerHTML =
      '<linearGradient id="hw-core" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#1b4f9c" stop-opacity="0"/>' +
        '<stop offset="0.2" stop-color="#1b4f9c" stop-opacity="0.55"/>' +
        '<stop offset="0.5" stop-color="#2e7cd6" stop-opacity="0.9"/>' +
        '<stop offset="0.8" stop-color="#5fb0e8" stop-opacity="0.55"/>' +
        '<stop offset="1" stop-color="#5fb0e8" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<linearGradient id="hw-thin" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#2e7cd6" stop-opacity="0"/>' +
        '<stop offset="0.4" stop-color="#2e7cd6" stop-opacity="0.5"/>' +
        '<stop offset="0.65" stop-color="#7cc4f0" stop-opacity="0.7"/>' +
        '<stop offset="1" stop-color="#7cc4f0" stop-opacity="0"/>' +
      '</linearGradient>';
    svg.appendChild(defs);

    /* 中心線 y=300 を基準に、撚れる線を配置。
       prefers-reduced-motion 時は <animate> を付けず静止した束にする。 */
    var CY = 300;
    var lineDefs = [
      { grad: 'hw-core', w: 3.2, op: 1.0,  dur: 11   },
      { grad: 'hw-core', w: 2.6, op: 0.88, dur: 12.5 },
      { grad: 'hw-core', w: 2.2, op: 0.82, dur: 13.5 },
      { grad: 'hw-thin', w: 1.4, op: 0.78, dur: 10   },
      { grad: 'hw-thin', w: 1.2, op: 0.72, dur: 15   },
      { grad: 'hw-thin', w: 1.0, op: 0.66, dur: 12   },
      { grad: 'hw-thin', w: 0.9, op: 0.60, dur: 16   },
      { grad: 'hw-thin', w: 0.8, op: 0.50, dur: 9    },
      { grad: 'hw-thin', w: 0.7, op: 0.45, dur: 17   },
      { grad: 'hw-thin', w: 0.6, op: 0.40, dur: 13   }
    ];

    /* 撚れ用の3キーフレーム d 値を生成（中心 CY 付近で上下に振らせる） */
    var rand = function (a, b) { return a + Math.random() * (b - a); };
    var makeFrames = function () {
      var base = CY + rand(-12, 12);
      var a1 = rand(-58, -36), a2 = rand(36, 58);       // 振幅（上下）
      var p = function (y1, y2, y3, y4) {
        return 'M-260,' + base.toFixed(0) +
               ' C-60,' + y1 + ' 360,' + y2 + ' 760,' + base.toFixed(0) +
               ' C1060,' + y3 + ' 1300,' + y4 + ' 1700,' + base.toFixed(0);
      };
      var f1 = p((base + a1).toFixed(0), (base + a1 * 0.6).toFixed(0), (base + a2).toFixed(0), (base + a2 * 0.5).toFixed(0));
      var f2 = p((base + a2).toFixed(0), (base + a2 * 0.6).toFixed(0), (base + a1).toFixed(0), (base + a1 * 0.5).toFixed(0));
      return f1 + ';' + f2 + ';' + f1;
    };

    lineDefs.forEach(function (def) {
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'url(#' + def.grad + ')');
      path.setAttribute('stroke-width', def.w);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('opacity', def.op);
      var frames = makeFrames();
      var first = frames.split(';')[0];
      path.setAttribute('d', first);
      if (!prefersReduced) {
        var anim = document.createElementNS(SVGNS, 'animate');
        anim.setAttribute('attributeName', 'd');
        anim.setAttribute('dur', def.dur + 's');
        anim.setAttribute('repeatCount', 'indefinite');
        anim.setAttribute('calcMode', 'spline');
        anim.setAttribute('keyTimes', '0;0.5;1');
        anim.setAttribute('keySplines', '0.5 0 0.5 1;0.5 0 0.5 1');
        anim.setAttribute('values', frames);
        path.appendChild(anim);
      }
      svg.appendChild(path);
    });

    visual.insertAdjacentElement('afterend', svg);

    /* --- パララックス（画像と光の束を数pxだけ追従させる） --- */
    var isTouch = window.matchMedia('(hover: none)').matches;
    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var PARALLAX_PX = 6;
    var rafId = null, running = false, inView = true;
    var time = 0;

    var loop = function () {
      time += 0.016;
      if (isTouch) {
        targetX = Math.sin(time * 0.25) * (PARALLAX_PX * 0.6);
        targetY = Math.cos(time * 0.2) * (PARALLAX_PX * 0.4);
      }
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      if (heroImg) {
        heroImg.style.transform = 'translate(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px) scale(1.02)';
      }
      svg.style.transform = 'translate(' + (curX * 1.6).toFixed(2) + 'px,' + (curY * 1.6).toFixed(2) + 'px)';
      rafId = running ? requestAnimationFrame(loop) : null;
    };

    var updateRunning = function () {
      var shouldRun = inView && !document.hidden && !isTouch;
      if (shouldRun && !running) { running = true; rafId = requestAnimationFrame(loop); }
      else if (!shouldRun && running) { running = false; if (rafId) cancelAnimationFrame(rafId); rafId = null; }
    };

    /* タッチ端末では追従ループを回さず、画像は軽い拡大のみ（SVGの撚れは自走） */
    if (isTouch && heroImg) {
      heroImg.style.transform = 'scale(1.02)';
    }

    document.addEventListener('visibilitychange', updateRunning);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        updateRunning();
      }, { threshold: 0 }).observe(hero);
    }

    if (!isTouch) {
      var pending = false;
      hero.addEventListener('pointermove', function (e) {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          var nx = (e.clientX - rect.left) / rect.width - 0.5;
          var ny = (e.clientY - rect.top) / rect.height - 0.5;
          targetX = nx * -PARALLAX_PX * 2;
          targetY = ny * -PARALLAX_PX;
          pending = false;
        });
      });
      hero.addEventListener('pointerleave', function () { targetX = 0; targetY = 0; });
    }

    updateRunning();
  })();

  /* ----------------------------------------------------------
     11. タップ／クリック時の風（ひと吹き）
         <body data-wind-gust> がある場合のみ有効。
         （body の属性を外せば機能ごと無効化できる）
         クリック地点から右方向へ短い流線を数本流して消す。
         パーティクルが無い間は rAF を完全停止。
         reduced-motion 時は無効。
  ---------------------------------------------------------- */
  (function () {
    if (prefersReduced) return;
    if (!document.body.hasAttribute('data-wind-gust')) return;

    var canvas = null, ctx = null;
    var particles = [];
    var rafId = null;

    var rootStyle = getComputedStyle(document.documentElement);
    var cerulean = (rootStyle.getPropertyValue('--color-cerulean') || '#2e7cd6').trim();
    var teal = (rootStyle.getPropertyValue('--color-teal') || '#1e8a6e').trim();

    var hexToRgba = function (hex, alpha) {
      var h = hex.replace('#', '');
      return 'rgba(' + parseInt(h.substring(0, 2), 16) + ',' + parseInt(h.substring(2, 4), 16) + ',' + parseInt(h.substring(4, 6), 16) + ',' + alpha + ')';
    };

    var ensureCanvas = function () {
      if (canvas) return;
      canvas = document.createElement('canvas');
      canvas.className = 'wind-gust';
      canvas.setAttribute('aria-hidden', 'true');
      document.body.appendChild(canvas);
      ctx = canvas.getContext('2d');
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    var removeCanvas = function () {
      if (!canvas) return;
      canvas.remove();
      canvas = null;
      ctx = null;
    };

    var tick = function () {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      var alive = false;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.t += 0.03;
        if (p.t >= 1) continue;
        alive = true;

        p.x += p.vx;
        p.y += p.vy;
        var fade = 1 - p.t;

        ctx.beginPath();
        ctx.moveTo(p.x - p.len, p.y + Math.sin(p.x * 0.05) * 2);
        ctx.quadraticCurveTo(p.x - p.len * 0.5, p.y - 3, p.x, p.y);
        ctx.strokeStyle = hexToRgba(p.color, 0.35 * fade);
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      if (alive) {
        rafId = requestAnimationFrame(tick);
      } else {
        particles = [];
        rafId = null;
        removeCanvas(); // 終わったら canvas ごと片付ける
      }
    };

    document.addEventListener('click', function (e) {
      /* 控えめに：1クリックにつき3〜4本だけ */
      ensureCanvas();
      var count = 3 + Math.floor(Math.random() * 2);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: e.clientX,
          y: e.clientY + (Math.random() - 0.5) * 18,
          vx: 1.6 + Math.random() * 1.8,         // 右方向へドリフト
          vy: (Math.random() - 0.5) * 0.6,
          len: 18 + Math.random() * 26,
          t: 0,
          color: Math.random() < 0.7 ? cerulean : teal
        });
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    });
  })();
})();
/* 1b. ヒーローのテキスト：画面に入るたび再生、出ると巻き戻る */
(function () {
  var copy = document.querySelector('.hero__copy');
  if (!copy) return;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    copy.classList.add('is-revealed');
    return;
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          copy.classList.add('is-revealed');
        } else {
          copy.classList.remove('is-revealed');
        }
      });
    }, { threshold: 0.25 }).observe(copy);
  } else {
    copy.classList.add('is-revealed');
  }
})();
/* 1c. 段落テキスト：画面に入ると浮き上がり色づき、出ると元に戻る */
(function () {
  var lines = document.querySelectorAll('.reveal-line');
  if (lines.length === 0) return;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || prefersReduced) {
    lines.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      } else {
        entry.target.classList.remove('is-visible');
      }
    });
  }, { threshold: 0.15 });
  lines.forEach(function (el) { observer.observe(el); });
})();

/* ============================================================
   スポットカード：タップ／クリック時の虫眼鏡エフェクト
   押した位置に実線の虫眼鏡が出て、破線が波紋状に広がる。
   詳細ページへの遷移は NAV_DELAY だけ待ってから実行する
   （待たないと演出が見える前にページが切り替わるため）。
============================================================ */
(function () {
  var DURATION  = 560;  // 演出の長さ(ms)。CSSのanimationと揃えること
  var NAV_DELAY = 300;  // 遷移を遅らせる時間(ms)。0にすると即座に遷移

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 初回タップで画像が間に合わないのを防ぐため先読み
  ['img/zoom-pop.png', 'img/zoom-ring.png'].forEach(function (src) {
    var i = new Image(); i.src = src;
  });

  function findLink(target) {
    if (!target || !target.closest) return null;
    return target.closest('.card-spot__link');
  }

  function burst(x, y) {
    var wrap = document.createElement('div');
    wrap.className = 'zoom-burst';
    wrap.style.left = x + 'px';
    wrap.style.top  = y + 'px';

    var ring = document.createElement('img');
    ring.src = 'img/zoom-ring.png';
    ring.alt = '';
    ring.className = 'zoom-burst__ring';

    var pop = document.createElement('img');
    pop.src = 'img/zoom-pop.png';
    pop.alt = '';
    pop.className = 'zoom-burst__pop';

    wrap.appendChild(ring);
    wrap.appendChild(pop);
    document.body.appendChild(wrap);

    setTimeout(function () {
      if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    }, DURATION + 80);
  }

  // 押した瞬間に演出を出す
  document.addEventListener('pointerdown', function (e) {
    if (reduced || !findLink(e.target)) return;
    burst(e.clientX, e.clientY);
  }, { passive: true });

  // 演出が見えるよう、遷移を少しだけ待つ
  document.addEventListener('click', function (e) {
    if (reduced || NAV_DELAY <= 0) return;
    var link = findLink(e.target);
    if (!link) return;
    // 新しいタブで開く操作などは邪魔しない
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var href = link.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    setTimeout(function () { window.location.href = href; }, NAV_DELAY);
  });
})();
