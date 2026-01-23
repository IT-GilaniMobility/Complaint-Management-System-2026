import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

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
      // Prepare a redirect response and bind cookies to it so Supabase can write auth cookies
      let response = NextResponse.redirect(new URL("/dashboard", baseUrl));

      // Read incoming cookies from request headers (avoid type issues)
      const incomingCookieHeader = request.headers.get("cookie") || "";
      const readCookie = (name: string) => {
        const parts = incomingCookieHeader.split(/;\s*/);
        for (const part of parts) {
          const idx = part.indexOf("=");
          if (idx > -1) {
            const k = part.slice(0, idx);
            const v = part.slice(idx + 1);
            if (k === name) return decodeURIComponent(v);
          }
        }
        return undefined;
      };
      const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return readCookie(name);
            },
            set(name: string, value: string, options: any) {
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              response.cookies.set({ name, value: "", ...options });
            },
          },
        }
      );

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error("Session exchange error:", exchangeError.message);
        response = NextResponse.redirect(
          new URL(`/login?error=auth_failed&message=${encodeURIComponent(exchangeError.message)}`, baseUrl)
        );
        return response;
      }

      // Redirect to dashboard after successful authentication
      console.log("Session exchange success, redirecting to /dashboard");
      return response;
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
