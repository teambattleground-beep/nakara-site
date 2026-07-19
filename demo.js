/* Nakara /demo.html — wire phone display + open chat */
(function () {
  'use strict';

  function digits(p) {
    return String(p || '').replace(/[^\d+]/g, '');
  }

  function wirePhone() {
    var d = window.NAKARA_DEMO || window.NAKARA_CHAT || {};
    var phone = d.phone || '';
    var display = d.phoneDisplay || phone;
    var el = document.getElementById('demo-phone-display');
    var hint = document.getElementById('demo-phone-hint');
    var btn = document.getElementById('demo-phone-btn');
    var badge = document.getElementById('voice-status-badge');
    if (!phone || !el) return;
    el.textContent = display;
    if (hint) hint.textContent = 'Tap call — you’re reaching Nakara’s lab front desk.';
    if (btn) {
      btn.hidden = false;
      btn.href = 'tel:' + digits(phone);
      btn.textContent = 'Call ' + display;
    }
    if (badge) {
      badge.textContent = 'Live';
      badge.className = 'demo-pillar__status demo-pillar__status--live';
    }
  }

  function wireChatButton() {
    var b = document.getElementById('demo-open-chat');
    if (!b) return;
    b.addEventListener('click', function () {
      var launcher = document.querySelector('.nk-chat__launcher');
      if (launcher) launcher.click();
      else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
  }

  function init() {
    wirePhone();
    wireChatButton();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
