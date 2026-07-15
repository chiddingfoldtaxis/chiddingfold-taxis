/* Chiddingfold Taxis — tiny vanilla JS. No dependencies, no tracking.
   The site is fully usable with this file blocked; JS only adds niceties. */
(function () {
  'use strict';

  /* ---- Mobile nav --------------------------------------------------- */
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('nav-menu');
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  /* ---- Footer year -------------------------------------------------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());

  /* ---- Reveal on scroll (flash-free: only hide off-screen elements) -- */
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var targets = document.querySelectorAll(
      '.section__head, .airport-card, .service-card, .review-card, .why__media, .quote__form, .area-tags, .cta-band__inner'
    );
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); obs.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    var vh = window.innerHeight || document.documentElement.clientHeight;
    targets.forEach(function (el) {
      // Only animate elements that start below the fold — avoids any flash.
      if (el.getBoundingClientRect().top > vh * 0.9) {
        el.classList.add('reveal');
        io.observe(el);
      }
    });
  }

  /* ---- Quote form --------------------------------------------------- */
  var form = document.querySelector('.quote__form');
  if (form) {
    var status = form.querySelector('.form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var action = form.getAttribute('action') || '';
    // "Unconfigured" means the placeholder is still in place. This works with
    // Formspree, Web3Forms, Basin or any backend — we only look for the placeholder.
    var unconfigured = !action || action.indexOf('YOUR_FORM_ID') !== -1;
    var setStatus = function (msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form-status' + (kind ? ' is-' + kind : '');
    };

    // Not wired up yet → tell people up front and steer them to the phone,
    // rather than letting them fill it all in and fail on submit.
    if (unconfigured) {
      setStatus('Online booking is being set up — for now please call 01483 387 475 to book.');
      if (submitBtn) submitBtn.disabled = true;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // Honeypot: if the hidden field is filled, silently drop (bot).
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) { return; }
      if (unconfigured) {
        setStatus('Online booking is being set up — for now please call 01483 387 475 to book.');
        return;
      }
      if (!form.checkValidity()) { form.reportValidity(); return; }
      setStatus('Sending…');
      fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          if (res.ok) { form.reset(); setStatus('Thanks! We’ve got your request and will call you back shortly.', 'ok'); }
          else { setStatus('Sorry, something went wrong — please call 01483 387 475.', 'err'); }
        })
        .catch(function () { setStatus('Sorry, something went wrong — please call 01483 387 475.', 'err'); });
    });
  }

  /* ---- Optional: measure tap-to-call clicks -------------------------
     Uncomment after adding a privacy-friendly analytics tag (e.g. GA4).
  document.querySelectorAll('[data-call]').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.gtag) window.gtag('event', 'call_click', { location: a.closest('section, header, footer') ? a.closest('section, header, footer').className : 'unknown' });
    });
  });
  ------------------------------------------------------------------- */
})();
