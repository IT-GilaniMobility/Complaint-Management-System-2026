import { NextResponse } from "next/server";
import { sendComplaintCreatedEmail } from "@/lib/email/emailjs";

// Test endpoint to verify EmailJS is working
// Access via: http://localhost:3000/api/test-emailjs
export async function GET() {
  try {
    const result = await sendComplaintCreatedEmail({
      complaint_number: "TEST-001",
      subject: "Test Complaint - EmailJS Integration",
      category: "Technical Support",
      priority: "High",
      description: "This is a test email to verify EmailJS integration is working correctly.",
      reporter_email: "test@example.com",
      created_at: new Date().toLocaleString(),
      dashboard_link: "http://localhost:3000/complaints",
    });

    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: "Test email sent successfully to it@gilanimobility.ae" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "Failed to send email. Check server logs for details." 
      }, { status: 500 });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      success: false, 
      error: errorMessage 
    }, { status: 500 });
  }
}
