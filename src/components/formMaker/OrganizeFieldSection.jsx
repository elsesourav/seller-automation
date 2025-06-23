import {
   FiCalendar,
   FiChevronDown,
   FiColumns,
   FiEdit2,
   FiGrid,
   FiHash,
   FiInfo,
   FiList,
   FiMaximize2,
   FiMinus,
   FiMove,
   FiPlus,
   FiTrash2,
   FiType,
} from "react-icons/fi";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import {
   createNewField,
   getFieldTypeInfo,
   WIDTH_OPTIONS,
} from "../../utils/formMaker";

const OrganizeFieldSection = ({
   fields,
   setFields,
   setEditingField,
   removeField,
}) => {
   const {
      isDragging,
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      isItemDragged,
      isDragTarget,
   } = useDragAndDrop(fields, setFields);

   const handleAddHR = () => {
      const newHR = createNewField(fields.length, "hr");
      setFields([...fields, newHR]);
   };

   const updateFieldWidth = (fieldId, width) => {
      setFields(
         fields.map((field) =>
            field.id === fieldId ? { ...field, width } : field
         )
      );
   };

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

   if (fields.length === 0) {
      return (
         <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
               <FiMove className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
               No Fields to Organize
            </h3>
            <p className="text-gray-500 mb-6">
               Add some fields first to start organizing them
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-xl font-bold text-white mb-2">
                  Organize Fields
               </h3>
               <p className="text-gray-400">
                  Drag and drop to reorder, adjust widths and spacing
               </p>
            </div>
            <button
               onClick={handleAddHR}
               className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 
                        text-white rounded-lg transition-colors"
            >
               <FiMinus className="w-4 h-4" />
               Add Divider
            </button>
         </div>

         {/* Instructions */}
         <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
               <FiInfo className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
               <div>
                  <p className="text-blue-300 font-medium mb-1">
                     Drag & Drop Instructions
                  </p>
                  <ul className="text-blue-300/80 text-sm space-y-1">
                     <li>• Drag the grip handle to reorder fields</li>
                     <li>• Use width buttons to control field sizing</li>
                     <li>• Drop zones appear when dragging</li>
                  </ul>
               </div>
            </div>
         </div>

         {/* Fields List */}
         <div className="space-y-3">
            {/* Drop zone at beginning */}
            {isDragging && (
               <div
                  onDragOver={handleDragOver}
                  onDragEnter={(e) => handleDragEnter(e, 0)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 0)}
                  className={`h-12 rounded-lg border-2 border-dashed transition-all duration-200 
                           flex items-center justify-center ${
                              isDragTarget(0)
                                 ? "border-blue-500 bg-blue-500/10 shadow-lg"
                                 : "border-gray-600 bg-gray-700/20"
                           }`}
               >
                  <div className="flex items-center gap-2 text-gray-400">
                     <FiPlus className="w-4 h-4" />
                     <span className="text-sm font-medium">
                        Drop at beginning
                     </span>
                  </div>
               </div>
            )}

            {fields.map((field, index) => (
               <div key={field.id}>
                  <div
                     draggable
                     onDragStart={(e) => handleDragStart(e, field.id)}
                     onDragEnd={handleDragEnd}
                     className={`group relative bg-gray-800/50 rounded-xl border transition-all duration-200 ${
                        isItemDragged(field.id)
                           ? "border-blue-500 shadow-lg scale-95 opacity-50"
                           : "border-gray-700 hover:border-gray-600 hover:shadow-md"
                     }`}
                  >
                     {/* Drag Handle */}
                     <div className="absolute left-3 top-1/2 transform -translate-y-1/2 cursor-move">
                        <div className="flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                           {[...Array(6)].map((_, i) => (
                              <div
                                 key={i}
                                 className="w-1 h-1 bg-gray-400 rounded-full"
                              />
                           ))}
                        </div>
                     </div>

                     {/* Field Content */}
                     <div className="pl-12 pr-4 py-4">
                        {field.type === "hr" ? (
                           // HR Field
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                 <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                    <FiMinus className="w-4 h-4 text-gray-400" />
                                 </div>
                                 <div className="flex-1">
                                    <h4 className="text-white font-medium">
                                       Horizontal Divider
                                    </h4>
                                    <div className="h-px bg-gray-600 mt-2" />
                                 </div>
                              </div>
                              <button
                                 onClick={() => removeField(field.id)}
                                 className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                                          rounded-lg transition-colors"
                              >
                                 <FiTrash2 className="w-4 h-4" />
                              </button>
                           </div>
                        ) : (
                           // Regular Field
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                 <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                    {getFieldIcon(field.type)}
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <h4 className="text-white font-medium truncate">
                                       {field.label}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-xs text-gray-400">
                                          {getFieldTypeInfo(field.type).label}
                                       </span>
                                       <span className="text-xs text-blue-400">
                                          {
                                             WIDTH_OPTIONS.find(
                                                (w) => w.value === field.width
                                             )?.label
                                          }
                                       </span>
                                    </div>
                                 </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1">
                                 {/* Width Controls */}
                                 {WIDTH_OPTIONS.map((widthOption) => (
                                    <button
                                       key={widthOption.value}
                                       onClick={() =>
                                          updateFieldWidth(
                                             field.id,
                                             widthOption.value
                                          )
                                       }
                                       className={`p-2 rounded-lg transition-colors relative group ${
                                          field.width === widthOption.value
                                             ? "bg-blue-500 text-white"
                                             : "text-gray-400 hover:text-white hover:bg-gray-700"
                                       }`}
                                       title={`${widthOption.label} (${widthOption.fraction})`}
                                    >
                                       {widthOption.value === "full" && (
                                          <FiMaximize2 className="w-4 h-4" />
                                       )}
                                       {widthOption.value === "half" && (
                                          <FiColumns className="w-4 h-4" />
                                       )}
                                       {widthOption.value === "third" && (
                                          <FiGrid className="w-4 h-4" />
                                       )}
                                       {widthOption.value === "fourth" && (
                                          <svg
                                             className="w-4 h-4"
                                             fill="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <rect
                                                x="1"
                                                y="6"
                                                width="4"
                                                height="12"
                                                rx="1"
                                             />
                                             <rect
                                                x="7"
                                                y="6"
                                                width="4"
                                                height="12"
                                                rx="1"
                                             />
                                             <rect
                                                x="13"
                                                y="6"
                                                width="4"
                                                height="12"
                                                rx="1"
                                             />
                                             <rect
                                                x="19"
                                                y="6"
                                                width="4"
                                                height="12"
                                                rx="1"
                                             />
                                          </svg>
                                       )}
                                       {/* Fraction label */}
                                       <span
                                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 
                                                      text-xs text-gray-500 opacity-0 group-hover:opacity-100 
                                                      transition-opacity duration-200 whitespace-nowrap"
                                       >
                                          {widthOption.fraction}
                                       </span>
                                    </button>
                                 ))}

                                 {/* Edit Button */}
                                 <button
                                    onClick={() => setEditingField(field.id)}
                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 
                                             rounded-lg transition-colors"
                                 >
                                    <FiEdit2 className="w-4 h-4" />
                                 </button>

                                 {/* Delete Button */}
                                 <button
                                    onClick={() => removeField(field.id)}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                                             rounded-lg transition-colors"
                                 >
                                    <FiTrash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Drop zone after each field */}
                  {isDragging && (
                     <div
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, index + 1)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index + 1)}
                        className={`h-12 rounded-lg border-2 border-dashed transition-all duration-200 
                                 flex items-center justify-center mt-3 ${
                                    isDragTarget(index + 1)
                                       ? "border-blue-500 bg-blue-500/10 shadow-lg"
                                       : "border-gray-600 bg-gray-700/20"
                                 }`}
                     >
                        <div className="flex items-center gap-2 text-gray-400">
                           <FiPlus className="w-4 h-4" />
                           <span className="text-sm font-medium">
                              Drop after field
                           </span>
                        </div>
                     </div>
                  )}
               </div>
            ))}
         </div>

         {/* Summary */}
         <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                     <span className="text-white font-bold text-sm">
                        {fields.length}
                     </span>
                  </div>
                  <div>
                     <p className="text-white font-medium">
                        {fields.length} Field{fields.length !== 1 ? "s" : ""}{" "}
                        Organized
                     </p>
                     <p className="text-gray-400 text-sm">Ready for preview</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OrganizeFieldSection;
