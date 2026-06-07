// Mobile nav toggle
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const list = document.querySelector('.nav-list');
  if (toggle && list) {
    toggle.addEventListener('click', function () {
      const open = list.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }
})();

// Scroll-reveal
(function () {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || els.length === 0) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => io.observe(el));
})();

// Footer year
(function () {
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();

// Contact form — AJAX submit + Google Analytics lead event
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = form.querySelector('[data-form-status]');
  const button = form.querySelector('button[type="submit"]');
  const buttonText = button ? button.innerHTML : '';

  function showStatus(message, ok) {
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    status.classList.toggle('is-error', !ok);
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (button) {
      button.disabled = true;
      button.textContent = 'Sending…';
    }
    if (status) status.hidden = true;

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Fire the GA4 lead event (mark as a key event in GA if you want it as a conversion)
        if (typeof gtag === 'function') {
          gtag('event', 'generate_lead', {
            form_name: 'contact',
            topic: (form.querySelector('[name="topic"]') || {}).value || '',
          });
        }
        form.reset();
        showStatus("Thanks — your message is on its way. I'll reply within one working day.", true);
        if (button) button.innerHTML = buttonText;
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      showStatus('Sorry, something went wrong. Please email william@skiddaw.digital instead.', false);
      if (button) button.innerHTML = buttonText;
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
