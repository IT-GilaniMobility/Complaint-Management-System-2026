import { createServiceClient } from "@/lib/supabase/service";

const categories = [
  { id: "00000000-0000-0000-0000-000000000011", name: "Technical Support", sla_hours: 24 },
  { id: "00000000-0000-0000-0000-000000000013", name: "Product", sla_hours: 48 },
  { id: "00000000-0000-0000-0000-000000000014", name: "Service Quality", sla_hours: 72 },
  { id: "00000000-0000-0000-0000-000000000015", name: "Provider Conduct", sla_hours: 72 },
  { id: "00000000-0000-0000-0000-000000000016", name: "Access and Eligibility", sla_hours: 48 },
  { id: "00000000-0000-0000-0000-000000000017", name: "Privacy Concern", sla_hours: 24 },
];

async function seedCategories() {
  const supabase = createServiceClient();

  for (const category of categories) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("categories")
      .upsert(
        { id: category.id, name: category.name, sla_hours: category.sla_hours, description: null },
        { onConflict: "id" }
      );

    if (error) {
      console.error(`Failed to seed ${category.name}:`, error);
    } else {
      console.log(`✓ Seeded: ${category.name}`);
    }
  }

  console.log("Category seeding complete!");
}

seedCategories().catch(console.error);
