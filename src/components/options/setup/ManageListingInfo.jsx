import { useEffect, useState } from "react";
import {
   createProductInfo,
   deleteProductInfo,
   getProductInfos,
   updateProductInfo,
} from "../../../api/productsInfoApi";
import { getUserFromCookie } from "../../../api/userApi";
import {
   addListingInfoID,
   getVerticals,
   removeListingInfoID,
} from "../../../api/verticalsApi";
import ConfirmDialog from "../../ConfirmDialog";
import CustomAlert from "../../CustomAlert";

export default function ManageListingInfo({ open, onClose }) {
   const [verticals, setVerticals] = useState([]);
   const [selectedVertical, setSelectedVertical] = useState("");
   const [infos, setInfos] = useState([]);
   const [user, setUser] = useState(null);
   const [alert, setAlert] = useState(null);
   const [loading, setLoading] = useState(false);
   const [editing, setEditing] = useState(null);
   const [infoData, setInfoData] = useState({
      name: "",
      status: "public",
      info: "",
   });
   const [showConfirm, setShowConfirm] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState(null);

   useEffect(() => {
      if (open) {
         setUser(getUserFromCookie());
         fetchVerticals();
      }
   }, [open]);

   useEffect(() => {
      if (selectedVertical) {
         fetchInfos(selectedVertical);
      } else {
         setInfos([]);
      }
   }, [selectedVertical]);

   async function fetchVerticals() {
      setLoading(true);
      try {
         const userId = getUserFromCookie()?.userId;
         const data = await getVerticals({ userId });
         setVerticals(data);
         if (data.length > 0) setSelectedVertical(data[0].id);
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   async function fetchInfos(verticalId) {
      setLoading(true);
      try {
         const data = await getProductInfos({ type: "listing" });
         setInfos(data.filter((info) => info.vertical === verticalId));
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   async function handleCreate(e) {
      e.preventDefault();
      if (!user) return setAlert({ type: "error", message: "Login required" });
      if (!selectedVertical)
         return setAlert({ type: "error", message: "Select a vertical" });
      setLoading(true);
      try {
         const infoId = `${selectedVertical}_listinginfo_${Date.now()}`;
         await createProductInfo({
            infoId,
            vertical: selectedVertical,
            userId: user.userId,
            username: user.username,
            name: infoData.name,
            status: infoData.status,
            type: "listing",
            info: infoData.info,
         });
         await addListingInfoID({ vertical: selectedVertical, infoId });
         setAlert({ type: "success", message: "Info created!" });
         setInfoData({ name: "", status: "public", info: "" });
         fetchInfos(selectedVertical);
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   function handleEdit(info) {
      setEditing(info.id);
      setInfoData({ name: info.name, status: info.status, info: info.info });
   }

   async function handleUpdate(e) {
      e.preventDefault();
      if (!user) return setAlert({ type: "error", message: "Login required" });
      setLoading(true);
      try {
         await updateProductInfo({
            infoId: editing,
            userId: user.userId,
            updates: { ...infoData },
         });
         setAlert({ type: "success", message: "Info updated!" });
         setEditing(null);
         setInfoData({ name: "", status: "public", info: "" });
         fetchInfos(selectedVertical);
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   function handleDelete(info) {
      setDeleteTarget(info);
      setShowConfirm(true);
   }

   async function confirmDelete() {
      if (!user || !deleteTarget) return;
      setLoading(true);
      setShowConfirm(false);
      try {
         await deleteProductInfo({
            infoId: deleteTarget.id,
            userId: user.userId,
         });
         await removeListingInfoID({
            vertical: selectedVertical,
            infoId: deleteTarget.id,
         });
         setAlert({ type: "success", message: "Info deleted!" });
         fetchInfos(selectedVertical);
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
         setDeleteTarget(null);
      }
   }

   if (!open) return null;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
         <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-2xl w-full p-6 relative">
            <button
               onClick={onClose}
               className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl font-bold cursor-pointer"
            >
               ×
            </button>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-4">
               Manage Listing Infos
            </h2>
            {alert && (
               <CustomAlert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
               />
            )}
            <div className="mb-4 flex gap-4 items-center">
               <label className="text-gray-300 font-medium">Vertical:</label>
               <select
                  value={selectedVertical}
                  onChange={(e) => setSelectedVertical(e.target.value)}
                  className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                  {verticals.map((v) => (
                     <option key={v.id} value={v.id}>
                        {v.id}
                     </option>
                  ))}
               </select>
            </div>
            <form
               onSubmit={editing ? handleUpdate : handleCreate}
               className="flex flex-col md:flex-row gap-4 items-center bg-gray-800/70 p-4 rounded-xl border border-gray-700 mb-4"
            >
               <input
                  type="text"
                  name="name"
                  placeholder="Info Name"
                  value={infoData.name}
                  onChange={(e) =>
                     setInfoData({ ...infoData, name: e.target.value })
                  }
                  className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  required
               />
               <input
                  type="text"
                  name="info"
                  placeholder="Info String"
                  value={infoData.info}
                  onChange={(e) =>
                     setInfoData({ ...infoData, info: e.target.value })
                  }
                  className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                  required
               />
               <select
                  name="status"
                  value={infoData.status}
                  onChange={(e) =>
                     setInfoData({ ...infoData, status: e.target.value })
                  }
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
                        setInfoData({ name: "", status: "public", info: "" });
                     }}
                     className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer"
                  >
                     Cancel
                  </button>
               )}
            </form>
            <div className="space-y-6 max-h-[40vh] overflow-y-auto">
               {loading && <div className="text-gray-400">Loading...</div>}
               {infos.length === 0 && !loading && (
                  <div className="text-gray-400">No infos found.</div>
               )}
               {infos.map((info) => (
                  <div
                     key={info.id}
                     className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 flex flex-col gap-2"
                  >
                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                           <span className="text-lg font-semibold text-white mr-2">
                              {info.name}
                           </span>
                           <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 ml-2">
                              {info.status}
                           </span>
                           <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 ml-2">
                              by {info.username}
                           </span>
                           <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 ml-2">
                              {info.info}
                           </span>
                        </div>
                        {user && user.userId === info.userId ? (
                           <div className="flex gap-2 items-center">
                              <button
                                 onClick={() => handleEdit(info)}
                                 className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                              >
                                 Edit
                              </button>
                              <button
                                 onClick={() => handleDelete(info)}
                                 className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                              >
                                 Delete
                              </button>
                           </div>
                        ) : (
                           info.status === "public" && (
                              <div className="text-xs text-green-400 font-medium">
                                 Public
                              </div>
                           )
                        )}
                     </div>
                  </div>
               ))}
            </div>
            <ConfirmDialog
               open={showConfirm}
               title="Delete Info"
               message={`Are you sure you want to delete info "${deleteTarget?.name}"? This action cannot be undone.`}
               onConfirm={confirmDelete}
               onCancel={() => {
                  setShowConfirm(false);
                  setDeleteTarget(null);
               }}
            />
         </div>
      </div>
   );
}
