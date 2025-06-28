import bcrypt from "bcryptjs";
import Cookies from "js-cookie";
import { supabase } from "../lib/supabaseClient";

// USERS TABLE API
export async function createUser({ name, username, password }) {
   return supabase
      .from("users")
      .insert([{ name, username, password }])
      .select()
      .single();
}
export async function getUserById(id) {
   return supabase.from("users").select("*").eq("id", id).single();
}
export async function getUserByUsername(username) {
   return supabase.from("users").select("*").eq("username", username).single();
}
export async function listUsers() {
   return supabase.from("users").select("*");
}

// SIGNUP: hash password, create user, set cookie
export async function signup({ name, username, password }) {
   const hashedPassword = await bcrypt.hash(password, 10);
   const { data, error } = await supabase
      .from("users")
      .insert([{ name, username, password: hashedPassword }])
      .select()
      .single();
   if (data && !error) {
      Cookies.set(
         "user",
         JSON.stringify({
            id: data.id,
            name: data.name,
            username: data.username,
         }),
         { expires: 7 }
      );
   }
   return { data, error };
}

// SIGNIN: check password, set cookie
export async function signin({ username, password }) {
   const { data: user, error } = await getUserByUsername(username);
   if (error || !user) {
      return { data: null, error: "User not found" };
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if (!isMatch) {
      return { data: null, error: "Invalid password" };
   }
   Cookies.set(
      "user",
      JSON.stringify({ id: user.id, name: user.name, username: user.username }),
      { expires: 7 }
   );
   return { data: user, error: null };
}

// SIGNOUT: remove user cookie
export function signout() {
   Cookies.remove("user");
}
