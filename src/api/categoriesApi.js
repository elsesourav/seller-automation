import { supabase } from "../lib/supabaseClient";

// CATEGORIES TABLE API
export async function createCategory({
   name,
   label,
   status = "public",
   created_by,
}) {
   return supabase
      .from("categories")
      .insert([{ name, label, status, created_by }])
      .select()
      .single();
}
export async function getCategoryById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateCategory(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteCategory(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("categories").delete().eq("id", id);
}
export async function listCategories() {
   // Return all public categories
   const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getCategoriesByUser(userId) {
   return supabase.from("categories").select("*").eq("created_by", userId);
}
