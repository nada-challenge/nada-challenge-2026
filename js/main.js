/* ============================================================
   灘チャレンジ2026 共通スクリプト
   1. ハンバーガーメニュー
   2. スクロール時ヘッダー背景変更
   3. Intersection Observer によるフェードイン
   4. カテゴリーフィルター（spot.html / index.html 共通）
   5. スムーズスクロール
   6. スポット画像フォールバック
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. ハンバーガーメニュー（ナビ開閉）
  ---------------------------------------------------------- */
  var navToggle = document.querySelector('.nav__toggle');
  var navList = document.querySelector('.nav__list');

  if (navToggle && navList) {
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
  }

  /* ----------------------------------------------------------
     2. スクロール時ヘッダー背景変更
  ---------------------------------------------------------- */
  var header = document.querySelector('.header');

  if (header) {
    var onScroll = function () {
      if (window.scrollY > 40) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----------------------------------------------------------
     3. Intersection Observer によるフェードイン
        .fade-in を持つ要素がビューポートに入ったら表示
  ---------------------------------------------------------- */
  var fadeTargets = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window && fadeTargets.length > 0) {
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
  } else {
    // 非対応環境ではすべて表示
    fadeTargets.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ----------------------------------------------------------
     4. カテゴリーフィルター
        data-category 属性によるスポットカードの絞り込み
  ---------------------------------------------------------- */
  var filterButtons = document.querySelectorAll('.category-filter__btn');
  var spotCards = document.querySelectorAll('.card-spot');

  if (filterButtons.length > 0 && spotCards.length > 0) {
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
  }

  /* ----------------------------------------------------------
     5. スムーズスクロール（a[href^="#"] 全リンク）
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({
          behavior: prefersReduced ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });

  /* ----------------------------------------------------------
     6. スポット画像フォールバック
        画像が読み込めない場合はカテゴリ名入りのカラー背景を表示
  ---------------------------------------------------------- */
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
