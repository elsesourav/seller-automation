import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new category (requires vertical_id, unique name per vertical)
export async function createCategory({
   name,
   label,
   status = "public",
   vertical_id,
}) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");
   if (!vertical_id) throw new Error("vertical_id is required");
   // Check for duplicate name in the same vertical
   const { data: existing, error: checkError } = await supabase
      .from("categories")
      .select("id")
      .eq("vertical_id", vertical_id)
      .eq("name", name)
      .maybeSingle();
   if (checkError) throw new Error(checkError.message);
   if (existing)
      throw new Error(
         "A category with this name already exists in this vertical."
      );
   const { data, error } = await supabase
      .from("categories")
      .insert([{ name, label, status, vertical_id, created_by }])
      .select()
      .single();
   if (error) throw new Error(error.message);
   return data;
}

// Update a category (only by owner, cannot change vertical_id)
export async function updateCategory(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   // Only allow updating name, label, status
   const allowed = {};
   if (typeof updates.name !== "undefined") allowed.name = updates.name;
   if (typeof updates.label !== "undefined") allowed.label = updates.label;
   if (typeof updates.status !== "undefined") allowed.status = updates.status;
   const { data: updated, error: updateError } = await supabase
      .from("categories")
      .update(allowed)
      .eq("id", id)
      .select()
      .single();
   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a category (only by owner)
export async function deleteCategory(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);
   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all categories (public + private for current user)
export async function getAllCategories() {
   const userId = getUserId();
   const { data: publicData, error } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   if (!userId) return publicData;
   const { data: privateData, error: privateError } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);
   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}

// Get all categories (public + private for current user)
export async function getVerticalCategories(verticalId) {
   const userId = getUserId();
   const { data: publicData, error } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "public")
      .eq("vertical_id", verticalId);
   if (error) throw new Error(error.message);
   if (!userId) return publicData;
   const { data: privateData, error: privateError } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);
   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}
