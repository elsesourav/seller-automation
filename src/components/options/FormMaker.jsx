import { useCallback, useEffect, useState } from "react";
import { FiCode, FiDownload, FiEye, FiSave, FiX } from "react-icons/fi";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import { createNewField, generateFormSchema } from "../../utils/formMaker";
import DragPreview from "../formMaker/DragPreview";
import FieldEditor from "../formMaker/FieldEditor";
import FieldPalette from "../formMaker/FieldPalette";
import FormCanvas from "../formMaker/FormCanvas";
import "../formMaker/formMaker.css";
import FormPreview from "../formMaker/FormPreview";
import SchemaPreview from "../formMaker/SchemaPreview";

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

   // Get the current editing field from the fields array (to ensure it's always up-to-date)
   const currentEditingField = editingField
      ? fields.find((f) => f.id === editingField.id)
      : null;

   // Close editor if the field no longer exists
   useEffect(() => {
      if (editingField && !currentEditingField) {
         setEditingField(null);
      }
   }, [editingField, currentEditingField]);

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
            key={currentEditingField?.id} // Force re-render when field changes
            field={currentEditingField}
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

export default FormMaker;
