import { supabase } from "../lib/supabaseClient";

// DATA_STORE TABLE API
export async function createDataStore({ data }) {
   return supabase.from("data_store").insert([{ data }]).select().single();
}
export async function getDataStoreById(id) {
   // No status/created_by, so just return
   const { data, error } = await supabase
      .from("data_store")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   return data;
}
export async function updateDataStore(id, updates) {
   return supabase
      .from("data_store")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteDataStore(id) {
   return supabase.from("data_store").delete().eq("id", id);
}
export async function listDataStores() {
   const { data, error } = await supabase.from("data_store").select("*");
   if (error) throw new Error(error.message);
   return data;
}
