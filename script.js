/* Nakara — minimal interactivity */

(function () {
  'use strict';

  // ---- Year stamp in footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sticky nav: subtle border once user has scrolled ----
  var nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 8) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Mobile menu toggle ----
  var burger = document.querySelector('.nav__burger');
  var mobile = document.getElementById('mobile-menu');
  if (burger && mobile) {
    burger.addEventListener('click', function () {
      var open = burger.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        mobile.hidden = false;
      } else {
        mobile.hidden = true;
      }
    });

    // Close mobile menu after tapping any link inside it
    mobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        burger.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        mobile.hidden = true;
      });
    });
  }

  // ---- FAQ accordion (vanilla, no library) ----
  var faqButtons = document.querySelectorAll('.faq__q');
  faqButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var panelId = btn.getAttribute('aria-controls');
      var panel = panelId ? document.getElementById(panelId) : null;

      // Close others for a calm single-open accordion
      faqButtons.forEach(function (other) {
        if (other === btn) return;
        other.setAttribute('aria-expanded', 'false');
        var otherId = other.getAttribute('aria-controls');
        var otherPanel = otherId ? document.getElementById(otherId) : null;
        if (otherPanel) otherPanel.hidden = true;
      });

      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (panel) panel.hidden = expanded;
    });
  });

  // ---- CTA form → FormSubmit (swap form action later for tickets/API) ----
  var form = document.getElementById('cta-form');
  if (form) {
    var statusEl = document.getElementById('cta-status');
    var submitBtn = document.getElementById('cta-submit');
    var defaultBtnLabel = submitBtn ? submitBtn.textContent : 'Request a conversation';

    function setStatus(msg, kind) {
      if (!statusEl) return;
      statusEl.hidden = !msg;
      statusEl.textContent = msg || '';
      statusEl.classList.remove('is-ok', 'is-err');
      if (kind) statusEl.classList.add(kind);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameInput = document.getElementById('cta-name');
      var emailInput = document.getElementById('cta-email');
      var bodyInput = document.getElementById('cta-body');
      var honey = form.querySelector('[name="_honey"]');

      var name = nameInput && nameInput.value ? nameInput.value.trim() : '';
      var email = emailInput && emailInput.value ? emailInput.value.trim() : '';
      var message = bodyInput && bodyInput.value ? bodyInput.value.trim() : '';

      // Honeypot filled → pretend success, drop spam
      if (honey && honey.value) {
        setStatus('Thanks — we received your note and will be in touch.', 'is-ok');
        form.reset();
        return;
      }

      if (!name) {
        setStatus('Please add your name.', 'is-err');
        if (nameInput) nameInput.focus();
        return;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('Please enter a valid work email.', 'is-err');
        if (emailInput) emailInput.focus();
        return;
      }
      if (!message) {
        setStatus('Tell us a bit about how we can help.', 'is-err');
        if (bodyInput) bodyInput.focus();
        return;
      }

      var endpoint = form.getAttribute('action');
      if (!endpoint) {
        setStatus('Form is not configured yet. Please try again later.', 'is-err');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      setStatus('');

      var payload = {
        name: name,
        email: email,
        message: message,
        _subject: 'Nakara — conversation request',
        _template: 'table',
        _captcha: 'false',
        _cc: 'jb@nakara.ai',
        _replyto: email,
        _autoresponse:
          'Hi ' + name + ',\n\n' +
          'Thanks for reaching out to Nakara. We received your inquiry and look forward to speaking with you.\n\n' +
          'Someone from our team will follow up shortly.\n\n' +
          'To make sure our reply reaches your inbox (not spam):\n' +
          '• Add hello@nakara.ai to your contacts\n' +
          '• If a Nakara email lands in spam or junk, mark it “Not spam”\n' +
          '• If your company uses email filters, whitelist the domain nakara.ai\n\n' +
          '— Nakara\n' +
          'https://nakara.ai'
      };

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          if (result.ok || (result.data && (result.data.success === 'true' || result.data.success === true))) {
            setStatus('Thanks — we received your note and will be in touch.', 'is-ok');
            form.reset();
          } else {
            var errMsg = (result.data && (result.data.message || result.data.error)) ||
              'Something went wrong. Please try again in a moment.';
            setStatus(errMsg, 'is-err');
          }
        })
        .catch(function () {
          setStatus('Could not send right now. Please try again in a moment.', 'is-err');
        })
        .finally(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = defaultBtnLabel;
          }
        });
    });
  }

  // ---- Subtle scroll reveal via IntersectionObserver ----
  // Only mark elements as reveal AFTER confirming JS is running AND
  // they are below the fold. This prevents the hero from being
  // invisible if JS is slow to load or blocked.
  var belowFold = document.querySelectorAll(
    '.what__lead, .glance, .audience__lead, .audience-card, .problem__item, .stop__item, .feature, .cycle__step, .pillar, .usecase, .early__lead, .early__list, .behind__lead, .behind__quiet, .faq__item, .cta__h, .cta__sub, .cta__form, .footer__inner'
  );

  // Only animate sections that are clearly below the fold.
  belowFold.forEach(function (el) { el.classList.add('reveal'); });

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    belowFold.forEach(function (el) { io.observe(el); });

    // Safety net: if for any reason an element never gets observed
    // (e.g., observer disconnects, user has motion reduced, etc.),
    // reveal everything after 2 seconds so the page is never blank.
    setTimeout(function () {
      belowFold.forEach(function (el) { el.classList.add('is-visible'); });
    }, 2000);
  } else {
    belowFold.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
