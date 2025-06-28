import { useEffect, useState } from "react";
import { getUserFromCookie } from "../../api/userApi";
import {
   // addListingFormID,
   // addMappingFormID,
   createOrUpdateVertical,
   deleteVertical,
   editVertical,
   getVerticals,
   addBasicInfo,
   removeBasicInfo,
   // removeListingFormID,
   // removeMappingFormID,
} from "../../api/verticalsApi";
import CustomAlert from "../CustomAlert";
// import ManageListingForm from "./setup/ManageListingForm";
// import ManageMappingForm from "./setup/ManageMappingForm";
// import ManageVertical from "./setup/ManageVertical";

export default function SetupContent() {
   const [verticals, setVerticals] = useState([]);
   const [form, setForm] = useState({ vertical: "", status: "public" });
   const [user, setUser] = useState(null);
   const [alert, setAlert] = useState(null);
   const [loading, setLoading] = useState(false);
   const [editing, setEditing] = useState(null);
   const [showManage, setShowManage] = useState(false);
   const [showListing, setShowListing] = useState(false);
   const [showMapping, setShowMapping] = useState(false);

   // addBasicInfo({ vertical: "seed", infoId: "t1" })
   //    .then(() => console.log("added"))
   //    .catch((err) => console.error("Error:", err));

   // addBasicInfo({ vertical: "seed", infoId: "t2" })
   //    .then(() => console.log("added"))
   //    .catch((err) => console.error("Error:", err));

   // removeBasicInfo({ vertical: "seed", infoId: "t1" })
   //    .then(() => console.log("Removed!"))
   //    .catch((err) => console.error("Error:", err));

   useEffect(() => {
      setUser(getUserFromCookie());
      fetchVerticals();
   }, []);

   async function fetchVerticals() {
      setLoading(true);
      try {
         const userId = getUserFromCookie()?.userId;
         const data = await getVerticals({ userId });
         setVerticals(data);
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   const handleChange = (e) => {
      setForm({ ...form, [e.target.name]: e.target.value });
   };

   async function handleCreate(e) {
      e.preventDefault();
      if (!user) return setAlert({ type: "error", message: "Login required" });
      setLoading(true);
      try {
         await createOrUpdateVertical({
            vertical: form.vertical,
            userId: user.userId,
            username: user.username,
            status: form.status,
         });
         setAlert({ type: "success", message: "Vertical created/updated!" });
         setForm({ vertical: "", status: "public" });
         fetchVerticals();
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   async function handleEdit(vertical) {
      setEditing(vertical.id);
      setForm({ vertical: vertical.id, status: vertical.status });
   }

   async function handleUpdate(e) {
      e.preventDefault();
      if (!user) return setAlert({ type: "error", message: "Login required" });
      setLoading(true);
      try {
         await editVertical({
            vertical: form.vertical,
            userId: user.userId,
            updates: { status: form.status },
         });
         setAlert({ type: "success", message: "Vertical updated!" });
         setEditing(null);
         setForm({ vertical: "", status: "public" });
         fetchVerticals();
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   async function handleDelete(vertical) {
      if (!user) return setAlert({ type: "error", message: "Login required" });
      setLoading(true);
      try {
         await deleteVertical({ vertical: vertical.id, userId: user.userId });
         setAlert({ type: "success", message: "Vertical deleted!" });
         fetchVerticals();
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   // Add/Remove Form IDs
   // async function handleAddFormId(vertical, type, formId) {
   //    setLoading(true);
   //    try {
   //       if (type === "listing")
   //          await addListingFormID({ vertical: vertical.id, formId });
   //       else await addMappingFormID({ vertical: vertical.id, formId });
   //       setAlert({ type: "success", message: `Form ID added to ${type}` });
   //       fetchVerticals();
   //    } catch (err) {
   //       setAlert({ type: "error", message: err.message });
   //    } finally {
   //       setLoading(false);
   //    }
   // }
   // async function handleRemoveFormId(vertical, type, formId) {
   //    setLoading(true);
   //    try {
   //       if (type === "listing")
   //          await removeListingFormID({ vertical: vertical.id, formId });
   //       else await removeMappingFormID({ vertical: vertical.id, formId });
   //       setAlert({ type: "success", message: `Form ID removed from ${type}` });
   //       fetchVerticals();
   //    } catch (err) {
   //       setAlert({ type: "error", message: err.message });
   //    } finally {
   //       setLoading(false);
   //    }
   // }

   return (
      <div className="max-w-2xl mx-auto space-y-8 p-6">
         {/* Header with 3 buttons */}
         <div className="flex justify-center gap-4 mb-8">
            <button
               className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer shadow hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white focus:bg-gradient-to-r focus:from-blue-500 focus:to-purple-600 focus:text-white
                  ${
                     showManage
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-800 text-gray-300"
                  }`}
               onClick={() => {
                  setShowManage(true);
                  setShowListing(false);
                  setShowMapping(false);
               }}
            >
               Manage Vertical
            </button>
            <button
               className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer shadow
                  ${
                     showListing
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-800 text-gray-300"
                  }
                  hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white focus:bg-gradient-to-r focus:from-blue-500 focus:to-purple-600 focus:text-white`}
               onClick={() => {
                  setShowListing(true);
                  setShowManage(false);
                  setShowMapping(false);
               }}
            >
               Listing Form
            </button>
            <button
               className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 cursor-pointer shadow
                  ${
                     showMapping
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-800 text-gray-300"
                  }
                  hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white focus:bg-gradient-to-r focus:from-blue-500 focus:to-purple-600 focus:text-white`}
               onClick={() => {
                  setShowMapping(true);
                  setShowManage(false);
                  setShowListing(false);
               }}
            >
               Mapping Form
            </button>
         </div>
         {/* <ManageVertical
            open={showManage}
            onClose={() => setShowManage(false)}
         />
         <ManageListingForm
            open={showListing}
            onClose={() => setShowListing(false)}
         />
         <ManageMappingForm
            open={showMapping}
            onClose={() => setShowMapping(false)}
         /> */}
         <h2 className="text-xl font-bold text-white mb-4">
            Verticals Management
         </h2>
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}
         <form
            onSubmit={editing ? handleUpdate : handleCreate}
            className="flex flex-col md:flex-row gap-4 items-center bg-gray-800/70 p-4 rounded-xl border border-gray-700"
         >
            <input
               type="text"
               name="vertical"
               placeholder="Vertical Name"
               value={form.vertical}
               onChange={handleChange}
               className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
               required
               disabled={!!editing}
            />
            <select
               name="status"
               value={form.status}
               onChange={handleChange}
               className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
               <option value="public">Public</option>
               <option value="private">Private</option>
            </select>
            <button
               type="submit"
               className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium cursor-pointer"
               disabled={loading}
            >
               {editing ? "Update" : "Create"}
            </button>
            {editing && (
               <button
                  type="button"
                  onClick={() => {
                     setEditing(null);
                     setForm({ vertical: "", status: "public" });
                  }}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer"
               >
                  Cancel
               </button>
            )}
         </form>
         <div className="space-y-6">
            {loading && <div className="text-gray-400">Loading...</div>}
            {verticals.length === 0 && !loading && (
               <div className="text-gray-400">No verticals found.</div>
            )}
            {verticals.map((vertical) => (
               <div
                  key={vertical.id}
                  className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 flex flex-col gap-2"
               >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                     <div>
                        <span className="text-lg font-semibold text-white mr-2">
                           {vertical.id}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 ml-2">
                           {vertical.status}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 ml-2">
                           by {vertical.username}
                        </span>
                     </div>
                     {user && user.userId === vertical.userId && (
                        <div className="flex gap-2">
                           <button
                              onClick={() => handleEdit(vertical)}
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium cursor-pointer"
                           >
                              Edit
                           </button>
                           <button
                              onClick={() => handleDelete(vertical)}
                              className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium cursor-pointer"
                           >
                              Delete
                           </button>
                        </div>
                     )}
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 mt-2">
                     {/* Listing Form IDs */}
                     {/* <div className="flex-1">
                        <div className="text-sm text-gray-300 mb-1">
                           Listing Form IDs:
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {vertical.listingFormIDs &&
                           vertical.listingFormIDs.length > 0 ? (
                              vertical.listingFormIDs.map((fid) => (
                                 <span
                                    key={fid}
                                    className="bg-blue-900/60 text-blue-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                                 >
                                    {fid}
                                    <button
                                       onClick={() =>
                                          handleRemoveFormId(
                                             vertical,
                                             "listing",
                                             fid
                                          )
                                       }
                                       className="ml-1 text-red-400 hover:text-red-600 cursor-pointer"
                                       title="Remove"
                                    >
                                       ×
                                    </button>
                                 </span>
                              ))
                           ) : (
                              <span className="text-gray-500 text-xs">
                                 No IDs
                              </span>
                           )}
                        </div>
                        <form
                           onSubmit={async (e) => {
                              e.preventDefault();
                              const formId = e.target.elements.lid.value.trim();
                              if (formId) {
                                 await handleAddFormId(
                                    vertical,
                                    "listing",
                                    formId
                                 );
                                 e.target.reset();
                              }
                           }}
                           className="flex gap-2 mt-2"
                        >
                           <input
                              name="lid"
                              type="text"
                              placeholder="Add Listing Form ID"
                              className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                           />
                           <button
                              type="submit"
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                           >
                              Add
                           </button>
                        </form>
                     </div> */}
                     {/* Mapping Form IDs */}
                     {/* <div className="flex-1">
                        <div className="text-sm text-gray-300 mb-1">
                           Mapping Form IDs:
                        </div>
                        <div className="flex flex-wrap gap-2">
                           {vertical.mappingFormIDs &&
                           vertical.mappingFormIDs.length > 0 ? (
                              vertical.mappingFormIDs.map((fid) => (
                                 <span
                                    key={fid}
                                    className="bg-purple-900/60 text-purple-200 px-2 py-1 rounded text-xs flex items-center gap-1"
                                 >
                                    {fid}
                                    <button
                                       onClick={() =>
                                          handleRemoveFormId(
                                             vertical,
                                             "mapping",
                                             fid
                                          )
                                       }
                                       className="ml-1 text-red-400 hover:text-red-600 cursor-pointer"
                                       title="Remove"
                                    >
                                       ×
                                    </button>
                                 </span>
                              ))
                           ) : (
                              <span className="text-gray-500 text-xs">
                                 No IDs
                              </span>
                           )}
                        </div>
                        <form
                           onSubmit={async (e) => {
                              e.preventDefault();
                              const formId = e.target.elements.mid.value.trim();
                              if (formId) {
                                 await handleAddFormId(
                                    vertical,
                                    "mapping",
                                    formId
                                 );
                                 e.target.reset();
                              }
                           }}
                           className="flex gap-2 mt-2"
                        >
                           <input
                              name="mid"
                              type="text"
                              placeholder="Add Mapping Form ID"
                              className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                           />
                           <button
                              type="submit"
                              className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                           >
                              Add
                           </button>
                        </form>
                     </div> */}
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
