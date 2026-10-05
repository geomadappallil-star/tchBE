import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailEnquiryData {
  referenceId: string;
  name: string;
  phone: string;
  email?: string;
  suburb?: string;
  enquiryType: string;
  service: string;
  message: string;
  fundingType?: string;
  timestamp: string;
}

const FORWARD_TO_EMAIL = process.env.FORWARD_TO_EMAIL || 'geomadappallil@gmail.com';
const FROM_EMAIL = process.env.SMTP_USER || 'admin@tchservices.com.au';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER || 'admin@tchservices.com.au';
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }

  return null;
}

/**
 * Builds a responsive, beautifully styled HTML email template
 */
export function generateForwardingEmailHtml(data: EmailEnquiryData): string {
  const dateFormatted = new Date(data.timestamp).toLocaleString('en-AU', {
    timeZone: 'Australia/Brisbane',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New TCH Support Services Enquiry</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F6F4EE; margin: 0; padding: 20px; color: #17241F; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(8, 58, 52, 0.08); border: 1px solid rgba(14, 110, 100, 0.15); }
    .header { background: linear-gradient(135deg, #083A34 0%, #0E6E64 100%); padding: 30px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0 0 6px; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 0; font-size: 13px; color: #DDE7D4; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; }
    .badge { display: inline-block; background: #E3A83B; color: #17241F; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; margin-top: 12px; text-transform: uppercase; }
    .content { padding: 28px 24px; }
    .section-title { font-size: 15px; font-weight: 700; color: #083A34; margin: 0 0 16px; border-bottom: 2px solid #DDE7D4; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px; }
    .info-table td { padding: 10px 12px; border-bottom: 1px solid #F0EEE6; }
    .info-table td.label { font-weight: 600; color: #5A6C65; width: 34%; }
    .info-table td.value { color: #17241F; font-weight: 500; }
    .message-box { background: #F6F4EE; border-left: 4px solid #0E6E64; padding: 16px; border-radius: 0 10px 10px 0; margin-bottom: 24px; font-size: 14px; line-height: 1.6; }
    .actions { text-align: center; margin: 28px 0 10px; }
    .btn { display: inline-block; background: #0E6E64; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 999px; font-weight: 700; font-size: 14px; margin: 0 6px 10px; }
    .btn-gold { background: #E3A83B; color: #17241F !important; }
    .footer { background: #083A34; padding: 20px 24px; text-align: center; font-size: 12px; color: rgba(221, 231, 212, 0.7); }
    .footer a { color: #E3A83B; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p>TCH Support Services · Townsville</p>
      <h1>New Website Enquiry Received</h1>
      <span class="badge">Ref: ${data.referenceId}</span>
    </div>

    <div class="content">
      <div class="section-title">Enquiry Details</div>
      <table class="info-table">
        <tr>
          <td class="label">Date &amp; Time:</td>
          <td class="value">${dateFormatted}</td>
        </tr>
        <tr>
          <td class="label">Contact Name:</td>
          <td class="value"><strong>${data.name}</strong></td>
        </tr>
        <tr>
          <td class="label">Phone:</td>
          <td class="value"><a href="tel:${data.phone}" style="color:#0E6E64; font-weight:700;">${data.phone}</a></td>
        </tr>
        <tr>
          <td class="label">Email:</td>
          <td class="value">${data.email ? `<a href="mailto:${data.email}">${data.email}</a>` : '<em>Not provided</em>'}</td>
        </tr>
        <tr>
          <td class="label">Townsville Suburb:</td>
          <td class="value">${data.suburb || '<em>Not provided</em>'}</td>
        </tr>
        <tr>
          <td class="label">Service Required:</td>
          <td class="value"><strong style="color:#0E6E64;">${data.service}</strong></td>
        </tr>
        <tr>
          <td class="label">Enquiry Category:</td>
          <td class="value">${data.enquiryType}</td>
        </tr>
        <tr>
          <td class="label">Funding Arrangement:</td>
          <td class="value">${data.fundingType || 'Unspecified'}</td>
        </tr>
      </table>

      <div class="section-title">Message / Client Notes</div>
      <div class="message-box">
        ${data.message ? data.message.replace(/\n/g, '<br>') : '<em>No additional message provided.</em>'}
      </div>

      <div class="actions">
        <a href="tel:${data.phone}" class="btn">📞 Call ${data.name}</a>
        ${data.email ? `<a href="mailto:${data.email}?subject=Regarding%20your%20TCH%20Support%20Services%20Enquiry%20(${data.referenceId})" class="btn btn-gold">✉️ Reply via Email</a>` : ''}
      </div>
    </div>

    <div class="footer">
      <p style="margin:0 0 6px;">This message was automatically forwarded from <strong>${FROM_EMAIL}</strong> to <strong>${FORWARD_TO_EMAIL}</strong>.</p>
      <p style="margin:0;">TCH Support Services · Alan Jomon (0431 430 905) · Townsville | Ingham | Charters Towers</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Builds acknowledgment email sent to the user/participant if they provided an email
 */
export function generateClientAcknowledgmentHtml(data: EmailEnquiryData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Thank you for contacting TCH Support Services</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F6F4EE; margin: 0; padding: 20px; color: #17241F; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(8, 58, 52, 0.08); }
    .header { background: #0E6E64; padding: 26px 20px; text-align: center; color: #ffffff; }
    .content { padding: 24px; font-size: 15px; line-height: 1.65; }
    .footer { background: #083A34; padding: 18px 20px; text-align: center; font-size: 12px; color: #DDE7D4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size:20px;">TCH Support Services</h1>
      <p style="margin:6px 0 0; font-size:13px; color:#DDE7D4;">Townsville · Ingham · Charters Towers</p>
    </div>
    <div class="content">
      <p>Hello <strong>${data.name}</strong>,</p>
      <p>Thank you for reaching out to TCH Support Services. We have received your enquiry regarding <strong>${data.service}</strong> (Reference: <strong>${data.referenceId}</strong>).</p>
      <p>Our service delivery team led by <strong>Alan Jomon</strong> reviews enquiries immediately. Alan will phone you shortly at <strong>${data.phone}</strong> to discuss your support or property inspection requirements.</p>
      <p>If your enquiry is urgent, you can also reach Alan directly at <a href="tel:0431430905" style="color:#0E6E64; font-weight:700;">0431 430 905</a>.</p>
      <br>
      <p style="margin:0;">Warm regards,<br><strong>Alan Jomon</strong><br>Manager – Service Delivery<br>TCH Support Services</p>
    </div>
    <div class="footer">
      &copy; 2026 TCH Support Services · Townsville QLD · <a href="https://www.tchservices.com.au" style="color:#E3A83B;">www.tchservices.com.au</a>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Sends forwarding email and optional client acknowledgment
 */
export async function forwardEnquiryEmail(data: EmailEnquiryData): Promise<{ sent: boolean; message: string }> {
  const transporter = createTransporter();

  const forwardMailOptions = {
    from: `"TCH Support Services" <${FROM_EMAIL}>`,
    to: FORWARD_TO_EMAIL,
    replyTo: data.email || FROM_EMAIL,
    subject: `[New TCH Enquiry] ${data.service} - ${data.name} (${data.suburb || 'Townsville'}) [${data.referenceId}]`,
    html: generateForwardingEmailHtml(data)
  };

  if (!transporter) {
    console.log('================================================================');
    console.log(`[EMAIL DISPATCH - SIMULATED / OFFLINE MODE]`);
    console.log(`From: ${FROM_EMAIL}`);
    console.log(`To: ${FORWARD_TO_EMAIL}`);
    console.log(`Subject: ${forwardMailOptions.subject}`);
    console.log(`Client: ${data.name} (${data.phone}) | Suburb: ${data.suburb}`);
    console.log(`Reference: ${data.referenceId}`);
    console.log('================================================================');
    return {
      sent: true,
      message: `Enquiry logged and forwarded to ${FORWARD_TO_EMAIL} (simulated dev mode).`
    };
  }

  try {
    const info = await transporter.sendMail(forwardMailOptions);
    console.log(`[EMAIL FORWARDED SUCCESS] Message ID: ${info.messageId} to ${FORWARD_TO_EMAIL}`);

    // If client supplied email, send acknowledgment
    if (data.email && data.email.includes('@')) {
      try {
        await transporter.sendMail({
          from: `"TCH Support Services" <${FROM_EMAIL}>`,
          to: data.email,
          subject: `Enquiry Received - TCH Support Services [${data.referenceId}]`,
          html: generateClientAcknowledgmentHtml(data)
        });
      } catch (clientErr) {
        console.warn('[EMAIL ACKNOWLEDGMENT WARNING] Could not send client copy:', clientErr);
      }
    }

    return { sent: true, message: `Email forwarded successfully to ${FORWARD_TO_EMAIL}` };
  } catch (err: any) {
    console.error('[EMAIL DISPATCH ERROR]', err);
    return { sent: false, message: `Failed to forward email: ${err.message}` };
  }
}
