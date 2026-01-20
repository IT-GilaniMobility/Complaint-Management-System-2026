import { createClient } from "./client";
import type { Database } from "./database.types";

type Complaint = Database["public"]["Tables"]["complaints"]["Row"] & {
  category: Database["public"]["Tables"]["categories"]["Row"];
  reporter: Database["public"]["Tables"]["users"]["Row"];
  assigned_to: Database["public"]["Tables"]["users"]["Row"] | null;
};

type ComplaintWithDetails = Complaint & {
  comments: Array<
    Database["public"]["Tables"]["comments"]["Row"] & {
      user: Database["public"]["Tables"]["users"]["Row"];
    }
  >;
  activities: Array<
    Database["public"]["Tables"]["activities"]["Row"] & {
      user: Database["public"]["Tables"]["users"]["Row"];
    }
  >;
};

export async function fetchComplaints(): Promise<Complaint[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      category:categories(*),
      reporter:reporter_id(*),
      assigned_to:assigned_to_id(*)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as Complaint[];
}

export async function fetchComplaintById(id: string): Promise<ComplaintWithDetails | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("complaints")
    .select(`
      *,
      category:categories(*),
      reporter:reporter_id(*),
      assigned_to:assigned_to_id(*),
      comments(
        *,
        user:user_id(*)
      ),
      activities(
        *,
        user:user_id(*)
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as unknown as ComplaintWithDetails;
}

export async function createComplaint(
  complaint: Database["public"]["Tables"]["complaints"]["Insert"]
): Promise<Database["public"]["Tables"]["complaints"]["Row"]> {
  const supabase = createClient();
  
  // @ts-ignore - Supabase type inference can be strict with insert types
  const { data, error } = await supabase
    .from("complaints")
    .insert(complaint as any)
    .select()
    .single();

  if (error) {
    // Surface Supabase error details for easier debugging in UI
    throw new Error(
      JSON.stringify(
        {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        null,
        2
      )
    );
  }
  return data as Database["public"]["Tables"]["complaints"]["Row"];
}

export async function updateComplaint(
  id: string,
  updates: Database["public"]["Tables"]["complaints"]["Update"]
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("complaints")
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUsers() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function fetchCategories(): Promise<Database["public"]["Tables"]["categories"]["Row"][]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) throw error;
  return data as Database["public"]["Tables"]["categories"]["Row"][];
}

export async function createCategory(
  category: Database["public"]["Tables"]["categories"]["Insert"]
): Promise<Database["public"]["Tables"]["categories"]["Row"]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    // @ts-ignore
    .insert(category as any)
    .select()
    .single();
  if (error) throw error;
  return data as Database["public"]["Tables"]["categories"]["Row"];
}

export async function createComment(
  comment: Database["public"]["Tables"]["comments"]["Insert"]
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("comments")
    .insert(comment as any)
    .select(`
      *,
      user:user_id(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function createActivity(
  activity: Database["public"]["Tables"]["activities"]["Insert"]
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("activities")
    .insert(activity as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUser(
  id: string,
  updates: Database["public"]["Tables"]["users"]["Update"]
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("users")
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// duplicate removed

export async function updateCategory(
  id: string,
  updates: Database["public"]["Tables"]["categories"]["Update"]
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from("categories")
    // @ts-ignore - Supabase type inference issue
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
