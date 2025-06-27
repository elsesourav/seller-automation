import {
   arrayRemove,
   arrayUnion,
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

// Create or update a vertical
export async function createOrUpdateVertical({
   vertical,
   userId,
   username,
   status = "public",
}) {
   const ref = doc(db, "verticals", vertical);
   const snap = await getDoc(ref);
   if (snap.exists()) {
      throw new Error("Vertical with this name already exists");
   }
   await setDoc(
      ref,
      {
         userId,
         username,
         status,
         products: [],
         basicInfo: [],
         infoForm: [],
         // listingFormIDs: [],
         // mappingFormIDs: [],
         // listingInfoIDs: [],
         // mappingInfoIDs: [],
      },
      { merge: true }
   );
   return { vertical, userId, username, status };
}

// Edit vertical (only by owner)
export async function editVertical({ vertical, userId, updates }) {
   const ref = doc(db, "verticals", vertical);
   const snap = await getDoc(ref);
   if (!snap.exists()) throw new Error("Vertical not found");
   const data = snap.data();
   if (data.userId !== userId) throw new Error("Not authorized");
   await updateDoc(ref, updates);
   return true;
}

// Delete vertical (only by owner)
export async function deleteVertical({ vertical, userId }) {
   const ref = doc(db, "verticals", vertical);
   const snap = await getDoc(ref);
   if (!snap.exists()) throw new Error("Vertical not found");
   const data = snap.data();
   if (data.userId !== userId) throw new Error("Not authorized");
   await deleteDoc(ref);
   return true;
}

// Add/remove listingFormIDs
export async function addListingFormID({ vertical, formId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { listingFormIDs: arrayUnion(formId) });
}
export async function removeListingFormID({ vertical, formId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { listingFormIDs: arrayRemove(formId) });
}

// Add/remove mappingFormIDs
export async function addMappingFormID({ vertical, formId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { mappingFormIDs: arrayUnion(formId) });
}
export async function removeMappingFormID({ vertical, formId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { mappingFormIDs: arrayRemove(formId) });
}

// Add/remove listingInfoIDs
export async function addListingInfoID({ vertical, infoId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { listingInfoIDs: arrayUnion(infoId) });
}
export async function removeListingInfoID({ vertical, infoId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { listingInfoIDs: arrayRemove(infoId) });
}

// Add/remove mappingInfoIDs
export async function addMappingInfoID({ vertical, infoId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { mappingInfoIDs: arrayUnion(infoId) });
}
export async function removeMappingInfoID({ vertical, infoId }) {
   const ref = doc(db, "verticals", vertical);
   await updateDoc(ref, { mappingInfoIDs: arrayRemove(infoId) });
}

// Get all public verticals or private ones for a user
export async function getVerticals({ userId }) {
   const verticalsRef = collection(db, "verticals");
   const q = query(verticalsRef, where("status", "==", "public"));
   const publicSnaps = await getDocs(q);
   let result = publicSnaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
   if (userId) {
      const privateQ = query(
         verticalsRef,
         where("status", "==", "private"),
         where("userId", "==", userId)
      );
      const privateSnaps = await getDocs(privateQ);
      result = result.concat(
         privateSnaps.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
   }
   return result;
}
