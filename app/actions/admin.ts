"use server";

import { createServiceClient } from "@/lib/supabase/service";
import { revalidatePath } from "next/cache";

type UserRole = "Admin" | "Lead Agent" | "Agent" | "Staff";

export async function updateUserRole(userId: string, role: UserRole) {
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("users")
    .update({ role } as { role: string })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user role: ${error.message}`);
  }

  revalidatePath("/admin/users");
  return { success: true };
}
