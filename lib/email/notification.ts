import nodemailer from "nodemailer";

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

let transporter: any = null;

const RESEND_API_KEY = process.env.RESEND_API_KEY;

async function sendWithResend(notification: EmailNotification): Promise<boolean> {
  if (!RESEND_API_KEY) {
    return false;
  }

  try {
    const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notification.to],
        subject: notification.subject,
        html: notification.html,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[Resend] Failed (${response.status}):`, responseText);
      return false;
    }

    const data = await response.json();
    console.log(`[Resend] Email sent to ${notification.to} (ID: ${data.id})`);
    return true;
  } catch (error: any) {
    console.error(`[Resend] Error:`, error?.message || error);
    return false;
  }
}

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const secure = process.env.EMAIL_SECURE === "true";
  const user = process.env.EMAIL_USER;
  const password = process.env.EMAIL_PASSWORD;

  if (!host || !user || !password) {
    console.warn("Email configuration missing - email notifications disabled");
    return null;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: password },
  });

  return transporter;
}

export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  if (RESEND_API_KEY) {
    const sent = await sendWithResend(notification);
    if (sent) return true;
  }

  const transport = getTransporter();
  if (!transport) {
    console.error("Email service not configured");
    return false;
  }

  try {
    const info = await transport.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: notification.to,
      subject: notification.subject,
      html: notification.html,
    });
    console.log(`Email sent to ${notification.to} (ID: ${info.messageId})`);
    return true;
  } catch (error: any) {
    console.error(`Failed to send email to ${notification.to}:`, error.message);
    return false;
  }
}

export function generateAssignmentEmailTemplate(data: {
  complaintNumber: string;
  subject: string;
  description: string;
  priority: string;
  assignedTo: string;
  dueDate: string;
  complaintUrl: string;
}): string {
  const priorityColor: Record<string, string> = {
    Urgent: "#ef4444",
    High: "#f97316",
    Medium: "#eab308",
    Low: "#22c55e",
  };

  const color = priorityColor[data.priority] || "#6366f1";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e293b; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .priority-badge { background: ${color}; color: white; }
    .field { margin: 12px 0; }
    .label { color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 600; }
    .value { color: #1e293b; font-size: 14px; margin-top: 4px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { color: #64748b; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">New Complaint Assignment</h2>
      <p style="margin: 8px 0 0 0; opacity: 0.9;">Complaint #${data.complaintNumber}</p>
    </div>
    <div class="content">
      <p>Hi ${data.assignedTo},</p>
      <p>A new complaint has been assigned to you.</p>

      <div class="field">
        <div class="label">Subject</div>
        <div class="value">${data.subject}</div>
      </div>

      <div class="field">
        <div class="label">Description</div>
        <div class="value">${data.description}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div class="field">
          <div class="label">Priority</div>
          <div class="value">
            <span class="badge priority-badge">${data.priority}</span>
          </div>
        </div>
        <div class="field">
          <div class="label">Due Date</div>
          <div class="value">${data.dueDate}</div>
        </div>
      </div>

      <a href="${data.complaintUrl}" class="button">View Complaint</a>

      <div class="footer">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>© ${new Date().getFullYear()} Complaint Management System. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
