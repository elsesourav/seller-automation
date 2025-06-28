import { supabase } from "../lib/supabaseClient";

// FORMS TABLE API
export async function createForm({ structure, status = "public", created_by }) {
   return supabase
      .from("forms")
      .insert([{ structure, status, created_by }])
      .select()
      .single();
}
export async function getFormById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateForm(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("forms").update(updates).eq("id", id).select().single();
}
export async function deleteForm(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("forms").delete().eq("id", id);
}
export async function listForms() {
   // Return all public forms
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getFormsByUser(userId) {
   return supabase.from("forms").select("*").eq("created_by", userId);
}
