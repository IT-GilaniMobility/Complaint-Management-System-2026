"use server";

import { createServiceClient } from "@/lib/supabase/service";

export async function seedCategories() {
  const supabase = createServiceClient();

  const categories = [
    { id: "00000000-0000-0000-0000-000000000011", name: "Technical Support", sla_hours: 24 },
    { id: "00000000-0000-0000-0000-000000000013", name: "Product", sla_hours: 48 },
    { id: "00000000-0000-0000-0000-000000000014", name: "Service Quality", sla_hours: 72 },
    { id: "00000000-0000-0000-0000-000000000015", name: "Provider Conduct", sla_hours: 72 },
    { id: "00000000-0000-0000-0000-000000000016", name: "Access and Eligibility", sla_hours: 48 },
    { id: "00000000-0000-0000-0000-000000000017", name: "Privacy Concern", sla_hours: 24 },
  ];

  try {
    const { error } = await supabase
      .from("categories")
      .upsert(
        categories.map((c) => ({ ...c, description: null })),
        { onConflict: "id" }
      );

    if (error) {
      console.error("Seed error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: categories.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
