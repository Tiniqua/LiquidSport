(function () {
  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const cta = document.getElementById('primary-cta');
  if (cta) {
    cta.addEventListener('click', () => {
      console.log('Primary CTA clicked');
    });
  }

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Contact form submission intercepted (template mode).');
    });
  }
})();
