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
          - data-spots-desc      があれば一言説明も表示（spot.html 用）
          - data-spots-placeholder があれば末尾に「準備中」カードを追加
        ・[data-sponsors-render] に協賛企業を描画（空なら案内文を表示）
        ※ 後続モジュール（フェードイン・フィルター・画像フォールバック）
          より先に実行する必要があるため、必ずこの位置に置くこと。
  ---------------------------------------------------------- */
  (function () {
    var data = window.NADA_DATA;
    if (!data) return;

    /* --- スポットカード --- */
    document.querySelectorAll('[data-spots-render]').forEach(function (grid) {
      var limit = parseInt(grid.getAttribute('data-spots-limit'), 10);
      var withDesc = grid.hasAttribute('data-spots-desc');
      var spots = isNaN(limit) ? data.spots : data.spots.slice(0, limit);
      var nameTag = withDesc ? 'h2' : 'h3'; // 一覧ページは h2、抜粋は h3（既存マークアップ準拠）

      spots.forEach(function (spot) {
        var label = data.categories[spot.category] || 'その他';
        var card = document.createElement('article');
        card.className = 'card-spot fade-in';
        card.setAttribute('data-category', spot.category);
        card.innerHTML =
          '<div class="card-spot__media">' +
            '<img src="img/shop/' + spot.slug + '.jpg" alt="" class="card-spot__img" loading="lazy" decoding="async">' +
            '<span class="card-spot__fallback"></span>' +
          '</div>' +
          '<div class="card-spot__body">' +
            '<' + nameTag + ' class="card-spot__name"></' + nameTag + '>' +
            '<span class="card-spot__tag"></span>' +
            (withDesc ? '<p class="card-spot__desc"></p>' : '') +
          '</div>';
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

      /* 「準備中」カード（spot.html のみ） */
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
            '<p class="card-spot__desc">新しいおすすめスポットを随時追加していきます。</p>' +
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

    if (!('IntersectionObserver' in window) || prefersReduced) {
      ribbons.forEach(function (el) {
        el.classList.add('is-drawn');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-drawn');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
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
    if (!hero || prefersReduced) return;

    var visual = hero.querySelector('.hero__visual');
    var heroImg = hero.querySelector('.hero__img');
    if (!visual) return;

    /* --- 装飾レイヤー（canvas）を .hero__visual の直後に挿入 --- */
    var canvas = document.createElement('canvas');
    canvas.className = 'hero__wind';
    canvas.setAttribute('aria-hidden', 'true');
    visual.insertAdjacentElement('afterend', canvas);
    var ctx = canvas.getContext('2d');

    /* --- 既存トークンから色を取得（新しい色は定義しない） --- */
    var rootStyle = getComputedStyle(document.documentElement);
    var hexToRgba = function (hex, alpha) {
      var h = hex.trim().replace('#', '');
      var r = parseInt(h.substring(0, 2), 16);
      var g = parseInt(h.substring(2, 4), 16);
      var b = parseInt(h.substring(4, 6), 16);
      return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    };
    var COLORS = [
      rootStyle.getPropertyValue('--color-cerulean')  || '#2e7cd6',
      rootStyle.getPropertyValue('--color-deep-blue') || '#1b4f9c',
      rootStyle.getPropertyValue('--color-teal')      || '#1e8a6e'
    ];

    /* --- 状態 --- */
    var W = 0, H = 0, DPR = 1;
    var wisps = [];
    var rafId = null;
    var running = false;
    var inView = true;
    var isTouch = window.matchMedia('(hover: none)').matches;

    /* パララックス：目標値と現在値（lerp で滑らかに追従） */
    var targetX = 0, targetY = 0, curX = 0, curY = 0;
    var PARALLAX_PX = 6; // 最大移動量（控えめに数px）

    var resize = function () {
      DPR = Math.min(window.devicePixelRatio || 1, 2); // 高DPIは2倍まで
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    /* --- 流線（wisp）の生成。本数は控えめに --- */
    var WISP_COUNT = window.innerWidth < 768 ? 5 : 8;

    var newWisp = function (spawnAnywhere) {
      var len = 90 + Math.random() * 140;       // 流線の長さ
      return {
        x: spawnAnywhere ? Math.random() * W : -len,
        y: H * (0.12 + Math.random() * 0.76),   // 縦位置はランダム
        len: len,
        speed: 0.35 + Math.random() * 0.5,      // 横方向の速さ（緩やか）
        amp: 4 + Math.random() * 9,             // 上下の揺らぎ幅
        k: 0.004 + Math.random() * 0.006,       // 揺らぎの波長
        phase: Math.random() * Math.PI * 2,
        width: 0.8 + Math.random() * 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 0.10 + Math.random() * 0.14      // ごく淡く
      };
    };

    var initWisps = function () {
      wisps = [];
      for (var i = 0; i < WISP_COUNT; i++) wisps.push(newWisp(true));
    };

    /* --- 描画ループ --- */
    var time = 0;
    var draw = function () {
      ctx.clearRect(0, 0, W, H);
      time += 0.016;

      /* パララックス目標：タッチ端末はゆっくり自動ドリフト */
      if (isTouch) {
        targetX = Math.sin(time * 0.25) * (PARALLAX_PX * 0.6);
        targetY = Math.cos(time * 0.2) * (PARALLAX_PX * 0.4);
      }
      curX += (targetX - curX) * 0.05;
      curY += (targetY - curY) * 0.05;
      if (heroImg) {
        heroImg.style.transform = 'translate(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px) scale(1.02)';
      }
      /* 風レイヤーは画像より少し大きく動かして奥行き感を出す */
      ctx.save();
      ctx.translate(curX * 1.6, curY * 1.6);

      for (var i = 0; i < wisps.length; i++) {
        var w = wisps[i];
        w.x += w.speed;

        /* 端のフェード（出入りで急に現れないように） */
        var edge = Math.min(1, (w.x + w.len) / 120, (W + w.len - w.x) / 160);
        if (edge < 0) edge = 0;

        ctx.beginPath();
        var STEP = 14;
        for (var t = 0; t <= w.len; t += STEP) {
          var px = w.x - t;
          var py = w.y + Math.sin(px * w.k + w.phase + time * 0.6) * w.amp;
          if (t === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = hexToRgba(w.color, w.alpha * edge);
        ctx.lineWidth = w.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (w.x - w.len > W + 40) wisps[i] = newWisp(false); // 画面外で再生成
      }
      ctx.restore();

      rafId = running ? requestAnimationFrame(draw) : null;
    };

    /* --- 起動／停止（タブ非表示・画面外で止める） --- */
    var updateRunning = function () {
      var shouldRun = inView && !document.hidden;
      if (shouldRun && !running) {
        running = true;
        rafId = requestAnimationFrame(draw);
      } else if (!shouldRun && running) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    document.addEventListener('visibilitychange', updateRunning);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        updateRunning();
      }, { threshold: 0 }).observe(hero);
    }

    /* --- ポインタ追従（スロットル付き・タッチ端末は無し） --- */
    if (!isTouch) {
      var pending = false;
      hero.addEventListener('pointermove', function (e) {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          var nx = (e.clientX - rect.left) / rect.width - 0.5;  // -0.5〜0.5
          var ny = (e.clientY - rect.top) / rect.height - 0.5;
          targetX = nx * -PARALLAX_PX * 2; // ポインタと逆方向に僅かに
          targetY = ny * -PARALLAX_PX;
          pending = false;
        });
      });
      hero.addEventListener('pointerleave', function () {
        targetX = 0;
        targetY = 0;
      });
    }

    var resizePending = false;
    window.addEventListener('resize', function () {
      if (resizePending) return;
      resizePending = true;
      requestAnimationFrame(function () {
        resize();
        resizePending = false;
      });
    });

    resize();
    initWisps();
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
