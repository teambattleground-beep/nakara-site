/**
 * Nakara website inquiry form + chat lead → Gmail
 * Deploy: script.google.com → paste → Deploy → Web app
 * Execute as: Me (jb@nakara.ai) · Who has access: Anyone
 *
 * Form: POST name, email, message [, _honey]
 * Chat: POST name, email, message, source=chat [, transcript]
 * AJAX: add ajax=1 → JSON response (no redirect)
 */
var NOTIFY_TO = 'hello@nakara.ai';
var NOTIFY_CC = 'jb@nakara.ai';
var THANKS_URL = 'https://nakara.ai/?thanks=1#cta';
var FROM_NAME = 'Nakara';

function doPost(e) {
  try {
    var p = (e && e.parameter) ? e.parameter : {};
    if (p._honey) {
      return respond_(p, true);
    }

    var name = String(p.name || '').trim();
    var email = String(p.email || '').trim();
    var message = String(p.message || '').trim();
    var source = String(p.source || 'form').trim() || 'form';
    var transcript = String(p.transcript || '').trim();
    var phone = String(p.phone || '').trim();

    if (!name || !email || !message) {
      if (isAjax_(p)) {
        return json_({ ok: false, error: 'Missing fields' });
      }
      return HtmlService.createHtmlOutput('Missing fields. <a href="https://nakara.ai/#cta">Go back</a>');
    }

    var subject =
      source === 'chat'
        ? 'Nakara — chat lead from ' + name
        : source === 'voice'
          ? 'Nakara — voice lead from ' + name
          : source === 'api-test'
            ? 'Nakara — test lead from ' + name
            : 'Nakara — conversation request from ' + name;

    var body =
      'New inquiry from the website (' + source + ').\n\n' +
      'Name: ' + name + '\n' +
      'Email: ' + email + '\n' +
      (phone ? 'Phone: ' + phone + '\n' : '') +
      '\nMessage:\n' + message + '\n';

    if (transcript) {
      body += '\n--- Chat transcript ---\n' + transcript + '\n';
    }
    body += '\n— nakara.ai ' + source;

    MailApp.sendEmail({
      to: NOTIFY_TO,
      cc: NOTIFY_CC,
      replyTo: email,
      name: FROM_NAME,
      subject: subject,
      body: body
    });

    MailApp.sendEmail({
      to: email,
      name: FROM_NAME,
      replyTo: 'jb@nakara.ai',
      subject: 'We received your inquiry — Nakara',
      body:
        'Hi ' + name + ',\n\n' +
        'Thanks for reaching out to Nakara. We received your note and look forward to speaking with you.\n\n' +
        'Someone from our team will follow up shortly.\n\n' +
        'To make sure our reply reaches your inbox (not spam):\n' +
        '• Add jb@nakara.ai to your contacts\n' +
        '• If a Nakara email lands in spam or junk, mark it Not spam\n' +
        '• If your company uses email filters, whitelist the domain nakara.ai\n\n' +
        '— Nakara\n' +
        'https://nakara.ai\n'
    });

    return respond_(p, true);
  } catch (err) {
    if (e && e.parameter && isAjax_(e.parameter)) {
      return json_({ ok: false, error: String(err) });
    }
    return HtmlService.createHtmlOutput(
      'Something went wrong. Please email hello@nakara.ai directly.<br><pre>' +
        String(err) +
        '</pre>'
    );
  }
}

function doGet() {
  return ContentService.createTextOutput('Nakara form endpoint OK').setMimeType(ContentService.MimeType.TEXT);
}

function isAjax_(p) {
  return String(p.ajax || '') === '1' || String(p.source || '') === 'chat';
}

function respond_(p, ok) {
  if (isAjax_(p)) {
    return json_({ ok: !!ok });
  }
  return redirect_(THANKS_URL);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function redirect_(url) {
  var html =
    '<!doctype html><html><head>' +
    '<meta charset="utf-8">' +
    '<meta http-equiv="refresh" content="0;url=' + url + '">' +
    '<title>Thanks</title></head><body>' +
    '<p>Thanks — redirecting…</p>' +
    '<p><a href="' + url + '">Continue</a></p>' +
    '<script>location.replace(' + JSON.stringify(url) + ');</script>' +
    '</body></html>';
  return HtmlService.createHtmlOutput(html);
}
