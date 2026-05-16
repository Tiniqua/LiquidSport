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
})();
