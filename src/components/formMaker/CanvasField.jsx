import { FiEdit2, FiMove, FiTrash2 } from "react-icons/fi";
import { getFieldTypeInfo } from "../../utils/formMaker";

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

   if (field.type === "spacer") {
      return (
         <div
            className="relative group w-full"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            <div
               className={`p-2 border-2 border-dashed border-gray-500 rounded-lg bg-gray-800/30 
                           hover:border-purple-500 transition-all duration-200 min-h-[50px]
                           ${isDragging ? "opacity-50 scale-95" : ""}`}
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <FiMove className="w-4 h-4 text-gray-400 cursor-move" />
                     <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-300">
                           Spacer Field
                        </span>
                        <span className="text-xs text-gray-500">
                           Width: {getWidthLabel(field.width)} • Empty space
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={() => onEdit(field)}
                        className="p-1 text-purple-400 hover:text-purple-300 
                                 hover:bg-purple-900/20 rounded"
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
            </div>
         </div>
      );
   }

   if (field.type === "title") {
      return (
         <div
            className="relative group w-full"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
         >
            <div
               className={`p-3 border border-blue-600 rounded-lg bg-blue-900/20 
                           hover:border-blue-500 transition-all duration-200 min-h-[60px]
                           ${isDragging ? "opacity-50 scale-95" : ""}`}
            >
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                     <FiMove className="w-4 h-4 text-gray-400 cursor-move" />
                     <div className="flex flex-col flex-1">
                        <span className="text-lg font-bold text-blue-300">
                           {field.label || "Title Header"}
                        </span>
                        <span className="text-xs text-gray-400">
                           Width: {getWidthLabel(field.width)} • Header title
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        onClick={() => onEdit(field)}
                        className="p-1 text-blue-400 hover:text-blue-300 
                                 hover:bg-blue-900/20 rounded"
                        title="Edit title"
                     >
                        <FiEdit2 className="w-3 h-3" />
                     </button>
                     <button
                        onClick={() => onDelete(field.id)}
                        className="p-1 text-red-400 hover:text-red-300 
                                 hover:bg-red-900/20 rounded"
                        title="Delete title"
                     >
                        <FiTrash2 className="w-3 h-3" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div
         className="relative group w-full"
         draggable
         onDragStart={handleDragStart}
         onDragEnd={handleDragEnd}
      >
         <div
            className={`p-2 border border-gray-600 rounded-lg bg-gray-700 
                        hover:border-blue-500 transition-all duration-200 min-h-[50px]
                        ${isDragging ? "opacity-50 scale-95" : ""}`}
         >
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                  <FiMove className="w-4 h-4 text-gray-400 cursor-move" />
                  <div className="flex flex-col">
                     <span className="text-sm font-medium text-white">
                        {fieldInfo.label}
                     </span>
                     <span className="text-xs text-gray-400">
                        Width: {getWidthLabel(field.width)}
                        {field.required && (
                           <span className="text-red-400 ml-1">*</span>
                        )}
                     </span>
                  </div>
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
         </div>
      </div>
   );
};

const getWidthLabel = (width) => {
   const labels = {
      full: "Full (100%)",
      "three-fourths": "3/4 (75%)",
      half: "1/2 (50%)",
      fourth: "1/4 (25%)",
   };
   return labels[width] || width;
};

export default CanvasField;
