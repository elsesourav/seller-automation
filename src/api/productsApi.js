import { supabase } from "../lib/supabaseClient";

// PRODUCTS TABLE API
export async function createProduct({
   name,
   label,
   status = "public",
   vertical_id,
   category_id,
   created_by,
   price,
   quantity_per_kg,
   sku_id,
   increment_per_rupee,
}) {
   return supabase
      .from("products")
      .insert([
         {
            name,
            label,
            status,
            vertical_id,
            category_id,
            created_by,
            price,
            quantity_per_kg,
            sku_id,
            increment_per_rupee,
         },
      ])
      .select()
      .single();
}
export async function getProductById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateProduct(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteProduct(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("products").delete().eq("id", id);
}
export async function listProducts() {
   // Return all public products
   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getProductsByUser(userId) {
   return supabase.from("products").select("*").eq("created_by", userId);
}
