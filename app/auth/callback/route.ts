import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  // Build the base URL dynamically
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
      // Get cookies for Supabase
      const cookieStore = await cookies();
      
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              cookieStore.set(name, value, options);
            },
            remove(name: string, options: any) {
              cookieStore.set(name, "", { ...options, maxAge: 0 });
            },
          },
        }
      );

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
