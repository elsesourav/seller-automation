import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new vertical
export async function createVertical({ name, label, status = "public" }) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("verticals")
      .insert([{ name, label, status, created_by }])
      .select()
      .single();
   if (error) throw new Error(error.message);
   return data;
}

// Update a vertical (only by owner)
export async function updateVertical(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("id", id)
      .single();
   
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { data: updated, error: updateError } = await supabase
      .from("verticals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a vertical (only by owner)
export async function deleteVertical(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error: deleteError } = await supabase
      .from("verticals")
      .delete()
      .eq("id", id);
   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all verticals (public + private for current user)
export async function getAllVerticals() {
   const userId = getUserId();
   const { data: publicData, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   if (!userId) return publicData;
   const { data: privateData, error: privateError } = await supabase
      .from("verticals")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);
   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}
