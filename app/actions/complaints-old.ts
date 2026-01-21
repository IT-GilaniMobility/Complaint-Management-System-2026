"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { addDays } from "date-fns";

type CreateComplaintInput = {
  subject: string;
  description: string;
  category: string;
  categoryOther?: string;
  desiredOutcome?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  branch?: string;
  phone?: string;
  email?: string;
};

export async function createComplaintAction(input: CreateComplaintInput) {
  const supabase = createServiceClient();

  // Map categories to seeded IDs or create new ones
  const seededIds = {
    technical_support: "00000000-0000-0000-0000-000000000011",
    product: "00000000-0000-0000-0000-000000000013",
    service_quality: "00000000-0000-0000-0000-000000000014",
  } as const;

  const labelByKey: Record<string, string> = {
    service_quality: "Service Quality",
    provider_conduct: "Provider Conduct",
    access_eligibility: "Access and Eligibility",
    privacy_concern: "Privacy Concern",
    product: "Product",
    technical_support: "Technical Support",
    other: input.categoryOther?.trim() || "Other",
  };

  let categoryId: string | null = null;

  if (input.category in seededIds) {
    categoryId = seededIds[input.category as keyof typeof seededIds];
  } else {
    // Create or reuse category
    const categoryName = labelByKey[input.category];
    
    // Try to find existing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();

    if (existing) {
      categoryId = existing.id;
    } else {
      // Create new category
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: created, error: catError } = await (supabase as any)
        .from("categories")
        .insert({
          name: categoryName,
          description: null,
          sla_hours: 48,
        })
        .select("id")
        .single();

      if (catError) throw new Error(`Failed to create category: ${catError.message}`);
      categoryId = created.id;
    }
  }

  // Insert complaint
  const { data, error } = await supabase
    .from("complaints")
    .insert({
      subject: input.subject,
      description: input.description,
      desired_outcome: input.desiredOutcome || null,
      category_id: categoryId!,
      priority: input.priority,
      reporter_id: "00000000-0000-0000-0000-000000000001", // Default admin
      assigned_to_id: null,
      customer_name: input.branch || null,
      customer_email: input.email || null,
      customer_phone: input.phone || null,
      due_date: addDays(new Date(), 3).toISOString(),
      status: "Unassigned",
    })
    .select("complaint_number")
    .single();

  if (error) {
    throw new Error(
      JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }, null, 2)
    );
  }

  revalidatePath("/complaints");
  return { success: true, complaintNumber: data.complaint_number };
}
