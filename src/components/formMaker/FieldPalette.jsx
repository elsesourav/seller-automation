import {
   FiAlignCenter,
   FiBox,
   FiCalendar,
   FiChevronDown,
   FiHash,
   FiList,
   FiMinus,
   FiType,
} from "react-icons/fi";
import { FIELD_TYPES } from "../../utils/formMaker";

const FIELD_ICONS = {
   FiType: FiType,
   FiAlignCenter: FiAlignCenter,
   FiHash: FiHash,
   FiCalendar: FiCalendar,
   FiChevronDown: FiChevronDown,
   FiList: FiList,
   FiMinus: FiMinus,
   FiBox: FiBox,
};

/**
 * Left sidebar containing draggable field types
 */
const FieldPalette = () => {
   const handleDragStart = (e, fieldType) => {
      e.dataTransfer.setData(
         "application/json",
         JSON.stringify({
            type: "palette-field",
            fieldType: fieldType.value,
         })
      );
      e.dataTransfer.effectAllowed = "copy";

      // Add visual feedback
      e.target.style.opacity = "0.7";
   };

   const handleDragEnd = (e) => {
      // Reset visual feedback
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
                     className="p-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 
                              rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 
                              hover:border-blue-500 group transform hover:scale-[1.02]"
                  >
                     <div className="flex items-center gap-3">
                        <div
                           className="p-2 bg-gray-600 group-hover:bg-blue-600 
                                      rounded-md transition-colors field-palette-icon"
                        >
                           <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <div>
                           <div className="text-sm font-medium text-white">
                              {fieldType.label}
                           </div>
                           <div className="text-xs text-gray-400">
                              {getFieldDescription(fieldType.value)}
                           </div>
                        </div>
                     </div>

                     {/* Drag indicator */}
                     <div className="mt-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="text-xs text-blue-400 font-medium">
                           ⇈ Drag to canvas
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
};

const getFieldDescription = (type) => {
   const descriptions = {
      text: "Single line text input",
      title: "Header title for sections",
      number: "Numeric input with validation",
      date: "Date picker input",
      select: "Dropdown selection",
      multiple: "Multiple choice options",
      spacer: "Empty space for layout",
   };
   return descriptions[type] || "Form field";
};

export default FieldPalette;
