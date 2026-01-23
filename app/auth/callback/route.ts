import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Build the base URL dynamically (handles Vercel proxies) with env override
  const forwardedProto = request.headers.get("x-forwarded-proto") || requestUrl.protocol.replace(":", "");
  const forwardedHost = request.headers.get("x-forwarded-host") || requestUrl.host;
  const baseUrl = `${forwardedProto}://${forwardedHost}`;

  // Handle OAuth errors
  if (error) {
    const errorMessage = errorDescription || error;
    console.error("OAuth error:", errorMessage);
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&message=${encodeURIComponent(errorMessage)}`, baseUrl)
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Session exchange error:", exchangeError.message);
        return NextResponse.redirect(
          new URL(`/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`, baseUrl)
        );
      }

      // Redirect to dashboard after successful authentication
      console.log("Session exchange success, redirecting to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", baseUrl));
    } catch (err) {
      console.error("Unexpected error in callback:", err);
      return NextResponse.redirect(
        new URL(`/login?error=auth_failed&message=Unexpected error`, baseUrl)
      );
    }
  }

  // No code provided
  return NextResponse.redirect(new URL("/login?error=no_code", baseUrl));
}
