/* Nakara site chat — Front-desk style intake widget (v1)
 * FAQ + guided Q&A + lead capture → same Apps Script as CTA form.
 * Optional: set window.NAKARA_CHAT.phone when voice lab number is live.
 */
(function () {
  'use strict';

  var CFG = window.NAKARA_CHAT || {};
  var ENDPOINT =
    CFG.endpoint ||
    'https://script.google.com/macros/s/AKfycbzJhiXtPDTdmvsi_pHm7l8Jtxs99NT-XTstBy3sZSDYAXVXu7heHGK5jdyn5Tua6Mog/exec';
  var PHONE = CFG.phone || ''; // e.g. '+1-XXX-XXX-XXXX' when live
  var PHONE_DISPLAY = CFG.phoneDisplay || PHONE;

  var FAQS = [
    {
      keys: ['what is nakara', 'who are you', 'what do you do', 'nakara'],
      answer:
        'Nakara builds AI employees and AI-powered solutions for businesses — digital teammates with memory, clear roles, and human checkpoints. You bring the problem. We build the answer. We can also help with consulting and custom systems without a full AI employee.'
    },
    {
      keys: ['price', 'pricing', 'cost', 'how much', 'rate'],
      answer:
        'We scope after a short conversation so the fit is right — not a public rate card. Early partners get clear proposals. Want us to reach out? Leave your name and work email and we’ll follow up.'
    },
    {
      keys: ['ai employee', 'employee', 'teammate', 'hire'],
      answer:
        'An AI employee is a role-shaped digital teammate — not a chatbot you babysit. It learns how you work, handles scoped work, and escalates high-stakes decisions to you.'
    },
    {
      keys: ['voice', 'phone', 'call', 'front desk', 'after hours'],
      answer:
        'Yes — front-desk voice is part of what we build: answer when you’re busy, qualify leads, book appointments, and hand off anything sensitive. We’re standing up a live demo line; leave your number if you want a call-back walkthrough.'
    },
    {
      keys: ['chatbot', 'chat bot', 'website chat'],
      answer:
        'Website chat is one channel. The product is the teammate behind it — same standards on phone, chat, and follow-up, with a human when it matters.'
    },
    {
      keys: ['how it works', 'process', 'start', 'begin', 'onboard'],
      answer:
        'Discover → Design → Deploy → Improve. Short discovery, clear recommendation (AI employee, solution, consulting, or not a fit), then pilot with real work.'
    },
    {
      keys: ['consulting', 'without employee', 'just advice'],
      answer:
        'You don’t need an AI employee to work with us. Bring the problem — we can help with AI and technology consulting or a custom system only.'
    },
    {
      keys: ['human', 'replace', 'jobs', 'staff'],
      answer:
        'Goal is capacity and less overload — not stripping the company of people. Most start by clearing backlogs so humans keep judgment and relationships.'
    },
    {
      keys: ['security', 'privacy', 'data', 'safe'],
      answer:
        'Escalation and review are designed in. High-stakes work stays human. For a security or privacy conversation, email hello@nakara.ai or leave a note here.'
    },
    {
      keys: ['where', 'location', 'virginia', 'based'],
      answer:
        'Nakara LLC is based in Virginia, USA. We work with US businesses.'
    },
    {
      keys: ['contact', 'email', 'talk', 'call me', 'human please', 'speak to someone'],
      answer:
        'Happy to connect you with the team. Share your name and work email (phone optional) and we’ll follow up. You can also email hello@nakara.ai.'
    }
  ];

  var state = {
    open: false,
    step: 'chat', // chat | lead | done
    messages: [],
    lead: { name: '', email: '', phone: '' }
  };

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function matchFaq(text) {
    var t = (text || '').toLowerCase();
    for (var i = 0; i < FAQS.length; i++) {
      for (var k = 0; k < FAQS[i].keys.length; k++) {
        if (t.indexOf(FAQS[i].keys[k]) !== -1) return FAQS[i].answer;
      }
    }
    return null;
  }

  function wantsHuman(text) {
    var t = (text || '').toLowerCase();
    return /human|person|call me|talk to|schedule|book a|contact|email me|reach out|sales|demo|price|pricing|quote|proposal/.test(
      t
    );
  }

  function botReply(text) {
    var faq = matchFaq(text);
    if (faq) return faq;
    if (wantsHuman(text)) {
      return 'I can have the team follow up. What’s the best name and work email? (You can also add a phone.)';
    }
    return 'Good question. I’m best on what Nakara is, AI employees, how we work, voice/front desk, and getting you to the team. Try one of those — or leave your email and a human will answer properly.';
  }

  function transcriptText() {
    return state.messages
      .map(function (m) {
        return (m.role === 'user' ? 'Visitor' : 'Nakara') + ': ' + m.text;
      })
      .join('\n');
  }

  function addMsg(role, text) {
    state.messages.push({ role: role, text: text });
    var row = el('div', 'nk-chat__msg nk-chat__msg--' + role);
    row.textContent = text;
    var log = document.getElementById('nk-chat-log');
    if (log) {
      log.appendChild(row);
      log.scrollTop = log.scrollHeight;
    }
  }

  function setStep(step) {
    state.step = step;
    var chatPane = document.getElementById('nk-chat-pane');
    var leadPane = document.getElementById('nk-lead-pane');
    if (!chatPane || !leadPane) return;
    if (step === 'lead') {
      chatPane.hidden = true;
      leadPane.hidden = false;
    } else {
      chatPane.hidden = false;
      leadPane.hidden = true;
    }
  }

  function submitLead(name, email, phone, note) {
    var message =
      (note || 'Website chat — please follow up.') +
      (PHONE ? '\n\n[Visitor may have seen demo phone: ' + PHONE + ']' : '');

    var body = new URLSearchParams();
    body.set('name', name);
    body.set('email', email);
    body.set('phone', phone || '');
    body.set('message', message);
    body.set('source', 'chat');
    body.set('ajax', '1');
    body.set('transcript', transcriptText().slice(0, 8000));

    // no-cors: Apps Script will still process; we can't read body reliably
    return fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString()
    }).then(function () {
      return true;
    });
  }

  function build() {
    if (document.getElementById('nk-chat-root')) return;

    var root = el('div', 'nk-chat');
    root.id = 'nk-chat-root';

    var launcher = el('button', 'nk-chat__launcher', '');
    launcher.type = 'button';
    launcher.setAttribute('aria-label', 'Chat with Naka');
    launcher.innerHTML =
      '<img class="nk-chat__launcher-face" src="assets/naka/naka-mascot.png" width="28" height="28" alt="" />' +
      '<span class="nk-chat__launcher-label">Naka</span>';

    var panel = el('div', 'nk-chat__panel');
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Chat with Naka');

    var head = el('div', 'nk-chat__head');
    head.innerHTML =
      '<div class="nk-chat__head-brand">' +
      '<img class="nk-chat__head-face" src="assets/naka/naka-mascot.png" width="40" height="40" alt="" />' +
      '<div class="nk-chat__head-text">' +
      '<p class="nk-chat__title">Naka</p>' +
      '<p class="nk-chat__sub">Your Nakara teammate — ask anything, or leave a note for the team.</p>' +
      '</div></div>';
    var close = el('button', 'nk-chat__close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', 'Close chat');
    head.appendChild(close);

    var body = el('div', 'nk-chat__body');

    // Chat pane
    var chatPane = el('div', 'nk-chat__pane');
    chatPane.id = 'nk-chat-pane';
    var log = el('div', 'nk-chat__log');
    log.id = 'nk-chat-log';

    var chips = el('div', 'nk-chat__chips');
    [
      ['What is Nakara?', 'What is Nakara?'],
      ['AI employees', 'What is an AI employee?'],
      ['Voice / phone', 'Do you do voice or phone front desk?'],
      ['Talk to the team', 'I want to talk to someone']
    ].forEach(function (c) {
      var b = el('button', 'nk-chat__chip', c[0]);
      b.type = 'button';
      b.addEventListener('click', function () {
        sendUser(c[1]);
      });
      chips.appendChild(b);
    });

    if (PHONE_DISPLAY) {
      var call = el('a', 'nk-chat__call', 'Call demo line: ' + PHONE_DISPLAY);
      call.href = 'tel:' + PHONE.replace(/[^\d+]/g, '');
      chips.appendChild(call);
    }

    var form = el('form', 'nk-chat__compose');
    form.innerHTML =
      '<label class="visually-hidden" for="nk-chat-input">Message</label>' +
      '<input id="nk-chat-input" class="nk-chat__input" type="text" placeholder="Type a message…" autocomplete="off" maxlength="500" />' +
      '<button type="submit" class="nk-chat__send">Send</button>';

    chatPane.appendChild(log);
    chatPane.appendChild(chips);
    chatPane.appendChild(form);

    // Lead pane
    var leadPane = el('div', 'nk-chat__pane');
    leadPane.id = 'nk-lead-pane';
    leadPane.hidden = true;
    leadPane.innerHTML =
      '<p class="nk-chat__lead-intro">Leave a note — we’ll follow up by email.</p>' +
      '<form class="nk-chat__lead-form" id="nk-lead-form">' +
      '<label class="nk-chat__flab" for="nk-lead-name">Name</label>' +
      '<input class="nk-chat__finput" id="nk-lead-name" name="name" required autocomplete="name" />' +
      '<label class="nk-chat__flab" for="nk-lead-email">Work email</label>' +
      '<input class="nk-chat__finput" id="nk-lead-email" name="email" type="email" required autocomplete="email" />' +
      '<label class="nk-chat__flab" for="nk-lead-phone">Phone <span class="nk-chat__opt">(optional)</span></label>' +
      '<input class="nk-chat__finput" id="nk-lead-phone" name="phone" type="tel" autocomplete="tel" />' +
      '<label class="nk-chat__flab" for="nk-lead-note">How can we help?</label>' +
      '<textarea class="nk-chat__finput nk-chat__fta" id="nk-lead-note" name="note" rows="3" required placeholder="What’s stuck or what you’re hoping to solve…"></textarea>' +
      '<button type="submit" class="nk-chat__send nk-chat__send--block" id="nk-lead-submit">Send to the team</button>' +
      '<button type="button" class="nk-chat__back" id="nk-lead-back">Back to chat</button>' +
      '<p class="nk-chat__status" id="nk-lead-status" hidden></p>' +
      '</form>';

    body.appendChild(chatPane);
    body.appendChild(leadPane);
    panel.appendChild(head);
    panel.appendChild(body);
    root.appendChild(panel);
    root.appendChild(launcher);
    document.body.appendChild(root);

    function open() {
      state.open = true;
      panel.hidden = false;
      launcher.classList.add('is-open');
      if (state.messages.length === 0) {
        addMsg(
          'bot',
          'Hi — I’m Naka, your Nakara teammate. I can help with what we do, voice and chat front desk, or connect you to the team. What are you working on?'
        );
      }
      var input = document.getElementById('nk-chat-input');
      if (input) setTimeout(function () { input.focus(); }, 50);
    }

    function shut() {
      state.open = false;
      panel.hidden = true;
      launcher.classList.remove('is-open');
    }

    launcher.addEventListener('click', function () {
      if (state.open) shut();
      else open();
    });
    close.addEventListener('click', shut);

    function sendUser(text) {
      text = (text || '').trim();
      if (!text) return;
      addMsg('user', text);
      var reply = botReply(text);
      setTimeout(function () {
        addMsg('bot', reply);
        if (wantsHuman(text) || /leave your name|follow up|work email/i.test(reply)) {
          var go = el('button', 'nk-chat__chip nk-chat__chip--cta', 'Leave contact details');
          go.type = 'button';
          go.addEventListener('click', function () {
            setStep('lead');
          });
          var logEl = document.getElementById('nk-chat-log');
          if (logEl) {
            var wrap = el('div', 'nk-chat__msg nk-chat__msg--bot');
            wrap.appendChild(go);
            logEl.appendChild(wrap);
            logEl.scrollTop = logEl.scrollHeight;
          }
        }
      }, 280);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = document.getElementById('nk-chat-input');
      var v = input ? input.value : '';
      if (input) input.value = '';
      sendUser(v);
    });

    document.getElementById('nk-lead-back').addEventListener('click', function () {
      setStep('chat');
    });

    document.getElementById('nk-lead-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('nk-lead-name').value.trim();
      var email = document.getElementById('nk-lead-email').value.trim();
      var phone = document.getElementById('nk-lead-phone').value.trim();
      var note = document.getElementById('nk-lead-note').value.trim();
      var status = document.getElementById('nk-lead-status');
      var btn = document.getElementById('nk-lead-submit');
      if (!name || !email || !note) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.hidden = false;
        status.textContent = 'Please use a valid work email.';
        status.className = 'nk-chat__status is-err';
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Sending…';
      submitLead(name, email, phone, note)
        .then(function () {
          status.hidden = false;
          status.className = 'nk-chat__status is-ok';
          status.textContent = 'Sent — check your email for a confirmation. We’ll be in touch.';
          btn.textContent = 'Sent';
          addMsg('bot', 'Thanks, ' + name.split(' ')[0] + ' — your note is with the team.');
          setTimeout(function () {
            setStep('chat');
          }, 1200);
        })
        .catch(function () {
          status.hidden = false;
          status.className = 'nk-chat__status is-err';
          status.textContent = 'Could not send. Email hello@nakara.ai directly.';
          btn.disabled = false;
          btn.textContent = 'Send to the team';
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
