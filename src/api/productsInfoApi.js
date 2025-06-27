import {
   collection,
   deleteDoc,
   doc,
   getDoc,
   getDocs,
   query,
   setDoc,
   updateDoc,
   where,
} from "firebase/firestore";
import { db } from "../lib/firebaseConfig";

// Create a new product info
export async function createProductInfo({
   infoId,
   username,
   userId,
   name,
   status = "public",
   type,
   info,
}) {
   const ref = doc(db, "productsInfo", infoId);
   const snap = await getDoc(ref);
   if (snap.exists()) throw new Error("Info with this ID already exists");
   await setDoc(ref, { username, userId, name, status, type, info });
   return { infoId, username, userId, name, status, type, info };
}

// Update product info (only by owner)
export async function updateProductInfo({ infoId, userId, updates }) {
   const ref = doc(db, "productsInfo", infoId);
   const snap = await getDoc(ref);
   if (!snap.exists()) throw new Error("Info not found");
   const data = snap.data();
   if (data.userId !== userId) throw new Error("Not authorized");
   await updateDoc(ref, updates);
   return true;
}

// Delete product info (only by owner)
export async function deleteProductInfo({ infoId, userId }) {
   const ref = doc(db, "productsInfo", infoId);
   const snap = await getDoc(ref);
   if (!snap.exists()) throw new Error("Info not found");
   const data = snap.data();
   if (data.userId !== userId) throw new Error("Not authorized");
   await deleteDoc(ref);
   return true;
}

// Get all public product infos, or private infos for a user
export async function getProductInfos({ userId, type }) {
   const infosRef = collection(db, "productsInfo");
   let q = query(infosRef, where("status", "==", "public"));
   if (type)
      q = query(
         infosRef,
         where("status", "==", "public"),
         where("type", "==", type)
      );
   const publicSnaps = await getDocs(q);
   let result = publicSnaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   if (userId) {
      let privateQ = query(
         infosRef,
         where("status", "==", "private"),
         where("userId", "==", userId)
      );
      if (type)
         privateQ = query(
            infosRef,
            where("status", "==", "private"),
            where("userId", "==", userId),
            where("type", "==", type)
         );
      const privateSnaps = await getDocs(privateQ);
      result = result.concat(
         privateSnaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
   }
   return result;
}

// Get product info by info string (public or owner)
export async function getProductInfoByInfo({ userId }) {
   const infosRef = collection(db, "productsInfo");
   // First, try to get public info by info string
   let q = query(infosRef, where("status", "==", "public"));
   let snaps = await getDocs(q);
   let result = snaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   // If userId is provided, also get private info for this user
   if (userId) {
      let privateQ = query(
         infosRef,
         where("status", "==", "private"),
         where("userId", "==", userId)
      );
      let privateSnaps = await getDocs(privateQ);
      result = result.concat(
         privateSnaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
   }
   return result;
}

// Get product info by name (public or owner, partial match)
export async function getProductInfoByName({ name, userId }) {
   const infosRef = collection(db, "productsInfo");
   let q = query(infosRef, where("status", "==", "public"));
   let snaps = await getDocs(q);
   let result = snaps.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
         (doc) =>
            doc.name && doc.name.toLowerCase().includes(name.toLowerCase())
      );
   // If userId is provided, also get private info for this user
   if (userId) {
      let privateQ = query(
         infosRef,
         where("status", "==", "private"),
         where("userId", "==", userId)
      );
      let privateSnaps = await getDocs(privateQ);
      result = result.concat(
         privateSnaps.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter(
               (doc) =>
                  doc.name &&
                  doc.name.toLowerCase().includes(name.toLowerCase())
            )
      );
   }
   return result;
}
