import { supabase } from "../lib/supabaseClient";

// BASE_FORM_DATA TABLE API
export async function createBaseFormData({
   data_id,
   status = "private",
   base_form_id,
   vertical_id,
   category_id,
   created_by,
}) {
   return supabase
      .from("base_form_data")
      .insert([
         {
            data_id,
            status,
            base_form_id,
            vertical_id,
            category_id,
            created_by,
         },
      ])
      .select()
      .single();
}
export async function getBaseFormDataById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateBaseFormData(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("base_form_data")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteBaseFormData(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("base_form_data").delete().eq("id", id);
}
export async function listBaseFormData() {
   // Return all public base form data
   const { data, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getBaseFormDataByUser(userId) {
   return supabase.from("base_form_data").select("*").eq("created_by", userId);
}
