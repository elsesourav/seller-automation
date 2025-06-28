import { supabase } from "../lib/supabaseClient";

// DESCRIPTION_FORM_DATA TABLE API
export async function createDescriptionFormData({
   data_id,
   status = "private",
   description_form_id,
   base_form_data_id,
   vertical_id,
   category_id,
   created_by,
}) {
   return supabase
      .from("description_form_data")
      .insert([
         {
            data_id,
            status,
            description_form_id,
            base_form_data_id,
            vertical_id,
            category_id,
            created_by,
         },
      ])
      .select()
      .single();
}
export async function getDescriptionFormDataById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateDescriptionFormData(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("description_form_data")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteDescriptionFormData(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("description_form_data").delete().eq("id", id);
}
export async function listDescriptionFormData() {
   // Return all public description form data
   const { data, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getDescriptionFormDataByUser(userId) {
   return supabase
      .from("description_form_data")
      .select("*")
      .eq("created_by", userId);
}
