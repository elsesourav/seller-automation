import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new base form data
export async function createBaseFormData({
   data_id,
   status = "private",
   base_form_id,
   vertical_id,
   category_id,
}) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");
   const { data, error } = await supabase
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
   if (error) throw new Error(error.message);
   return data;
}

// Update a base form data (only by owner)
export async function updateBaseFormData(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { data: updated, error: updateError } = await supabase
      .from("base_form_data")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a base form data (only by owner)
export async function deleteBaseFormData(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error: deleteError } = await supabase
      .from("base_form_data")
      .delete()
      .eq("id", id);
   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all base form data (public + private for current user)
export async function getAllBaseFormData() {
   const userId = getUserId();
   const { data: publicData, error } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   if (!userId) return publicData;
   const { data: privateData, error: privateError } = await supabase
      .from("base_form_data")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);
   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}
