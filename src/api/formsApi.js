import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new form
export async function createForm({ structure }) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("forms")
      .insert([{ structure, created_by }])
      .select()
      .single();
   if (error) throw new Error(error.message);
   return data;
}

// Update a form (only by owner)
export async function updateForm(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { data: updated, error: updateError } = await supabase
      .from("forms")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a form (only by owner)
export async function deleteForm(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error: deleteError } = await supabase
      .from("forms")
      .delete()
      .eq("id", id);
   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all forms
export async function getAllForms() {
   const { data, error } = await supabase.from("forms").select("*");
   if (error) throw new Error(error.message);
   return data;
}

// Get a single form by ID
export async function getFormById(id) {
   if (!id || typeof id !== "string") throw new Error("Invalid form id");
   const { data, error } = await supabase
      .from("forms")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   return data;
}
