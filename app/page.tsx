import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Auth error on home page:", error);
      redirect("/login");
    }

    if (!user) {
      redirect("/login");
    }

    redirect("/dashboard");
  } catch (error) {
    console.error("Unexpected error on home page:", error);
    redirect("/login");
  }
}
