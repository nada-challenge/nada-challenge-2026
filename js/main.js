/* ============================================================
   灘チャレンジ2026 共通スクリプト
   1. ヒーロー読み込み演出（orchestrated moment）
   2. ハンバーガーメニュー
   3. スクロール時ヘッダー罫線
   4. Intersection Observer によるフェードイン
   5. リボン・ディバイダーの描画演出
   6. カテゴリーフィルター（spot.html / index.html 共通）
   7. スムーズスクロール
   8. スポット画像フォールバック
   ============================================================ */

(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
})();
