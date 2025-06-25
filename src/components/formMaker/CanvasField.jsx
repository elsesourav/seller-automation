import * as FiIcons from "react-icons/fi";
import { FiEdit2, FiMove, FiTrash2 } from "react-icons/fi";
import { getFieldTypeInfo } from "../../utils/formMaker";

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

export default CanvasField;
