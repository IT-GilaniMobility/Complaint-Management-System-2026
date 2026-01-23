import { NextResponse } from "next/server";
import { sendEmail, generateAssignmentEmailTemplate } from "@/lib/email/notification";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, html, type } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    console.log(`[API] /send-email POST received for ${to}`);

    const sent = await sendEmail({
      to,
      subject,
      html,
    });

    if (sent) {
      console.log(`[API] Email sent successfully to ${to}`);
      return NextResponse.json({ success: true, message: `Email sent to ${to}` });
    } else {
      console.log(`[API] Failed to send email to ${to}`);
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[API] Error in /send-email:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
