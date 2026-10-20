-- New branded email design for client-facing booking templates.
-- Same shell: wordmark, white card, big reference code, detail rows,
-- dark pill CTA, green-check "what happens next", small footer.

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">We got your booking request</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, thanks for reaching out — I will confirm your slot shortly.</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;font-size:14px">
      <tr><td style="padding:8px 0;color:#8a8a99;width:110px">Requested time</td><td style="padding:8px 0;font-weight:700">{{date_client}} · {{time_client}}</td></tr>
      <tr><td style="padding:8px 0;color:#8a8a99">Timezone</td><td style="padding:8px 0">{{client_timezone}}</td></tr>
    </table>
    <a href="{{manage_link}}" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:8px">Manage your booking</a>
    <div style="margin-top:26px;border-top:1px solid #eeeef4;padding-top:18px">
      <p style="font-size:13px;font-weight:800;margin:0 0 12px;color:#1a1a22">What happens next</p>
      <p style="margin:0 0 8px;font-size:14px;color:#3a3a48"><span style="color:#22a06b;font-weight:800">✓</span>&nbsp; I confirm your slot and send the Google Meet link</p>
      <p style="margin:0 0 8px;font-size:14px;color:#3a3a48"><span style="color:#22a06b;font-weight:800">✓</span>&nbsp; Agenda: your project → solution and timeline → pricing</p>
      <p style="margin:0;font-size:14px;color:#3a3a48"><span style="color:#22a06b;font-weight:800">✓</span>&nbsp; Change of plans? Reschedule or cancel anytime from your private link</p>
    </div>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'booking_received_client';

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">Your meeting is confirmed</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, everything is set — see you {{date_client}} at {{time_client}}.</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;font-size:14px">
      <tr><td style="padding:8px 0;color:#8a8a99;width:110px">When</td><td style="padding:8px 0;font-weight:700">{{date_client}} · {{time_client}}</td></tr>
      <tr><td style="padding:8px 0;color:#8a8a99">Timezone</td><td style="padding:8px 0">{{client_timezone}}</td></tr>
    </table>
    <a href="{{meeting_link}}" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:8px">Join Google Meet</a>
    <a href="{{manage_link}}" style="display:block;text-align:center;font-size:13px;color:#7C4DFF;padding:12px 0 0">Reschedule or cancel</a>
    <div style="margin-top:22px;border-top:1px solid #eeeef4;padding-top:18px">
      <p style="font-size:13px;font-weight:800;margin:0 0 12px;color:#1a1a22">What happens next</p>
      <p style="margin:0 0 8px;font-size:14px;color:#3a3a48"><span style="color:#22a06b;font-weight:800">✓</span>&nbsp; A calendar invite (.ics) is attached to this email</p>
      <p style="margin:0 0 8px;font-size:14px;color:#3a3a48"><span style="color:#22a06b;font-weight:800">✓</span>&nbsp; Join from the link above a couple of minutes early</p>
      <p style="margin:0;font-size:14px;color:#3a3a48"><span style="color:#22a06b;font-weight:800">✓</span>&nbsp; Agenda: your project → solution and timeline → pricing</p>
    </div>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'booking_confirmed_client';

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">Your meeting has moved</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, our meeting has been rescheduled — new time below.</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;font-size:14px">
      <tr><td style="padding:8px 0;color:#8a8a99;width:110px">New time</td><td style="padding:8px 0;font-weight:700">{{date_client}} · {{time_client}}</td></tr>
      <tr><td style="padding:8px 0;color:#8a8a99">Timezone</td><td style="padding:8px 0">{{client_timezone}}</td></tr>
    </table>
    <a href="{{meeting_link}}" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:8px">Join Google Meet</a>
    <a href="{{manage_link}}" style="display:block;text-align:center;font-size:13px;color:#7C4DFF;padding:12px 0 0">Reschedule or cancel</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'rescheduled_client';

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">Your meeting has been cancelled</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, the meeting on {{date_client}} at {{time_client}} is now cancelled.</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <a href="{{site_url}}/book" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:20px">Book a new time</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'cancelled_client';

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">Our meeting is tomorrow</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, a friendly reminder — see you {{date_client}} at {{time_client}} ({{client_timezone}}).</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <a href="{{meeting_link}}" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:20px">Join Google Meet</a>
    <a href="{{manage_link}}" style="display:block;text-align:center;font-size:13px;color:#7C4DFF;padding:12px 0 0">Reschedule or cancel</a>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'reminder_client';
