import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new description form data
export async function createDescriptionFormData({
   name,
   label,
   data_id,
   status = "private",
   description_form_id,
   base_form_data_id,
   vertical_id,
   category_id,
}) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("description_form_data")
      .insert([
         {
            name,
            label,
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
   if (error) throw new Error(error.message);
   return data;
}

// Update a description form data (only by owner)
export async function updateDescriptionFormData(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { data: updated, error: updateError } = await supabase
      .from("description_form_data")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a description form data (only by owner)
export async function deleteDescriptionFormData(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error: deleteError } = await supabase
      .from("description_form_data")
      .delete()
      .eq("id", id);
   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all description form data (public + private for current user)
export async function getAllDescriptionFormData() {
   const userId = getUserId();
   const { data: publicData, error } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   if (!userId) return publicData;
   const { data: privateData, error: privateError } = await supabase
      .from("description_form_data")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);
   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}
