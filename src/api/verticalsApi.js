import { supabase } from "../lib/supabaseClient";

// Create or update a vertical
export async function createOrUpdateVertical({
   vertical,
   userId,
   username,
   status = "public",
}) {
   const { data, error } = await supabase
      .from("verticals")
      .upsert([{ vertical, userId, username, status }])
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

// Edit vertical (only by owner)
export async function editVertical({ vertical, userId, updates }) {
   const { data, error } = await supabase
      .from("verticals")
      .update(updates)
      .eq("vertical", vertical)
      .eq("userId", userId)
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

// Add/remove basicInfo as subCollection
export async function addBasicInfo({ vertical, infoId }) {
   const { data, error } = await supabase
      .from("basicInfos")
      .insert([{ vertical, infoId }])
      .select()
      .single();

   if (error) throw new Error(error.message);
   return data;
}

export async function removeBasicInfo({ vertical, infoId }) {
   const { error } = await supabase
      .from("basicInfos")
      .delete()
      .eq("vertical", vertical)
      .eq("infoId", infoId);

   if (error) throw new Error(error.message);
   return true;
}

// Get all public verticals or private ones for a user
export async function getVerticals({ userId }) {
   let { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("status", "public");

   if (userId) {
      const { data: privateData, error: privateError } = await supabase
         .from("verticals")
         .select("*")
         .eq("status", "private")
         .eq("userId", userId);

      if (privateError) throw new Error(privateError.message);
      data = data.concat(privateData);
   }

   if (error) throw new Error(error.message);
   return data;
}

// VERTICALS TABLE API (Supabase only)
export async function createVertical({
   name,
   label,
   status = "public",
   created_by,
}) {
   return supabase
      .from("verticals")
      .insert([{ name, label, status, created_by }])
      .select()
      .single();
}
export async function getVerticalById(id) {
   // Allow access if status is public
   const { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.status === "public") return data;
   throw new Error("Not authorized");
}
export async function updateVertical(id, updates, userId) {
   // Only allow update if created_by is userId
   const { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase
      .from("verticals")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
}
export async function deleteVertical(id, userId) {
   // Only allow delete if created_by is userId
   const { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("id", id)
      .single();
   if (error) throw new Error(error.message);
   if (data.created_by !== userId) throw new Error("Not authorized");
   return supabase.from("verticals").delete().eq("id", id);
}
export async function listVerticals() {
   // Return all public verticals
   const { data, error } = await supabase
      .from("verticals")
      .select("*")
      .eq("status", "public");
   if (error) throw new Error(error.message);
   return data;
}
export async function getVerticalsByUser(userId) {
   return supabase.from("verticals").select("*").eq("created_by", userId);
}
