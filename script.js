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

  // ---- Demo form → mailto (works without backend pre-launch) ----
  var form = document.getElementById('cta-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = document.getElementById('cta-email');
      var email = emailInput && emailInput.value ? emailInput.value.trim() : '';
      if (!email) return;

      var subject = encodeURIComponent('Nakara demo / early access request');
      var body = encodeURIComponent(
        'Hi Nakara team,\n\nI would like a demo / early access conversation.\n\nWork email: ' +
          email +
          '\n\n(Optional) Company / role:\n\nWhat hurts about headcount planning today:\n\n'
      );
      window.location.href = 'mailto:NakaraLLC@proton.me?subject=' + subject + '&body=' + body;

      var btn = form.querySelector('button');
      if (btn) btn.textContent = 'Opening email…';
      setTimeout(function () {
        if (btn) btn.textContent = 'Request a Demo';
      }, 2500);
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
