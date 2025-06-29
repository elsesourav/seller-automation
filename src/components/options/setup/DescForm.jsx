import { useEffect, useState } from "react";
import { FiEdit2, FiFileText, FiPlus, FiTrash2 } from "react-icons/fi";
import { getAllBaseForms } from "../../../api/baseFormsApi";
import { getAllCategories } from "../../../api/categoriesApi";
import {
   createDescriptionForm,
   deleteDescriptionForm,
   getAllDescriptionForms,
   updateDescriptionForm,
} from "../../../api/descriptionFormsApi";
import {
   createForm,
   deleteForm,
   getFormById,
   updateForm,
} from "../../../api/formsApi";
import { fetchAllUsers, getUserId } from "../../../api/usersApi";
import { getAllVerticals } from "../../../api/verticalsApi";
import ConfirmDialog from "../../ConfirmDialog";
import CustomAlert from "../../CustomAlert";
import CustomForm from "../../formMaker/CustomForm";
import FormBuilder from "../../formMaker/FormBuilder";
import { SelectInput, TextInput } from "../../inputs";

export default function DescForm() {
   const [descForms, setDescForms] = useState([]);
   const [baseForms, setBaseForms] = useState([]);
   const [verticals, setVerticals] = useState([]);
   const [categories, setCategories] = useState([]);
   const [users, setUsers] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showModal, setShowModal] = useState(false);
   const [editForm, setEditForm] = useState(null);
   const [showEditSection, setShowEditSection] = useState(false);
   const [form, setForm] = useState({
      name: "",
      label: "",
      status: "private",
      base_form_id: "",
      vertical_id: "",
      category_id: "",
   });
   const [confirm, setConfirm] = useState({ open: false, id: null });
   const [alert, setAlert] = useState(null);
   const [search, setSearch] = useState("");
   const [filterMine, setFilterMine] = useState("mine");
   const [filterVertical, setFilterVertical] = useState("");
   const [filterCategory, setFilterCategory] = useState("");
   const [filterBaseForm, setFilterBaseForm] = useState("");
   const [showFormBuilder, setShowFormBuilder] = useState(false);
   const [showFormSchemaPreview, setShowFormSchemaPreview] = useState(false);
   const [pendingSchema, setPendingSchema] = useState(null);

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         const [df, bf, v, c, u] = await Promise.all([
            getAllDescriptionForms(),
            getAllBaseForms(),
            getAllVerticals(),
            getAllCategories(),
            fetchAllUsers(),
         ]);
         setDescForms(df);
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

   // Filter description forms based on search and filters
   const filteredDescForms = descForms.filter((df) => {
      if (filterMine === "mine" && df.created_by !== getUserId()) return false;
      if (filterVertical && df.vertical_id !== filterVertical) return false;
      if (filterCategory && df.category_id !== filterCategory) return false;
      if (filterBaseForm && df.base_form_id !== filterBaseForm) return false;
      if (search) {
         const s = search.toLowerCase();
         const name = (df.name || "").toLowerCase();
         const label = (df.label || "").toLowerCase();
         if (!name.includes(s) && !label.includes(s)) return false;
      }
      return true;
   });

   // DescFormForm component for both Add and Edit
   function DescFormForm({
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
               placeholder="Description Form Name"
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
                     onClick={onDelete}
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

   // Handlers
   const handleAdd = async (formData) => {
      try {
         let formId = null;
         if (pendingSchema) {
            // Upload schema to forms table and get form ID
            const formRes = await createForm({ structure: pendingSchema });
            formId = formRes.id;
            setPendingSchema(null);
         }
         // Create description form with the form_id (can be null if no schema)
         await createDescriptionForm({ ...formData, form_id: formId });
         setAlert({ type: "success", message: "Description Form created!" });
         setShowModal(false);
         setForm({
            name: "",
            label: "",
            status: "private",
            base_form_id: "",
            vertical_id: "",
            category_id: "",
         });
         setDescForms(await getAllDescriptionForms());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleEdit = async (formData) => {
      try {
         // Handle schema updates if there's a pending schema
         if (pendingSchema) {
            if (editForm.form_id) {
               // Update existing schema
               await updateForm(editForm.form_id, { structure: pendingSchema });
            } else {
               // Create new schema and update description form with form_id
               const formRes = await createForm({ structure: pendingSchema });
               formData.form_id = formRes.id;
            }
            setPendingSchema(null);
         }

         await updateDescriptionForm(editForm.id, formData);
         setAlert({ type: "success", message: "Description Form updated!" });
         setEditForm(null);
         setShowEditSection(false);
         setForm({
            name: "",
            label: "",
            status: "private",
            base_form_id: "",
            vertical_id: "",
            category_id: "",
            form_id: null,
         });
         setDescForms(await getAllDescriptionForms());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   const handleDelete = async (id) => {
      try {
         // First, get the description form to check if it has an associated form_id
         const descFormToDelete = descForms.find((df) => df.id === id);

         // Delete the description form first
         await deleteDescriptionForm(id);

         // If the description form had an associated form schema, delete that too
         if (descFormToDelete?.form_id) {
            try {
               await deleteForm(descFormToDelete.form_id);
               console.log(
                  `[Delete] Also deleted associated form schema: ${descFormToDelete.form_id}`
               );
            } catch (formDeleteError) {
               console.warn(
                  `[Delete] Could not delete associated form schema: ${formDeleteError.message}`
               );
               // Don't throw here - the description form deletion was successful
            }
         }

         setAlert({ type: "success", message: "Description Form deleted!" });
         setDescForms(await getAllDescriptionForms());
      } catch (e) {
         setAlert({ type: "error", message: e.message });
      }
   };

   function FormSchemaPreviewModal({ formId, pendingSchema, onClose }) {
      const [schema, setSchema] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
         async function fetchSchema() {
            setLoading(true);
            try {
               if (pendingSchema) {
                  // Use pending schema if available (for new forms)
                  console.log(
                     "[Form View] Using pending schema:",
                     pendingSchema
                  );
                  setSchema(pendingSchema);
               } else if (typeof formId === "string" && formId.length > 0) {
                  // Load from database for existing forms
                  const form = await getFormById(formId);
                  console.log(
                     "[Form View] Loaded schema for formId:",
                     formId,
                     form?.structure
                  );
                  setSchema(form?.structure || null);
               } else {
                  console.log("[Form View] No valid formId or pending schema");
                  setSchema(null);
               }
            } catch (err) {
               console.error("[Form View] Error loading schema:", err);
               setSchema(null);
            } finally {
               setLoading(false);
            }
         }
         fetchSchema();
      }, [formId, pendingSchema]);

      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col relative">
               <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl z-10"
                  onClick={onClose}
               >
                  &times;
               </button>
               <div className="p-8 pb-4 flex-shrink-0">
                  <h4 className="text-lg font-bold flex items-center gap-2">
                     <FiFileText className="text-blue-400" /> Description Form
                     Schema Preview
                  </h4>
               </div>
               <div
                  className="flex-1 overflow-y-auto px-8 pb-8"
                  style={{ minHeight: 0 }}
               >
                  {loading ? (
                     <div className="text-gray-400">Loading schema...</div>
                  ) : schema ? (
                     <div className="h-full">
                        <CustomForm schema={schema} onSubmit={() => {}} />
                     </div>
                  ) : (
                     <div className="text-gray-400">No schema found.</div>
                  )}
               </div>
            </div>
         </div>
      );
   }

   // Handle opening FormBuilder - preserve pending schema if it exists
   const handleOpenFormBuilder = async () => {
      let schema = null;

      // Priority: 1. Use existing pendingSchema if available (continue editing)
      if (pendingSchema) {
         schema = pendingSchema;
         console.log("[Form Builder] Continuing with pending schema");
      }
      // 2. Load from database if form_id exists and no pending schema
      else if (form.form_id) {
         try {
            const formObj = await getFormById(form.form_id);
            schema = formObj?.structure || null;
            console.log("[Form Builder] Loaded schema from database");
         } catch (err) {
            console.log("[Form Builder] Error loading form schema:", err);
            schema = null;
         }
      }
      // 3. Start with empty schema for new forms
      else {
         console.log("[Form Builder] Starting with new schema");
         schema = null;
      }

      setPendingSchema(schema);
      setShowFormBuilder(true);
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
               <FiFileText className="text-blue-400" /> Description Forms
            </h2>
            <button
               className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 font-medium shadow flex items-center gap-2 cursor-pointer"
               onClick={() => {
                  setShowModal(true);
                  setEditForm(null);
                  setForm({
                     name: "",
                     label: "",
                     status: "private",
                     base_form_id: "",
                     vertical_id: "",
                     category_id: "",
                     form_id: null,
                  });
               }}
            >
               <FiPlus /> Add Description Form
            </button>
         </div>
         <div className="flex w-full justify-between flex-col md:flex-row md:items-end gap-1 mb-4">
            <TextInput
               placeholder="Search by name or label"
               value={search}
               onChange={setSearch}
               className="md:w-64 w-full"
            />
            <SelectInput
               value={filterMine}
               onChange={setFilterMine}
               options={[
                  { value: "mine", label: "My Forms" },
                  { value: "all", label: "All Forms" },
               ]}
               className="md:w-35 w-full"
            />
            <SelectInput
               value={filterVertical}
               onChange={(val) => {
                  setFilterVertical(val);
                  setFilterCategory("");
                  setFilterBaseForm("");
               }}
               options={verticals.map((v) => ({ value: v.id, label: v.name }))}
               placeholder="By Vertical"
               className="md:w-40 w-full"
            />
            <SelectInput
               value={filterCategory}
               onChange={setFilterCategory}
               options={filteredCategories.map((c) => ({
                  value: c.id,
                  label: c.name,
               }))}
               placeholder="By Category"
               className="md:w-40 w-full"
            />
            <SelectInput
               value={filterBaseForm}
               onChange={setFilterBaseForm}
               options={filteredBaseForms.map((bf) => ({
                  value: bf.id,
                  label: bf.name,
               }))}
               placeholder="By Base Form"
               className="md:w-45 w-full"
            />
         </div>
         {loading ? (
            <div className="text-center text-gray-400">Loading...</div>
         ) : (
            <div className="flex flex-col md:flex-row gap-6">
               {/* Description Form List */}
               <div className="flex-1">
                  <div className="relative w-full bg-gray-800/70 rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
                     <div className="flex gap-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 text-gray-200 px-4 py-2 font-semibold text-sm rounded-t-2xl">
                        <p className="flex-3 text-left">Name</p>
                        <p className="flex-2 text-left">Base Form</p>
                        <p className="flex-2 text-left">Category</p>
                        <p className="w-24 text-left">Owner</p>
                        <p className="w-16 text-center">Actions</p>
                     </div>
                     <div>
                        {filteredDescForms.length === 0 ? (
                           <div className="text-center text-gray-500 py-4 bg-gray-900/60">
                              No description forms
                           </div>
                        ) : (
                           filteredDescForms.map((df) => (
                              <div
                                 key={df.id}
                                 className="flex items-center gap-2 border-t border-gray-700 hover:bg-gray-700/40 transition-colors duration-150 group px-4 py-2"
                              >
                                 <div className="flex-3 whitespace-nowrap text-white group-hover:text-blue-200 flex items-center gap-1">
                                    <FiFileText className="text-blue-400" />
                                    {df.name}{" "}
                                    {df.label && (
                                       <span className="text-gray-400">
                                          ({df.label})
                                       </span>
                                    )}
                                 </div>
                                 <div className="flex-2 whitespace-nowrap text-gray-200">
                                    {getBaseFormName(df.base_form_id)}
                                 </div>
                                 <div className="flex-2 whitespace-nowrap text-gray-200">
                                    {categories.find(
                                       (c) => c.id === df.category_id
                                    )?.name || "-"}
                                 </div>
                                 <div className="w-24 text-left text-gray-200">
                                    {getUsername(df.created_by)}
                                 </div>
                                 <div className="w-16 flex gap-2 justify-center">
                                    {df.created_by === getUserId() && (
                                       <button
                                          className="text-blue-400 hover:text-blue-200 flex items-center gap-1 cursor-pointer"
                                          onClick={() => {
                                             setEditForm(df);
                                             setForm({
                                                name: df.name,
                                                label: df.label,
                                                status: df.status,
                                                base_form_id: df.base_form_id,
                                                vertical_id: df.vertical_id,
                                                category_id: df.category_id,
                                                form_id: df.form_id,
                                             });
                                             setShowEditSection(true);
                                          }}
                                       >
                                          <FiEdit2 />
                                       </button>
                                    )}
                                 </div>
                              </div>
                           ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Section (floating right overlay) */}
         {showEditSection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiFileText className="text-blue-400" />
                     Edit Description Form
                  </h3>
                  {/* Form Schema Section for Edit */}
                  <div className="mb-6 flex flex-col gap-2 bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                     <div className="flex gap-2 items-center">
                        <button
                           className={`px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all ${
                              !form.form_id && !pendingSchema
                                 ? "opacity-50 cursor-not-allowed"
                                 : ""
                           }`}
                           disabled={!form.form_id && !pendingSchema}
                           onClick={() => setShowFormSchemaPreview(true)}
                        >
                           Form View
                        </button>
                        <button
                           className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all"
                           onClick={handleOpenFormBuilder}
                        >
                           {pendingSchema
                              ? "Continue Form"
                              : form.form_id
                              ? "Edit Form"
                              : "Setup Form"}
                        </button>
                        <span className="text-xs text-gray-400 ml-2">
                           {pendingSchema
                              ? "Unsaved changes"
                              : form.form_id
                              ? "Schema linked"
                              : "No schema linked"}
                        </span>
                     </div>
                  </div>
                  <DescFormForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={handleEdit}
                     onCancel={() => {
                        setShowEditSection(false);
                        setEditForm(null);
                        setPendingSchema(null); // Clear pending schema on cancel
                     }}
                     submitLabel="Update"
                     showDelete={editForm?.created_by === getUserId()}
                     onDelete={() =>
                        setConfirm({ open: true, id: editForm.id })
                     }
                  />
               </div>
            </div>
         )}

         {/* Modal for Add Description Form */}
         {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiFileText className="text-blue-400" />
                     Add Description Form
                  </h3>
                  {/* Form Schema Section */}
                  <div className="mb-6 flex flex-col gap-2 bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                     <div className="flex gap-2 items-center">
                        <button
                           className={`px-3 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all ${
                              !form.form_id && !pendingSchema
                                 ? "opacity-50 cursor-not-allowed"
                                 : ""
                           }`}
                           disabled={!form.form_id && !pendingSchema}
                           onClick={() => setShowFormSchemaPreview(true)}
                        >
                           Form View
                        </button>
                        <button
                           className="px-3 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all"
                           onClick={handleOpenFormBuilder}
                        >
                           {pendingSchema
                              ? "Continue Form"
                              : form.form_id
                              ? "Edit Form"
                              : "Setup Form"}
                        </button>
                        <span className="text-xs text-gray-400 ml-2">
                           {pendingSchema
                              ? "Unsaved changes"
                              : form.form_id
                              ? "Schema linked"
                              : "No schema linked"}
                        </span>
                     </div>
                  </div>
                  <DescFormForm
                     initialForm={form}
                     verticals={verticals}
                     onSubmit={handleAdd}
                     onCancel={() => {
                        setShowModal(false);
                        setEditForm(null);
                        setPendingSchema(null); // Clear pending schema on cancel
                     }}
                     submitLabel="Add"
                     showDelete={false}
                  />
               </div>
            </div>
         )}

         {/* FormBuilder Modal */}
         {showFormBuilder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
               <div className="bg-gray-900 rounded-xl p-8 border border-gray-700 w-full max-w-2xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                     <FiFileText className="text-blue-400" />
                     {pendingSchema
                        ? "Continue Editing Description Form Schema"
                        : form.form_id
                        ? "Edit Description Form Schema"
                        : "Create New Description Form Schema"}
                  </h3>
                  <FormBuilder
                     isOpen={showFormBuilder}
                     onClose={() => {
                        setShowFormBuilder(false);
                        // Don't clear pendingSchema on close - preserve it for continuing later
                     }}
                     onSaveSchema={(schemaObj) => {
                        setShowFormBuilder(false);
                        setPendingSchema(schemaObj); // Save schema for upload on submit
                        // Only open add modal if we're not already in edit mode
                        if (!showEditSection) {
                           setShowModal(true);
                        }
                     }}
                     schema={pendingSchema}
                  />
               </div>
            </div>
         )}

         {/* Confirm Dialog for Delete */}
         <ConfirmDialog
            open={confirm.open}
            title="Delete Description Form"
            message="Are you sure you want to delete this description form? This will also delete any associated form schema."
            onConfirm={async () => {
               await handleDelete(confirm.id);
               setShowModal(false);
               setShowEditSection(false);
               setEditForm(null);
               setPendingSchema(null); // Clear pending schema on delete
               setConfirm({ open: false, id: null });
            }}
            onCancel={() => setConfirm({ open: false, id: null })}
         />

         {/* Form Schema Preview Modal */}
         {showFormSchemaPreview && (
            <FormSchemaPreviewModal
               formId={form.form_id}
               pendingSchema={pendingSchema}
               onClose={() => setShowFormSchemaPreview(false)}
            />
         )}
      </div>
   );
}
