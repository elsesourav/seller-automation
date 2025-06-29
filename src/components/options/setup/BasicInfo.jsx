import { useEffect, useState } from "react";
import { FiEdit2, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import {
   createBaseFormData,
   deleteBaseFormData,
   getAllBaseFormData,
   updateBaseFormData,
} from "../../../api/baseFormDataApi";
import { getAllBaseForms } from "../../../api/baseFormsApi";
import { getAllCategories } from "../../../api/categoriesApi";
import { createDataStore, deleteDataStore } from "../../../api/dataStoreApi";
import { getFormById } from "../../../api/formsApi";
import { fetchAllUsers, getUserId } from "../../../api/usersApi";
import { getAllVerticals } from "../../../api/verticalsApi";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmDialog from "../../ConfirmDialog";
import CustomAlert from "../../CustomAlert";
import CustomForm from "../../formMaker/CustomForm";
import { SelectInput, TextInput } from "../../inputs";

export default function BasicInfo() {
   const [baseFormData, setBaseFormData] = useState([]);
   const [baseForms, setBaseForms] = useState([]);
   const [verticals, setVerticals] = useState([]);
   const [categories, setCategories] = useState([]);
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [showFillFormModal, setShowFillFormModal] = useState(false);
   const [editFormData, setEditFormData] = useState(null);
   const [showEditModal, setShowEditModal] = useState(false);
   const [selectedBaseForm, setSelectedBaseForm] = useState(null);
   const [formSchema, setFormSchema] = useState(null);
   const [form, setForm] = useState({
      name: "",
      label: "",
      status: "private",
      base_form_id: "",
      vertical_id: "",
      category_id: "",
   });
   const [formDataToFill, setFormDataToFill] = useState({});
   const [confirm, setConfirm] = useState({ open: false, id: null });
   const [alert, setAlert] = useState(null);
   const [search, setSearch] = useState("");
   const [filterMine, setFilterMine] = useState("mine");
   const [filterVertical, setFilterVertical] = useState("");
   const [filterCategory, setFilterCategory] = useState("");
   const [filterBaseForm, setFilterBaseForm] = useState("");

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         const [bfd, bf, v, c, u] = await Promise.all([
            getAllBaseFormData(),
            getAllBaseForms(),
            getAllVerticals(),
            getAllCategories(),
            fetchAllUsers(),
         ]);
         setBaseFormData(bfd);
         setBaseForms(bf);
         setVerticals(v);
         setCategories(c);
         setUsers(u);
         setLoading(false);
      }
      fetchData();
   }, []);

   function getUsername(userId) {
      const user = users.find((u) => u.id === userId);
      return user?.username || userId?.slice(0, 8) || "-";
   }

   function getBaseFormName(baseFormId) {
      const baseForm = baseForms.find((bf) => bf.id === baseFormId);
      return baseForm?.name || "-";
   }

   function getVerticalName(verticalId) {
      const vertical = verticals.find((v) => v.id === verticalId);
      return vertical?.name || "-";
   }

   function getCategoryName(categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      return category?.name || "-";
   }

   // Filter categories by selected vertical (for the main filter bar)
   const filteredCategories = filterVertical
      ? categories.filter((c) => c.vertical_id === filterVertical)
      : categories;

   // Filter base forms by selected vertical (for the main filter bar)
   const filteredBaseForms = filterVertical
      ? baseForms.filter((bf) => bf.vertical_id === filterVertical)
      : baseForms;

   // Helper: filter categories for the form, based on form.vertical_id
   function getFormCategories(verticalId) {
      return verticalId
         ? categories.filter((c) => c.vertical_id === verticalId)
         : categories;
   }

   // Helper: filter base forms for the form, based on form.vertical_id
   function getFormBaseForms(verticalId) {
      return verticalId
         ? baseForms.filter((bf) => bf.vertical_id === verticalId)
         : baseForms;
   }

   // Filter base form data based on search and filters
   const filteredBaseFormData = baseFormData.filter((bfd) => {
      if (filterMine === "mine" && bfd.created_by !== getUserId()) return false;
      if (filterVertical && bfd.vertical_id !== filterVertical) return false;
      if (filterCategory && bfd.category_id !== filterCategory) return false;
      if (filterBaseForm && bfd.base_form_id !== filterBaseForm) return false;
      if (search) {
         const s = search.toLowerCase();
         const name = (bfd.name || "").toLowerCase();
         const label = (bfd.label || "").toLowerCase();
         const baseFormName = getBaseFormName(bfd.base_form_id).toLowerCase();
         const verticalName = getVerticalName(bfd.vertical_id).toLowerCase();
         const categoryName = getCategoryName(bfd.category_id).toLowerCase();
         if (
            !name.includes(s) &&
            !label.includes(s) &&
            !baseFormName.includes(s) &&
            !verticalName.includes(s) &&
            !categoryName.includes(s)
         )
            return false;
      }
      return true;
   });

   // BaseFormDataForm component for both Add and Edit
   function BaseFormDataForm({
      initialForm,
      verticals,
      onSubmit,
      onCancel,
      submitLabel,
      showDelete,
      onDelete,
   }) {
      const [form, setForm] = useState(initialForm);
      useEffect(() => {
         setForm(initialForm);
      }, [initialForm]);

      const formCategories = getFormCategories(form.vertical_id);
      const formBaseForms = getFormBaseForms(form.vertical_id);

      return (
         <form
            onSubmit={(e) => {
               e.preventDefault();
               onSubmit(form);
            }}
         >
            <TextInput
               value={form.name}
               onChange={(val) => setForm((f) => ({ ...f, name: val }))}
               placeholder="Enter entry name"
               className="mb-3"
            />
            <TextInput
               value={form.label}
               onChange={(val) => setForm((f) => ({ ...f, label: val }))}
               placeholder="Enter entry label"
               className="mb-3"
            />
            <SelectInput
               value={form.status || "private"}
               onChange={(val) => setForm((f) => ({ ...f, status: val }))}
               options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
               ]}
               className="mb-3"
            />
            <SelectInput
               value={form.vertical_id}
               onChange={(val) =>
                  setForm((f) => ({
                     ...f,
                     vertical_id: val,
                     category_id: "",
                     base_form_id: "",
                  }))
               }
               options={verticals.map((v) => ({ value: v.id, label: v.name }))}
               placeholder="Select Vertical"
               className="mb-3"
            />
            <SelectInput
               value={form.category_id}
               onChange={(val) => setForm((f) => ({ ...f, category_id: val }))}
               options={formCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
               }))}
               placeholder="Select Category"
               className="mb-3"
            />
            <SelectInput
               value={form.base_form_id}
               onChange={(val) => setForm((f) => ({ ...f, base_form_id: val }))}
               options={formBaseForms.map((bf) => ({
                  value: bf.id,
                  label: bf.name,
               }))}
               placeholder="Select Base Form"
               className="mb-3"
            />
            <div className="flex flex-row gap-2 justify-between mt-4">
               {showDelete ? (
                  <button
                     type="button"
                     className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded hover:from-red-600 hover:to-pink-700 flex items-center gap-1 cursor-pointer"
                     onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (onDelete && typeof onDelete === "function") {
                           onDelete();
                        } else {
                           console.error(
                              "Delete function not provided or not a function"
                           );
                        }
                     }}
                  >
                     <FiTrash2 /> Delete
                  </button>
               ) : (
                  <span />
               )}
               <div className="flex gap-2">
                  <button
                     type="button"
                     className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer"
                     onClick={onCancel}
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded hover:from-green-600 hover:to-blue-700 cursor-pointer"
                  >
                     {submitLabel}
                  </button>
               </div>
            </div>
         </form>
      );
   }

   // Load form schema for selected base form
   const loadFormSchema = async (baseFormId) => {
      try {
         const baseForm = baseForms.find((bf) => bf.id === baseFormId);
         if (baseForm?.form_id) {
            const formData = await getFormById(baseForm.form_id);
            setFormSchema(formData?.structure || null);
         } else {
            setFormSchema(null);
         }
      } catch (error) {
         console.error("Error loading form schema:", error);
         setFormSchema(null);
      }
   };

   // Handlers
   const handleAdd = async (formData) => {
      try {
         // Check if base form is selected and has a schema
         if (!formData.base_form_id) {
            setAlert({ type: "error", message: "Please select a base form" });
            return;
         }

         // Load the form schema to check if form needs to be filled
         await loadFormSchema(formData.base_form_id);
         setSelectedBaseForm(formData);
         setShowModal(false);
         setShowFillFormModal(true);
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleFormSubmit = async (filledFormData) => {
      try {
         if (selectedBaseForm.data_id) {
            // Update existing data store entry
            await supabase
               .from("data_store")
               .update({ data: filledFormData })
               .eq("id", selectedBaseForm.data_id);

            setAlert({
               type: "success",
               message: "Form data updated successfully!",
            });
         } else {
            // Save form data to data store (new entry)
            const dataStoreEntry = await createDataStore({
               data: filledFormData,
            });

            // Create base form data entry
            await createBaseFormData({
               name: selectedBaseForm.name,
               label: selectedBaseForm.label,
               data_id: dataStoreEntry.id,
               status: selectedBaseForm.status,
               base_form_id: selectedBaseForm.base_form_id,
               vertical_id: selectedBaseForm.vertical_id,
               category_id: selectedBaseForm.category_id,
            });

            setAlert({
               type: "success",
               message: "Base Form Data created successfully!",
            });
         }

         setShowFillFormModal(false);
         setSelectedBaseForm(null);
         setFormDataToFill({});
         setBaseFormData(await getAllBaseFormData());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleEdit = async (formData) => {
      try {
         await updateBaseFormData(editFormData.id, formData);
         setAlert({ type: "success", message: "Base Form Data updated!" });
         setEditFormData(null);
         setShowEditModal(false);
         setForm({
            name: "",
            label: "",
            status: "private",
            base_form_id: "",
            vertical_id: "",
            category_id: "",
         });
         setBaseFormData(await getAllBaseFormData());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleDelete = async (id) => {
      try {
         if (!id) {
            setAlert({
               type: "error",
               message: "Cannot delete: No ID provided",
            });
            return;
         }

         // First, get the base form data to check if it has an associated data_id
         const baseFormDataToDelete = baseFormData.find((bfd) => bfd.id === id);

         if (!baseFormDataToDelete) {
            setAlert({ type: "error", message: "Entry not found" });
            return;
         }

         // Delete the base form data first
         await deleteBaseFormData(id);

         // If the base form data had an associated data store entry, delete that too
         if (baseFormDataToDelete?.data_id) {
            try {
               await deleteDataStore(baseFormDataToDelete.data_id);
            } catch (dataDeleteError) {
               console.warn(
                  `[Delete] Could not delete associated data store entry: ${dataDeleteError.message}`
               );
               // Don't throw here - the base form data deletion was successful
            }
         }

         setAlert({ type: "success", message: "Base Form Data deleted!" });
         setBaseFormData(await getAllBaseFormData());
         setConfirm({ open: false, id: null });
         setEditFormData(null);
         setShowEditModal(false);
      } catch (e) {
         console.error("Delete error:", e);
         setAlert({ type: "error", message: e.message });
      }
   };

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
               <FiFileText className="text-blue-400" /> Basic Info Data
            </h2>
            <button
               className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 font-medium shadow flex items-center gap-2 cursor-pointer"
               onClick={() => {
                  setShowModal(true);
                  setEditFormData(null);
                  setForm({
                     name: "",
                     label: "",
                     status: "private",
                     base_form_id: "",
                     vertical_id: "",
                     category_id: "",
                  });
               }}
            >
               <FiPlus /> Fill Base Form
            </button>
         </div>

         {/* Search and Filter Section */}
         <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
            <TextInput
               value={search}
               onChange={setSearch}
               placeholder="Search entries..."
               className="mb-0"
            />
            <SelectInput
               value={filterMine}
               onChange={setFilterMine}
               options={[
                  { value: "mine", label: "My Entries" },
                  { value: "all", label: "All Entries" },
               ]}
               className="mb-0"
            />
            <SelectInput
               value={filterVertical}
               onChange={(val) => {
                  setFilterVertical(val);
                  setFilterCategory("");
                  setFilterBaseForm("");
               }}
               options={[
                  { value: "", label: "All Verticals" },
                  ...verticals.map((v) => ({ value: v.id, label: v.name })),
               ]}
               className="mb-0"
            />
            <SelectInput
               value={filterCategory}
               onChange={setFilterCategory}
               options={[
                  { value: "", label: "All Categories" },
                  ...filteredCategories.map((c) => ({
                     value: c.id,
                     label: c.name,
                  })),
               ]}
               className="mb-0"
            />
            <SelectInput
               value={filterBaseForm}
               onChange={setFilterBaseForm}
               options={[
                  { value: "", label: "All Base Forms" },
                  ...filteredBaseForms.map((bf) => ({
                     value: bf.id,
                     label: bf.name,
                  })),
               ]}
               className="mb-0"
            />
         </div>

         {/* Data List */}
         {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
         ) : filteredBaseFormData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
               {baseFormData.length === 0
                  ? "No entries found. Click 'Fill Base Form' to create your first entry."
                  : "No entries match your filters."}
            </div>
         ) : (
            <div className="space-y-3">
               {filteredBaseFormData.map((bfd) => (
                  <div
                     key={bfd.id}
                     className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all"
                  >
                     <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <h3 className="font-semibold text-lg mb-1">
                              {bfd.name || getBaseFormName(bfd.base_form_id)}
                           </h3>
                           {bfd.label && (
                              <p className="text-sm text-gray-300 mb-2">
                                 {bfd.label}
                              </p>
                           )}
                           <div className="text-sm text-gray-300 space-y-1">
                              <p>
                                 <span className="text-gray-400">
                                    Base Form:
                                 </span>{" "}
                                 {getBaseFormName(bfd.base_form_id)}
                              </p>
                              <p>
                                 <span className="text-gray-400">
                                    Vertical:
                                 </span>{" "}
                                 {getVerticalName(bfd.vertical_id)}
                              </p>
                              <p>
                                 <span className="text-gray-400">
                                    Category:
                                 </span>{" "}
                                 {getCategoryName(bfd.category_id)}
                              </p>
                              <div className="flex gap-4 text-xs text-gray-400 mt-2">
                                 <span>Status: {bfd.status}</span>
                                 <span>
                                    Created by: {getUsername(bfd.created_by)}
                                 </span>
                                 <span>
                                    Created:{" "}
                                    {new Date(
                                       bfd.created_at
                                    ).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                           {bfd.created_by === getUserId() && (
                              <button
                                 onClick={async () => {
                                    try {
                                       const baseForm = baseForms.find(
                                          (bf) => bf.id === bfd.base_form_id
                                       );
                                       if (baseForm?.form_id) {
                                          const formData = await getFormById(
                                             baseForm.form_id
                                          );
                                          setFormSchema(
                                             formData?.structure || null
                                          );
                                          setSelectedBaseForm(bfd);

                                          // Load existing data from data store if available
                                          if (bfd.data_id) {
                                             try {
                                                const { data: dataStoreData } =
                                                   await supabase
                                                      .from("data_store")
                                                      .select("data")
                                                      .eq("id", bfd.data_id)
                                                      .single();

                                                if (dataStoreData?.data) {
                                                   setFormDataToFill(
                                                      dataStoreData.data
                                                   );
                                                } else {
                                                   setFormDataToFill({});
                                                }
                                             } catch (error) {
                                                console.warn(
                                                   "Could not load existing data:",
                                                   error
                                                );
                                                setFormDataToFill({});
                                             }
                                          } else {
                                             setFormDataToFill({});
                                          }

                                          setShowFillFormModal(true);
                                       } else {
                                          setAlert({
                                             type: "error",
                                             message: "No form schema found",
                                          });
                                       }
                                    } catch {
                                       setAlert({
                                          type: "error",
                                          message: "Failed to load form",
                                       });
                                    }
                                 }}
                                 className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-all cursor-pointer flex items-center gap-1"
                              >
                                 <FiEdit2 size={12} /> Fill
                              </button>
                           )}
                           {bfd.created_by === getUserId() && (
                              <button
                                 onClick={() => {
                                    setEditFormData(bfd);
                                    setForm({
                                       name: bfd.name || "",
                                       label: bfd.label || "",
                                       status: bfd.status,
                                       base_form_id: bfd.base_form_id,
                                       vertical_id: bfd.vertical_id,
                                       category_id: bfd.category_id,
                                    });
                                    setShowEditModal(true);
                                 }}
                                 className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-all cursor-pointer flex items-center gap-1"
                              >
                                 <FiEdit2 size={12} /> Edit
                              </button>
                           )}
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}

         {/* Add Modal */}
         {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
                  <h3 className="text-lg font-semibold mb-4">
                     Create New Entry
                  </h3>
                  <BaseFormDataForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={handleAdd}
                     onCancel={() => {
                        setShowModal(false);
                        setForm({
                           name: "",
                           label: "",
                           status: "private",
                           base_form_id: "",
                           vertical_id: "",
                           category_id: "",
                        });
                     }}
                     submitLabel="Create & Fill Form"
                     showDelete={false}
                  />
               </div>
            </div>
         )}

         {/* Edit Modal */}
         {showEditModal && editFormData && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-600">
                  <h3 className="text-lg font-semibold mb-4">Edit Entry</h3>
                  <BaseFormDataForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={handleEdit}
                     onCancel={() => {
                        setEditFormData(null);
                        setShowEditModal(false);
                        setForm({
                           name: "",
                           label: "",
                           status: "private",
                           base_form_id: "",
                           vertical_id: "",
                           category_id: "",
                        });
                     }}
                     submitLabel="Update Entry"
                     showDelete={editFormData?.created_by === getUserId()}
                     onDelete={() => {
                        if (editFormData?.id) {
                           setConfirm({ open: true, id: editFormData.id });
                        } else {
                           setAlert({
                              type: "error",
                              message: "Cannot delete: No entry ID found",
                           });
                        }
                     }}
                  />
               </div>
            </div>
         )}

         {/* Form Fill Modal */}
         {showFillFormModal && selectedBaseForm && formSchema && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-5/6 border border-gray-600 flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-600">
                     <h3 className="text-lg font-semibold">
                        Fill Form:{" "}
                        {getBaseFormName(selectedBaseForm.base_form_id)}
                     </h3>
                     <button
                        onClick={() => {
                           setShowFillFormModal(false);
                           setSelectedBaseForm(null);
                           setFormSchema(null);
                           setFormDataToFill({});
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                     >
                        ✕
                     </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                     <CustomForm
                        schema={formSchema}
                        onSubmit={handleFormSubmit}
                        externalData={formDataToFill}
                        onExternalChange={(fieldName, value) => {
                           setFormDataToFill((prev) => ({
                              ...prev,
                              [fieldName]: value,
                           }));
                        }}
                     />
                  </div>
               </div>
            </div>
         )}

         {/* Confirmation Dialog */}
         <ConfirmDialog
            open={confirm.open}
            title="Delete Entry"
            message="Are you sure you want to delete this entry? This action cannot be undone."
            onConfirm={() => {
               if (confirm.id) {
                  handleDelete(confirm.id);
               } else {
                  setAlert({
                     type: "error",
                     message: "Cannot delete: No ID provided",
                  });
                  setConfirm({ open: false, id: null });
               }
            }}
            onCancel={() => setConfirm({ open: false, id: null })}
         />
      </div>
   );
}
