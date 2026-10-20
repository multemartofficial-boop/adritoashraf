-- Simplified client-facing templates: the email only confirms the booking
-- request/details; the owner contacts the client personally (WhatsApp/phone).

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">Request received</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, your booking request is confirmed — I will contact you shortly at the number or email you left.</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;font-size:14px">
      <tr><td style="padding:8px 0;color:#8a8a99;width:110px">Requested time</td><td style="padding:8px 0;font-weight:700">{{date_client}} · {{time_client}}</td></tr>
      <tr><td style="padding:8px 0;color:#8a8a99">Timezone</td><td style="padding:8px 0">{{client_timezone}}</td></tr>
    </table>
    <a href="{{manage_link}}" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:8px">Manage your booking</a>
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:#8a8a99">Questions? Just reply to this email.</p>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'booking_received_client';

update public.email_templates set body_html =
'<!doctype html><html><body style="margin:0;padding:0;background:#f3f3f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px 16px">
  <div style="text-align:center;padding:6px 0 18px"><span style="font-size:20px;font-weight:800;letter-spacing:-0.5px;color:#1a1a22">Adrito<span style="color:#7C4DFF">.</span></span></div>
  <div style="background:#ffffff;border:1px solid #e8e8f0;border-radius:20px;padding:32px 28px">
    <h1 style="margin:0 0 6px;font-size:26px;line-height:1.2;color:#1a1a22">Your booking is confirmed</h1>
    <p style="margin:0 0 24px;color:#5a5a6a;font-size:15px">Hi {{client_name}}, your call is confirmed — I will reach out to you shortly at the number or email you left.</p>
    <div style="background:#f7f6fb;border:1px solid #eae9f2;border-radius:14px;padding:20px;text-align:center">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a8a99;margin-bottom:6px">Booking reference</div>
      <div style="font-family:Courier,monospace;font-size:30px;font-weight:800;letter-spacing:4px;color:#1a1a22">{{reference_code}}</div>
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;font-size:14px">
      <tr><td style="padding:8px 0;color:#8a8a99;width:110px">Confirmed time</td><td style="padding:8px 0;font-weight:700">{{date_client}} · {{time_client}}</td></tr>
      <tr><td style="padding:8px 0;color:#8a8a99">Timezone</td><td style="padding:8px 0">{{client_timezone}}</td></tr>
    </table>
    <a href="{{manage_link}}" style="display:block;background:#1a1a22;color:#ffffff;text-decoration:none;text-align:center;font-weight:700;font-size:15px;padding:14px 24px;border-radius:999px;margin-top:8px">Manage your booking</a>
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:#8a8a99">Questions? Just reply to this email.</p>
  </div>
  <p style="text-align:center;font-size:12px;color:#9a9aa8;margin-top:20px">{{owner_name}} · Full Stack Developer · <a href="{{site_url}}" style="color:#9a9aa8">{{site_url}}</a></p>
</div></body></html>'
where type = 'booking_confirmed_client';

-- Plain-text bodies matching the simplified HTML.
update public.email_templates set body_text = $$Hi {{client_name}},

Your booking request is confirmed — I will contact you shortly at the number or email you left.

Requested time: {{date_client}} at {{time_client}} ({{client_timezone}})
Reference: {{reference_code}}
Manage your booking: {{manage_link}}

{{owner_name}}$$ where type = 'booking_received_client';

update public.email_templates set body_text = $$Hi {{client_name}},

Your call is confirmed for {{date_client}} at {{time_client}} ({{client_timezone}}) — I will reach out to you shortly.

Reference: {{reference_code}}
Manage your booking: {{manage_link}}

{{owner_name}}$$ where type = 'booking_confirmed_client';
