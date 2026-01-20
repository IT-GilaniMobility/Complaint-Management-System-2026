"use server";

import { createServiceClient } from "@/lib/supabase/service";

export async function seedUsers() {
  const supabase = createServiceClient();

  type UserRow = {
    id: string;
    name: string;
    email: string;
    role: "Admin" | "Lead Agent" | "Agent" | "Staff";
    avatar_url: null;
  };

  const users: UserRow[] = [
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Admin User",
      email: "admin@example.com",
      role: "Admin",
      avatar_url: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Lead Agent",
      email: "lead@example.com",
      role: "Lead Agent",
      avatar_url: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Agent One",
      email: "agent1@example.com",
      role: "Agent",
      avatar_url: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000004",
      name: "Agent Two",
      email: "agent2@example.com",
      role: "Agent",
      avatar_url: null,
    },
  ];

  try {
    const { error } = await supabase
      .from("users")
      .upsert(users as any, { onConflict: "id" });

    if (error) {
      console.error("Seed users error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: users.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function seedCategories() {
  const supabase = createServiceClient();

  type CategoryRow = {
    id: string;
    name: string;
    sla_hours: number;
    description: null;
  };

  const categories: CategoryRow[] = [
    { id: "00000000-0000-0000-0000-000000000011", name: "Technical Support", sla_hours: 24, description: null },
    { id: "00000000-0000-0000-0000-000000000013", name: "Product", sla_hours: 48, description: null },
    { id: "00000000-0000-0000-0000-000000000014", name: "Service Quality", sla_hours: 72, description: null },
    { id: "00000000-0000-0000-0000-000000000015", name: "Provider Conduct", sla_hours: 72, description: null },
    { id: "00000000-0000-0000-0000-000000000016", name: "Access and Eligibility", sla_hours: 48, description: null },
    { id: "00000000-0000-0000-0000-000000000017", name: "Privacy Concern", sla_hours: 24, description: null },
  ];

  try {
    const { error } = await supabase
      .from("categories")
      .upsert(categories as any, { onConflict: "id" });

    if (error) {
      console.error("Seed error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: categories.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
