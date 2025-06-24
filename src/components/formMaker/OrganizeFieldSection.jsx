import {
   FiCalendar,
   FiChevronDown,
   FiHash,
   FiList,
   FiMinus,
   FiMove,
   FiPlus,
   FiTrash2,
   FiType,
} from "react-icons/fi";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";
import {
   canFieldsFitInRow,
   createNewField,
   getFieldTypeInfo,
   groupFieldsIntoRows,
   WIDTH_OPTIONS,
} from "../../utils/formMaker";
import { getWidthIcon } from "../../utils/widthIcons";
import DragPreview from "./DragPreview";

const OrganizeFieldSection = ({ fields, setFields, removeField }) => {
   const {
      isDragging,
      dragPreview,
      mousePosition,
      draggedId,
      horizontalDropZone,
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      handleHorizontalDropEnter,
      handleHorizontalDropLeave,
      handleHorizontalDrop,
      isItemDragged,
      isDragTarget,
   } = useDragAndDrop(fields, setFields);

   const handleAddHR = () => {
      const newHR = createNewField(fields.length, "hr");
      setFields([...fields, newHR]);
   };

   const updateFieldWidth = (fieldId, width) => {
      const newFields = fields.map((field) => {
         if (field.id === fieldId) {
            return { ...field, width };
         }
         return field;
      });
      setFields(newFields);
   };

   const getWidthClass = (width) => {
      switch (width) {
         case "fourth":
            return "w-1/4"; // 25%
         case "half":
            return "w-1/2"; // 50%
         case "three-fourths":
            return "w-3/4"; // 75%
         case "full":
         default:
            return "w-full"; // 100%
      }
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
               <p className="text-md font-bold text-white mb-2">
                  Organize Fields
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

         {/* Fields List - Scrollable Container */}
         <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-[400px] overflow-hidden">
            <div className="h-full overflow-y-auto custom-scrollbar p-4">
               <div className="relative space-y-3">
                  {/* Drop Zone - Always rendered and available for drag events */}
                  <div
                     onDragOver={handleDragOver}
                     onDragEnter={(e) => handleDragEnter(e, 0)}
                     onDragLeave={handleDragLeave}
                     onDrop={(e) => handleDrop(e, 0)}
                     className={`transition-all duration-200 flex items-center justify-center rounded-lg border-2 border-dashed ${
                        isDragging
                           ? `h-12 ${
                                isDragTarget(0)
                                   ? "border-blue-500 bg-blue-500/10 shadow-lg"
                                   : "border-gray-600 bg-gray-700/20"
                             }`
                           : "h-2 border-transparent bg-transparent opacity-0"
                     }`}
                  >
                     {isDragging && (
                        <div className="flex items-center gap-2 text-gray-400">
                           <FiPlus className="w-4 h-4" />
                           <span className="text-sm font-medium">
                              Drop at beginning
                           </span>
                        </div>
                     )}
                  </div>

                  {/* Render fields in rows for proper side-by-side layout */}
                  {(() => {
                     const rows = groupFieldsIntoRows(fields);
                     let globalIndex = 0;

                     return rows.map((row, rowIndex) => (
                        <div
                           key={`row-${rowIndex}`}
                           className="flex gap-2 items-start"
                        >
                           {row.map((field) => {
                              const currentIndex = globalIndex++;
                              return (
                                 <div
                                    key={field.id}
                                    className={`relative ${getWidthClass(
                                       field.width
                                    )} flex-shrink-0`}
                                 >
                                    <div
                                       className={`group relative bg-gray-800/50 rounded-xl border transition-all duration-200 hover:bg-gray-800/70 w-full ${
                                          isItemDragged(field.id)
                                             ? "border-blue-500 shadow-lg scale-95 opacity-50"
                                             : "border-gray-700 hover:border-gray-600 hover:shadow-md"
                                       }`}
                                    >
                                       {/* Simplified Drag Handle */}
                                       <div
                                          draggable={true}
                                          onDragStart={(e) =>
                                             handleDragStart(e, field.id)
                                          }
                                          onDragEnd={(e) => handleDragEnd(e)}
                                          className="absolute left-0 top-0 bottom-0 w-12 grid place-items-center cursor-move z-30 hover:bg-gray-700/50 transition-colors"
                                          title="Drag to reorder"
                                       >
                                          <div className="flex flex-col gap-0.5 opacity-60 hover:opacity-100 transition-opacity">
                                             {[...Array(6)].map((_, i) => (
                                                <div
                                                   key={i}
                                                   className="w-1 h-1 bg-gray-400 rounded-full"
                                                />
                                             ))}
                                          </div>
                                       </div>

                                       {/* Field Content - Not draggable */}
                                       <div
                                          className="pl-12 pr-4 py-4 cursor-default relative"
                                          draggable={false}
                                          onDragOver={(e) => e.preventDefault()}
                                       >
                                          {field.type === "hr" ? (
                                             // HR Field
                                             <div className="flex items-center justify-between">
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
                                                {/* Delete button only for HR - appears on hover */}
                                                <button
                                                   onClick={() =>
                                                      removeField(field.id)
                                                   }
                                                   className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 
                                                            rounded-lg transition-all duration-200"
                                                   title="Delete Divider"
                                                >
                                                   <FiTrash2 className="w-4 h-4" />
                                                </button>
                                             </div>
                                          ) : (
                                             // Regular Field
                                             <div className="flex items-center justify-between relative">
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
                                                            {
                                                               getFieldTypeInfo(
                                                                  field.type
                                                               ).label
                                                            }
                                                         </span>
                                                      </div>
                                                   </div>
                                                </div>

                                                {/* Width Controls - Show on hover like edit/delete buttons */}
                                                <div className="absolute right-0 flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                   {WIDTH_OPTIONS.map(
                                                      (widthOption) => {
                                                         const isActive =
                                                            field.width ===
                                                            widthOption.value;
                                                         return (
                                                            <div
                                                               key={
                                                                  widthOption.value
                                                               }
                                                               className="relative"
                                                            >
                                                               <button
                                                                  type="button"
                                                                  onMouseDown={(
                                                                     e
                                                                  ) => {
                                                                     e.stopPropagation();
                                                                     e.preventDefault();
                                                                  }}
                                                                  onClick={(
                                                                     e
                                                                  ) => {
                                                                     e.stopPropagation();
                                                                     e.preventDefault();
                                                                     updateFieldWidth(
                                                                        field.id,
                                                                        widthOption.value
                                                                     );
                                                                  }}
                                                                  className={`
                                                                  w-6 h-6 rounded-md flex items-center justify-center
                                                                  transition-all duration-200 border
                                                                  ${
                                                                     isActive
                                                                        ? "bg-blue-500/70 text-white border-blue-500 shadow-md"
                                                                        : "bg-gray-600/70 text-gray-200 border-gray-500 hover:bg-gray-500 hover:text-white hover:border-gray-400"
                                                                  }
                                                               `}
                                                                  title={`${widthOption.label} (${widthOption.fraction})`}
                                                               >
                                                                  {getWidthIcon(
                                                                     widthOption.value,
                                                                     "w-3 h-3"
                                                                  )}
                                                               </button>
                                                            </div>
                                                         );
                                                      }
                                                   )}
                                                </div>
                                             </div>
                                          )}
                                       </div>

                                       {/* Smart Horizontal Drop Zones */}
                                       {isDragging &&
                                          draggedId !== field.id &&
                                          (() => {
                                             const draggedField = fields.find(
                                                (f) => f.id === draggedId
                                             );
                                             return (
                                                draggedField &&
                                                canFieldsFitInRow(
                                                   draggedField.width,
                                                   field.width
                                                )
                                             );
                                          })() && (
                                             <>
                                                {/* Left Drop Zone */}
                                                <div
                                                   onDragOver={handleDragOver}
                                                   onDragEnter={(e) =>
                                                      handleHorizontalDropEnter(
                                                         e,
                                                         field.id,
                                                         "left"
                                                      )
                                                   }
                                                   onDragLeave={
                                                      handleHorizontalDropLeave
                                                   }
                                                   onDrop={(e) =>
                                                      handleHorizontalDrop(
                                                         e,
                                                         field.id,
                                                         "left"
                                                      )
                                                   }
                                                   className={`absolute -left-12 top-0 bottom-0 w-8 border-2 border-dashed
                                                         rounded-lg flex items-center justify-center transition-all z-10 ${
                                                            horizontalDropZone?.fieldId ===
                                                               field.id &&
                                                            horizontalDropZone?.position ===
                                                               "left"
                                                               ? "bg-blue-500/40 border-blue-400 opacity-100 pointer-events-auto"
                                                               : "bg-blue-500/20 border-blue-500/50 opacity-80 hover:opacity-100 hover:bg-blue-500/30 hover:border-blue-500/70 pointer-events-auto"
                                                         }`}
                                                   title="Drop to place side by side (left)"
                                                >
                                                   <FiPlus className="w-4 h-4 text-blue-400" />
                                                </div>

                                                {/* Right Drop Zone */}
                                                <div
                                                   onDragOver={handleDragOver}
                                                   onDragEnter={(e) =>
                                                      handleHorizontalDropEnter(
                                                         e,
                                                         field.id,
                                                         "right"
                                                      )
                                                   }
                                                   onDragLeave={
                                                      handleHorizontalDropLeave
                                                   }
                                                   onDrop={(e) =>
                                                      handleHorizontalDrop(
                                                         e,
                                                         field.id,
                                                         "right"
                                                      )
                                                   }
                                                   className={`absolute -right-12 top-0 bottom-0 w-8 border-2 border-dashed
                                                         rounded-lg flex items-center justify-center transition-all z-10 ${
                                                            horizontalDropZone?.fieldId ===
                                                               field.id &&
                                                            horizontalDropZone?.position ===
                                                               "right"
                                                               ? "bg-blue-500/40 border-blue-400 opacity-100 pointer-events-auto"
                                                               : "bg-blue-500/20 border-blue-500/50 opacity-80 hover:opacity-100 hover:bg-blue-500/30 hover:border-blue-500/70 pointer-events-auto"
                                                         }`}
                                                   title="Drop to place side by side (right)"
                                                >
                                                   <FiPlus className="w-4 h-4 text-blue-400" />
                                                </div>
                                             </>
                                          )}
                                    </div>

                                    {/* Drop Zone After Field */}
                                    <div
                                       onDragOver={handleDragOver}
                                       onDragEnter={(e) =>
                                          handleDragEnter(e, currentIndex + 1)
                                       }
                                       onDragLeave={handleDragLeave}
                                       onDrop={(e) =>
                                          handleDrop(e, currentIndex + 1)
                                       }
                                       className={`transition-all duration-200 flex items-center justify-center rounded-lg border-2 border-dashed ${
                                          isDragging
                                             ? `h-12 mt-2 ${
                                                  isDragTarget(currentIndex + 1)
                                                     ? "border-blue-500 bg-blue-500/10 shadow-lg"
                                                     : "border-gray-600 bg-gray-700/20"
                                               }`
                                             : "h-2 mt-1 border-transparent bg-transparent opacity-0"
                                       }`}
                                    >
                                       {isDragging && (
                                          <div className="flex items-center gap-2 text-gray-400">
                                             <FiPlus className="w-4 h-4" />
                                             <span className="text-sm font-medium">
                                                Drop after field
                                             </span>
                                          </div>
                                       )}
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     ));
                  })()}
               </div>
            </div>
         </div>

         {/* Drag Preview */}
         <DragPreview dragPreview={dragPreview} mousePosition={mousePosition} />
      </div>
   );
};

export default OrganizeFieldSection;
