import { useEffect, useState } from "react";
import { FiEdit2, FiList, FiPlus, FiTag, FiTrash2 } from "react-icons/fi";
import { DataTable } from "../../";
import {
   createCategory,
   deleteCategory,
   getAllCategories,
   updateCategory,
} from "../../../api/categoriesApi";
import { getUserId } from "../../../api/usersApi";
import {
   createVertical,
   deleteVertical,
   getAllVerticals,
   updateVertical,
} from "../../../api/verticalsApi";
import ConfirmDialog from "../../ConfirmDialog";
import CustomAlert from "../../CustomAlert";
import { VerticalIcon } from "../../icons/SetupIcons";
import { SelectInput, TextInput } from "../../inputs";

export default function VerticalAndCategory() {
   const [verticals, setVerticals] = useState([]);
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showVerticalModal, setShowVerticalModal] = useState(false);
   const [showCategoryModal, setShowCategoryModal] = useState(false);
   const [editVertical, setEditVertical] = useState(null);
   const [editCategory, setEditCategory] = useState(null);
   const [form, setForm] = useState({ name: "", label: "" });
   const [categoryForm, setCategoryForm] = useState({
      name: "",
      label: "",
      vertical_id: null,
   });
   const [confirm, setConfirm] = useState({
      open: false,
      type: null,
      id: null,
   });
   const [alert, setAlert] = useState(null);

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         const v = await getAllVerticals();
         const c = await getAllCategories();
         setVerticals(v);
         setCategories(c);
         setLoading(false);
      }
      fetchData();
   }, []);

   // Handlers for verticals
   const handleAddVertical = async () => {
      try {
         await createVertical({ ...form });
         setAlert({ type: "success", message: "Vertical created!" });
         setShowVerticalModal(false);
         setForm({ name: "", label: "" });
         setVerticals(await getAllVerticals());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };
   const handleEditVertical = async () => {
      try {
         await updateVertical(editVertical.id, form);
         setAlert({ type: "success", message: "Vertical updated!" });
         setEditVertical(null);
         setShowVerticalModal(false);
         setForm({ name: "", label: "" });
         setVerticals(await getAllVerticals());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };
   const handleDeleteVertical = async (id) => {
      try {
         await deleteVertical(id);
         setAlert({ type: "success", message: "Vertical deleted!" });
         setVerticals(await getAllVerticals());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   // Category handlers
   const handleAddCategory = async () => {
      try {
         await createCategory({ ...categoryForm });
         setAlert({ type: "success", message: "Category created!" });
         setShowCategoryModal(false);
         setCategoryForm({ name: "", label: "", vertical_id: null });
         setCategories(await getAllCategories());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };
   const handleEditCategory = async () => {
      try {
         await updateCategory(editCategory.id, {
            name: categoryForm.name,
            label: categoryForm.label,
            status: categoryForm.status || "public",
         });
         setAlert({ type: "success", message: "Category updated!" });
         setEditCategory(null);
         setShowCategoryModal(false);
         setCategoryForm({ name: "", label: "", vertical_id: null });
         setCategories(await getAllCategories());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };
   const handleDeleteCategory = async (id) => {
      try {
         await deleteCategory(id);
         setAlert({ type: "success", message: "Category deleted!" });
         setCategories(await getAllCategories());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   // Table configuration for categories
   const getCategoryTableHeaders = () => [
      {
         key: "name",
         label: "Name",
         className: "flex-1",
      },
      {
         key: "label",
         label: "Label",
         className: "flex-1",
      },
      {
         key: "status",
         label: "Status",
         className: "w-24",
         render: (category) => (
            <span
               className={`px-2 py-1 rounded text-xs font-medium ${
                  category.status === "private"
                     ? "bg-pink-700/40 text-pink-300"
                     : "bg-blue-700/40 text-blue-300"
               }`}
            >
               {category.status === "private" ? "Private" : "Public"}
            </span>
         ),
      },
   ];

   // Handle category delete action
   const handleCategoryDeleteAction = (category) => {
      setConfirm({
         open: true,
         type: "category",
         id: category.id,
      });
   };

   // Handle category table row action (edit)
   const handleCategoryRowAction = (category, verticalId) => {
      setEditCategory(category);
      setCategoryForm({
         name: category.name,
         label: category.label,
         vertical_id: verticalId,
         status: category.status,
      });
      setShowCategoryModal(true);
   };

   // Prepare category data for table with actions
   const getCategoryTableData = (verticalId) => {
      return categories
         .filter((c) => c.vertical_id === verticalId)
         .map((category) => ({
            ...category,
            showAction: category.created_by === getUserId(),
         }));
   };

   // UI
   return (
      <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 text-white shadow-md">
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <VerticalIcon className="text-blue-400" /> Verticals
            </h2>
            <button
               className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 font-medium shadow flex items-center gap-2 cursor-pointer"
               onClick={() => {
                  setShowVerticalModal(true);
                  setEditVertical(null);
                  setForm({ name: "", label: "" });
               }}
            >
               <FiPlus /> Add Vertical
            </button>
         </div>
         {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
         ) : (
            <div className="space-y-8">
               {verticals.map((v) => (
                  <div
                     key={v.id}
                     className="bg-gray-900/70 rounded-xl border border-gray-700 p-4"
                  >
                     <div className="flex justify-between items-center mb-2 bg-white/10 px-4 py-1 rounded-2xl">
                        <div className="flex items-center gap-2">
                           <span className="font-semibold text-lg">
                              {v.name}{" "}
                              {v.label && (
                                 <span className="text-gray-400">
                                    ({v.label})
                                 </span>
                              )}
                           </span>
                           <span
                              className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                                 v.status === "private"
                                    ? "bg-pink-700/40 text-pink-300"
                                    : "bg-blue-700/40 text-blue-300"
                              }`}
                           >
                              {v.status === "private" ? "Private" : "Public"}
                           </span>
                        </div>
                        {/* Only show edit/delete if created_by is current user */}
                        {v.created_by === getUserId() && (
                           <div className="flex gap-2">
                              <button
                                 className="text-blue-400 hover:text-blue-200 flex items-center gap-1 cursor-pointer"
                                 onClick={() => {
                                    setEditVertical(v);
                                    setForm({
                                       name: v.name,
                                       label: v.label,
                                       status: v.status,
                                    });
                                    setShowVerticalModal(true);
                                 }}
                              >
                                 <FiEdit2 />
                              </button>
                           </div>
                        )}
                     </div>
                     {/* Category Table */}{" "}
                     <div className="mt-2">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="font-semibold flex items-center gap-1 text-base">
                              <FiTag className="text-pink-400" /> Categories
                           </h4>
                           <button
                              className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded hover:from-pink-600 hover:to-purple-700 flex items-center gap-1 text-sm cursor-pointer"
                              onClick={() => {
                                 setEditCategory(null);
                                 setCategoryForm({
                                    name: "",
                                    label: "",
                                    vertical_id: v.id,
                                 });
                                 setShowCategoryModal(true);
                              }}
                           >
                              <FiPlus /> Add Category
                           </button>
                        </div>
                        <DataTable
                           headers={getCategoryTableHeaders()}
                           data={getCategoryTableData(v.id)}
                           onRowAction={(category) =>
                              handleCategoryRowAction(category, v.id)
                           }
                           actionIcon={FiEdit2}
                           actionLabel="Edit Category"
                           onSecondaryAction={handleCategoryDeleteAction}
                           secondaryActionIcon={FiTrash2}
                           secondaryActionLabel="Delete Category"
                           noDataMessage="No categories"
                           compact={true}
                        />
                     </div>
                  </div>
               ))}
            </div>
         )}
         {/* Modal for Add/Edit Vertical */}
         {showVerticalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiList className="text-blue-400" />
                     {editVertical ? "Edit Vertical" : "Add Vertical"}
                  </h3>
                  <TextInput
                     placeholder="Vertical Name"
                     value={form.name}
                     onChange={(val) => setForm((f) => ({ ...f, name: val }))}
                     className="mb-3"
                  />
                  <TextInput
                     placeholder="Label"
                     value={form.label}
                     onChange={(val) => setForm((f) => ({ ...f, label: val }))}
                     className="mb-3"
                  />
                  <SelectInput
                     value={form.status || "public"}
                     onChange={(val) => setForm((f) => ({ ...f, status: val }))}
                     options={[
                        { value: "public", label: "Public" },
                        { value: "private", label: "Private" },
                     ]}
                     className="mb-3"
                  />
                  <div className="flex gap-2 justify-end mt-4">
                     {editVertical &&
                        editVertical.created_by === getUserId() && (
                           <button
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded hover:from-red-600 hover:to-pink-700 flex items-center gap-1 cursor-pointer"
                              onClick={() =>
                                 setConfirm({
                                    open: true,
                                    type: "vertical",
                                    id: editVertical.id,
                                 })
                              }
                           >
                              <FiTrash2 /> Delete
                           </button>
                        )}
                     <button
                        className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer"
                        onClick={() => setShowVerticalModal(false)}
                     >
                        Cancel
                     </button>
                     <button
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded hover:from-blue-600 hover:to-purple-700 cursor-pointer"
                        onClick={
                           editVertical ? handleEditVertical : handleAddVertical
                        }
                     >
                        {editVertical ? "Update" : "Add"}
                     </button>
                  </div>
               </div>
            </div>
         )}
         {/* Modal for Add/Edit Category */}
         {showCategoryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-md">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiTag className="text-pink-400" />
                     {editCategory ? "Edit Category" : "Add Category"}
                  </h3>
                  <TextInput
                     placeholder="Category Name"
                     value={categoryForm.name || ""}
                     onChange={(val) =>
                        setCategoryForm((f) => ({ ...f, name: val }))
                     }
                     className="mb-3"
                  />
                  <TextInput
                     placeholder="Label"
                     value={categoryForm.label || ""}
                     onChange={(val) =>
                        setCategoryForm((f) => ({ ...f, label: val }))
                     }
                     className="mb-3"
                  />
                  <SelectInput
                     value={categoryForm.status || "public"}
                     onChange={(val) =>
                        setCategoryForm((f) => ({ ...f, status: val }))
                     }
                     options={[
                        { value: "public", label: "Public" },
                        { value: "private", label: "Private" },
                     ]}
                     className="mb-3"
                  />
                  <div className="flex gap-2 justify-end mt-4">
                     <button
                        className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer"
                        onClick={() => setShowCategoryModal(false)}
                     >
                        Cancel
                     </button>
                     <button
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded hover:from-pink-600 hover:to-purple-700 cursor-pointer"
                        onClick={
                           editCategory ? handleEditCategory : handleAddCategory
                        }
                     >
                        {editCategory ? "Update" : "Add"}
                     </button>
                  </div>
               </div>
            </div>
         )}
         <ConfirmDialog
            open={confirm.open}
            title={
               confirm.type === "vertical"
                  ? "Delete Vertical"
                  : "Delete Category"
            }
            message={
               confirm.type === "vertical"
                  ? "Are you sure you want to delete this vertical? This will also remove all its categories."
                  : "Are you sure you want to delete this category?"
            }
            onConfirm={async () => {
               if (confirm.type === "vertical") {
                  await handleDeleteVertical(confirm.id);
                  setShowVerticalModal(false); // Close edit modal if open
                  setEditVertical(null);
               }
               if (confirm.type === "category") {
                  await handleDeleteCategory(confirm.id);
                  setShowCategoryModal(false); // Close category modal if open
                  setEditCategory(null);
               }
               setConfirm({ open: false, type: null, id: null });
            }}
            onCancel={() => setConfirm({ open: false, type: null, id: null })}
         />
      </div>
   );
}
