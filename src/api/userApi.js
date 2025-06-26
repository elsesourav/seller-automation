import bcrypt from "bcryptjs";
import {
   collection,
   doc,
   getDocs,
   query,
   setDoc,
   where,
} from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

// Helper to set cookie for 50 days
function setUserCookie(user) {
   const expires = new Date(
      Date.now() + 50 * 24 * 60 * 60 * 1000
   ).toUTCString();
   document.cookie = `sa_user=${encodeURIComponent(
      JSON.stringify(user)
   )}; expires=${expires}; path=/`;
}

// Helper to get user from cookie
export function getUserFromCookie() {
   const match = document.cookie.match(/(?:^|; )sa_user=([^;]*)/);
   if (!match) return null;
   try {
      return JSON.parse(decodeURIComponent(match[1]));
   } catch {
      return null;
   }
}

// Create a new user
export async function createUser({ name, username, password }) {
   // Check if username already exists
   const usersRef = collection(db, "users");
   const q = query(usersRef, where("username", "==", username));
   const querySnapshot = await getDocs(q);
   if (!querySnapshot.empty) {
      throw new Error("Username already exists");
   }

   const userId = crypto.randomUUID();
   const passwordHash = await bcrypt.hash(password, 10);
   const createdAt = Date.now();

   const userData = {
      name,
      username,
      createdAt,
      password: passwordHash,
      userId,
   };

   await setDoc(doc(db, "users", userId), userData);
   // Set cookie after registration
   setUserCookie({ userId, name, username, createdAt });
   return { userId, name, username, createdAt };
}

// Login user
export async function loginUser({ username, password }) {
   const usersRef = collection(db, "users");
   const q = query(usersRef, where("username", "==", username));
   const querySnapshot = await getDocs(q);
   if (querySnapshot.empty) {
      throw new Error("User not found");
   }
   const userDoc = querySnapshot.docs[0];
   const userData = userDoc.data();
   const isMatch = await bcrypt.compare(password, userData.password);
   if (!isMatch) {
      throw new Error("Invalid password");
   }
   // Return user info except password
   const { password: _, ...userInfo } = userData;
   setUserCookie(userInfo); // Set cookie after login
   return userInfo;
}
