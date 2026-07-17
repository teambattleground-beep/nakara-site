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

  // ---- Subtle scroll reveal via IntersectionObserver ----
  // Only mark elements as reveal AFTER confirming JS is running AND
  // they are below the fold. This prevents the hero from being
  // invisible if JS is slow to load or blocked.
  var heroCopy = document.querySelector('.hero__copy');
  var belowFold = document.querySelectorAll(
    '.what__lead, .glance, .problem__item, .feature, .pillar, .usecase, .logos, .quote, .behind__lead, .behind__quiet, .cta__h, .cta__sub, .cta__form, .footer__inner'
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