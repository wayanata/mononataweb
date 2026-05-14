/* ==========================================================================
   MONONATA — main.js
   ========================================================================== */

(function () {
  'use strict';

  /* ----- 1. Mobile nav (burger) ------------------------------------------ */
  function initBurger() {
    const btn = document.querySelector('[data-burger]');
    const mobile = document.querySelector('[data-mobile]');
    if (!btn || !mobile) return;

    const setOpen = (open) => {
      mobile.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };

    btn.addEventListener('click', () => {
      setOpen(!mobile.classList.contains('open'));
    });

    mobile.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobile.classList.contains('open')) {
        setOpen(false);
        btn.focus();
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
          b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
      };

      const applyFilter = (cat) => {
        const key = (cat || 'all').toLowerCase();
        items.forEach((it) => {
          const cats = (it.getAttribute('data-cat') || '')
            .toLowerCase()
            .split(/[\s/,]+/)
            .filter(Boolean);
          const show = key === 'all' || cats.includes(key);
          it.classList.toggle('is-hidden', !show);
        });
      };

      buttons.forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');
        btn.addEventListener('click', () => {
          const cat = btn.dataset.filter || 'all';
          setActive(btn);
          applyFilter(cat);
        });
      });

      const defaultBtn = bar.querySelector('.cat.is-active') || buttons[0];
      if (defaultBtn) setActive(defaultBtn);
      applyFilter('all');
    });
  }

  /* ----- 3. YouTube facade (thumbnail → click-to-play) ------------------- */
  // Saves bandwidth & CPU. The hero showreel is excluded so it can autoplay.
  function initYouTubeFacade() {
    const wraps = document.querySelectorAll('.v-item .embed[data-yt]');
    wraps.forEach((wrap) => {
      const id = wrap.getAttribute('data-yt');
      if (!id) return;

      const title = wrap.getAttribute('data-yt-title') || 'YouTube video';
      const isVertical = wrap.classList.contains('ratio-9x16');
      const thumb = `https://i.ytimg.com/vi/${id}/${isVertical ? 'hqdefault' : 'maxresdefault'}.jpg`;
      const thumbFallback = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

      wrap.innerHTML = `
        <button class="yt-facade" type="button" aria-label="Play: ${title}">
          <img src="${thumb}" alt="" loading="lazy" onerror="this.src='${thumbFallback}'">
          <span class="yt-play" aria-hidden="true">
            <svg viewBox="0 0 68 48" width="56" height="40" focusable="false">
              <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="#f00"/>
              <path d="M45 24 27 14v20" fill="#fff"/>
            </svg>
          </span>
        </button>
      `;

      const btn = wrap.querySelector('.yt-facade');
      btn.addEventListener('click', () => {
        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
        iframe.title = title;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
        iframe.setAttribute('allowfullscreen', '');
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        wrap.innerHTML = '';
        wrap.appendChild(iframe);
      });
    });
  }

  /* ----- 4. Lazy-load iframes for hero showreel (data-src) --------------- */
  function initLazyIframes() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    if (!iframes.length) return;

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
      { rootMargin: '120px 0px' }
    );

    iframes.forEach((f) => io.observe(f));
  }

  /* ----- 5. Unmute hero showreel ----------------------------------------- */
  function initUnmute() {
    const btn = document.querySelector('[data-unmute]');
    const iframe = document.querySelector('.showreel-video iframe, .hero-video iframe');
    if (!btn || !iframe) return;

    btn.addEventListener('click', () => {
      const current = iframe.src || iframe.dataset.src || '';
      if (!current) return;
      const unmuted = current.replace(/([?&])mute=1/, '$1mute=0');
      iframe.src = unmuted.includes('mute=0') ? unmuted : current + (current.includes('?') ? '&' : '?') + 'mute=0';
      btn.innerHTML = '<span aria-hidden="true">🔈</span> Sound on';
      btn.setAttribute('aria-label', 'Sound is on');
      btn.disabled = true;
    });
  }

  /* ----- 6. Lightbox for photo gallery ----------------------------------- */
  function initLightbox() {
    const gallery = document.querySelector('.gallery');
    const lightbox = document.querySelector('[data-lightbox]');
    if (!gallery || !lightbox) return;

    const imgEl = lightbox.querySelector('[data-lb-img]');
    const captionEl = lightbox.querySelector('[data-lb-caption]');
    const counterEl = lightbox.querySelector('[data-lb-counter]');
    const closeBtn = lightbox.querySelector('[data-lb-close]');
    const prevBtn = lightbox.querySelector('[data-lb-prev]');
    const nextBtn = lightbox.querySelector('[data-lb-next]');

    let index = 0;
    let items = [];
    let lastFocus = null;

    const collectVisible = () =>
      Array.from(gallery.querySelectorAll('.g-item:not(.is-hidden) img'));

    const render = () => {
      const img = items[index];
      if (!img) return;
      imgEl.src = img.src;
      imgEl.alt = img.alt || '';
      captionEl.textContent = img.alt || '';
      counterEl.textContent = `${index + 1} / ${items.length}`;
    };

    const open = (startImg) => {
      items = collectVisible();
      index = Math.max(0, items.indexOf(startImg));
      lastFocus = document.activeElement;
      render();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      imgEl.src = '';
      if (lastFocus) lastFocus.focus();
    };

    const step = (delta) => {
      if (!items.length) return;
      index = (index + delta + items.length) % items.length;
      render();
    };

    gallery.addEventListener('click', (e) => {
      const img = e.target.closest('.g-item img');
      if (!img) return;
      e.preventDefault();
      open(img);
    });

    gallery.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const item = e.target.closest('.g-item');
      if (!item) return;
      const img = item.querySelector('img');
      if (img) {
        e.preventDefault();
        open(img);
      }
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lb-backdrop')) close();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });

    // Make gallery items keyboard-accessible
    gallery.querySelectorAll('.g-item').forEach((item) => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      const img = item.querySelector('img');
      item.setAttribute('aria-label', img && img.alt ? `Open: ${img.alt}` : 'Open photo');
    });
  }

  /* ----- 7. Scroll-reveal animations ------------------------------------- */
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-revealed'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  /* ----- 8. Animated counters (hero stats) ------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const animate = (el) => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = target + suffix;
      };
      requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => io.observe(el));
  }

  /* ----- 9. Back-to-top button ------------------------------------------- */
  function initBackToTop() {
    const btn = document.querySelector('[data-to-top]');
    if (!btn) return;
    const onScroll = () => {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----- 10. Active nav link on scroll ----------------------------------- */
  function initActiveNav() {
    const links = document.querySelectorAll('.links a[href^="#"], .mobile a[href^="#"]');
    const sections = Array.from(links)
      .map((a) => document.getElementById(a.getAttribute('href').slice(1)))
      .filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const setActive = (id) => {
      links.forEach((a) => {
        a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ----- 11. Contact form (mailto fallback) ------------------------------ */
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const status = form.querySelector('[data-form-status]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const type = (data.get('type') || '').toString().trim();
      const location = (data.get('location') || '').toString().trim();
      const date = (data.get('date') || '').toString().trim();
      const message = (data.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        if (status) status.textContent = 'Please fill in your name, email, and a short message.';
        return;
      }

      const body = [
        `Name: ${name}`,
        `Email: ${email}`,
        type ? `Project type: ${type}` : '',
        location ? `Location: ${location}` : '',
        date ? `Date: ${date}` : '',
        '',
        message,
      ].filter(Boolean).join('\n');

      const mailto = `mailto:mononatateam@gmail.com?subject=${encodeURIComponent(
        `Project inquiry — ${name}`
      )}&body=${encodeURIComponent(body)}`;

      window.location.href = mailto;
      if (status) status.textContent = 'Opening your email app… If nothing happens, message us on WhatsApp.';
    });
  }

  /* ----- Init on DOM ready ----------------------------------------------- */
  function init() {
    initBurger();
    initFilters();
    initYouTubeFacade();
    initLazyIframes();
    initUnmute();
    initLightbox();
    initReveal();
    initCounters();
    initBackToTop();
    initActiveNav();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
