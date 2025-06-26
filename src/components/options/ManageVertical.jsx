import { useEffect, useState } from "react";
import { getUserFromCookie } from "../../api/userApi";
import {
   createOrUpdateVertical,
   deleteVertical,
   editVertical,
   getVerticals,
} from "../../api/verticalsApi";
import ConfirmDialog from "../ConfirmDialog";
import CustomAlert from "../CustomAlert";

export default function ManageVertical({ open, onClose }) {
   const [verticals, setVerticals] = useState([]);
   const [user, setUser] = useState(null);
   const [alert, setAlert] = useState(null);
   const [loading, setLoading] = useState(false);
   const [editing, setEditing] = useState(null);
   const [editStatus, setEditStatus] = useState("");
   const [showConfirm, setShowConfirm] = useState(false);
   const [deleteTarget, setDeleteTarget] = useState(null);
   const [addForm, setAddForm] = useState({ vertical: "", status: "public" });
   const [showAdd, setShowAdd] = useState(false);

   useEffect(() => {
      if (open) {
         setUser(getUserFromCookie());
         fetchVerticals();
      }
   }, [open]);

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

   async function handleEdit(vertical) {
      setEditing(vertical.id);
      setEditStatus(vertical.status);
   }

   async function handleUpdate(vertical) {
      if (!user) return setAlert({ type: "error", message: "Login required" });
      setLoading(true);
      try {
         await editVertical({
            vertical: vertical.id,
            userId: user.userId,
            updates: { status: editStatus },
         });
         setAlert({ type: "success", message: "Vertical updated!" });
         setEditing(null);
         fetchVerticals();
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
      }
   }

   function handleDelete(vertical) {
      setDeleteTarget(vertical);
      setShowConfirm(true);
   }

   async function confirmDelete() {
      if (!user || !deleteTarget) return;
      setLoading(true);
      setShowConfirm(false);
      try {
         await deleteVertical({
            vertical: deleteTarget.id,
            userId: user.userId,
         });
         setAlert({ type: "success", message: "Vertical deleted!" });
         fetchVerticals();
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
         setDeleteTarget(null);
      }
   }

   async function handleAddVertical(e) {
      e.preventDefault();
      if (!user) return setAlert({ type: "error", message: "Login required" });
      setLoading(true);
      try {
         await createOrUpdateVertical({
            vertical: addForm.vertical,
            userId: user.userId,
            username: user.username,
            status: addForm.status,
         });
         setAlert({ type: "success", message: "Vertical created!" });
         setAddForm({ vertical: "", status: "public" });
         setShowAdd(false);
         fetchVerticals();
      } catch (err) {
         setAlert({ type: "error", message: err.message });
      } finally {
         setLoading(false);
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
               Manage Verticals
               <button
                  className="px-4 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium text-xs cursor-pointer"
                  onClick={() => setShowAdd((v) => !v)}
               >
                  {showAdd ? "Close" : "Add New Vertical"}
               </button>
            </h2>
            {showAdd && (
               <form
                  onSubmit={handleAddVertical}
                  className="flex flex-col md:flex-row gap-4 items-center bg-gray-800/70 p-4 rounded-xl border border-gray-700 mb-4"
               >
                  <input
                     type="text"
                     name="vertical"
                     placeholder="Vertical Name"
                     value={addForm.vertical}
                     onChange={(e) =>
                        setAddForm({ ...addForm, vertical: e.target.value })
                     }
                     className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                     required
                  />
                  <select
                     name="status"
                     value={addForm.status}
                     onChange={(e) =>
                        setAddForm({ ...addForm, status: e.target.value })
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
                     Create
                  </button>
               </form>
            )}
            {alert && (
               <CustomAlert
                  type={alert.type}
                  message={alert.message}
                  onClose={() => setAlert(null)}
               />
            )}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
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
                           <div className="flex gap-2 items-center">
                              {editing === vertical.id ? (
                                 <>
                                    <select
                                       value={editStatus}
                                       onChange={(e) =>
                                          setEditStatus(e.target.value)
                                       }
                                       className="px-2 py-1 rounded bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                    >
                                       <option value="public">Public</option>
                                       <option value="private">Private</option>
                                    </select>
                                    <button
                                       onClick={() => handleUpdate(vertical)}
                                       className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                                    >
                                       Save
                                    </button>
                                    <button
                                       onClick={() => setEditing(null)}
                                       className="px-3 py-1 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium text-xs cursor-pointer"
                                    >
                                       Cancel
                                    </button>
                                 </>
                              ) : (
                                 <>
                                    <button
                                       onClick={() => handleEdit(vertical)}
                                       className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                                    >
                                       Edit
                                    </button>
                                    <button
                                       onClick={() => handleDelete(vertical)}
                                       className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium text-xs cursor-pointer"
                                    >
                                       Delete
                                    </button>
                                 </>
                              )}
                           </div>
                        )}
                     </div>
                  </div>
               ))}
            </div>
            <ConfirmDialog
               open={showConfirm}
               title="Delete Vertical"
               message={`Are you sure you want to delete vertical "${deleteTarget?.id}"? This action cannot be undone.`}
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
