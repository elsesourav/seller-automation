import { useEffect, useState } from "react";
import { FiEye, FiList, FiPlus, FiX } from "react-icons/fi";
import AddFieldSection from "../formMaker/AddFieldSection";
import FieldEditor from "../formMaker/FieldEditor";
import OrganizeFieldSection from "../formMaker/OrganizeFieldSection";
import PreviewSection from "../formMaker/PreviewSection";
import "../formMaker/formMaker.css";

/**
 * FormMaker - A redesigned component for creating dynamic forms
 * Features modern UI, improved drag-and-drop, and better organization
 */

const FormMaker = ({ isOpen, onClose }) => {
   // Test data with various field widths
   const testFields = [
      {
         id: 1,
         type: "text",
         label: "First Name",
         placeholder: "Enter first name",
         width: "half",
         required: true,
         options: [],
      },
      {
         id: 2,
         type: "text",
         label: "Last Name",
         placeholder: "Enter last name",
         width: "half",
         required: true,
         options: [],
      },
      {
         id: 3,
         type: "text",
         label: "Full Address",
         placeholder: "Enter your full address",
         width: "full",
         required: false,
         options: [],
      },
      {
         id: 4,
         type: "number",
         label: "Age",
         placeholder: "Enter age",
         width: "fourth",
         required: false,
         options: [],
      },
      {
         id: 5,
         type: "select",
         label: "Country",
         placeholder: "Select country",
         width: "three-fourths",
         required: true,
         options: [
            { value: "us", label: "United States" },
            { value: "ca", label: "Canada" },
            { value: "uk", label: "United Kingdom" },
         ],
      },
   ];

   const [fields, setFields] = useState(testFields); // Start with test data
   const [formData, setFormData] = useState({});
   const [editingField, setEditingField] = useState(null);
   const [activeSection, setActiveSection] = useState("organize"); // Start on organize section
   const [isNewField, setIsNewField] = useState(false);

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "unset";
      }
      return () => {
         document.body.style.overflow = "unset";
      };
   }, [isOpen]);

   // Handle form data change in preview
   const handleFormDataChange = (fieldName, value) => {
      setFormData((prev) => ({ ...prev, [fieldName]: value }));
   };

   // Handle field editor close
   const handleFieldEditorClose = () => {
      if (isNewField && editingField) {
         // If it's a new field and user cancels, remove it
         setFields(fields.filter((field) => field.id !== editingField));
      }
      setEditingField(null);
      setIsNewField(false);
   };

   // Handle field editor save
   const handleFieldEditorSave = () => {
      setEditingField(null);
      setIsNewField(false);
   };

   // Update a field
   const updateField = (id, updates) => {
      setFields(
         fields.map((field) =>
            field.id === id ? { ...field, ...updates } : field
         )
      );
   };

   // Remove a field
   const removeField = (id) => {
      setFields(fields.filter((field) => field.id !== id));
      if (editingField === id) {
         setEditingField(null);
      }
   };

   // Add option to select field
   const addOption = (fieldId) => {
      const field = fields.find((f) => f.id === fieldId);
      if (field) {
         const newOption = {
            value: `option_${field.options.length + 1}`,
            label: `Option ${field.options.length + 1}`,
         };
         updateField(fieldId, {
            options: [...field.options, newOption],
         });
      }
   };

   // Update option
   const updateOption = (fieldId, optionIndex, updates) => {
      const field = fields.find((f) => f.id === fieldId);
      if (field) {
         const newOptions = [...field.options];
         newOptions[optionIndex] = { ...newOptions[optionIndex], ...updates };
         updateField(fieldId, { options: newOptions });
      }
   };

   // Remove option
   const removeOption = (fieldId, optionIndex) => {
      const field = fields.find((f) => f.id === fieldId);
      if (field) {
         const newOptions = field.options.filter(
            (_, index) => index !== optionIndex
         );
         updateField(fieldId, { options: newOptions });
      }
   };

   const tabs = [
      {
         id: "add",
         label: "Add Fields",
         icon: FiPlus,
         disabled: false,
         description: "Create new form fields",
      },
      {
         id: "organize",
         label: "Organize",
         icon: FiList,
         disabled: fields.length === 0,
         description: "Arrange and configure fields",
      },
      {
         id: "preview",
         label: "Preview",
         icon: FiEye,
         disabled: fields.length === 0,
         description: "Test your form",
      },
   ];

   return (
      <>
         {/* Main Modal */}
         {isOpen && (
            <div className="fixed z-50 flex items-center justify-center p-4 inset-0 mx-auto">
               {/* Backdrop */}
               <div
                  className="absolute inset-0 backdrop-blur-sm"
                  onClick={onClose}
               />

               {/* Modal Container */}
               <div className="relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 w-[800px] md:w-[900px] max-h-[95vh] flex flex-col">
                  {/* Header */}
                  <div className="flex-shrink-0 border-b border-gray-700">
                     <div className="flex items-center justify-between p-6">
                        <div>
                           <h1 className="text-2xl font-bold text-white mb-1">
                              Form Builder
                           </h1>
                        </div>
                        <button
                           onClick={onClose}
                           className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 
                                    rounded-lg transition-colors"
                        >
                           <FiX className="w-6 h-6" />
                        </button>
                     </div>

                     {/* Tab Navigation */}
                     <div className="px-6">
                        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
                           {tabs.map((tab) => {
                              const Icon = tab.icon;
                              return (
                                 <button
                                    key={tab.id}
                                    onClick={() =>
                                       !tab.disabled && setActiveSection(tab.id)
                                    }
                                    disabled={tab.disabled}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium 
                                             transition-all duration-200 flex-1 justify-center ${
                                                activeSection === tab.id
                                                   ? "bg-blue-600 text-white shadow-lg"
                                                   : tab.disabled
                                                   ? "text-gray-600 cursor-not-allowed"
                                                   : "text-gray-400 hover:text-white hover:bg-gray-700"
                                             }`}
                                 >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    {tab.id === "organize" &&
                                       fields.length > 0 && (
                                          <span
                                             className="ml-1 px-2 py-0.5 bg-blue-500 text-white 
                                                      text-xs rounded-full"
                                          >
                                             {fields.length}
                                          </span>
                                       )}
                                 </button>
                              );
                           })}
                        </div>
                     </div>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-hidden">
                     <div className="h-full overflow-y-auto">
                        <div className="p-6">
                           {activeSection === "add" && (
                              <AddFieldSection
                                 fields={fields}
                                 setFields={setFields}
                                 setEditingField={setEditingField}
                                 removeField={removeField}
                                 setIsNewField={setIsNewField}
                              />
                           )}

                           {activeSection === "organize" && (
                              <OrganizeFieldSection
                                 fields={fields}
                                 setFields={setFields}
                                 removeField={removeField}
                              />
                           )}

                           {activeSection === "preview" && (
                              <PreviewSection
                                 fields={fields}
                                 formData={formData}
                                 handleFormDataChange={handleFormDataChange}
                              />
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         )}

         {/* Field Editor Modal */}
         <FieldEditor
            field={fields.find((f) => f.id === editingField)}
            isOpen={!!editingField}
            onClose={handleFieldEditorClose}
            onSave={handleFieldEditorSave}
            onUpdate={updateField}
            onDelete={removeField}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
         />
      </>
   );
};

export default FormMaker;
