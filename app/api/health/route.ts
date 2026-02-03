import { NextResponse } from "next/server";

// Simple test to check if server actions can work
export async function GET() {
  const checks: Record<string, any> = {
    timestamp: new Date().toISOString(),
  };

  // Check environment variables
  checks.envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing", 
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing",
    EMAILJS_PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY ? "✓ Set" : "✗ Missing",
    EMAILJS_PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY ? "✓ Set" : "✗ Missing",
  };

  // Try to create service client
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const supabase = createServiceClient();
    checks.serviceClient = "✓ Created";

    // Try a simple query
    const { data, error } = await supabase
      .from("categories")
      .select("id, name")
      .limit(3);

    if (error) {
      checks.dbQuery = `✗ Error: ${error.message}`;
    } else {
      checks.dbQuery = "✓ Success";
      checks.categories = data;
    }
  } catch (e: any) {
    checks.serviceClient = `✗ Error: ${e.message}`;
  }

  // Try to import and test email function
  try {
    const { sendComplaintCreatedEmail } = await import("@/lib/email/emailjs");
    checks.emailImport = "✓ Imported";
  } catch (e: any) {
    checks.emailImport = `✗ Error: ${e.message}`;
  }

  return NextResponse.json(checks);
}
