/* Nakara /demo.html — wire phone display + open chat + sticky bar */
(function () {
  'use strict';

  function digits(p) {
    // Keep leading + and digits only (strip asterisks / formatting junk)
    var s = String(p || '').replace(/[^\d+]/g, '');
    // If corrupted (e.g. **** middle), refuse and fall back
    if (s.indexOf('*') !== -1) return '';
    // tel: prefers +1...
    if (s.charAt(0) !== '+') {
      if (s.length === 10) s = '+1' + s;
      else if (s.length === 11 && s.charAt(0) === '1') s = '+' + s;
    }
    return s;
  }

  function wirePhone() {
    var d = window.NAKARA_DEMO || window.NAKARA_CHAT || {};
    var phone = d.phone || '+14344555296';
    var display = d.phoneDisplay || '(434) 455-5296';
    var tel = digits(phone) || '+14344555296';
    var el = document.getElementById('demo-phone-display');
    var hint = document.getElementById('demo-phone-hint');
    var btn = document.getElementById('demo-phone-btn');
    var link = document.getElementById('demo-phone-link');
    var badge = document.getElementById('voice-status-badge');
    if (el) el.textContent = display;
    if (hint) hint.textContent = 'One tap from your phone. You’re reaching Nakara’s live AI front desk.';
    if (btn) {
      btn.hidden = false;
      btn.href = 'tel:' + tel;
      btn.textContent = 'Call Naka now';
    }
    if (link) link.href = 'tel:' + tel;
    document.querySelectorAll('a.demo-btn-call, a.demo-sticky__btn--call').forEach(function (a) {
      a.href = 'tel:' + tel;
    });
    if (badge) {
      badge.textContent = 'Live · ' + display;
      badge.className = 'demo-pillar__status demo-pillar__status--live';
    }
  }

  function openChat() {
    var launcher = document.querySelector('.nk-chat__launcher');
    if (launcher) {
      launcher.click();
      return;
    }
    var chat = document.getElementById('chat');
    if (chat) chat.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function wireChatButtons() {
    ['demo-open-chat', 'demo-open-chat-hero', 'demo-sticky-chat'].forEach(function (id) {
      var b = document.getElementById(id);
      if (!b) return;
      b.addEventListener('click', function (e) {
        e.preventDefault();
        openChat();
      });
    });
  }

  function init() {
    wirePhone();
    wireChatButtons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
