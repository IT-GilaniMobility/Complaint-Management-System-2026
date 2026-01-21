import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Handle OAuth errors
  if (error) {
    const errorMessage = errorDescription || error;
    console.error("OAuth error:", errorMessage);
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&message=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Session exchange error:", exchangeError.message);
        return NextResponse.redirect(
          new URL(`/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        );
      }

      // Redirect to dashboard after successful authentication
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    } catch (err) {
      console.error("Unexpected error in callback:", err);
      return NextResponse.redirect(
        new URL(`/login?error=auth_failed&message=Unexpected error`, requestUrl.origin)
      );
    }
  }

  // No code provided
  return NextResponse.redirect(new URL("/login?error=no_code", requestUrl.origin));
}
