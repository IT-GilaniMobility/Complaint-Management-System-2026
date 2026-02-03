"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { sendEmail, generateAssignmentEmailTemplate } from "@/lib/email/notification";
import { sendComplaintCreatedEmail, sendComplaintResolvedEmail, sendCustomEmail } from "@/lib/email/emailjs";

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
  dueDate?: string;
};

export async function createComplaintAction(input: CreateComplaintInput) {
  try {
    console.log('[Complaint] Starting createComplaintAction');
    console.log('[Complaint] Input:', { ...input, description: input.description?.substring(0, 50) + '...' });
    
    // Check environment variables first
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.error('[Complaint] Missing NEXT_PUBLIC_SUPABASE_URL');
      throw new Error("Server configuration error: Missing database URL");
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[Complaint] Missing SUPABASE_SERVICE_ROLE_KEY');
      throw new Error("Server configuration error: Missing database key");
    }
    
    const supabase = createServiceClient();
    console.log('[Complaint] Service client created successfully');
    
    // Get authenticated user
    const authSupabase = await createClient();
    const { data: { user }, error: authError } = await authSupabase.auth.getUser();
    
    if (authError) {
      console.error('[Complaint] Auth error:', authError);
      throw new Error("You must be logged in to create a complaint");
    }
    
    if (!user) {
      console.error('[Complaint] No user found');
      throw new Error("You must be logged in to create a complaint");
    }
    
    console.log('[Complaint] User authenticated:', user.id);

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
  console.log('Inserting complaint with categoryId:', categoryId);
  const baseDueDate = input.dueDate
    ? new Date(input.dueDate)
    : addDays(new Date(), 3);
  const complaintData = {
    subject: input.subject,
    description: input.description,
    desired_outcome: input.desiredOutcome || null,
    category_id: categoryId!,
    priority: input.priority,
    reporter_id: user.id,
    assigned_to_id: null,
    customer_name: input.branch || null,
    customer_email: input.email || null,
    customer_phone: input.phone || null,
    due_date: baseDueDate.toISOString(),
    status: "Unassigned",
  } as any;
  
  console.log('Complaint data to insert:', { ...complaintData, description: complaintData.description?.substring(0, 50) + '...' });
  
  const { data, error } = await supabase
    .from("complaints")
    .insert(complaintData)
    .select("complaint_number")
    .single();

  if (error) {
    console.error("Create complaint error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw new Error(
      JSON.stringify({
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      }, null, 2)
    );
  }

  // Send EmailJS notification for new complaint (non-blocking)
  const complaintNumber = (data as any).complaint_number;
  console.log("[Complaint] Created successfully:", complaintNumber);
  console.log("[Complaint] Sending email notification to it@gilanimobility.ae...");
  
  // Fire and forget - don't await to avoid blocking
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  sendComplaintCreatedEmail({
    complaint_number: complaintNumber,
    subject: input.subject,
    category: labelByKey[input.category] || input.category,
    priority: input.priority,
    description: input.description,
    reporter_email: user.email || "Unknown",
    created_at: new Date().toLocaleString(),
    dashboard_link: `${appUrl}/complaints`,
  }).then((success) => {
    if (success) {
      console.log("[Complaint] Email sent successfully for:", complaintNumber);
    } else {
      console.error("[Complaint] Email failed for:", complaintNumber);
    }
  }).catch((emailError) => {
    console.error("[Complaint] Email error:", emailError);
  });

  revalidatePath("/complaints");
  return { success: true, complaintNumber };
  } catch (error: any) {
    console.error("createComplaintAction failed:", error?.message || error);
    throw new Error(error?.message || "Failed to create complaint");
  }
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

  // Send EmailJS notification when complaint is resolved or closed (non-blocking)
  if (status === "Resolved" || status === "Closed") {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    console.log("[Status] Sending resolved email for complaint:", data.complaint_number);
    sendComplaintResolvedEmail({
      complaint_number: data.complaint_number || "",
      subject: data.subject || "",
      status: status,
      resolved_at: new Date().toLocaleString(),
      dashboard_link: `${appUrl}/complaints/${complaintId}`,
    }).then((success) => {
      if (success) {
        console.log("[Status] Resolved email sent successfully for:", data.complaint_number);
      } else {
        console.error("[Status] Resolved email failed for:", data.complaint_number);
      }
    }).catch((emailError) => {
      console.error("[Status] Resolved email error:", emailError);
    });
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
  try {
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
  } catch (error: any) {
    console.error("updateComplaintAssigneeAction error:", error);
    throw error;
  }
}

export async function sendEmailAction(
  toEmail: string,
  subject: string,
  message: string,
  complaintNumber?: string
) {
  try {
    console.log('[Email] Starting sendEmailAction');
    console.log('[Email] To:', toEmail, 'Subject:', subject);
    
    const result = await sendCustomEmail({
      to_email: toEmail,
      subject: subject,
      message: message,
      complaint_number: complaintNumber,
    });

    if (!result) {
      throw new Error("Failed to send email");
    }

    return { success: true };
  } catch (error: any) {
    console.error("sendEmailAction error:", error);
    throw error;
  }
}
