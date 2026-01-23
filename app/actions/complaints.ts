"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { sendEmail, generateAssignmentEmailTemplate } from "@/lib/email/notification";

type ComplaintStatus = "Pending" | "Unassigned" | "In Progress" | "Resolved" | "Closed";
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
  
  // Get authenticated user
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to create a complaint");
  }

  // Map categories to seeded IDs or create new ones
  const seededIds = {
    technical_support: "00000000-0000-0000-0000-000000000011",
    product: "00000000-0000-0000-0000-000000000013",
    service_quality: "00000000-0000-0000-0000-000000000014",
    provider_conduct: "00000000-0000-0000-0000-000000000015",
    access_eligibility: "00000000-0000-0000-0000-000000000016",
    privacy_concern: "00000000-0000-0000-0000-000000000017",
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
    // Create or reuse category (for "other" and custom)
    const categoryName = labelByKey[input.category];
    
    // Try to find existing
    const { data: existing, error: findError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .single();

    if (!findError && existing) {
      categoryId = (existing as any).id;
    } else {
      // Create new category
      const { data: created, error: catError } = await supabase
        .from("categories")
        .insert({
          name: categoryName,
          description: null,
          sla_hours: 48,
        } as any)
        .select("id")
        .single();

      if (catError) throw new Error(`Failed to create category: ${catError.message}`);
      categoryId = (created as any).id;
    }
  }

  // Ensure user exists in users table or create them
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existingUser) {
    // Create user record
    const { error: userError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || "User",
        email: user.email!,
        role: "Agent", // Default role
      } as any);

    if (userError) {
      console.error("Failed to create user:", userError);
      // Continue anyway - the user might have been created by another request
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
      reporter_id: user.id, // Use authenticated user's ID
      assigned_to_id: null,
      customer_name: input.branch || null,
      customer_email: input.email || null,
      customer_phone: input.phone || null,
      due_date: addDays(new Date(), 3).toISOString(),
      status: "Unassigned",
    } as any)
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
  return { success: true, complaintNumber: (data as any).complaint_number };
}

export async function updateComplaintStatusAction(complaintId: string, status: ComplaintStatus) {
  const supabase: any = createServiceClient();
  const updates = { status: status as any };

  // Capture user for audit trail
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  if (authError) {
    console.warn("Status change proceeding without auth user", authError.message);
  }

  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", complaintId)
    .select("id, status, assigned_to_id, priority, complaint_number, subject, description, created_at, due_date, category_id")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update status");
  }

  // Log activity (best-effort)
  if (user?.id) {
    const { error: activityError } = await supabase
      .from("activities")
      .insert({
        complaint_id: complaintId,
        action: "status_change",
        details: { to: status } as any,
        user_id: user.id,
      } as Database["public"]["Tables"]["activities"]["Insert"]);
    if (activityError) {
      console.error("Failed to log activity:", activityError);
    }
  }

  revalidatePath("/complaints");
  revalidatePath("/dashboard");
  revalidatePath(`/complaints/${complaintId}`);

  return data;
}

export async function getRecentActivities(limit: number = 3) {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("activities")
    .select(`
      *,
      complaint:complaints(id, complaint_number, subject),
      user:users(id, name)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch activities:", error);
    return [];
  }

  return data || [];
}

export async function getRecentComplaints(limit: number = 5, minutes: number = 60) {
  const supabase = createServiceClient();
  const since = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      category:categories(name),
      reporter:users!complaints_reporter_id_fkey(name)
    `)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent complaints:", error);
    return [];
  }

  return data || [];
}

export async function createCommentAction(
  complaintId: string,
  message: string,
  isInternal: boolean = false
) {
  const supabase: any = createServiceClient();

  // Get authenticated user
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be logged in to add a comment");
  }

  // Create comment
  const { data: comment, error: commentError } = await supabase
    .from("comments")
    .insert({
      complaint_id: complaintId,
      user_id: user.id,
      content: message,
      is_internal: isInternal,
    })
    .select()
    .single();

  if (commentError) {
    throw new Error(`Failed to create comment: ${commentError.message}`);
  }

  // Log activity
  const { error: activityError } = await supabase
    .from("activities")
    .insert({
      complaint_id: complaintId,
      action: "comment",
      details: { type: isInternal ? "internal" : "public" } as any,
      user_id: user.id,
    });

  if (activityError) {
    console.error("Failed to log comment activity:", activityError);
  }

  // Notify IT on any new comment (public or internal)
  try {
    const { data: complaint } = await supabase
      .from("complaints")
      .select(
        `
        complaint_number,
        subject,
        assigned_to:assigned_to_id(email, name)
      `
      )
      .eq("id", complaintId)
      .single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const complaintUrl = `${appUrl}/complaints/${complaintId}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
        <h2 style="margin: 0 0 8px 0;">New comment on complaint #${complaint?.complaint_number || ""}</h2>
        <p style="margin: 0 0 12px 0;">${isInternal ? "Internal" : "Public"} comment by ${user.email}</p>
        <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-weight: 600; margin-bottom: 6px;">Message:</div>
          <div style="white-space: pre-wrap;">${message}</div>
        </div>
        <p style="margin: 12px 0 0 0;">Subject: ${complaint?.subject || ""}</p>
        <a href="${complaintUrl}" style="display: inline-block; margin-top: 12px; padding: 10px 16px; background: #2563eb; color: white; border-radius: 6px; text-decoration: none;">View Complaint</a>
      </div>
    `;

    // Always notify IT
    await sendEmail({
      to: "it@gilanimobility.ae",
      subject: `New comment on complaint #${complaint?.complaint_number || ""}`,
      html,
    });
  } catch (notifyError) {
    console.error("Failed to send comment notification:", notifyError);
  }

  revalidatePath(`/complaints/${complaintId}`);
  return comment;
}

export async function updateComplaintAssigneeAction(complaintId: string, assigneeId: string | null) {
  const supabase: any = createServiceClient();

  // Fetch current complaint to detect assignment change
  const { data: currentComplaint, error: fetchError } = await supabase
    .from("complaints")
    .select("assigned_to_id, complaint_number, subject, description, priority, reporter:reporter_id(name)")
    .eq("id", complaintId)
    .single();

  if (fetchError) {
    throw new Error(fetchError.message || "Failed to fetch complaint");
  }

  const previousAssigneeId = currentComplaint.assigned_to_id;
  const assignmentChanged = previousAssigneeId !== assigneeId;

  const updates: Database["public"]["Tables"]["complaints"]["Update"] = { assigned_to_id: assigneeId };

  // Capture user for audit trail
  const authSupabase = await createClient();
  const { data: { user }, error: authError } = await authSupabase.auth.getUser();
  if (authError) {
    console.warn("Assignment change proceeding without auth user", authError.message);
  }

  const { data, error } = await supabase
    .from("complaints")
    .update(updates)
    .eq("id", complaintId)
    .select(`
      id,
      status,
      assigned_to_id,
      priority,
      complaint_number,
      subject,
      description,
      created_at,
      due_date,
      category_id,
      assigned_to:assigned_to_id(id, name, email, role)
    `)
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update assignee");
  }

  // Log activity (best-effort)
  if (user?.id) {
    const { error: activityError } = await supabase
      .from("activities")
      .insert({
        complaint_id: complaintId,
        action: "assignment_change",
        details: { to: assigneeId } as any,
        user_id: user.id,
      } as Database["public"]["Tables"]["activities"]["Insert"]);
    if (activityError) {
      console.error("Failed to log activity:", activityError);
    }
  }

  // Send email ONLY if assignment changed
  if (assignmentChanged && assigneeId && data?.assigned_to?.email) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const complaintUrl = `${appUrl}/complaints/${complaintId}`;
      const customerName = currentComplaint.reporter?.name || "Customer";

      const emailHtml = generateAssignmentEmailTemplate({
        complaintNumber: data.complaint_number || "Unknown",
        subject: data.subject || "",
        description: data.description || "",
        priority: data.priority || "Medium",
        assignedTo: data.assigned_to.name || "Team Member",
        dueDate: data.due_date ? new Date(data.due_date).toLocaleDateString() : "Not set",
        complaintUrl,
      });

      // Send to both it@gilanimobility.ae and assigned agent
      const recipients = [
        "it@gilanimobility.ae",
        data.assigned_to.email
      ];

      const apiUrl = `${appUrl}/api/send-email`;
      
      for (const recipient of recipients) {
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: recipient,
            subject: `Complaint #${data.complaint_number} Assigned - ${data.subject}`,
            html: emailHtml,
          }),
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }
  }

  revalidatePath("/complaints");
  revalidatePath("/dashboard");
  revalidatePath(`/complaints/${complaintId}`);

  return data;
}
