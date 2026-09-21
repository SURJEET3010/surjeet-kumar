/* =========================================================
   Surjeet Kumar — Portfolio
   Vanilla JS. No dependencies.
   1. Mobile navigation
   2. Smooth scroll with sticky-header offset
   3. Copy-email clipboard utility
   4. Portrait image fallback
   5. Footer year
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Small helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var toast = $('#toast');
  var toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  /* =========================================================
     1. Mobile navigation
     ========================================================= */
  var toggle = $('#navToggle');
  var nav = $('#primary-nav');
  var scrim = $('#navScrim');

  function setNav(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (scrim) scrim.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      setNav(toggle.getAttribute('aria-expanded') !== 'true');
    });
  }

  if (scrim) scrim.addEventListener('click', function () { setNav(false); });

  // Close the drawer after choosing a destination.
  $$('#primary-nav a').forEach(function (link) {
    link.addEventListener('click', function () { setNav(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setNav(false);
  });

  // Reset state if the viewport grows past the desktop breakpoint.
  var desktop = window.matchMedia('(min-width: 980px)');
  var onBreakpoint = function (e) { if (e.matches) setNav(false); };
  if (desktop.addEventListener) desktop.addEventListener('change', onBreakpoint);
  else if (desktop.addListener) desktop.addListener(onBreakpoint);

  /* =========================================================
     2. Smooth scroll, offset for the sticky header
     CSS handles the easing; this keeps the target clear of the bar
     and moves keyboard focus so the jump is announced.
     ========================================================= */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  $$('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var id = link.getAttribute('href');
      if (!id || id === '#') return;

      var target = document.querySelector(id);
      if (!target) return;

      e.preventDefault();

      var header = $('.site-header');
      var offset = header ? header.offsetHeight + 14 : 0;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: top,
        behavior: reduceMotion.matches ? 'auto' : 'smooth'
      });

      // Make the destination focusable without adding a visible outline jump.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });

      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* =========================================================
     3. Copy email to clipboard
     Uses the async Clipboard API, with a textarea fallback for
     older browsers and non-secure origins (file://).
     ========================================================= */
  var copyBtn = $('#copyEmail');

  function legacyCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();

    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }

    document.body.removeChild(field);
    return ok;
  }

  function confirmCopy(success, email) {
    if (!copyBtn) return;
    if (success) {
      copyBtn.textContent = 'Copied';
      copyBtn.classList.add('copied');
      showToast('Email address copied');
      setTimeout(function () {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 1800);
    } else {
      showToast('Copy blocked by the browser — the address is ' + email);
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email') || '';

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email)
          .then(function () { confirmCopy(true, email); })
          .catch(function () { confirmCopy(legacyCopy(email), email); });
      } else {
        confirmCopy(legacyCopy(email), email);
      }
    });
  }

  /* =========================================================
     4. Portrait fallback
     If assets/profile.jpg is missing, show the initials block
     instead of a broken image icon.
     ========================================================= */
  var portrait = $('#portrait');

  if (portrait) {
    var markMissing = function () {
      var frame = portrait.closest('.portrait-frame');
      if (frame) frame.classList.add('no-image');
    };

    portrait.addEventListener('error', markMissing);
    // Catch images that failed before this script parsed.
    if (portrait.complete && portrait.naturalWidth === 0) markMissing();
  }

  /* =========================================================
     5. Footer year
     ========================================================= */
  var year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

})();