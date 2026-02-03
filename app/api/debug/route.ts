import { NextResponse } from "next/server";

// Diagnostic endpoint to test Supabase and EmailJS configuration
// Access via: /api/debug
export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  };

  // Check Supabase env vars
  diagnostics.supabase = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Missing",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Missing",
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✓ Set" : "✗ Missing",
  };

  // Check EmailJS env vars
  diagnostics.emailjs = {
    publicKey: process.env.EMAILJS_PUBLIC_KEY ? "✓ Set" : "✗ Missing",
    privateKey: process.env.EMAILJS_PRIVATE_KEY ? "✓ Set" : "✗ Missing",
  };

  // Check other important vars
  diagnostics.app = {
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "Not set (using localhost)",
  };

  // Try Supabase connection
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createServiceClient } = await import("@/lib/supabase/service");
      const supabase = createServiceClient();
      
      const { error } = await supabase
        .from("categories")
        .select("count")
        .limit(1);
      
      if (error) {
        diagnostics.supabaseConnection = `✗ Error: ${error.message}`;
      } else {
        diagnostics.supabaseConnection = "✓ Connected";
      }
    } else {
      diagnostics.supabaseConnection = "✗ Cannot test - missing env vars";
    }
  } catch (e: any) {
    diagnostics.supabaseConnection = `✗ Exception: ${e.message}`;
  }

  return NextResponse.json(diagnostics, { status: 200 });
}
