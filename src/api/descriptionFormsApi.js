import { supabase } from "../lib/supabaseClient";

// DESCRIPTION_FORMS TABLE API
export async function createDescriptionForm({
   name,
   label,
   status = "private",
   form_id,
   base_form_id,
   vertical_id,
   category_id,
   created_by,
}) {
   return supabase
      .from("description_forms")
      .insert([
         {
            name,
            label,
            status,
            form_id,
            base_form_id,
            vertical_id,
            category_id,
            created_by,
         },
      ])
      .select()
      .single();
}
export async function getDescriptionFormById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("description_forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateDescriptionForm(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("description_forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("description_forms")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteDescriptionForm(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("description_forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("description_forms").delete().eq("id", id);
}
export async function listDescriptionForms() {
   // Return all public description forms
   const { data, error } = await supabase
      .from("description_forms")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getDescriptionFormsByUser(userId) {
   return supabase
      .from("description_forms")
      .select("*")
      .eq("created_by", userId);
}
