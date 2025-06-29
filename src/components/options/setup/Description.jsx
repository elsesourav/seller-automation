import { useEffect, useState } from "react";
import { FiEdit2, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { getAllBaseFormData } from "../../../api/baseFormDataApi";
import { getAllCategories } from "../../../api/categoriesApi";
import { createDataStore, deleteDataStore } from "../../../api/dataStoreApi";
import {
   createDescriptionFormData,
   deleteDescriptionFormData,
   getAllDescriptionFormData,
   updateDescriptionFormData,
} from "../../../api/descriptionFormDataApi";
import { getAllDescriptionForms } from "../../../api/descriptionFormsApi";
import { getFormById } from "../../../api/formsApi";
import { fetchAllUsers, getUserId } from "../../../api/usersApi";
import { getAllVerticals } from "../../../api/verticalsApi";
import { supabase } from "../../../lib/supabaseClient";
import ConfirmDialog from "../../ConfirmDialog";
import CustomAlert from "../../CustomAlert";
import CustomForm from "../../formMaker/CustomForm";
import { SelectInput, TextInput } from "../../inputs";

export default function Description() {
   const [descriptionFormData, setDescriptionFormData] = useState([]);
   const [descriptionForms, setDescriptionForms] = useState([]);
   const [baseFormData, setBaseFormData] = useState([]);
   const [verticals, setVerticals] = useState([]);
   const [categories, setCategories] = useState([]);
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [showFillFormModal, setShowFillFormModal] = useState(false);
   const [editFormData, setEditFormData] = useState(null);
   const [showEditModal, setShowEditModal] = useState(false);
   const [selectedDescriptionForm, setSelectedDescriptionForm] = useState(null);
   const [formSchema, setFormSchema] = useState(null);
   const [form, setForm] = useState({
      name: "",
      label: "",
      status: "private",
      description_form_id: "",
      base_form_data_id: "",
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
   const [filterDescriptionForm, setFilterDescriptionForm] = useState("");
   const [filterBaseFormData, setFilterBaseFormData] = useState("");

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         const [dfd, df, bfd, v, c, u] = await Promise.all([
            getAllDescriptionFormData(),
            getAllDescriptionForms(),
            getAllBaseFormData(),
            getAllVerticals(),
            getAllCategories(),
            fetchAllUsers(),
         ]);
         setDescriptionFormData(dfd);
         setDescriptionForms(df);
         setBaseFormData(bfd);
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

   function getDescriptionFormName(descriptionFormId) {
      const descForm = descriptionForms.find(
         (df) => df.id === descriptionFormId
      );
      return descForm?.name || "-";
   }

   function getBaseFormDataName(baseFormDataId) {
      const baseFormDataItem = baseFormData.find(
         (bfd) => bfd.id === baseFormDataId
      );
      return baseFormDataItem?.name || "-";
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

   // Filter description forms by selected vertical (for the main filter bar)
   const filteredDescriptionForms = filterVertical
      ? descriptionForms.filter((df) => df.vertical_id === filterVertical)
      : descriptionForms;

   // Filter base form data by selected vertical (for the main filter bar)
   const filteredBaseFormDataForFilter = filterVertical
      ? baseFormData.filter((bfd) => bfd.vertical_id === filterVertical)
      : baseFormData;

   // Helper: filter categories for the form, based on form.vertical_id
   function getFormCategories(verticalId) {
      return verticalId
         ? categories.filter((c) => c.vertical_id === verticalId)
         : categories;
   }

   // Helper: filter description forms for the form, based on form.vertical_id
   function getFormDescriptionForms(verticalId) {
      return verticalId
         ? descriptionForms.filter((df) => df.vertical_id === verticalId)
         : descriptionForms;
   }

   // Helper: filter base form data for the form, based on form.vertical_id
   function getFormBaseFormData(verticalId) {
      return verticalId
         ? baseFormData.filter((bfd) => bfd.vertical_id === verticalId)
         : baseFormData;
   }

   // Filter description form data based on search and filters
   const filteredDescriptionFormData = descriptionFormData.filter((dfd) => {
      if (filterMine === "mine" && dfd.created_by !== getUserId()) return false;
      if (filterVertical && dfd.vertical_id !== filterVertical) return false;
      if (filterCategory && dfd.category_id !== filterCategory) return false;
      if (
         filterDescriptionForm &&
         dfd.description_form_id !== filterDescriptionForm
      )
         return false;
      if (filterBaseFormData && dfd.base_form_data_id !== filterBaseFormData)
         return false;
      if (search) {
         const s = search.toLowerCase();
         const name = (dfd.name || "").toLowerCase();
         const label = (dfd.label || "").toLowerCase();
         const descFormName = getDescriptionFormName(
            dfd.description_form_id
         ).toLowerCase();
         const baseFormDataName = getBaseFormDataName(
            dfd.base_form_data_id
         ).toLowerCase();
         const verticalName = getVerticalName(dfd.vertical_id).toLowerCase();
         const categoryName = getCategoryName(dfd.category_id).toLowerCase();
         if (
            !name.includes(s) &&
            !label.includes(s) &&
            !descFormName.includes(s) &&
            !baseFormDataName.includes(s) &&
            !verticalName.includes(s) &&
            !categoryName.includes(s)
         )
            return false;
      }
      return true;
   });

   // DescriptionFormDataForm component for both Add and Edit
   function DescriptionFormDataForm({
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
      const formDescriptionForms = getFormDescriptionForms(form.vertical_id);
      const formBaseFormData = getFormBaseFormData(form.vertical_id);

      return (
         <form
            onSubmit={(e) => {
               e.preventDefault();
               onSubmit(form);
            }}
         >
            <TextInput
               label="Name"
               value={form.name}
               onChange={(val) => setForm((f) => ({ ...f, name: val }))}
               placeholder="Enter entry name"
               className="mb-3"
            />
            <TextInput
               label="Label"
               value={form.label}
               onChange={(val) => setForm((f) => ({ ...f, label: val }))}
               placeholder="Enter entry label"
               className="mb-3"
            />
            <SelectInput
               label="Status"
               value={form.status || "private"}
               onChange={(val) => setForm((f) => ({ ...f, status: val }))}
               options={[
                  { value: "public", label: "Public" },
                  { value: "private", label: "Private" },
               ]}
               className="mb-3"
            />
            <SelectInput
               label="Vertical"
               value={form.vertical_id}
               onChange={(val) =>
                  setForm((f) => ({
                     ...f,
                     vertical_id: val,
                     category_id: "",
                     description_form_id: "",
                     base_form_data_id: "",
                  }))
               }
               options={verticals.map((v) => ({ value: v.id, label: v.name }))}
               placeholder="Select Vertical"
               className="mb-3"
            />
            <SelectInput
               label="Category"
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
               label="Description Form"
               value={form.description_form_id}
               onChange={(val) =>
                  setForm((f) => ({ ...f, description_form_id: val }))
               }
               options={formDescriptionForms.map((df) => ({
                  value: df.id,
                  label: df.name,
               }))}
               placeholder="Select Description Form"
               className="mb-3"
            />
            <SelectInput
               label="Base Form Data"
               value={form.base_form_data_id}
               onChange={(val) =>
                  setForm((f) => ({ ...f, base_form_data_id: val }))
               }
               options={formBaseFormData.map((bfd) => ({
                  value: bfd.id,
                  label: bfd.name || `Base Form Data ${bfd.id.slice(0, 8)}`,
               }))}
               placeholder="Select Base Form Data"
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

   // Load form schema for selected description form
   const loadFormSchema = async (descriptionFormId) => {
      try {
         const descForm = descriptionForms.find(
            (df) => df.id === descriptionFormId
         );
         if (descForm?.form_id) {
            const formData = await getFormById(descForm.form_id);
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
         // Check if description form is selected and has a schema
         if (!formData.description_form_id) {
            setAlert({
               type: "error",
               message: "Please select a description form",
            });
            return;
         }

         // Load the form schema to check if form needs to be filled
         await loadFormSchema(formData.description_form_id);
         setSelectedDescriptionForm(formData);
         setShowModal(false);
         setShowFillFormModal(true);
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleFormSubmit = async (filledFormData) => {
      try {
         if (selectedDescriptionForm.data_id) {
            // Update existing data store entry
            await supabase
               .from("data_store")
               .update({ data: filledFormData })
               .eq("id", selectedDescriptionForm.data_id);

            setAlert({
               type: "success",
               message: "Form data updated successfully!",
            });
         } else {
            // Save form data to data store (new entry)
            const dataStoreEntry = await createDataStore({
               data: filledFormData,
            });

            // Create description form data entry
            await createDescriptionFormData({
               name: selectedDescriptionForm.name,
               label: selectedDescriptionForm.label,
               data_id: dataStoreEntry.id,
               status: selectedDescriptionForm.status,
               description_form_id: selectedDescriptionForm.description_form_id,
               base_form_data_id: selectedDescriptionForm.base_form_data_id,
               vertical_id: selectedDescriptionForm.vertical_id,
               category_id: selectedDescriptionForm.category_id,
            });

            setAlert({
               type: "success",
               message: "Description Form Data created successfully!",
            });
         }

         setShowFillFormModal(false);
         setSelectedDescriptionForm(null);
         setFormDataToFill({});
         setDescriptionFormData(await getAllDescriptionFormData());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleEdit = async (formData) => {
      try {
         await updateDescriptionFormData(editFormData.id, formData);
         setAlert({
            type: "success",
            message: "Description Form Data updated!",
         });
         setEditFormData(null);
         setShowEditModal(false);
         setForm({
            name: "",
            label: "",
            status: "private",
            description_form_id: "",
            base_form_data_id: "",
            vertical_id: "",
            category_id: "",
         });
         setDescriptionFormData(await getAllDescriptionFormData());
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

         // First, get the description form data to check if it has an associated data_id
         const descFormDataToDelete = descriptionFormData.find(
            (dfd) => dfd.id === id
         );

         if (!descFormDataToDelete) {
            setAlert({ type: "error", message: "Entry not found" });
            return;
         }

         // Delete the description form data first
         await deleteDescriptionFormData(id);

         // If the description form data had an associated data store entry, delete that too
         if (descFormDataToDelete?.data_id) {
            try {
               await deleteDataStore(descFormDataToDelete.data_id);
            } catch (dataDeleteError) {
               console.warn(
                  `[Delete] Could not delete associated data store entry: ${dataDeleteError.message}`
               );
               // Don't throw here - the description form data deletion was successful
            }
         }

         setAlert({
            type: "success",
            message: "Description Form Data deleted!",
         });
         setDescriptionFormData(await getAllDescriptionFormData());
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
               <FiFileText className="text-purple-400" /> Description Data
            </h2>
            <button
               className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 font-medium shadow flex items-center gap-2 cursor-pointer"
               onClick={() => {
                  setShowModal(true);
                  setEditFormData(null);
                  setForm({
                     name: "",
                     label: "",
                     status: "private",
                     description_form_id: "",
                     base_form_data_id: "",
                     vertical_id: "",
                     category_id: "",
                  });
               }}
            >
               <FiPlus /> Fill Description Form
            </button>
         </div>

         {/* Search and Filter Section */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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
                  { value: "mine", label: "My Desc" },
                  { value: "all", label: "All Desc" },
               ]}
               className="mb-0"
            />
            <SelectInput
               value={filterVertical}
               onChange={(val) => {
                  setFilterVertical(val);
                  setFilterCategory("");
                  setFilterDescriptionForm("");
                  setFilterBaseFormData("");
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
               value={filterDescriptionForm}
               onChange={setFilterDescriptionForm}
               options={[
                  { value: "", label: "All Description Forms" },
                  ...filteredDescriptionForms.map((df) => ({
                     value: df.id,
                     label: df.name,
                  })),
               ]}
               className="mb-0"
            />
            <SelectInput
               value={filterBaseFormData}
               onChange={setFilterBaseFormData}
               options={[
                  { value: "", label: "All BaseData" },
                  ...filteredBaseFormDataForFilter.map((bfd) => ({
                     value: bfd.id,
                     label: bfd.name || `Base Data ${bfd.id.slice(0, 8)}`,
                  })),
               ]}
               className="mb-0"
            />
         </div>

         {/* Data List */}
         {loading ? (
            <div className="text-center py-8 text-gray-400">Loading...</div>
         ) : filteredDescriptionFormData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
               {descriptionFormData.length === 0
                  ? "No entries found. Click 'Fill Description Form' to create your first entry."
                  : "No entries match your filters."}
            </div>
         ) : (
            <div className="space-y-3">
               {filteredDescriptionFormData.map((dfd) => (
                  <div
                     key={dfd.id}
                     className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all"
                  >
                     <div className="flex justify-between items-start">
                        <div className="flex-1">
                           <h3 className="font-semibold text-lg mb-1">
                              {dfd.name ||
                                 getDescriptionFormName(
                                    dfd.description_form_id
                                 )}
                           </h3>
                           {dfd.label && (
                              <p className="text-sm text-gray-300 mb-2">
                                 {dfd.label}
                              </p>
                           )}
                           <div className="text-sm text-gray-300 space-y-1">
                              <p>
                                 <span className="text-gray-400">
                                    Description Form:
                                 </span>{" "}
                                 {getDescriptionFormName(
                                    dfd.description_form_id
                                 )}
                              </p>
                              <p>
                                 <span className="text-gray-400">
                                    Base Form Data:
                                 </span>{" "}
                                 {getBaseFormDataName(dfd.base_form_data_id)}
                              </p>
                              <p>
                                 <span className="text-gray-400">
                                    Vertical:
                                 </span>{" "}
                                 {getVerticalName(dfd.vertical_id)}
                              </p>
                              <p>
                                 <span className="text-gray-400">
                                    Category:
                                 </span>{" "}
                                 {getCategoryName(dfd.category_id)}
                              </p>
                              <div className="flex gap-4 text-xs text-gray-400 mt-2">
                                 <span>Status: {dfd.status}</span>
                                 <span>
                                    Created by: {getUsername(dfd.created_by)}
                                 </span>
                                 <span>
                                    Created:{" "}
                                    {new Date(
                                       dfd.created_at
                                    ).toLocaleDateString()}
                                 </span>
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                           {dfd.created_by === getUserId() && (
                              <button
                                 onClick={async () => {
                                    try {
                                       const descForm = descriptionForms.find(
                                          (df) =>
                                             df.id === dfd.description_form_id
                                       );
                                       if (descForm?.form_id) {
                                          const formData = await getFormById(
                                             descForm.form_id
                                          );
                                          setFormSchema(
                                             formData?.structure || null
                                          );
                                          setSelectedDescriptionForm(dfd);

                                          // Load existing data from data store if available
                                          if (dfd.data_id) {
                                             try {
                                                const { data: dataStoreData } =
                                                   await supabase
                                                      .from("data_store")
                                                      .select("data")
                                                      .eq("id", dfd.data_id)
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
                           {dfd.created_by === getUserId() && (
                              <button
                                 onClick={() => {
                                    setEditFormData(dfd);
                                    setForm({
                                       name: dfd.name || "",
                                       label: dfd.label || "",
                                       status: dfd.status,
                                       description_form_id:
                                          dfd.description_form_id,
                                       base_form_data_id: dfd.base_form_data_id,
                                       vertical_id: dfd.vertical_id,
                                       category_id: dfd.category_id,
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
                  <DescriptionFormDataForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={handleAdd}
                     onCancel={() => {
                        setShowModal(false);
                        setForm({
                           name: "",
                           label: "",
                           status: "private",
                           description_form_id: "",
                           base_form_data_id: "",
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
                  <DescriptionFormDataForm
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
                           description_form_id: "",
                           base_form_data_id: "",
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
         {showFillFormModal && selectedDescriptionForm && formSchema && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
               <div className="bg-gray-800 rounded-lg w-full max-w-4xl h-5/6 border border-gray-600 flex flex-col">
                  <div className="flex items-center justify-between p-6 border-b border-gray-600">
                     <h3 className="text-lg font-semibold">
                        Fill Form:{" "}
                        {getDescriptionFormName(
                           selectedDescriptionForm.description_form_id
                        )}
                     </h3>
                     <button
                        onClick={() => {
                           setShowFillFormModal(false);
                           setSelectedDescriptionForm(null);
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
