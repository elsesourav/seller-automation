import { supabase } from "../lib/supabaseClient";
import { getUserId } from "./usersApi";

// Create a new product
export async function createProduct({
   name,
   label,
   status = "public",
   vertical_id,
   category_id,
   price,
   quantity_per_kg,
   sku_id,
   increment_per_rupee,
}) {
   const created_by = getUserId();
   if (!created_by) throw new Error("Not authenticated");
   const { data, error } = await supabase
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
   if (error) throw new Error(error.message);
   return data;
}

// Update a product (only by owner)
export async function updateProduct(id, updates) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { data: updated, error: updateError } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   if (updateError) throw new Error(updateError.message);
   return updated;
}

// Delete a product (only by owner)
export async function deleteProduct(id) {
   const userId = getUserId();
   if (!userId) throw new Error("Not authenticated");
   const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
   if (deleteError) throw new Error(deleteError.message);
   return { success: true };
}

// Get all products (public + private for current user)
export async function getAllProducts() {
   const userId = getUserId();
   const { data: publicData, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   if (!userId) return publicData;
   const { data: privateData, error: privateError } = await supabase
      .from("products")
      .select("*")
      .eq("status", "private")
      .eq("created_by", userId);
   if (privateError) throw new Error(privateError.message);
   return publicData.concat(privateData);
}
