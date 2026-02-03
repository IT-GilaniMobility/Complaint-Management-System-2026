// EmailJS integration for complaint notifications
// Sends emails to it@gilanimobility.ae when complaints are created or resolved

const EMAILJS_SERVICE_ID = "service_f1gdkek";
const EMAILJS_TEMPLATE_CREATED = "template_bjen6qr";
const EMAILJS_TEMPLATE_RESOLVED = "template_ble8pmn";
const NOTIFICATION_EMAIL = "it@gilanimobility.ae";

// Read env vars at runtime (inside functions), not at module load time
function getEmailJSKeys() {
  return {
    publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
    privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
  };
}

interface ComplaintCreatedParams {
  complaint_number: string;
  subject: string;
  category: string;
  priority: string;
  description: string;
  reporter_email: string;
  created_at: string;
  dashboard_link: string;
}

interface ComplaintResolvedParams {
  complaint_number: string;
  subject: string;
  status: string;
  resolved_at: string;
  dashboard_link: string;
}

async function sendEmailJS(templateId: string, templateParams: Record<string, string>): Promise<boolean> {
  const { publicKey, privateKey } = getEmailJSKeys();
  
  if (!publicKey || !privateKey) {
    console.error("[EmailJS] Keys not configured. PUBLIC_KEY:", !!publicKey, "PRIVATE_KEY:", !!privateKey);
    return false;
  }

  console.log("[EmailJS] Attempting to send with private key authentication...");

  try {
    const payload = {
      service_id: EMAILJS_SERVICE_ID,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        ...templateParams,
        to_email: NOTIFICATION_EMAIL,
      },
    };
    
    console.log("[EmailJS] Payload (without sensitive data):", {
      service_id: payload.service_id,
      template_id: payload.template_id,
      user_id: payload.user_id ? "***set***" : "missing",
      accessToken: payload.accessToken ? "***set***" : "missing",
    });

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "origin": "http://localhost",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log(`[EmailJS] Email sent successfully to ${NOTIFICATION_EMAIL}`);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`[EmailJS] Failed to send email: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`[EmailJS] Error sending email:`, error.message);
    } else {
      console.error(`[EmailJS] Error sending email:`, error);
    }
    return false;
  }
}

export async function sendComplaintCreatedEmail(params: ComplaintCreatedParams): Promise<boolean> {
  console.log(`[EmailJS] Sending complaint created notification for #${params.complaint_number}`);
  
  return sendEmailJS(EMAILJS_TEMPLATE_CREATED, {
    complaint_number: params.complaint_number,
    subject: params.subject,
    category: params.category,
    priority: params.priority,
    description: params.description,
    reporter_email: params.reporter_email,
    created_at: params.created_at,
    dashboard_link: params.dashboard_link,
    to_email: NOTIFICATION_EMAIL,
  });
}

export async function sendComplaintResolvedEmail(params: ComplaintResolvedParams): Promise<boolean> {
  console.log(`[EmailJS] Sending complaint resolved notification for #${params.complaint_number}`);
  
  return sendEmailJS(EMAILJS_TEMPLATE_RESOLVED, {
    complaint_number: params.complaint_number,
    subject: params.subject,
    status: params.status,
    resolved_at: params.resolved_at,
    dashboard_link: params.dashboard_link,
    to_email: NOTIFICATION_EMAIL,
  });
}
