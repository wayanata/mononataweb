/* ==========================================================================
   MONONATA — main.js
   Clean, consolidated version.
   ========================================================================== */

(function () {
  'use strict';

  /* ----- 1. Mobile nav (burger) ------------------------------------------ */
  function initBurger() {
    const btn = document.querySelector('[data-burger]');
    const mobile = document.querySelector('[data-mobile]');
    if (!btn || !mobile) return;

    btn.addEventListener('click', () => {
      const isOpen = mobile.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu after clicking any link inside
    mobile.addEventListener('click', (e) => {
      if (e.target.closest('a')) {
        mobile.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----- 2. Category filter (photography + videography) ------------------ */
  function initFilters() {
    document.querySelectorAll('.catbar').forEach((bar) => {
      const scope = bar.closest('.card') || bar.parentElement;
      const gallery = scope && scope.querySelector('[data-gallery]');
      if (!gallery) return;

      const buttons = bar.querySelectorAll('.cat');
      const items = gallery.querySelectorAll('.g-item, .v-item');
      if (!buttons.length || !items.length) return;

      const setActive = (activeBtn) => {
        buttons.forEach((b) => {
          const on = b === activeBtn;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-pressed', String(on));
        });
      };

      const applyFilter = (cat) => {
        const key = (cat || 'all').toLowerCase();
        items.forEach((it) => {
          // Normalize data-cat: lowercase, split on whitespace AND slashes,
          // so "documentation/event" → ["documentation", "event"]
          const cats = (it.getAttribute('data-cat') || '')
            .toLowerCase()
            .split(/[\s/,]+/)
            .filter(Boolean);

          const show = key === 'all' || cats.includes(key);
          it.classList.toggle('is-hidden', !show);
        });
      };

      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const cat = btn.dataset.filter || 'all';
          setActive(btn);
          applyFilter(cat);
        });
      });

      // Init: show all
      applyFilter('all');
    });
  }

  /* ----- 3. Lazy-load iframes (swap data-src → src when in view) --------- */
  function initLazyIframes() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    if (!iframes.length) return;

    // Fallback: no IntersectionObserver support → load all
    if (!('IntersectionObserver' in window)) {
      iframes.forEach((f) => {
        f.src = f.dataset.src;
        f.removeAttribute('data-src');
      });
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const f = e.target;
          if (!f.src && f.dataset.src) {
            f.src = f.dataset.src;
            f.removeAttribute('data-src');
          }
          io.unobserve(f);
        });
      },
      { rootMargin: '300px 0px' } // start loading 300px before entering viewport
    );

    iframes.forEach((f) => io.observe(f));
  }

  /* ----- 4. Unmute hero showreel ----------------------------------------- */
  function initUnmute() {
    const btn = document.querySelector('[data-unmute]');
    const iframe = document.querySelector('.showreel-video iframe, .hero-video iframe');
    if (!btn || !iframe) return;

    btn.addEventListener('click', () => {
      // Make sure the iframe is loaded first (handles lazy-load case)
      const current = iframe.src || iframe.dataset.src || '';
      if (!current) return;

      const unmuted = current.replace(/([?&])mute=1/, '$1mute=0');
      iframe.src = unmuted.includes('mute=0') ? unmuted : current + (current.includes('?') ? '&' : '?') + 'mute=0';

      btn.innerHTML = '<span aria-hidden="true">🔈</span> Sound on';
      btn.setAttribute('aria-label', 'Sound is on');
      btn.disabled = true;
    });
  }

  /* ----- 5. Smooth-scroll offset for sticky nav (progressive) ------------ */
  // (Browser's native `scroll-behavior: smooth` already handles this;
  //  nothing extra needed here.)

  /* ----- Init on DOM ready ----------------------------------------------- */
  function init() {
    initBurger();
    initFilters();
    initLazyIframes();
    initUnmute();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
