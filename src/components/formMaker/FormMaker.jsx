import { useCallback, useEffect, useState } from "react";
import { FiCode, FiDownload, FiEye, FiSave, FiX } from "react-icons/fi";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { createNewField, generateFormSchema } from "../../utils/formMaker";
import "../formMaker/formMaker.css";
import DragPreview from "./DragPreview";
import FieldEditor from "./FieldEditor";
import FieldPalette from "./FieldPalette";
import FormCanvas from "./FormCanvas";

/**
 * Modern FormMaker - Redesigned with left-right layout
 * Left: Field palette with draggable field types
 * Right: Canvas for placing and arranging fields (1-4 items per row)
 */

const FormMaker = ({ isOpen, onClose }) => {
   const [fields, setFields] = useState([]);
   const [editingField, setEditingField] = useState(null);
   const [showPreview, setShowPreview] = useState(false);
   const [showExport, setShowExport] = useState(false);
   const [formData, setFormData] = useState({});

   // Initialize drag and drop functionality
   const dragAndDrop = useDragAndDrop(fields);

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

   // Add new field to canvas
   const addField = useCallback(
      (fieldType, insertIndex = null, fieldOptions = {}) => {
         const newField = createNewField(fields.length, fieldType);

         // Apply any additional field options (width, positioning, etc.)
         const enhancedField = { ...newField, ...fieldOptions };

         if (insertIndex !== null) {
            setFields((prev) => {
               const newFields = [...prev];
               newFields.splice(insertIndex, 0, enhancedField);
               return newFields;
            });
         } else {
            setFields((prev) => [...prev, enhancedField]);
         }
      },
      [fields.length]
   );

   // Update field
   const updateField = useCallback((fieldId, updates) => {
      setFields((prev) =>
         prev.map((field) =>
            field.id === fieldId ? { ...field, ...updates } : field
         )
      );
   }, []);

   // Delete field
   const deleteField = useCallback((fieldId) => {
      setFields((prev) => prev.filter((field) => field.id !== fieldId));
      setEditingField(null);
   }, []);

   // Reorder fields
   const reorderFields = useCallback(
      (sourceIndex, destinationIndex, newFieldsArray = null) => {
         if (newFieldsArray) {
            // Special case: directly set the provided fields array (for complex operations like width + position)
            setFields(newFieldsArray);
         } else {
            // Normal reordering
            setFields((prev) => {
               const newFields = [...prev];
               const [removed] = newFields.splice(sourceIndex, 1);
               newFields.splice(destinationIndex, 0, removed);
               return newFields;
            });
         }
      },
      []
   );

   // Edit field
   const editField = useCallback((field) => {
      setEditingField(field);
   }, []);

   // Handle field editor close
   const handleFieldEditorClose = useCallback(() => {
      setEditingField(null);
   }, []);

   // Handle field editor save
   const handleFieldEditorSave = useCallback(() => {
      setEditingField(null);
   }, []);

   // Add option to select field
   const addOption = useCallback(
      (fieldId) => {
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
      },
      [fields, updateField]
   );

   // Update option
   const updateOption = useCallback(
      (fieldId, optionIndex, updates) => {
         const field = fields.find((f) => f.id === fieldId);
         if (field) {
            const newOptions = [...field.options];
            newOptions[optionIndex] = {
               ...newOptions[optionIndex],
               ...updates,
            };
            updateField(fieldId, { options: newOptions });
         }
      },
      [fields, updateField]
   );

   // Remove option
   const removeOption = useCallback(
      (fieldId, optionIndex) => {
         const field = fields.find((f) => f.id === fieldId);
         if (field) {
            const newOptions = field.options.filter(
               (_, index) => index !== optionIndex
            );
            updateField(fieldId, { options: newOptions });
         }
      },
      [fields, updateField]
   );

   // Handle form data change for preview
   const handleFormDataChange = useCallback((fieldName, value) => {
      setFormData((prev) => ({
         ...prev,
         [fieldName]: value,
      }));
   }, []);

   // Generate and download form schema
   const handleExport = useCallback(() => {
      const schema = generateFormSchema(fields);
      const dataStr = JSON.stringify(schema, null, 2);
      const dataUri =
         "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = "form-schema.json";
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
   }, [fields]);

   // Save form (placeholder for actual save functionality)
   const handleSave = useCallback(() => {
      // This would typically save to a backend or local storage
   }, []);

   if (!isOpen) return null;

   return (
      <>
         {/* Main Modal */}
         <div className="fixed z-50 inset-0 flex">
            {/* Backdrop */}
            <div
               className="absolute inset-0 bg-black/50 backdrop-blur-sm"
               onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative bg-gray-900 w-full max-w-7xl mx-auto my-4 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
               {/* Header */}
               <div className="flex-shrink-0 border-b border-gray-700">
                  <div className="flex items-center justify-between p-4">
                     <div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                           Form Builder
                        </h1>
                        <p className="text-sm text-gray-400">
                           {fields.length} field{fields.length !== 1 ? "s" : ""}{" "}
                           • Drag from palette or click to add
                        </p>
                     </div>

                     <div className="flex items-center gap-2">
                        {fields.length > 0 && (
                           <>
                              <button
                                 onClick={() => setShowPreview(!showPreview)}
                                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 
                                          hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                 <FiEye className="w-4 h-4" />
                                 {showPreview ? "Hide Preview" : "Preview"}
                              </button>

                              <button
                                 onClick={() => setShowExport(!showExport)}
                                 className="flex items-center gap-2 px-4 py-2 bg-green-600 
                                          hover:bg-green-700 text-white rounded-lg transition-colors"
                              >
                                 <FiCode className="w-4 h-4" />
                                 Schema
                              </button>

                              <button
                                 onClick={handleExport}
                                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 
                                          hover:bg-purple-700 text-white rounded-lg transition-colors"
                              >
                                 <FiDownload className="w-4 h-4" />
                                 Export
                              </button>

                              <button
                                 onClick={handleSave}
                                 className="flex items-center gap-2 px-4 py-2 bg-gray-600 
                                          hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                 <FiSave className="w-4 h-4" />
                                 Save
                              </button>
                           </>
                        )}

                        <button
                           onClick={onClose}
                           className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 
                                    rounded-lg transition-colors"
                        >
                           <FiX className="w-6 h-6" />
                        </button>
                     </div>
                  </div>
               </div>

               {/* Content Area */}
               <div className="flex-1 flex min-h-0">
                  {/* Left Sidebar - Field Palette */}
                  <FieldPalette />

                  {/* Right Content - Canvas or Preview */}
                  {showPreview ? (
                     <FormPreview
                        fields={fields}
                        formData={formData}
                        onFormDataChange={handleFormDataChange}
                        onBack={() => setShowPreview(false)}
                     />
                  ) : showExport ? (
                     <SchemaPreview
                        fields={fields}
                        onBack={() => setShowExport(false)}
                     />
                  ) : (
                     <FormCanvas
                        fields={fields}
                        onAddField={addField}
                        onEditField={editField}
                        onDeleteField={deleteField}
                        onReorderFields={reorderFields}
                     />
                  )}
               </div>
            </div>
         </div>

         {/* Field Editor Modal */}
         <FieldEditor
            field={editingField}
            isOpen={!!editingField}
            onClose={handleFieldEditorClose}
            onSave={handleFieldEditorSave}
            onUpdate={updateField}
            onDelete={deleteField}
            onAddOption={addOption}
            onUpdateOption={updateOption}
            onRemoveOption={removeOption}
         />

         {/* Drag Preview */}
         <DragPreview
            dragPreview={dragAndDrop.dragPreview}
            mousePosition={dragAndDrop.mousePosition}
         />
      </>
   );
};

// Form Preview Component
const FormPreview = ({ fields, formData, onFormDataChange, onBack }) => {
   const handleInputChange = (fieldName, value) => {
      onFormDataChange(fieldName, value);
   };

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
               onClick={onBack}
               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                        rounded-lg transition-colors"
            >
               ← Back to Editor
            </button>
            <h3 className="text-lg font-semibold text-white">Form Preview</h3>
         </div>

         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-2xl mx-auto">
               <form className="space-y-6">
                  {fields.map((field) => (
                     <FormField
                        key={field.id}
                        field={field}
                        value={formData[field.name] || ""}
                        onChange={(value) =>
                           handleInputChange(field.name, value)
                        }
                     />
                  ))}

                  {fields.length > 0 && (
                     <div className="pt-4">
                        <button
                           type="button"
                           className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 
                                    text-white font-medium rounded-lg transition-colors"
                        >
                           Submit Form
                        </button>
                     </div>
                  )}
               </form>
            </div>
         </div>
      </div>
   );
};

// Schema Preview Component
const SchemaPreview = ({ fields, onBack }) => {
   const schema = generateFormSchema(fields);

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
               onClick={onBack}
               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                        rounded-lg transition-colors"
            >
               ← Back to Editor
            </button>
            <h3 className="text-lg font-semibold text-white">Form Schema</h3>
         </div>

         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <pre
               className="bg-gray-800 p-4 rounded-lg text-sm text-green-400 
                          font-mono overflow-x-auto"
            >
               {JSON.stringify(schema, null, 2)}
            </pre>
         </div>
      </div>
   );
};

// Individual Form Field Component for Preview
const FormField = ({ field, value, onChange }) => {
   if (field.type === "hr") {
      return <hr className="border-gray-600 my-4" />;
   }

   const handleChange = (e) => {
      const newValue =
         e.target.type === "checkbox"
            ? e.target.checked
               ? [...(value || []), e.target.value]
               : (value || []).filter((v) => v !== e.target.value)
            : e.target.value;
      onChange(newValue);
   };

   return (
      <div className="space-y-2">
         {field.label && (
            <label className="block text-sm font-medium text-white">
               {field.label}
               {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
         )}

         {field.type === "text" && (
            <input
               type="text"
               value={value}
               onChange={handleChange}
               placeholder={field.placeholder}
               required={field.required}
               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 
                        rounded-lg text-white placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         )}

         {field.type === "number" && (
            <input
               type="number"
               value={value}
               onChange={handleChange}
               placeholder={field.placeholder}
               min={field.min}
               max={field.max}
               step={field.step}
               required={field.required}
               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 
                        rounded-lg text-white placeholder-gray-400 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         )}

         {field.type === "date" && (
            <input
               type="date"
               value={value}
               onChange={handleChange}
               required={field.required}
               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 
                        rounded-lg text-white 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
         )}

         {field.type === "select" && (
            <select
               value={value}
               onChange={handleChange}
               required={field.required}
               className="w-full px-3 py-2 bg-gray-700 border border-gray-600 
                        rounded-lg text-white 
                        focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
               <option value="">
                  {field.placeholder || "Select an option..."}
               </option>
               {field.options?.map((option, index) => (
                  <option key={index} value={option.value}>
                     {option.label}
                  </option>
               ))}
            </select>
         )}

         {field.type === "multiple" && (
            <div className="space-y-2">
               {field.options?.map((option, index) => (
                  <label
                     key={index}
                     className="flex items-center gap-2 text-white"
                  >
                     <input
                        type="checkbox"
                        value={option.value}
                        checked={(value || []).includes(option.value)}
                        onChange={handleChange}
                        className="rounded bg-gray-700 border-gray-600 text-blue-600 
                                 focus:ring-blue-500 focus:ring-2"
                     />
                     {option.label}
                  </label>
               ))}
            </div>
         )}

         {field.helperText && (
            <p className="text-sm text-gray-400">{field.helperText}</p>
         )}
      </div>
   );
};

export default FormMaker;
