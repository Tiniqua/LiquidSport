(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Theme toggle
   */
  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
    }

    const updateThemeButton = () => {
      const isDark = document.body.classList.contains('dark-theme');

      themeToggle.setAttribute('aria-pressed', String(isDark));
      themeToggle.setAttribute(
          'aria-label',
          isDark ? 'Switch to light mode' : 'Switch to dark mode'
      );
    };

    updateThemeButton();

    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark-theme');

      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      updateThemeButton();
    });
  }

  /**
   * Shrinking sticky header
   */
  const header = document.querySelector('.site-header');

  const updateHeaderScale = () => {
    if (!header) return;

    const maxScroll = 180;
    const scrollProgress = Math.min(window.scrollY / maxScroll, 1);

    const topScale = 1;
    const scrolledScale = 0.7;

    const scale = topScale - scrollProgress * (topScale - scrolledScale);

    document.documentElement.style.setProperty('--header-scale', scale.toFixed(3));
    header.classList.toggle('is-scrolled', scrollProgress > 0.85);
  };

  updateHeaderScale();
  window.addEventListener('scroll', updateHeaderScale, { passive: true });

  /**
   * Primary CTA smooth scroll
   */
  const contactSection = document.getElementById('contact');
  const cta = document.getElementById('primary-cta');

  if (cta && contactSection) {
    cta.addEventListener('click', (event) => {
      event.preventDefault();

      contactSection.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  }

  /**
   * Smooth internal anchor scrolling
   */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');

      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start'
      });
    });
  });

  /**
   * Simple contact form feedback
   */
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = form.querySelector('#name');
      const email = form.querySelector('#email');
      const message = form.querySelector('#message');

      const hasName = name && name.value.trim().length > 0;
      const hasEmail = email && email.value.trim().length > 0;
      const hasMessage = message && message.value.trim().length > 0;

      if (!hasName || !hasEmail || !hasMessage) {
        feedback.textContent = 'Please complete all fields before sending.';
        return;
      }

      feedback.textContent = "Thank you, we'll be in touch soon.";
      form.reset();
    });
  }

  /**
   * Subtle liquid cursor glow
   */
  const liquidGlowElements = document.querySelectorAll(
      [
        '.card',
        '.hero-note',
        '.service-card',
        '#contact-form',
        '.challenge-grid li',
        '.mini-card'
      ].join(', ')
  );

  liquidGlowElements.forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      element.style.setProperty('--mx', `${x}%`);
      element.style.setProperty('--my', `${y}%`);
    });

    element.addEventListener('pointerleave', () => {
      element.style.setProperty('--mx', '50%');
      element.style.setProperty('--my', '50%');
    });
  });

  /**
   * Soft scroll reveal
   */
  const revealElements = document.querySelectorAll(
      [
        '.section h2',
        '.section h3',
        '.section .lead',
        '.section > .container > p',
        '.section-heading',
        '.service-track',
        '.challenge-grid li',
        '.contact-layout > *',
        '.hero-layout > *',
        '.about-layout > *',
        '.about-highlights > *',
        '.publication-card',
        '.policy-card',
        '.cta-row',
        '.card',
        '.hero-note'
      ].join(', ')
  );

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    revealElements.forEach((element) => {
      element.classList.add('reveal');
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
          });
        },
        {
          threshold: 0.02,
          rootMargin: '0px 0px -8% 0px'
        }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add('reveal', 'is-visible');
    });
  }

  /**
   * Service carousel logic
   */
  function initServiceCarousel(carousel) {
    const viewport = carousel.querySelector('[data-viewport]');
    const track = carousel.querySelector('[data-track]');
    const cards = track ? Array.from(track.children) : [];
    const prevBtn = carousel.querySelector('[data-dir="prev"]');
    const nextBtn = carousel.querySelector('[data-dir="next"]');

    if (!viewport || !track || !cards.length) return;

    let index = 1;
    let activeCount = 3;

    const setActiveCount = () => {
      const width = window.innerWidth;

      if (width <= 540) activeCount = 1;
      else if (width <= 980) activeCount = 2;
      else activeCount = 3;
    };

    const getMaxIndex = () => {
      return Math.max(0, cards.length - activeCount);
    };

    const clampIndex = () => {
      index = Math.min(Math.max(index, 0), getMaxIndex());
    };

    const getCardStep = () => {
      if (!cards.length) return 0;

      const cardWidth = cards[0].getBoundingClientRect().width;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');

      return cardWidth + gap;
    };

    const updateButtons = () => {
      if (prevBtn) {
        prevBtn.hidden = index === 0;
        prevBtn.disabled = index === 0;
      }

      if (nextBtn) {
        nextBtn.hidden = index >= getMaxIndex();
        nextBtn.disabled = index >= getMaxIndex();
      }
    };

    const updateState = () => {
      setActiveCount();
      clampIndex();

      const step = getCardStep();
      const visibleStartIndex = Math.max(0, index - 1);
      const offset = -(visibleStartIndex * step);

      track.style.transform = `translateX(${offset}px)`;

      cards.forEach((card, i) => {
        const isLeftPreview = i === index - 1;
        const isRightPreview = i === index + activeCount;
        const isActive = i >= index && i < index + activeCount;
        const isPreview = isLeftPreview || isRightPreview;
        const isHidden = !isActive && !isPreview;

        card.classList.toggle('is-preview', isPreview);
        card.classList.toggle('is-active', isActive);
        card.classList.toggle('is-hidden-card', isHidden);

        card.dataset.carouselRole = '';

        if (isLeftPreview) {
          card.dataset.carouselRole = 'prev';
        } else if (isRightPreview) {
          card.dataset.carouselRole = 'next';
        }

        card.setAttribute('aria-hidden', isHidden ? 'true' : 'false');

        if (isHidden) {
          card.setAttribute('inert', '');
          card.tabIndex = -1;
        } else {
          card.removeAttribute('inert');
          card.tabIndex = isPreview ? 0 : -1;
        }
      });

      updateButtons();
    };

    const moveBy = (direction) => {
      index += direction;
      clampIndex();
      updateState();
    };

    nextBtn?.addEventListener('click', () => moveBy(1));
    prevBtn?.addEventListener('click', () => moveBy(-1));

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        if (card.dataset.carouselRole === 'prev') {
          moveBy(-1);
        }

        if (card.dataset.carouselRole === 'next') {
          moveBy(1);
        }
      });

      card.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;

        if (card.dataset.carouselRole === 'prev') {
          event.preventDefault();
          moveBy(-1);
        }

        if (card.dataset.carouselRole === 'next') {
          event.preventDefault();
          moveBy(1);
        }
      });
    });

    let resizeFrame = null;

    const requestCarouselUpdate = () => {
      if (resizeFrame) cancelAnimationFrame(resizeFrame);

      resizeFrame = requestAnimationFrame(() => {
        updateState();
        resizeFrame = null;
      });
    };

    window.addEventListener('resize', requestCarouselUpdate);

    updateState();
  }

  document.querySelectorAll('[data-carousel]').forEach(initServiceCarousel);
})();