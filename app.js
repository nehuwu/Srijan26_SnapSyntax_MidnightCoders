/* ═══════════════════════════════════
   NAVBAR — SCROLL SHRINK + HAMBURGER
═══════════════════════════════════ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const ham     = document.getElementById('hamburger');
  const drawer  = document.getElementById('mobile-drawer');
  const mLinks  = document.querySelectorAll('.mobile-link');

  // Scroll shrink
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Hamburger toggle
  ham.addEventListener('click', () => {
    const open = ham.classList.toggle('open');
    drawer.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on link click
  mLinks.forEach(link => {
    link.addEventListener('click', () => {
      ham.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      ham.classList.remove('open');
      drawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ═══════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════ */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  els.forEach(el => observer.observe(el));
})();

/* ═══════════════════════════════════
   ANIMATED COUNTERS
═══════════════════════════════════ */
(function initCounters() {
  const counterEls = document.querySelectorAll('[data-target]');
  let triggered = false;

  function animateCount(el) {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1600;
    const step    = 16;
    const steps   = dur / step;
    const inc     = target / steps;
    let current   = 0;
    let frame     = 0;

    const timer = setInterval(() => {
      frame++;
      // Ease-out cubic
      const progress = frame / steps;
      const eased    = 1 - Math.pow(1 - progress, 3);
      current        = Math.min(Math.round(eased * target), target);
      el.textContent = current.toLocaleString() + suffix;

      if (current >= target) {
        clearInterval(timer);
        el.textContent = target.toLocaleString() + suffix;
      }
    }, step);
  }

  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      counterEls.forEach(el => animateCount(el));
    }
  }, { threshold: 0.3 });

  observer.observe(statsSection);
})();

/* ═══════════════════════════════════
   TESTIMONIAL CAROUSEL
═══════════════════════════════════ */
(function initCarousel() {
  const track   = document.getElementById('testimonial-track');
  const dotsWrap= document.getElementById('tc-dots');
  const prevBtn = document.getElementById('tc-prev');
  const nextBtn = document.getElementById('tc-next');
  if (!track) return;

  const cards       = track.querySelectorAll('.tcard');
  const total       = cards.length;
  let current       = 0;
  let autoplay      = null;
  let cardsVisible  = 3;

  function getVisible() {
    if (window.innerWidth <= 480)  return 1;
    if (window.innerWidth <= 900)  return 1;
    if (window.innerWidth <= 1100) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    cardsVisible = getVisible();
    const pages = Math.ceil(total / cardsVisible);
    for (let i = 0; i < pages; i++) {
      const d = document.createElement('div');
      d.className = 'tc-dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function goTo(page) {
    cardsVisible = getVisible();
    const pages  = Math.ceil(total / cardsVisible);
    current      = ((page % pages) + pages) % pages;

    // Card width includes gap
    const cardEl      = cards[0];
    const cardStyle   = getComputedStyle(cardEl);
    const gap         = 20;
    const cardWidth   = cardEl.offsetWidth + gap;
    const offset      = current * cardsVisible * cardWidth;

    track.style.transform = `translateX(-${offset}px)`;

    // Update dots
    dotsWrap.querySelectorAll('.tc-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() {
    cardsVisible = getVisible();
    const pages = Math.ceil(total / cardsVisible);
    goTo((current + 1) % pages);
  }

  function prev() {
    cardsVisible = getVisible();
    const pages = Math.ceil(total / cardsVisible);
    goTo((current - 1 + pages) % pages);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplay = setInterval(next, 5000);
  }

  function stopAutoplay() {
    if (autoplay) { clearInterval(autoplay); autoplay = null; }
  }

  prevBtn.addEventListener('click', () => { stopAutoplay(); prev(); startAutoplay(); });
  nextBtn.addEventListener('click', () => { stopAutoplay(); next(); startAutoplay(); });

  // Touch/swipe
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAutoplay(); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    startAutoplay();
  }, { passive: true });

  window.addEventListener('resize', () => {
    buildDots();
    goTo(0);
  });

  buildDots();
  startAutoplay();
})();

/* ═══════════════════════════════════
   PRODUCT PREVIEW TABS
═══════════════════════════════════ */
(function initTabs() {
  const tabs = document.querySelectorAll('.ptab');
  const panels = {
    editor:    document.getElementById('tab-editor'),
    dashboard: document.getElementById('tab-dashboard'),
    roadmap:   document.getElementById('tab-roadmap'),
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const id = tab.dataset.tab;
      Object.keys(panels).forEach(key => {
        panels[key].classList.toggle('hidden', key !== id);
      });
    });
  });
})();

/* ═══════════════════════════════════
   SMOOTH SCROLL FOR ANCHOR LINKS
═══════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ═══════════════════════════════════
   TYPING ANIMATION — HERO EDITOR
═══════════════════════════════════ */
(function initTypingEffect() {
  const cursor = document.querySelector('.em-pre .tok-caret');
  if (!cursor) return;

  // Cursor is already animated via CSS — nothing more needed
  // Could extend here for actual typewriter effect
})();

/* ═══════════════════════════════════
   CTA CODE TYPEWRITER
═══════════════════════════════════ */
(function initCtaTypewriter() {
  const ctaCode  = document.querySelector('.cta-code');
  if (!ctaCode) return;

  const lines = [
    '<span class="tok-tag">&lt;</span><span class="tok-sel">div</span> <span class="tok-attr">class</span>=<span class="tok-val">"your-future"</span><span class="tok-tag">&gt;</span>',
    '<span class="tok-tag">&lt;/div&gt;</span>',
    '<span class="tok-tag">&lt;</span><span class="tok-sel">h1</span><span class="tok-tag">&gt;</span><span class="tok-val">Hello World</span><span class="tok-tag">&lt;/h1&gt;</span>',
    '<span class="tok-sel">.box</span> <span class="tok-brace">{</span> <span class="tok-prop">background</span>: <span class="tok-val">#22c55e</span>; <span class="tok-brace">}</span>',
  ];
  let lineIdx = 0;

  const spans = ctaCode.querySelectorAll('span:not(.cta-cursor)');
  const cursorEl = ctaCode.querySelector('.cta-cursor');

  setInterval(() => {
    lineIdx = (lineIdx + 1) % lines.length;
    // Just update the visible line content
    // Simple swap approach
    const container = ctaCode;
    if (spans.length >= 2) {
      spans[0].outerHTML; // no-op for complex swap
    }
  }, 3000);
})();

/* ═══════════════════════════════════
   LAZY LOAD IMAGES
═══════════════════════════════════ */
(function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;

  const imgs = document.querySelectorAll('img[data-src]');
  if (!imgs.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  imgs.forEach(img => observer.observe(img));
})();
