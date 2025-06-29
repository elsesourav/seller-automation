import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as FiIcons from "react-icons/fi";
import {
   FiAlignCenter,
   FiCalendar,
   FiChevronDown,
   FiCode,
   FiDownload,
   FiEdit2,
   FiEye,
   FiHash,
   FiList,
   FiMenu,
   FiMinus,
   FiMove,
   FiPlus,
   FiSave,
   FiTrash2,
   FiType,
   FiX,
} from "react-icons/fi";
import { NumberInput, TextInput, TitleBar } from "../inputs";
import CustomForm from "./CustomForm";
import {
   createNewField,
   FIELD_ICONS,
   FIELD_TYPES,
   getFieldDescription,
   getFieldTypeInfo,
   groupFieldsIntoRows,
   makeSchemaWithWidths,
   normalizeField,
} from "./formUtils";

/********************
 * DRAG & DROP HOOK
 ********************/
const useDragAndDrop = (fields) => {
   const [draggedId, setDraggedId] = useState(null);
   const [isDragging, setIsDragging] = useState(false);
   const [dragPreview, setDragPreview] = useState(null);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const dragStartPos = useRef({ x: 0, y: 0 });

   const handleDragMove = useCallback(
      (e) => {
         if (isDragging) setMousePosition({ x: e.clientX, y: e.clientY });
      },
      [isDragging]
   );

   useEffect(() => {
      if (isDragging) {
         document.addEventListener("dragover", handleDragMove);
         return () => document.removeEventListener("dragover", handleDragMove);
      }
   }, [isDragging, handleDragMove]);

   const createDragPreview = useCallback(
      (field) => ({
         id: field.id,
         label: field.label,
         type: field.type,
         width: field.width,
      }),
      []
   );
   const resetDragState = useCallback(() => {
      setDraggedId(null);
      setIsDragging(false);
      setDragPreview(null);
      setMousePosition({ x: 0, y: 0 });
      dragStartPos.current = { x: 0, y: 0 };
   }, []);
   const handleDragStart = useCallback(
      (e, fieldId) => {
         dragStartPos.current = { x: e.clientX, y: e.clientY };
         setMousePosition({ x: e.clientX, y: e.clientY });
         const draggedField = fields.find((field) => field.id === fieldId);
         if (!draggedField) return;
         setDraggedId(fieldId);
         setIsDragging(true);
         setDragPreview(createDragPreview(draggedField));
         if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData(
               "application/json",
               JSON.stringify({ type: "canvas-field", fieldId })
            );
         }
         requestAnimationFrame(() => {
            if (e.target) e.target.style.opacity = "0.6";
         });
      },
      [fields, createDragPreview]
   );
   const handleDragEnd = useCallback(
      (e) => {
         if (e.target) e.target.style.opacity = "";
         resetDragState();
      },
      [resetDragState]
   );
   const isItemDragged = useCallback(
      (fieldId) => draggedId === fieldId,
      [draggedId]
   );
   return {
      draggedId,
      isDragging,
      dragPreview,
      mousePosition,
      handleDragStart,
      handleDragEnd,
      isItemDragged,
      resetDragState,
   };
};

/********************
 * DRAG PREVIEW COMPONENT
 ********************/
const DragPreview = ({ dragPreview, mousePosition }) => {
   if (!dragPreview) return null;
   const getFieldIcon = (type) => {
      const icons = {
         text: FiType,
         number: FiHash,
         date: FiCalendar,
         select: FiChevronDown,
         multiple: FiList,
         hr: FiMinus,
      };
      const IconComponent = icons[type] || FiType;
      return <IconComponent className="w-4 h-4" />;
   };
   const getWidthClass = (width) => {
      switch (width) {
         case "fourth":
            return "w-1/4";
         case "half":
            return "w-1/2";
         case "three-fourths":
            return "w-3/4";
         case "full":
         default:
            return "w-full";
      }
   };
   return (
      <div
         className="fixed pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2"
         style={{ left: mousePosition.x, top: mousePosition.y }}
      >
         <div
            className={`${getWidthClass(
               dragPreview.width
            )} min-w-[200px] max-w-[400px]`}
         >
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl border border-blue-500/50 shadow-2xl p-4 transform rotate-3 scale-95">
               {dragPreview.type === "hr" ? (
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <FiMinus className="w-4 h-4 text-gray-400" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                           Horizontal Divider
                        </h4>
                        <div className="h-px bg-gray-600 mt-1" />
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                           {getFieldIcon(dragPreview.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                           <h4 className="text-white font-medium text-sm truncate">
                              {dragPreview.label}
                           </h4>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 capitalize">
                                 {dragPreview.type}
                              </span>
                           </div>
                        </div>
                     </div>
                     <div className="ml-2 flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-500/20 rounded-md flex items-center justify-center">
                           <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                           >
                              <polyline points="5 9 2 12 5 15" />
                              <polyline points="9 5 12 2 15 5" />
                              <polyline points="15 19 12 22 9 19" />
                              <polyline points="19 9 22 12 19 15" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <line x1="12" y1="2" x2="12" y2="22" />
                           </svg>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

/********************
 * FIELD PALETTE COMPONENT
 ********************/
const FieldPalette = () => {
   const handleDragStart = (e, fieldType) => {
      e.dataTransfer.setData(
         "application/json",
         JSON.stringify({ type: "palette-field", fieldType: fieldType.value })
      );
      e.dataTransfer.effectAllowed = "copy";
      e.target.style.opacity = "0.7";
   };
   const handleDragEnd = (e) => {
      e.target.style.opacity = "1";
   };
   return (
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
         <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">
               Field Types
            </h3>
            <p className="text-sm text-gray-400">
               Drag to canvas to add fields
            </p>
         </div>
         <div className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {FIELD_TYPES.map((fieldType) => {
               const IconComponent = FIELD_ICONS[fieldType.icon];
               return (
                  <div
                     key={fieldType.value}
                     draggable
                     onDragStart={(e) => handleDragStart(e, fieldType)}
                     onDragEnd={handleDragEnd}
                     className="p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 hover:border-blue-500 group transform hover:scale-[1.02]"
                  >
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-600 group-hover:bg-blue-600 rounded-md transition-colors field-palette-icon">
                           <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div>
                           <div className="text-sm font-medium text-white">
                              {fieldType.label}
                           </div>
                           <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-nowrap">
                              <div className="text-xs text-blue-400 font-medium">
                                 {getFieldDescription(fieldType.value)}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

/********************
 * FIELD EDITOR COMPONENT
 ********************/
const FieldEditor = ({
   field,
   isOpen,
   onClose,
   onSave,
   onUpdate,
   onDelete,
   onAddOption,
   onUpdateOption,
   onRemoveOption,
}) => {
   // Local state for editing field
   const [editField, setEditField] = useState(
      field ? normalizeField(field) : null
   );

   // Sync local state with prop when field changes or editor opens
   useEffect(() => {
      if (isOpen && field) {
         setEditField(normalizeField(field));
      }
   }, [isOpen, field]);

   if (!isOpen || !editField) return null;

   const normalizedField = editField; // For compatibility with rest of code

   const getFieldIcon = (type) => {
      const icons = {
         text: FiType,
         textarea: FiType, // Use same icon for now, or choose a new one
         title: FiAlignCenter,
         number: FiHash,
         date: FiCalendar,
         select: FiChevronDown,
         multiple: FiList,
      };
      const IconComponent = icons[type] || FiType;
      return <IconComponent className="w-5 h-5" />;
   };

   const handleSave = () => {
      if (onUpdate) {
         onUpdate(editField.id, editField); // Push all changes to parent only on save
      }
      if (onSave) {
         onSave();
      } else {
         onClose();
      }
   };

   const handleDelete = () => {
      onDelete(normalizedField.id);
      onClose();
   };

   // Generic handler for field property changes
   const handleFieldChange = (updates) => {
      setEditField((prev) => ({ ...prev, ...updates }));
   };

   // Local handlers for options
   const handleAddOption = (fieldId) => {
      const newOptions = [
         ...normalizedField.options,
         {
            value: `option_${normalizedField.options.length + 1}`,
            label: `Option ${normalizedField.options.length + 1}`,
         },
      ];
      setEditField((prev) => ({ ...prev, options: newOptions }));
      onAddOption(fieldId);
   };

   const handleUpdateOption = (fieldId, optionIndex, updates) => {
      const newOptions = normalizedField.options.map((opt, idx) =>
         idx === optionIndex ? { ...opt, ...updates } : opt
      );
      setEditField((prev) => ({ ...prev, options: newOptions }));
      onUpdateOption(fieldId, optionIndex, updates);
   };

   const handleRemoveOption = (fieldId, optionIndex) => {
      const newOptions = normalizedField.options.filter(
         (_, idx) => idx !== optionIndex
      );
      setEditField((prev) => ({ ...prev, options: newOptions }));
      onRemoveOption(fieldId, optionIndex);
   };

   const handleInputFocus = (e) => {
      e.target.select();
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            // Remove onClick={onClose} to disable closing by clicking outside
         />

         {/* Modal */}
         <div
            className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col"
            tabIndex={0}
            onKeyDown={(e) => {
               if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
               }
            }}
         >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                     {getFieldIcon(normalizedField.type)}
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-white">
                        Edit Field
                     </h2>
                     <p className="text-gray-400 text-sm">
                        Configure your form field
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 
                     rounded-lg transition-colors"
               >
                  <FiX className="w-5 h-5" />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
               <div className="space-y-6">
                  {/* Title Field Settings - Show for title fields */}
                  {normalizedField.type === "title" && (
                     <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                        <h3 className="text-lg font-semibold text-white mb-4">
                           Title Settings
                        </h3>
                        <div className="space-y-4">
                           {/* Editable TitleBar value */}
                           <TextInput
                              label="Title Text"
                              value={normalizedField.label}
                              onChange={(value) =>
                                 handleFieldChange({ label: value })
                              }
                              placeholder="Enter title text"
                              width="w-full"
                              onFocus={handleInputFocus}
                           />
                           {/* Live preview */}
                           <TitleBar value={normalizedField.label || "Title"} />
                        </div>
                     </div>
                  )}

                  {/* Regular Field Settings - Show for non-title fields */}
                  {normalizedField.type !== "title" && (
                     <>
                        {/* Basic Settings */}
                        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                           <h3 className="text-lg font-semibold text-white mb-4">
                              Basic Settings
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Field Name */}
                              <TextInput
                                 label="Field Name"
                                 value={normalizedField.name}
                                 onChange={(value) =>
                                    handleFieldChange({ name: value })
                                 }
                                 placeholder="field_name"
                                 helperText="Used as the key in form data"
                                 width="w-full"
                                 onFocus={handleInputFocus}
                              />

                              {/* Field Label */}
                              <TextInput
                                 label="Field Label"
                                 value={normalizedField.label}
                                 onChange={(value) =>
                                    handleFieldChange({ label: value })
                                 }
                                 placeholder="Field Label"
                                 helperText="Displayed above the input"
                                 width="w-full"
                                 onFocus={handleInputFocus}
                              />

                              {/* Placeholder */}
                              <TextInput
                                 label="Placeholder"
                                 value={normalizedField.placeholder}
                                 onChange={(value) =>
                                    handleFieldChange({ placeholder: value })
                                 }
                                 placeholder="Enter placeholder text"
                                 helperText="Hint text inside the input"
                                 width="w-full"
                                 onFocus={handleInputFocus}
                              />

                              {/* TextArea Rows (only for textarea) */}
                              {normalizedField.type === "textarea" && (
                                 <TextInput
                                    label="Rows"
                                    value={normalizedField.rows || 4}
                                    onChange={(value) =>
                                       handleFieldChange({
                                          rows: Number(value),
                                       })
                                    }
                                    placeholder="4"
                                    helperText="Number of visible rows"
                                    width="w-full"
                                    onFocus={handleInputFocus}
                                 />
                              )}
                           </div>
                        </div>

                        {/* Number Field Settings */}
                        {normalizedField.type === "number" && (
                           <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                 Number Validation
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <NumberInput
                                    label="Minimum Value"
                                    value={normalizedField.min}
                                    onChange={(value) =>
                                       handleFieldChange({ min: value })
                                    }
                                    placeholder="Min"
                                    width="w-full"
                                    onFocus={handleInputFocus}
                                 />
                                 <NumberInput
                                    label="Maximum Value"
                                    value={normalizedField.max}
                                    onChange={(value) =>
                                       handleFieldChange({ max: value })
                                    }
                                    placeholder="Max"
                                    width="w-full"
                                    onFocus={handleInputFocus}
                                 />
                                 <NumberInput
                                    label="Step"
                                    value={normalizedField.step}
                                    onChange={(value) =>
                                       handleFieldChange({ step: value })
                                    }
                                    placeholder="1"
                                    helperText="Increment value"
                                    width="w-full"
                                    onFocus={handleInputFocus}
                                 />
                              </div>
                           </div>
                        )}

                        {/* Options for Select/Multiple */}
                        {(normalizedField.type === "select" ||
                           normalizedField.type === "multiple") && (
                           <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                              <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-lg font-semibold text-white">
                                    Options
                                 </h3>
                                 <button
                                    onClick={() =>
                                       handleAddOption(normalizedField.id)
                                    }
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 
                                 text-white rounded-lg transition-colors text-sm"
                                 >
                                    <FiPlus className="w-4 h-4" />
                                    Add Option
                                 </button>
                              </div>
                              {normalizedField.options.length === 0 ? (
                                 <div className="text-center py-8 text-gray-400">
                                    <FiList className="w-8 h-8 mx-auto mb-2" />
                                    <p>No options added yet</p>
                                 </div>
                              ) : (
                                 <div className="space-y-3">
                                    {normalizedField.options.map(
                                       (option, index) => (
                                          <div
                                             key={index}
                                             className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg"
                                          >
                                             <span className="text-gray-400 text-sm font-mono w-8">
                                                {index + 1}
                                             </span>
                                             <TextInput
                                                placeholder="Option Value"
                                                value={option.value}
                                                onChange={(value) =>
                                                   handleUpdateOption(
                                                      normalizedField.id,
                                                      index,
                                                      { value }
                                                   )
                                                }
                                                width="flex-1"
                                                onFocus={handleInputFocus}
                                             />
                                             <TextInput
                                                placeholder="Option Label"
                                                value={option.label}
                                                onChange={(label) =>
                                                   handleUpdateOption(
                                                      normalizedField.id,
                                                      index,
                                                      { label }
                                                   )
                                                }
                                                width="flex-1"
                                                onFocus={handleInputFocus}
                                             />
                                             <button
                                                onClick={() =>
                                                   handleRemoveOption(
                                                      normalizedField.id,
                                                      index
                                                   )
                                                }
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                                      rounded-lg transition-colors"
                                             >
                                                <FiTrash2 className="w-4 h-4" />
                                             </button>
                                          </div>
                                       )
                                    )}
                                 </div>
                              )}
                           </div>
                        )}

                        {/* Additional Settings - Only for input fields */}
                        {normalizedField.type !== "title" && (
                           <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                 Additional Settings
                              </h3>
                              <div className="space-y-4">
                                 {/* Helper Text */}
                                 <TextInput
                                    label="Helper Text"
                                    value={normalizedField.helperText}
                                    onChange={(value) =>
                                       handleFieldChange({ helperText: value })
                                    }
                                    placeholder="Optional helper text"
                                    helperText="Additional guidance for users"
                                    width="w-full"
                                    onFocus={handleInputFocus}
                                 />

                                 {/* Required Toggle */}
                                 <div className="flex items-center gap-3">
                                    <input
                                       type="checkbox"
                                       id="required"
                                       checked={normalizedField.required}
                                       onChange={(e) =>
                                          handleFieldChange({
                                             required: e.target.checked,
                                          })
                                       }
                                       className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 
                                  rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label
                                       htmlFor="required"
                                       className="text-white text-sm font-medium"
                                    >
                                       Required field
                                    </label>
                                 </div>
                              </div>
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
               <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                     text-white rounded-lg transition-colors"
               >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Field
               </button>
               <div className="flex items-center gap-3">
                  <button
                     onClick={onClose}
                     className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                        rounded-lg transition-colors"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSave}
                     className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 
                        text-white rounded-lg transition-colors font-medium"
                  >
                     <FiSave className="w-4 h-4" />
                     Save Changes
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

/********************
 * CANVAS FIELD COMPONENT
 ********************/
const CanvasField = ({
   field,
   onEdit,
   onDelete,
   isDragging = false,
   onDragStart,
   onDragEnd,
   onFieldDragEnter,
   onFieldDragLeave,
   onDrop,
   isSwapTarget = false,
}) => {
   const getWidthLabel = (width) => {
      const labels = {
         full: "100%",
         "three-fourths": "75%",
         half: "50%",
         fourth: "25%",
      };
      return labels[width] || width;
   };

   const fieldInfo = getFieldTypeInfo(field.type);

   const handleDragStart = (e) => {
      e.dataTransfer.setData(
         "application/json",
         JSON.stringify({
            type: "canvas-field",
            fieldId: field.id,
         })
      );
      e.dataTransfer.effectAllowed = "move";
      onDragStart?.(field.id);
   };

   const handleDragEnd = () => {
      onDragEnd?.();
   };

   const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only handle drag enter if we're not dragging this field itself
      if (!isDragging) {
         onFieldDragEnter?.(field.id);
      }
   };

   const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Only trigger leave if we're actually leaving this element
      if (!e.currentTarget.contains(e.relatedTarget)) {
         onFieldDragLeave?.();
      }
   };

   const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Allow dropping only if we're not dragging this field itself
      if (!isDragging) {
         e.dataTransfer.dropEffect = "move";
      }
   };

   const handleDrop = (e) => {
      e.preventDefault();
      // Call the parent's drop handler directly
      onDrop?.(e);
   };

   // Dynamic styling based on field type
   const getFieldStyles = () => {
      if (field.type === "spacer") {
         return {
            container:
               "p-2 border-2 border-dashed rounded-lg bg-gray-800/30 hover:border-purple-500 transition-all duration-200 min-h-[50px]",
            baseBorder: "border-gray-500",
            swapBorder: "border-orange-400 bg-orange-500/20 border-solid",
            icon: <FiMove className="w-4 h-4 text-gray-400 cursor-move" />,
            title: "Spacer Field",
            titleClass: "text-sm font-medium text-gray-300",
            subtitle: `Width: ${getWidthLabel(field.width)}`,
            subtitleClass: "text-xs text-nowrap text-gray-500",
            editColor:
               "text-purple-400 hover:text-purple-300 hover:bg-purple-900/20",
         };
      } else if (field.type === "title") {
         return {
            container:
               "p-2 border rounded-lg bg-blue-900/20 hover:border-blue-500 transition-all duration-200 min-h-[60px]",
            baseBorder: "border-blue-600",
            swapBorder: "border-orange-400 bg-orange-500/20",
            icon: <FiMove className="w-4 h-4 text-gray-400 cursor-move" />,
            title: field.label || "Title Header",
            titleClass: "text-md font-bold text-blue-300",
            subtitle: `Width: ${getWidthLabel(field.width)}`,
            subtitleClass: "text-xs text-nowrap text-gray-400",
            editColor: "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20",
         };
      } else {
         return {
            container:
               "p-2 border rounded-lg bg-gray-700 hover:border-blue-500 transition-all duration-200 min-h-[50px]",
            baseBorder: "border-gray-600",
            swapBorder: "border-orange-400 bg-orange-500/20",
            icon: <FiMove className="w-4 h-4 text-gray-400 cursor-move" />,
            title: fieldInfo.label,
            titleClass: "text-sm font-medium text-white",
            subtitle: `Width: ${getWidthLabel(field.width)}`,
            subtitleClass: "text-xs text-gray-400 text-nowrap",
            editColor: "text-blue-400 hover:text-blue-300 hover:bg-blue-900/20",
         };
      }
   };

   const styles = getFieldStyles();

   const IconComponent =
      fieldInfo.icon && FiIcons[fieldInfo.icon]
         ? FiIcons[fieldInfo.icon]
         : null;

   return (
      <div
         className="relative group w-full"
         draggable
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
         onDragEnter={handleDragEnter}
         onDragLeave={handleDragLeave}
         onDragOver={handleDragOver}
         onDrop={handleDrop}
      >
         <div
            className={`${styles.container} ${
               isDragging ? "opacity-50 scale-95" : ""
            } ${isSwapTarget ? styles.swapBorder : styles.baseBorder}`}
         >
            <div className="flex items-center justify-between">
               <div
                  className={`flex items-center gap-2 ${
                     field.type === "title" ? "flex-1" : ""
                  }`}
               >
                  {styles.icon}
                  <div className={`flex flex-col text-nowrap`}>
                     <span className={styles.titleClass + " whitespace-nowrap"}>
                        {IconComponent && (
                           <IconComponent className="inline-block align-middle mr-1 text-base text-gray-400" />
                        )}
                        {field.label ? field.label : styles.title}
                     </span>
                     <span className={styles.subtitleClass}>
                        {styles.subtitle}
                        {field.required && (
                           <span className="text-red-400 ml-1">*</span>
                        )}
                     </span>
                  </div>
               </div>
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {field.type !== "spacer" && (
                     <button
                        onClick={() => onEdit(field)}
                        className={`p-1 ${styles.editColor} rounded`}
                        title={
                           field.type === "title" ? "Edit title" : "Edit field"
                        }
                     >
                        <FiEdit2 className="w-3 h-3" />
                     </button>
                  )}
                  <button
                     onClick={() => onDelete(field.id)}
                     className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                     title={
                        field.type === "title" ? "Delete title" : "Delete field"
                     }
                  >
                     <FiTrash2 className="w-3 h-3" />
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

/********************
 * FORM CANVAS COMPONENT
 ********************/
const FormCanvas = ({
   fields,
   onAddField,
   onEditField,
   onDeleteField,
   onReorderFields,
}) => {
   const [draggingFieldId, setDraggingFieldId] = useState(null);
   const [draggingRowIndex, setDraggingRowIndex] = useState(null);
   const [rowDropTarget, setRowDropTarget] = useState(null);
   const [showGrid, setShowGrid] = useState(false);
   const [gridDropZone, setGridDropZone] = useState(null);
   const [horizontalDropZone, setHorizontalDropZone] = useState(null);
   const [fieldSwapTarget, setFieldSwapTarget] = useState(null);
   const canvasRef = useRef(null);

   // Handle drag over with grid visualization
   const handleDragOver = useCallback(
      (e) => {
         e.preventDefault();
         e.dataTransfer.dropEffect = "move";
         if (!showGrid && draggingRowIndex === null) {
            setShowGrid(true);
         }

         // Auto-scroll logic
         const SCROLL_MARGIN = 60; // px from bottom to trigger scroll
         const SCROLL_SPEED = 24; // px per event
         const canvas = canvasRef.current;
         if (canvas) {
            const rect = canvas.getBoundingClientRect();
            const mouseY = e.clientY;
            if (mouseY > rect.bottom - SCROLL_MARGIN) {
               canvas.scrollTop += SCROLL_SPEED;
            } else if (mouseY < rect.top + SCROLL_MARGIN) {
               canvas.scrollTop -= SCROLL_SPEED;
            }
         }
      },
      [showGrid, draggingRowIndex]
   );

   // Handle drag enter for grid positioning
   const handleDragEnter = useCallback(
      (e) => {
         e.preventDefault();
         if (draggingRowIndex === null) {
            setShowGrid(true);
         }
      },
      [draggingRowIndex]
   );

   // Handle drag leave
   const handleDragLeave = useCallback((e) => {
      if (!e.currentTarget.contains(e.relatedTarget)) {
         setShowGrid(false);
         setGridDropZone(null);
         setHorizontalDropZone(null);
         setRowDropTarget(null);
      }
   }, []);

   // Handle horizontal drop positioning
   const handleHorizontalDrop = useCallback(
      (sourceIndex, dropZone) => {
         const targetIndex = fields.findIndex(
            (f) => f.id === dropZone.targetFieldId
         );
         if (targetIndex === -1) return;
         let newIndex = targetIndex;
         if (dropZone.position === "right") {
            newIndex = targetIndex + 1;
         }
         if (sourceIndex < newIndex) {
            newIndex--;
         }
         onReorderFields(sourceIndex, newIndex);
      },
      [fields, onReorderFields]
   );

   // Group fields into rows - memoized to prevent dependency issues (moved here to be available for row drag handlers)
   const rows = useMemo(() => {
      return fields.length > 0 ? groupFieldsIntoRows(fields) : [];
   }, [fields]); // Handle field swap within the same row
   const handleFieldSwap = useCallback(
      (sourceFieldId, targetFieldId) => {
         const sourceIndex = fields.findIndex((f) => f.id === sourceFieldId);
         const targetIndex = fields.findIndex((f) => f.id === targetFieldId);
         if (sourceIndex === -1 || targetIndex === -1) {
            return;
         }
         const sourceRow = rows.findIndex((row) =>
            row.some((field) => field.id === sourceFieldId)
         );
         const targetRow = rows.findIndex((row) =>
            row.some((field) => field.id === targetFieldId)
         );
         if (sourceRow !== targetRow) {
            return; // Not in the same row
         }
         const newFields = [...fields];
         const sourceField = newFields[sourceIndex];
         const targetField = newFields[targetIndex];
         newFields[sourceIndex] = { ...targetField };
         newFields[targetIndex] = { ...sourceField };
         onReorderFields(0, 0, newFields);
      },
      [fields, rows, onReorderFields]
   );

   // Handle drop with enhanced positioning
   const handleDrop = useCallback(
      (e, dropIndex = null) => {
         e.preventDefault();
         try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data.type === "palette-field") {
               if (gridDropZone) {
                  onAddField(data.fieldType, dropIndex, {
                     width: gridDropZone.width,
                  });
               } else {
                  onAddField(data.fieldType, dropIndex);
               }
            } else if (data.type === "canvas-field") {
               const sourceIndex = fields.findIndex(
                  (f) => f.id === data.fieldId
               );
               if (sourceIndex !== -1) {
                  if (fieldSwapTarget) {
                     handleFieldSwap(data.fieldId, fieldSwapTarget.fieldId);
                  } else if (gridDropZone) {
                     const field = fields[sourceIndex];
                     const updatedField = {
                        ...field,
                        width: gridDropZone.width,
                     };
                     const newFields = [...fields];
                     newFields[sourceIndex] = updatedField;
                     if (dropIndex !== null && sourceIndex !== dropIndex) {
                        const [movedField] = newFields.splice(sourceIndex, 1);
                        const insertIndex =
                           sourceIndex < dropIndex ? dropIndex - 1 : dropIndex;
                        newFields.splice(insertIndex, 0, movedField);
                     }
                     onReorderFields(0, 0, newFields); // Special case - pass the full array
                  } else if (horizontalDropZone) {
                     handleHorizontalDrop(sourceIndex, horizontalDropZone);
                  } else if (dropIndex !== null && sourceIndex !== dropIndex) {
                     onReorderFields(sourceIndex, dropIndex);
                  }
               }
            }
         } catch {
            // Silently handle drop errors
         }
         setShowGrid(false);
         setGridDropZone(null);
         setHorizontalDropZone(null);
         setDraggingFieldId(null);
         setRowDropTarget(null);
         setFieldSwapTarget(null);
      },
      [
         fields,
         gridDropZone,
         horizontalDropZone,
         fieldSwapTarget,
         onAddField,
         onReorderFields,
         handleHorizontalDrop,
         handleFieldSwap,
      ]
   );

   // Handle grid positioning for visual feedback
   const handleGridPosition = useCallback((e, rowIndex, sectorIndex, width) => {
      e.preventDefault();
      setGridDropZone({
         rowIndex,
         sectorPosition: sectorIndex,
         width,
         rect: e.currentTarget.getBoundingClientRect(),
      });
   }, []);

   const handleFieldDragStart = useCallback((fieldId) => {
      setDraggingFieldId(fieldId);
      setShowGrid(true);
   }, []);

   const handleFieldDragEnd = useCallback(() => {
      setDraggingFieldId(null);
      setShowGrid(false);
      setGridDropZone(null);
      setHorizontalDropZone(null);
      setRowDropTarget(null);
      setFieldSwapTarget(null);
   }, []);

   const handleFieldDragEnter = useCallback(
      (targetFieldId) => {
         if (draggingFieldId && draggingFieldId !== targetFieldId) {
            const sourceField = fields.find((f) => f.id === draggingFieldId);
            const targetField = fields.find((f) => f.id === targetFieldId);
            if (sourceField && targetField) {
               const sourceRow = rows.findIndex((row) =>
                  row.some((field) => field.id === draggingFieldId)
               );
               const targetRow = rows.findIndex((row) =>
                  row.some((field) => field.id === targetFieldId)
               );
               if (sourceRow === targetRow && sourceRow !== -1) {
                  setFieldSwapTarget({ fieldId: targetFieldId });
                  setShowGrid(false);
                  setGridDropZone(null);
               }
            }
         }
      },
      [draggingFieldId, fields, rows]
   );

   const handleFieldDragLeave = useCallback(() => {
      setFieldSwapTarget(null);
      if (draggingFieldId && draggingRowIndex === null) {
         setShowGrid(true);
      }
   }, [draggingFieldId, draggingRowIndex]);

   // Handle row dragging
   const handleRowDragStart = useCallback((e, rowIndex) => {
      setDraggingRowIndex(rowIndex);
      setShowGrid(false);
      e.dataTransfer.setData(
         "application/json",
         JSON.stringify({
            type: "canvas-row",
            rowIndex: rowIndex,
         })
      );
      e.dataTransfer.effectAllowed = "move";
   }, []);

   const handleRowDragEnd = useCallback(() => {
      setDraggingRowIndex(null);
      setRowDropTarget(null);
   }, []);

   const handleRowDrop = useCallback(
      (e, targetRowIndex) => {
         e.preventDefault();
         e.stopPropagation();
         try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data.type === "canvas-row" && data.rowIndex !== undefined) {
               const sourceRowIndex = data.rowIndex;
               if (sourceRowIndex !== targetRowIndex) {
                  let sourceStartIndex = 0;
                  let targetStartIndex = 0;
                  for (let i = 0; i < sourceRowIndex; i++) {
                     sourceStartIndex += rows[i].length;
                  }
                  for (let i = 0; i < targetRowIndex; i++) {
                     targetStartIndex += rows[i].length;
                  }
                  const sourceRow = rows[sourceRowIndex];
                  const newFields = [...fields];
                  const movedFields = newFields.splice(
                     sourceStartIndex,
                     sourceRow.length
                  );
                  const adjustedTargetIndex =
                     sourceRowIndex < targetRowIndex
                        ? targetStartIndex - sourceRow.length
                        : targetStartIndex;
                  newFields.splice(adjustedTargetIndex, 0, ...movedFields);
                  onReorderFields(0, 0, newFields);
               }
            }
         } catch (error) {
            console.warn("Row drop error:", error);
         }
         setDraggingRowIndex(null);
         setRowDropTarget(null);
      },
      [rows, fields, onReorderFields]
   );

   // Render row with available spaces in 4-section grid
   const renderRowWithAvailableSpaces = useCallback(
      (row, rowIndex) => {
         const sections = [null, null, null, null]; // 4 sections: 25%, 50%, 75%, 100%
         const widthToSections = {
            fourth: 1, // 25% takes 1 section
            half: 2, // 50% takes 2 sections
            "three-fourths": 3, // 75% takes 3 sections
            full: 4, // 100% takes 4 sections
         };
         let currentSection = 0;
         row.forEach((field) => {
            const sectionCount = widthToSections[field.width] || 4;
            for (let i = 0; i < sectionCount && currentSection < 4; i++) {
               sections[currentSection] = {
                  field,
                  sectionIndex: i,
                  totalSections: sectionCount,
               };
               currentSection++;
            }
         });
         const getAvailableWidthForSection = (sectionIndex, sections) => {
            let consecutiveEmpty = 0;
            for (let i = sectionIndex; i < 4; i++) {
               if (!sections[i]) {
                  consecutiveEmpty++;
               } else {
                  break;
               }
            }
            if (consecutiveEmpty >= 4) return "full"; // 100%
            if (consecutiveEmpty >= 3) return "three-fourths"; // 75%
            if (consecutiveEmpty >= 2) return "half"; // 50%
            if (consecutiveEmpty >= 1) return "fourth"; // 25%
            return null; // No space available
         };
         const getSectionSpanClass = (sectionCount) => {
            switch (sectionCount) {
               case 1:
                  return "col-span-1";
               case 2:
                  return "col-span-2";
               case 3:
                  return "col-span-3";
               case 4:
                  return "col-span-4";
               default:
                  return "col-span-1";
            }
         };
         const getWidthLabel = (width) => {
            const labels = {
               fourth: "25%",
               half: "50%",
               "three-fourths": "75%",
               full: "100%",
            };
            return labels[width] || width;
         };
         return sections
            .map((section, sectionIndex) => {
               if (section && section.sectionIndex === 0) {
                  const field = section.field;
                  const sectionSpan = section.totalSections;
                  return (
                     <div
                        key={field.id}
                        className={`relative ${getSectionSpanClass(
                           sectionSpan
                        )}`}
                     >
                        <CanvasField
                           field={field}
                           onEdit={onEditField}
                           onDelete={onDeleteField}
                           isDragging={draggingFieldId === field.id}
                           onDragStart={handleFieldDragStart}
                           onDragEnd={handleFieldDragEnd}
                           onFieldDragEnter={handleFieldDragEnter}
                           onFieldDragLeave={handleFieldDragLeave}
                           onDrop={handleDrop}
                           isSwapTarget={fieldSwapTarget?.fieldId === field.id}
                        />
                     </div>
                  );
               } else if (!section && showGrid && draggingRowIndex === null) {
                  const availableWidth = getAvailableWidthForSection(
                     sectionIndex,
                     sections
                  );
                  if (availableWidth) {
                     return (
                        <div
                           key={`available-${rowIndex}-${sectionIndex}`}
                           className={`border-2 border-dashed rounded transition-all duration-200 
                     cursor-pointer flex items-center justify-center pointer-events-auto min-h-[50px]
                     ${
                        gridDropZone?.rowIndex === rowIndex &&
                        gridDropZone?.sectorPosition === sectionIndex
                           ? "border-green-400 bg-green-500/20"
                           : "border-orange-400 bg-orange-400/20 hover:bg-orange-400/30"
                     }`}
                           onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleGridPosition(
                                 e,
                                 rowIndex,
                                 sectionIndex,
                                 availableWidth
                              );
                           }}
                           onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                           }}
                           onDrop={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              let insertIndex = 0;
                              for (let i = 0; i < rowIndex; i++) {
                                 insertIndex += rows[i].length;
                              }
                              const fieldsBeforeSection = sections
                                 .slice(0, sectionIndex)
                                 .filter(
                                    (s) => s && s.sectionIndex === 0
                                 ).length;
                              insertIndex += fieldsBeforeSection;
                              handleDrop(e, insertIndex);
                           }}
                        >
                           <span className="text-orange-600 font-semibold text-sm pointer-events-none">
                              {getWidthLabel(availableWidth)}
                           </span>
                        </div>
                     );
                  }
               } else if (!section) {
                  // Empty space when not dragging
                  return (
                     <div
                        key={`empty-${rowIndex}-${sectionIndex}`}
                        className="min-h-[50px]"
                     />
                  );
               }
               return null;
            })
            .filter(Boolean);
      },
      [
         showGrid,
         draggingRowIndex,
         gridDropZone,
         draggingFieldId,
         fieldSwapTarget,
         onEditField,
         onDeleteField,
         handleFieldDragStart,
         handleFieldDragEnd,
         handleFieldDragEnter,
         handleFieldDragLeave,
         handleGridPosition,
         handleDrop,
         rows,
      ]
   );

   if (fields.length === 0) {
      return (
         <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-700">
               <h3 className="text-lg font-semibold text-white">Form Canvas</h3>
               <p className="text-sm text-gray-400">
                  Drag fields here to build your form
               </p>
            </div>
            <div
               ref={canvasRef}
               className="flex-1 flex items-center justify-center p-8 pl-12 relative"
               onDragOver={handleDragOver}
               onDragEnter={handleDragEnter}
               onDrop={(e) => handleDrop(e, 0)}
               onDragLeave={handleDragLeave}
            >
               {/* Grid overlay for empty canvas */}
               {showGrid && (
                  <div className="absolute inset-0">
                     <GridOverlay
                        fields={[]}
                        onGridPosition={handleGridPosition}
                        gridDropZone={gridDropZone}
                        onDrop={handleDrop}
                     />
                  </div>
               )}
               <div className="text-center">
                  <div
                     className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full 
                        flex items-center justify-center"
                  >
                     <FiPlus className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-medium text-white mb-2">
                     Start Building Your Form
                  </h4>
                  <p className="text-gray-400 mb-4 max-w-md">
                     Drag field types from the left panel to create your form.
                     Fields will show possible positions on the grid.
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                     <div>
                        • Drag fields to see grid positioning (25%, 50%, 75%,
                        100%)
                     </div>
                     <div>• Drop fields horizontally to place side by side</div>
                     <div>
                        • Hover over rows to see drag handle for reordering
                     </div>
                     <div>• Click fields to edit their properties</div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-semibold text-white">
                     Form Canvas
                  </h3>
                  <p className="text-sm text-gray-400">
                     {fields.length} field{fields.length !== 1 ? "s" : ""} in{" "}
                     {rows.length} row{rows.length !== 1 ? "s" : ""}
                  </p>
               </div>
            </div>
         </div>

         <div
            ref={canvasRef}
            className="flex-1 p-4 pl-12 overflow-y-auto custom-scrollbar relative"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
         >
            <div className="relative z-20 flex flex-col gap-3">
               {rows.map((row, rowIndex) => (
                  <div className="relative" key={`row-container-${rowIndex}`}>
                     {/* Drop zone above each row (except first) */}
                     {draggingRowIndex !== null &&
                        draggingRowIndex !== rowIndex && (
                           <div
                              className={`absolute -left-8 top-0 w-8 h-full z-40 bg-blue-400/20 border border-blue-400/50 rounded transition-all
                       ${
                          rowDropTarget === `before-${rowIndex}` &&
                          "border-blue-400 bg-blue-400/60"
                       }
                    `}
                              onDragOver={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 setRowDropTarget(`before-${rowIndex}`);
                              }}
                              onDrop={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 handleRowDrop(e, rowIndex);
                              }}
                           ></div>
                        )}

                     <div
                        className={`relative group ${
                           draggingRowIndex === rowIndex
                              ? "opacity-30 scale-95"
                              : ""
                        } ${
                           rowDropTarget === rowIndex
                              ? "ring-2 ring-blue-400 rounded-lg"
                              : ""
                        } transition-all duration-200`}
                     >
                        {/* Row drag handle */}
                        <div
                           className="absolute -left-8 top-0 bottom-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-30"
                           draggable
                           onDragStart={(e) => handleRowDragStart(e, rowIndex)}
                           onDragEnd={handleRowDragEnd}
                           title="Drag to reorder row"
                        >
                           <div
                              className={`p-2 h-full grid place-items-center rounded cursor-grab active:cursor-grabbing border shadow-lg transition-colors
                    ${
                       draggingRowIndex === rowIndex
                          ? "bg-blue-600 border-blue-500"
                          : "bg-gray-700 hover:bg-gray-600 border-gray-600"
                    }`}
                           >
                              <FiMenu
                                 className={`w-4 h-4 ${
                                    draggingRowIndex === rowIndex
                                       ? "text-white"
                                       : "text-gray-400"
                                 }`}
                              />
                           </div>
                           {draggingRowIndex === rowIndex && (
                              <div className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded font-medium">
                                 Dragging
                              </div>
                           )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 relative">
                           {renderRowWithAvailableSpaces(row, rowIndex)}
                        </div>
                     </div>
                  </div>
               ))}
            </div>

            {/* Grid overlay - positioned after all content, but don't show during row dragging */}
            {showGrid && draggingRowIndex === null && (
               <GridOverlay
                  rows={rows}
                  fields={fields}
                  onGridPosition={handleGridPosition}
                  gridDropZone={gridDropZone}
                  onDrop={handleDrop}
               />
            )}
         </div>
      </div>
   );
};

// Grid overlay component for visual positioning
const GridOverlay = ({
   rows = [],
   fields = [],
   onGridPosition,
   gridDropZone,
   onDrop,
}) => {
   const widthOptions = [
      { value: "full", label: "100%", cols: 4, zone: 3 },
      { value: "three-fourths", label: "75%", cols: 3, zone: 2 },
      { value: "half", label: "50%", cols: 2, zone: 1 },
      { value: "fourth", label: "25%", cols: 1, zone: 0 },
   ];

   return (
      <div className="pointer-events-none">
         {/* Always show new row grid at the bottom - 4 equal zones with drag functionality */}
         <div className="mt-6 border-t-2 border-dashed border-blue-400 pt-4 bg-gray-800/30 rounded-lg p-4">
            <div className="text-sm text-blue-300 mb-3 text-center font-medium">
               Drop here to add new row
            </div>
            <div className="grid grid-cols-4 gap-4 h-16">
               {widthOptions.map((width, index) => (
                  <div
                     key={width.value}
                     className={`border-2 border-dashed rounded-lg 
                 transition-all duration-200 cursor-pointer flex items-center justify-center pointer-events-auto
                 ${
                    gridDropZone?.rowIndex === rows.length &&
                    gridDropZone?.width === width.value
                       ? "border-green-400 bg-green-500/30 scale-105"
                       : "border-blue-400 bg-blue-400/15 hover:bg-blue-400/25 hover:border-blue-300"
                 }`}
                     onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onGridPosition(e, rows.length, index, width.value);
                     }}
                     onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                     }}
                     onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDrop(e, fields.length);
                     }}
                  >
                     <span className="text-blue-300 font-semibold text-lg pointer-events-none">
                        {width.label}
                     </span>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
};

/********************
 * FORM PREVIEW COMPONENT
 ********************/
const FormPreview = ({ fields, formData, onFormDataChange, onBack }) => {
   // Submit handler (can be customized or just prevent default for preview)
   const handleSubmit = (data) => {
      console.log("Form submitted with data:", data);
   };

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
               onClick={onBack}
               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
               ← Back to Editor
            </button>
            <h3 className="text-lg font-semibold text-white">Form Preview</h3>
         </div>

         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
               <CustomForm
                  schema={fields}
                  onSubmit={handleSubmit}
                  externalData={formData}
                  onExternalChange={onFormDataChange}
               />
            </div>
         </div>
      </div>
   );
};

/********************
 * SCHEMA PREVIEW COMPONENT
 ********************/
const SchemaPreview = ({ fields, onBack }) => {
   const { schema, widths } = makeSchemaWithWidths(fields);

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
               onClick={onBack}
               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
               ← Back to Editor
            </button>
            <h3 className="text-lg font-semibold text-white">Form Schema</h3>
         </div>

         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <pre className="bg-gray-800 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
               {JSON.stringify({ schema, widths }, null, 2)}
            </pre>
         </div>
      </div>
   );
};

/* ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
 *
 *
 * FormBuilder Component
 * Modern FormMaker - Redesigned with left-right layout
 * Left: Field palette with draggable field types
 * Right: Canvas for placing and arranging fields (1-4 items per row)
 *
 *
 * ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
const FormBuilder = ({ isOpen, onClose, onSaveSchema, schema }) => {
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

   // If schema prop is provided, initialize fields from schema (for editing)
   useEffect(() => {
      if (schema && Array.isArray(schema)) {
         setFields(schema);
      }
   }, [schema, isOpen]);

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
      const schema = makeSchemaWithWidths(fields);
      const dataStr = JSON.stringify(schema, null, 2);
      const dataUri =
         "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = "form-schema.json";
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
   }, [fields]);

   // Save form (now calls onSaveSchema if provided)
   const handleSave = useCallback(() => {
      if (onSaveSchema) {
         onSaveSchema(makeSchemaWithWidths(fields));
      }
      // Optionally close the modal or show a message here
   }, [fields, onSaveSchema]);

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
            <div className="relative bg-gray-900 w-full max-w-5xl mx-auto my-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col overflow-hidden">
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
                                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                              >
                                 <FiEye className="w-4 h-4" />
                                 {showPreview ? "Hide Preview" : "Preview"}
                              </button>
                              <button
                                 onClick={() => setShowExport(!showExport)}
                                 className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                              >
                                 <FiCode className="w-4 h-4" />
                                 Schema
                              </button>
                              <button
                                 onClick={handleExport}
                                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                              >
                                 <FiDownload className="w-4 h-4" />
                                 Export
                              </button>
                              <button
                                 onClick={handleSave}
                                 className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                              >
                                 <FiSave className="w-4 h-4" />
                                 Save
                              </button>
                           </>
                        )}
                        <button
                           onClick={onClose}
                           className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
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

export default FormBuilder;
