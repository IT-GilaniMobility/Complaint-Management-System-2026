import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // Refresh the session so Server Components can read it
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.warn("[middleware] getUser error:", error.message);
  }
  if (user) {
    // bind refreshed cookies to response
    // Supabase client will have called set/remove above as needed.
    // no-op: presence of user indicates session cookie exists.
  }

  return res;
}

export const config = {
  matcher: [
    // Exclude callback and static assets from middleware to avoid interference
    "/((?!_next/static|_next/image|favicon.ico|auth/callback).*)",
  ],
};
