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

// Create a new form
export async function createForm({
   formId,
   username,
   userId,
   name,
   status = "public",
   type,
   form,
}) {
   const ref = doc(db, "forms", formId);
   const snap = await getDoc(ref);
   if (snap.exists()) throw new Error("Form with this ID already exists");
   await setDoc(ref, { username, userId, name, status, type, form });
   return { formId, username, userId, name, status, type, form };
}

// Update a form (only by owner)
export async function updateForm({ formId, userId, updates }) {
   const ref = doc(db, "forms", formId);
   const snap = await getDoc(ref);
   if (!snap.exists()) throw new Error("Form not found");
   const data = snap.data();
   if (data.userId !== userId) throw new Error("Not authorized");
   await updateDoc(ref, updates);
   return true;
}

// Delete a form (only by owner)
export async function deleteForm({ formId, userId }) {
   const ref = doc(db, "forms", formId);
   const snap = await getDoc(ref);
   if (!snap.exists()) throw new Error("Form not found");
   const data = snap.data();
   if (data.userId !== userId) throw new Error("Not authorized");
   await deleteDoc(ref);
   return true;
}

// Get all public forms, or private forms for a user
export async function getForms({ userId, type }) {
   const formsRef = collection(db, "forms");
   let q = query(formsRef, where("status", "==", "public"));
   if (type)
      q = query(
         formsRef,
         where("status", "==", "public"),
         where("type", "==", type)
      );
   const publicSnaps = await getDocs(q);
   let result = publicSnaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   if (userId) {
      let privateQ = query(
         formsRef,
         where("status", "==", "private"),
         where("userId", "==", userId)
      );
      if (type)
         privateQ = query(
            formsRef,
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

// Get a form by name (public or owner)
export async function getFormByName({ name, userId }) {
   const formsRef = collection(db, "forms");
   // First, try to get public form by name
   let q = query(
      formsRef,
      where("name", "==", name),
      where("status", "==", "public")
   );
   let snaps = await getDocs(q);
   let result = snaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   // If userId is provided, also get private form by name for this user
   if (userId) {
      let privateQ = query(
         formsRef,
         where("name", "==", name),
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
