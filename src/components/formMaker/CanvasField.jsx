import { FiEdit2, FiMove, FiTrash2 } from "react-icons/fi";
import { getFieldTypeInfo, getFieldWidthClass } from "../../utils/formMaker";

/**
 * Individual field component rendered in the canvas
 */
const CanvasField = ({
   field,
   onEdit,
   onDelete,
   isDragging = false,
   onDragStart,
   onDragEnd,
}) => {
   const fieldInfo = getFieldTypeInfo(field.type);
   const widthClass = getFieldWidthClass(field.width);

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

   if (field.type === "hr") {
      return (
         <div
            className={`${widthClass} relative group`}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            <div
               className={`p-3 border border-gray-600 rounded-lg bg-gray-700 
                           hover:border-blue-500 transition-all duration-200 
                           ${isDragging ? "opacity-50 scale-95" : ""}`}
            >
               <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <FiMove className="w-4 h-4 text-gray-400 cursor-move" />
                     <span className="text-sm font-medium text-white">
                        Horizontal Line
                     </span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={() => onEdit(field)}
                        className="p-1 text-blue-400 hover:text-blue-300 
                                 hover:bg-blue-900/20 rounded"
                        title="Edit field"
                     >
                        <FiEdit2 className="w-3 h-3" />
                     </button>
                     <button
                        onClick={() => onDelete(field.id)}
                        className="p-1 text-red-400 hover:text-red-300 
                                 hover:bg-red-900/20 rounded"
                        title="Delete field"
                     >
                        <FiTrash2 className="w-3 h-3" />
                     </button>
                  </div>
               </div>
               <hr className="border-gray-500" />
            </div>
         </div>
      );
   }

   return (
      <div
         className={`${widthClass} relative group`}
         draggable
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
      >
         <div
            className={`p-3 border border-gray-600 rounded-lg bg-gray-700 
                        hover:border-blue-500 transition-all duration-200 
                        ${isDragging ? "opacity-50 scale-95" : ""}`}
         >
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center gap-2">
                  <FiMove className="w-4 h-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium text-white">
                     {field.label || fieldInfo.label}
                  </span>
                  {field.required && (
                     <span className="text-red-400 text-xs">*</span>
                  )}
               </div>
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                     onClick={() => onEdit(field)}
                     className="p-1 text-blue-400 hover:text-blue-300 
                              hover:bg-blue-900/20 rounded"
                     title="Edit field"
                  >
                     <FiEdit2 className="w-3 h-3" />
                  </button>
                  <button
                     onClick={() => onDelete(field.id)}
                     className="p-1 text-red-400 hover:text-red-300 
                              hover:bg-red-900/20 rounded"
                     title="Delete field"
                  >
                     <FiTrash2 className="w-3 h-3" />
                  </button>
               </div>
            </div>

            <div className="space-y-2">
               {renderFieldPreview(field)}

               {field.helperText && (
                  <p className="text-xs text-gray-400">{field.helperText}</p>
               )}

               <div className="flex gap-2 text-xs text-gray-500">
                  <span>Type: {fieldInfo.label}</span>
                  <span>•</span>
                  <span>Width: {getWidthLabel(field.width)}</span>
                  {field.name && (
                     <>
                        <span>•</span>
                        <span>Name: {field.name}</span>
                     </>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

const renderFieldPreview = (field) => {
   switch (field.type) {
      case "text":
         return (
            <input
               type="text"
               placeholder={field.placeholder || "Enter text..."}
               className="w-full px-3 py-2 bg-gray-600 border border-gray-500 
                        rounded text-white text-sm pointer-events-none"
               disabled
            />
         );

      case "number":
         return (
            <input
               type="number"
               placeholder={field.placeholder || "Enter number..."}
               min={field.min}
               max={field.max}
               step={field.step}
               className="w-full px-3 py-2 bg-gray-600 border border-gray-500 
                        rounded text-white text-sm pointer-events-none"
               disabled
            />
         );

      case "date":
         return (
            <input
               type="date"
               className="w-full px-3 py-2 bg-gray-600 border border-gray-500 
                        rounded text-white text-sm pointer-events-none"
               disabled
            />
         );

      case "select":
         return (
            <select
               className="w-full px-3 py-2 bg-gray-600 border border-gray-500 
                        rounded text-white text-sm pointer-events-none"
               disabled
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
         );

      case "multiple":
         return (
            <div className="space-y-1">
               {field.options?.slice(0, 3).map((option, index) => (
                  <label
                     key={index}
                     className="flex items-center gap-2 text-sm text-gray-300"
                  >
                     <input
                        type="checkbox"
                        className="rounded bg-gray-600 border-gray-500 pointer-events-none"
                        disabled
                     />
                     {option.label}
                  </label>
               ))}
               {field.options?.length > 3 && (
                  <div className="text-xs text-gray-400">
                     +{field.options.length - 3} more options
                  </div>
               )}
            </div>
         );

      default:
         return (
            <div className="text-sm text-gray-400 italic">
               Field preview not available
            </div>
         );
   }
};

const getWidthLabel = (width) => {
   const labels = {
      full: "Full",
      "three-fourths": "3/4",
      half: "1/2",
      fourth: "1/4",
   };
   return labels[width] || width;
};

export default CanvasField;
