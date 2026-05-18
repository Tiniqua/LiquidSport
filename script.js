(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const contactSection = document.getElementById('contact');
  const cta = document.getElementById('primary-cta');
  if (cta && contactSection) {
    cta.addEventListener('click', (event) => {
      event.preventDefault();
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
   * - Uses modular arithmetic so the carousel loops infinitely.
   */
  function initServiceCarousel(carousel) {
    const viewport = carousel.querySelector('[data-viewport]');
    const track = carousel.querySelector('[data-track]');
    const cards = Array.from(track.children);
    const prevBtn = carousel.querySelector('[data-dir="prev"]');
    const nextBtn = carousel.querySelector('[data-dir="next"]');

    let index = 0;
    let activeCount = 3;
    let isDragging = false;
    let startX = 0;
    let deltaX = 0;

    const getCardStep = () => {
      if (!cards.length) return 0;
      const cardWidth = cards[0].getBoundingClientRect().width;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      return cardWidth + gap;
    };

    const setActiveCount = () => {
      const width = window.innerWidth;
      if (width <= 540) activeCount = 1;
      else if (width <= 980) activeCount = 2;
      else activeCount = 3;
    };

    const normalize = (value) => (value + cards.length) % cards.length;

    const updateState = () => {
      setActiveCount();
      const step = getCardStep();
      const offset = -(normalize(index) * step);
      track.style.transform = `translateX(${offset}px)`;

      cards.forEach((card, i) => {
        const relative = normalize(i - normalize(index));
        const isPreview = relative === 0 || relative === activeCount + 1;
        const isActive = relative >= 1 && relative <= activeCount;

        card.classList.toggle('is-preview', isPreview);
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-hidden', isPreview ? 'true' : 'false');

        if (isPreview) {
          card.setAttribute('inert', '');
          card.tabIndex = -1;
        } else {
          card.removeAttribute('inert');
          card.removeAttribute('tabindex');
        }
      });
    };

    const moveBy = (direction) => {
      index = normalize(index + direction);
      updateState();
    };

    const onDragStart = (clientX) => {
      isDragging = true;
      startX = clientX;
      deltaX = 0;
      track.style.transition = 'none';
    };

    const onDragMove = (clientX) => {
      if (!isDragging) return;
      deltaX = clientX - startX;
      const offset = -(normalize(index) * getCardStep()) + deltaX;
      track.style.transform = `translateX(${offset}px)`;
    };

    const onDragEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      track.style.transition = '';
      const threshold = Math.max(48, getCardStep() * 0.16);

      if (deltaX > threshold) moveBy(-1);
      else if (deltaX < -threshold) moveBy(1);
      else updateState();
    };

    nextBtn?.addEventListener('click', () => moveBy(1));
    prevBtn?.addEventListener('click', () => moveBy(-1));

    viewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      onDragStart(event.clientX);
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointermove', (event) => onDragMove(event.clientX));
    viewport.addEventListener('pointerup', onDragEnd);
    viewport.addEventListener('pointercancel', onDragEnd);
    viewport.addEventListener('pointerleave', () => {
      if (isDragging) onDragEnd();
    });

    window.addEventListener('resize', updateState);
    updateState();
  }

  document.querySelectorAll('[data-carousel]').forEach(initServiceCarousel);
})();
