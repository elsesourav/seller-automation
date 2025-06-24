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
   createNewField,
   getFieldTypeInfo,
   organizeFieldsIntoSectors,
   WIDTH_OPTIONS,
} from "../../utils/formMaker";
import { getWidthIcon } from "../../utils/widthIcons";
import DragPreview from "./DragPreview";

const OrganizeFieldSection = ({ fields, setFields, removeField }) => {
   const {
      isDragging,
      dragPreview,
      mousePosition,
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      isItemDragged,
      isDragTarget,
      scrollContainerRef,
   } = useDragAndDrop(fields, setFields);

   const handleAddHR = () => {
      const newHR = createNewField(fields.length, "hr");
      setFields([...fields, newHR]);
   };

   const updateFieldWidth = (fieldId, width) => {
      const newFields = fields.map((field) => {
         if (field.id === fieldId) {
            const updatedField = { ...field, width };
            
            // If field has explicit sector positioning, check if new width fits
            if (field.sectorPosition !== null && field.sectorPosition !== undefined) {
               const getFieldSectorCount = (fieldWidth) => {
                  switch (fieldWidth) {
                     case "fourth": return 1;
                     case "half": return 2;
                     case "three-fourths": return 3;
                     case "full": return 4;
                     default: return 1;
                  }
               };
               
               const newSectorCount = getFieldSectorCount(width);
               
               // If new width doesn't fit in current position, reset positioning
               if (field.sectorPosition + newSectorCount > 4) {
                  updatedField.sectorPosition = null;
                  updatedField.rowIndex = null;
               }
            }
            
            return updatedField;
         }
         return field;
      });
      setFields(newFields);
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

   // Helper function to find which row contains the dragged field
   const getDraggedFieldRowIndex = () => {
      if (!isDragging) return -1;

      const sectorRows = organizeFieldsIntoSectors(fields);
      for (let rowIndex = 0; rowIndex < sectorRows.length; rowIndex++) {
         const row = sectorRows[rowIndex];
         for (let sector of row) {
            if (sector && isItemDragged(sector.field.id)) {
               return rowIndex;
            }
         }
      }
      return -1;
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
            <div
               ref={scrollContainerRef}
               className="h-full overflow-y-auto custom-scrollbar p-4"
            >
               <div className="relative space-y-3">
                  {/* Drop Zone - Always rendered and available for drag events */}
                  <div
                     onDragOver={handleDragOver}
                     onDragEnter={(e) => handleDragEnter(e, 0)}
                     onDragLeave={handleDragLeave}
                     onDrop={(e) => handleDrop(e, 0)}
                     className={`transition-all duration-200 flex items-center justify-center rounded-lg border-2 border-dashed ${
                        isDragging && isDragTarget(0)
                           ? "h-8 border-blue-500 bg-blue-500/10 shadow-lg"
                           : isDragging
                           ? "h-2 border-gray-600/50 bg-transparent"
                           : "h-1 border-transparent bg-transparent opacity-0"
                     }`}
                  >
                     {isDragging && isDragTarget(0) && (
                        <div className="flex items-center gap-2 text-gray-400">
                           <FiPlus className="w-3 h-3" />
                           <span className="text-xs font-medium">
                              Drop at beginning
                           </span>
                        </div>
                     )}
                  </div>

                  {/* Render fields with 4-sector grid system */}
                  {(() => {
                     const sectorRows = organizeFieldsIntoSectors(fields);
                     const draggedRowIndex = getDraggedFieldRowIndex();
                     let globalIndex = 0;

                     return sectorRows.map((sectors, rowIndex) => {
                        // Check if this row has the dragged item or is a potential drop target
                        const hasActiveField = sectors.some(
                           (sector) => sector && isItemDragged(sector.field.id)
                        );
                        const isDropTarget =
                           isDragTarget(globalIndex) ||
                           sectors.some((_, sectorIndex) =>
                              isDragTarget(
                                 globalIndex,
                                 `sector-${rowIndex}-${sectorIndex}`
                              )
                           );

                        // Only show enhanced visuals for the dragged row and immediate neighbors
                        const isNearDraggedRow =
                           draggedRowIndex === -1 ||
                           Math.abs(rowIndex - draggedRowIndex) <= 1;
                        const showGridOverlay =
                           isDragging &&
                           (hasActiveField ||
                              (isDropTarget && isNearDraggedRow));

                        return (
                           <div
                              key={`row-${rowIndex}`}
                              className={`relative w-full grid grid-cols-4 gap-2 transition-all duration-200 ${
                                 showGridOverlay
                                    ? "border-2 border-dashed border-blue-400 bg-blue-50/20 rounded-lg p-2 shadow-lg"
                                    : "border border-transparent"
                              }`}
                              style={{
                                 minHeight: "72px", // More compact: reduced from 80px to 72px
                                 marginBottom: "6px", // Reduced margin for tighter layout
                                 ...(showGridOverlay && {
                                    backgroundImage:
                                       "repeating-linear-gradient(90deg, transparent, transparent 24.5%, rgba(59, 130, 246, 0.1) 25%, rgba(59, 130, 246, 0.1) 25.5%)",
                                 }),
                              }}
                           >
                              {/* Grid overlay when dragging - only show for active rows */}
                              {showGridOverlay && (
                                 <div className="absolute inset-0 pointer-events-none z-0">
                                    <div className="w-full h-full grid grid-cols-4 gap-2 opacity-30">
                                       {[1, 2, 3, 4].map((num) => (
                                          <div
                                             key={num}
                                             className="border border-blue-400 bg-blue-100/30 rounded-md flex items-center justify-center"
                                          >
                                             <span className="text-xs font-semibold text-blue-600">
                                                {num}
                                             </span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              )}

                              {sectors.map((sector, sectorIndex) => {
                                 if (!sector) {
                                    // Empty sector - show drop zone when dragging
                                    const isSectorTarget = isDragTarget(
                                       globalIndex,
                                       `sector-${rowIndex}-${sectorIndex}`
                                    );
                                    const showSectorFeedback =
                                       isDragging && isNearDraggedRow;

                                    return (
                                       <div
                                          key={`sector-${rowIndex}-${sectorIndex}`}
                                          className={`relative z-10 border-2 border-dashed rounded-lg transition-all duration-200 flex items-center justify-center ${
                                             isSectorTarget
                                                ? "border-blue-500 bg-blue-100/80 opacity-100 shadow-md"
                                                : showSectorFeedback
                                                ? "border-blue-300/60 bg-blue-50/40 opacity-70 hover:opacity-90 hover:bg-blue-100/60"
                                                : isDragging
                                                ? "border-gray-300/30 bg-gray-50/10 opacity-20"
                                                : "border-gray-300/20 bg-gray-50/5 opacity-5"
                                          }`}
                                          style={{
                                             minHeight: "56px", // More compact: reduced from 64px to 56px
                                             ...(isSectorTarget && {
                                                boxShadow:
                                                   "inset 0 0 0 1px rgba(59, 130, 246, 0.4)",
                                             }),
                                          }}
                                          onDragOver={handleDragOver}
                                          onDragEnter={(e) =>
                                             handleDragEnter(
                                                e,
                                                globalIndex,
                                                `sector-${rowIndex}-${sectorIndex}`
                                             )
                                          }
                                          onDragLeave={handleDragLeave}
                                          onDrop={(e) =>
                                             handleDrop(
                                                e,
                                                globalIndex,
                                                `sector-${rowIndex}-${sectorIndex}`
                                             )
                                          }
                                       >
                                          {isSectorTarget && (
                                             <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600">
                                                <FiPlus className="w-6 h-6 mb-1" />
                                                <span className="text-xs font-medium">
                                                   Drop Here
                                                </span>
                                                <span className="text-xs opacity-75">
                                                   Sector {sectorIndex + 1}
                                                </span>
                                             </div>
                                          )}
                                          {showSectorFeedback &&
                                             !isSectorTarget && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                   <div className="w-1 h-1 bg-blue-400 rounded-full opacity-50"></div>
                                                </div>
                                             )}
                                          {!isDragging && (
                                             <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-1 h-1 bg-gray-400 rounded-full opacity-20"></div>
                                             </div>
                                          )}
                                       </div>
                                    );
                                 }

                                 const {
                                    field,
                                    sectorIndex: fieldSectorIndex,
                                    totalSectors,
                                    startSector,
                                 } = sector;

                                 // Only render the field once (in its first sector)
                                 if (fieldSectorIndex !== 0) {
                                    return (
                                       <div
                                          key={`sector-${rowIndex}-${sectorIndex}`}
                                          className="hidden"
                                       ></div>
                                    );
                                 }

                                 globalIndex++; // Increment for tracking

                                 return (
                                    <div
                                       key={field.id}
                                       className={`relative z-10 ${
                                          totalSectors === 1
                                             ? "col-span-1"
                                             : totalSectors === 2
                                             ? "col-span-2"
                                             : totalSectors === 3
                                             ? "col-span-3"
                                             : "col-span-4"
                                       }`}
                                       style={{
                                          gridColumnStart: startSector + 1,
                                       }}
                                    >
                                       <div
                                          className={`group relative bg-gray-800/50 rounded-xl border transition-all duration-200 hover:bg-gray-800/70 w-full h-full ${
                                             isItemDragged(field.id)
                                                ? "border-blue-500 shadow-lg scale-95 opacity-50"
                                                : "border-gray-700 hover:border-gray-600 hover:shadow-md"
                                          }`}
                                       >
                                          {/* Drag Handle - More prominent and responsive */}
                                          <div
                                             draggable={true}
                                             onDragStart={(e) =>
                                                handleDragStart(e, field.id)
                                             }
                                             onDragEnd={(e) => handleDragEnd(e)}
                                             className="absolute left-0 top-0 bottom-0 w-10 grid place-items-center cursor-move rounded-l-xl z-30 hover:bg-gray-600/60 active:bg-gray-600/80 transition-all duration-150"
                                             title="Drag to reorder"
                                          >
                                             <div className="flex flex-col gap-1 opacity-50 hover:opacity-80 transition-opacity">
                                                {[...Array(3)].map((_, i) => (
                                                   <div
                                                      key={i}
                                                      className="flex gap-1"
                                                   >
                                                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                                                   </div>
                                                ))}
                                             </div>
                                          </div>

                                          {/* Field Content - Not draggable */}
                                          <div
                                             className="pl-10 pr-4 py-3 cursor-default relative h-full"
                                             draggable={false}
                                             onDragOver={(e) =>
                                                e.preventDefault()
                                             }
                                          >
                                             {field.type === "hr" ? (
                                                // HR Field
                                                <div className="flex items-center justify-between h-full">
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
                                                <div className="flex items-center justify-between relative h-full">
                                                   <div className="flex items-center gap-3 flex-1 min-w-0">
                                                      <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                                                         {getFieldIcon(
                                                            field.type
                                                         )}
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
                                                            <span className="text-xs text-blue-400">
                                                               Sector{" "}
                                                               {startSector + 1}
                                                               -
                                                               {startSector +
                                                                  totalSectors}
                                                            </span>
                                                         </div>
                                                      </div>
                                                   </div>

                                                   {/* Width Controls - Show on hover like edit/delete buttons */}
                                                   <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex items-center gap-0.5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                                       </div>
                                    </div>
                                 );
                              })}

                              {/* Vertical Drop Zone After Row */}
                              <div
                                 onDragOver={handleDragOver}
                                 onDragEnter={(e) =>
                                    handleDragEnter(e, globalIndex)
                                 }
                                 onDragLeave={handleDragLeave}
                                 onDrop={(e) => handleDrop(e, globalIndex)}
                                 className={`col-span-4 transition-all duration-200 flex items-center justify-center rounded-lg border-2 border-dashed ${
                                    isDragging && isDragTarget(globalIndex)
                                       ? "h-8 border-blue-500 bg-blue-500/10 shadow-lg"
                                       : isDragging
                                       ? "h-2 border-gray-600/50 bg-transparent"
                                       : "h-1 border-transparent bg-transparent opacity-0"
                                 }`}
                              >
                                 {isDragging && isDragTarget(globalIndex) && (
                                    <div className="flex items-center gap-2 text-gray-400">
                                       <FiPlus className="w-3 h-3" />
                                       <span className="text-xs font-medium">
                                          Drop new row
                                       </span>
                                    </div>
                                 )}
                              </div>
                           </div>
                        );
                     });
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
