import nodemailer from "nodemailer";

/**
 * Email utility for invoice notifications.
 *
 * SMTP config via env vars — supports Gmail App Password, SendGrid, or any SMTP.
 * If SMTP is not configured, emails are silently skipped (logged only).
 *
 * Fallback: if sending to the customer fails, retry to FALLBACK_EMAIL.
 */

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_AUTH_USER || process.env.SMTP_USER;
  const pass = process.env.SMTP_APP_PASSWORD || process.env.SMTP_PASS;

  if (!user || !pass) {
    return null; // SMTP not configured — skip silently
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getFromAddress(): string {
  const name = process.env.SMTP_FROM_NAME;
  const email = process.env.SMTP_FROM_EMAIL || process.env.SMTP_AUTH_USER || "noreply@example.com";
  return name ? `"${name}" <${email}>` : email;
}

const FALLBACK_EMAIL =
  process.env.FALLBACK_EMAIL || process.env.SMTP_AUTH_USER || process.env.SMTP_USER || "";
const REPLY_TO = process.env.SMTP_REPLY_EMAIL || "";

/** Escape HTML special chars to prevent injection in email templates. */
function esc(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Basic RFC 5322 email validation. */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

interface InvoiceEmailData {
  invoiceNo: string;
  invoiceDate: string;
  randomNumber: string;
  salesAmount: number;
  itemName: string;
  customerName?: string;
  relateNumber: string;
}

function buildInvoiceHtml(data: InvoiceEmailData): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #7c3aed;">電子發票開立通知 E-Invoice Notification</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">發票號碼 Invoice No</td>
          <td style="padding: 8px; font-weight: bold;">${esc(data.invoiceNo)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">隨機碼 Random Code</td>
          <td style="padding: 8px;">${esc(data.randomNumber)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">開立日期 Date</td>
          <td style="padding: 8px;">${esc(data.invoiceDate)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">金額 Amount</td>
          <td style="padding: 8px;">NT$ ${esc(String(data.salesAmount))}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">商品 Item</td>
          <td style="padding: 8px;">${esc(data.itemName)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">關聯編號 Relate No</td>
          <td style="padding: 8px;">${esc(data.relateNumber)}</td>
        </tr>
        ${data.customerName ? `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 8px; color: #6b7280;">買受人 Customer</td>
          <td style="padding: 8px;">${esc(data.customerName)}</td>
        </tr>` : ""}
      </table>
      <p style="color: #9ca3af; font-size: 12px;">
        此為系統自動發送，請勿直接回覆。<br/>
        This is an automated notification. Please do not reply.
      </p>
    </div>
  `;
}

/**
 * Send invoice email notification.
 *
 * 1. Try sending to customerEmail
 * 2. If fails (or empty) → retry to FALLBACK_EMAIL
 * 3. If SMTP not configured → log and skip
 *
 * Never throws — invoice issuance should not fail because of email.
 */
export async function sendInvoiceEmail(
  customerEmail: string | undefined,
  data: InvoiceEmailData,
): Promise<{ sent: boolean; to: string; fallback: boolean }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log("[email] SMTP not configured — skipping invoice email");
    return { sent: false, to: "", fallback: false };
  }

  const from = getFromAddress();
  // Subject is plain text (not HTML), but sanitize to prevent header injection
  const subject = `電子發票通知 Invoice ${data.invoiceNo.replace(/[\r\n]/g, "")} — NT$ ${data.salesAmount}`;
  const html = buildInvoiceHtml(data);
  const replyTo = REPLY_TO || undefined;

  // Try customer email first (validate format)
  if (customerEmail && isValidEmail(customerEmail)) {
    try {
      await transporter.sendMail({ from, replyTo, to: customerEmail, subject, html });
      console.log(`[email] Invoice ${data.invoiceNo} sent to ${customerEmail}`);
      return { sent: true, to: customerEmail, fallback: false };
    } catch (err) {
      console.error(`[email] Failed to send to ${customerEmail}:`, err);
    }
  }

  // Fallback to system email
  if (FALLBACK_EMAIL) {
    try {
      await transporter.sendMail({
        from,
        replyTo,
        to: FALLBACK_EMAIL,
        subject: `[Fallback] ${subject}`,
        html: `
          <p style="color: #ef4444; font-weight: bold;">
            ⚠️ 原始收件人寄送失敗 Original recipient failed: ${esc(customerEmail || "(empty)")}
          </p>
          ${html}
        `,
      });
      console.log(`[email] Invoice ${data.invoiceNo} sent to fallback ${FALLBACK_EMAIL}`);
      return { sent: true, to: FALLBACK_EMAIL, fallback: true };
    } catch (err) {
      console.error(`[email] Fallback email also failed:`, err);
    }
  }

  return { sent: false, to: "", fallback: false };
}
