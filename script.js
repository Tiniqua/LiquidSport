(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const themeToggle = document.getElementById('theme-toggle');

  if (themeToggle) {
    const setTheme = (theme) => {
      const isLight = theme === 'light';

      document.body.classList.toggle('light-theme', isLight);
      themeToggle.setAttribute('aria-pressed', String(!isLight));
      themeToggle.setAttribute(
          'aria-label',
          isLight ? 'Switch to dark mode' : 'Switch to light mode'
      );

      localStorage.setItem('site-theme', theme);
    };

    const savedTheme = localStorage.getItem('site-theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.contains('light-theme');
      setTheme(isLight ? 'dark' : 'light');
    });
  }

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

  const contactSection = document.getElementById('contact');
  const cta = document.getElementById('primary-cta');
  if (cta && contactSection) {
    cta.addEventListener('click', (event) => {
      event.preventDefault();
      contactSection.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      feedback.textContent = "Thank you, we'll be in touch soon.";
      form.reset();
    });
  }

  /**
   * Service carousel logic
   * - Keeps one left and one right preview card visible.
   * - The center cards are the active cards (3 desktop, 2 tablet, 1 mobile).
   * - Does not loop. Arrows hide at the start/end.
   */

  function initServiceCarousel(carousel) {
    const viewport = carousel.querySelector('[data-viewport]');
    const track = carousel.querySelector('[data-track]');
    const cards = Array.from(track.children);
    const prevBtn = carousel.querySelector('[data-dir="prev"]');
    const nextBtn = carousel.querySelector('[data-dir="next"]');

    let index = 1; // first full-size active card
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

      // Start the viewport one card before the active group when possible,
      // so the previous card appears as the faded preview.
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

    window.addEventListener('resize', updateState);

    updateState();
  }

  document.querySelectorAll('[data-carousel]').forEach(initServiceCarousel);
})();