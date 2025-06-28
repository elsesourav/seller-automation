import { supabase } from "../lib/supabaseClient";

// Create a new data store entry
export async function createDataStore({ data }) {
   const { data: created, error } = await supabase
      .from("data_store")
      .insert([{ data }])
      .select()
      .single();
   if (error) throw new Error(error.message);
   return created;
}

// Update a data store entry
export async function updateDataStore(id, updates) {
   const { data, error } = await supabase
      .from("data_store")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
   if (error) throw new Error(error.message);
   return data;
}

// Delete a data store entry
export async function deleteDataStore(id) {
   const { error } = await supabase.from("data_store").delete().eq("id", id);
   if (error) throw new Error(error.message);
   return { success: true };
}

// Get all data store entries
export async function getAllDataStores() {
   const { data, error } = await supabase.from("data_store").select("*");
   if (error) throw new Error(error.message);
   return data;
}
