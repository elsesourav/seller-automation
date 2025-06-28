import { supabase } from "../lib/supabaseClient";

// BASE_FORMS TABLE API
export async function createBaseForm({
   name,
   label,
   status = "private",
   form_id,
   vertical_id,
   category_id,
   created_by,
}) {
   return supabase
      .from("base_forms")
      .insert([
         { name, label, status, form_id, vertical_id, category_id, created_by },
      ])
      .select()
      .single();
}
export async function getBaseFormById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("base_forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateBaseForm(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("base_forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("base_forms")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteBaseForm(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("base_forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("base_forms").delete().eq("id", id);
}
export async function listBaseForms() {
   // Return all public base forms
   const { data, error } = await supabase
      .from("base_forms")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getBaseFormsByUser(userId) {
   return supabase.from("base_forms").select("*").eq("created_by", userId);
}
