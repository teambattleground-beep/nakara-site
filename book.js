/* Nakara public booking page — live free/busy via naka-chat-api */
(function () {
  'use strict';

  var CFG = window.NAKARA_BOOK || {};
  var API = (CFG.apiUrl || 'https://naka-chat-api.onrender.com').replace(/\/$/, '');
  var selected = null;
  var slots = [];

  function $(id) {
    return document.getElementById(id);
  }

  function setStatus(msg, ok) {
    var el = $('book-status');
    if (!el) return;
    if (!msg) {
      el.hidden = true;
      el.textContent = '';
      return;
    }
    el.hidden = false;
    el.textContent = msg;
    el.className = 'book-status ' + (ok ? 'is-ok' : 'is-err');
  }

  function loadSlots() {
    var list = $('book-slots');
    var hint = $('book-hint');
    var form = $('book-form');
    var picked = $('book-picked');
    if (!list) return;

    selected = null;
    slots = [];
    list.innerHTML = '';
    if (form) form.hidden = true;
    if (picked) picked.textContent = 'Select a time on the left to continue.';
    if (hint) hint.textContent = 'Checking the live calendar for open times…';
    setStatus('');

    fetch(API + '/availability?max_slots=24', {
      method: 'GET',
      headers: { Accept: 'application/json' }
    })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data.ok || !(data.slots || []).length) {
          if (hint) {
            hint.textContent =
              'No open slots right now. Leave a note in chat or call (434) 455-5296 and we’ll find a time.';
          }
          return;
        }
        slots = data.slots;
        if (hint) {
          hint.textContent =
            'Only open times are listed. Anything already busy on the calendar is hidden.';
        }
        // Group by day label prefix
        var byDay = {};
        var order = [];
        slots.forEach(function (s, idx) {
          var label = s.label || s.start;
          var dayKey = label.split('·')[0].trim();
          if (!byDay[dayKey]) {
            byDay[dayKey] = [];
            order.push(dayKey);
          }
          byDay[dayKey].push({ s: s, idx: idx });
        });
        order.forEach(function (day) {
          var h = document.createElement('h3');
          h.className = 'book-day';
          h.textContent = day;
          list.appendChild(h);
          var row = document.createElement('div');
          row.className = 'book-day-slots';
          byDay[day].forEach(function (item) {
            var b = document.createElement('button');
            b.type = 'button';
            b.className = 'book-slot';
            b.setAttribute('role', 'listitem');
            b.setAttribute('data-idx', String(item.idx));
            // time part after ·
            var parts = (item.s.label || '').split('·');
            b.textContent = (parts[1] || item.s.label || item.s.start).trim();
            b.title = item.s.label || item.s.start;
            b.addEventListener('click', function () {
              selectSlot(item.idx);
            });
            row.appendChild(b);
          });
          list.appendChild(row);
        });
      })
      .catch(function () {
        if (hint) {
          hint.textContent =
            'Couldn’t load the calendar just now. Try refresh, open chat, or call (434) 455-5296.';
        }
      });
  }

  function selectSlot(idx) {
    var s = slots[idx];
    if (!s) return;
    selected = s;
    var buttons = document.querySelectorAll('.book-slot');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].classList.toggle(
        'is-selected',
        Number(buttons[i].getAttribute('data-idx')) === idx
      );
    }
    var form = $('book-form');
    var picked = $('book-picked');
    if (form) form.hidden = false;
    if (picked) picked.textContent = 'Selected: ' + (s.label || s.start);
    setStatus('');
    var name = $('book-name');
    if (name) setTimeout(function () { name.focus(); }, 50);
  }

  function onSubmit(e) {
    e.preventDefault();
    var name = ($('book-name').value || '').trim();
    var email = ($('book-email').value || '').trim();
    var phone = ($('book-phone').value || '').trim();
    var notes = ($('book-notes').value || '').trim();
    var btn = $('book-submit');

    if (!selected) {
      setStatus('Pick an open time first.', false);
      return;
    }
    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('Name and a valid work email are required.', false);
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Booking…';
    setStatus('');

    fetch(API + '/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        notes: notes,
        slot_start: selected.start,
        source: 'book-page'
      })
    })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) {
            var err = new Error((data && data.detail) || 'Booking failed');
            err.status = r.status;
            throw err;
          }
          return data;
        });
      })
      .then(function () {
        setStatus(
          'You’re booked for ' +
            (selected.label || 'that time') +
            '. Check ' +
            email +
            ' for the calendar invite.',
          true
        );
        btn.textContent = 'Booked';
        var form = $('book-form');
        if (form) {
          var inputs = form.querySelectorAll('input, textarea, button');
          for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].id !== 'book-submit') inputs[i].disabled = true;
          }
        }
      })
      .catch(function (err) {
        var msg = (err && err.message) || 'Could not book. Try another time.';
        if (err && err.status === 409) {
          msg = 'That time just filled. Pick another open slot.';
          loadSlots();
        }
        setStatus(msg, false);
        btn.disabled = false;
        btn.textContent = 'Confirm booking';
      });
  }

  function init() {
    var y = $('year');
    if (y) y.textContent = String(new Date().getFullYear());

    var form = $('book-form');
    if (form) form.addEventListener('submit', onSubmit);

    var refresh = $('book-refresh');
    if (refresh) refresh.addEventListener('click', loadSlots);

    var openChat = $('book-open-chat');
    if (openChat) {
      openChat.addEventListener('click', function () {
        var launcher = document.querySelector('.nk-chat__launcher');
        if (launcher) launcher.click();
      });
    }

    loadSlots();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
