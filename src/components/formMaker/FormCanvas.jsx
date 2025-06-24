import { useCallback, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { groupFieldsIntoRows } from "../../utils/formMaker";
import CanvasField from "./CanvasField";

/**
 * Main canvas area where fields are dropped and arranged
 * Supports horizontal drag and drop with visual grid positioning
 */
const FormCanvas = ({
   fields,
   onAddField,
   onEditField,
   onDeleteField,
   onReorderFields,
}) => {
   const [dragOverIndex, setDragOverIndex] = useState(null);
   const [draggingFieldId, setDraggingFieldId] = useState(null);
   const [showGrid, setShowGrid] = useState(false);
   const [gridDropZone, setGridDropZone] = useState(null);
   const [horizontalDropZone, setHorizontalDropZone] = useState(null);
   const canvasRef = useRef(null);

   // Handle drag over with grid visualization
   const handleDragOver = useCallback(
      (e) => {
         e.preventDefault();
         e.dataTransfer.dropEffect = "move";

         // Show grid when dragging
         if (!showGrid) {
            setShowGrid(true);
         }
      },
      [showGrid]
   );

   // Handle drag enter for grid positioning
   const handleDragEnter = useCallback((e) => {
      e.preventDefault();

      // Show grid when dragging starts
      setShowGrid(true);
   }, []);

   // Handle drag leave
   const handleDragLeave = useCallback((e) => {
      // Only hide grid if we're leaving the canvas entirely
      if (!e.currentTarget.contains(e.relatedTarget)) {
         setShowGrid(false);
         setGridDropZone(null);
         setHorizontalDropZone(null);
      }
   }, []);

   // Handle horizontal drop positioning
   const handleHorizontalDrop = useCallback(
      (sourceIndex, dropZone) => {
         const targetIndex = fields.findIndex(
            (f) => f.id === dropZone.targetFieldId
         );

         if (targetIndex === -1) return;

         // Calculate new position based on drop zone
         let newIndex = targetIndex;
         if (dropZone.position === "right") {
            newIndex = targetIndex + 1;
         }

         // Adjust for fields that might be removed
         if (sourceIndex < newIndex) {
            newIndex--;
         }

         onReorderFields(sourceIndex, newIndex);
      },
      [fields, onReorderFields]
   );

   // Handle drop with enhanced positioning
   const handleDrop = useCallback(
      (e, dropIndex = null) => {
         e.preventDefault();

         try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));

            if (data.type === "palette-field") {
               // Adding new field from palette
               if (gridDropZone) {
                  // Use grid positioning - pass extra field data
                  onAddField(data.fieldType, dropIndex, {
                     width: gridDropZone.width,
                  });
               } else {
                  // Regular drop
                  onAddField(data.fieldType, dropIndex);
               }
            } else if (data.type === "canvas-field") {
               // Reordering existing field
               const sourceIndex = fields.findIndex(
                  (f) => f.id === data.fieldId
               );
               if (sourceIndex !== -1) {
                  if (horizontalDropZone) {
                     // Horizontal positioning
                     handleHorizontalDrop(sourceIndex, horizontalDropZone);
                  } else if (dropIndex !== null && sourceIndex !== dropIndex) {
                     // Regular reordering
                     onReorderFields(sourceIndex, dropIndex);
                  }
               }
            }
         } catch {
            // Silently handle drop errors
         }

         // Reset states
         setShowGrid(false);
         setGridDropZone(null);
         setHorizontalDropZone(null);
         setDragOverIndex(null);
         setDraggingFieldId(null);
      },
      [
         fields,
         gridDropZone,
         horizontalDropZone,
         onAddField,
         onReorderFields,
         handleHorizontalDrop,
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

   // Handle horizontal drop zone positioning
   const handleHorizontalDropZone = useCallback((e, fieldId, position) => {
      e.preventDefault();

      setHorizontalDropZone({
         targetFieldId: fieldId,
         position,
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
   }, []);

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
               className="flex-1 flex items-center justify-center p-8 relative"
               onDragOver={handleDragOver}
               onDragEnter={handleDragEnter}
               onDrop={(e) => handleDrop(e, 0)}
               onDragLeave={handleDragLeave}
            >
               {/* Grid overlay for empty canvas */}
               {showGrid && (
                  <div className="absolute inset-0 pointer-events-none">
                     <GridOverlay onGridPosition={handleGridPosition} />
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
                     <div>• Click fields to edit their properties</div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   const rows = groupFieldsIntoRows(fields);

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
            className="flex-1 p-4 overflow-y-auto custom-scrollbar relative"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
         >
            {/* Grid overlay */}
            {showGrid && (
               <div className="absolute inset-0 pointer-events-none z-10">
                  <GridOverlay
                     rows={rows}
                     onGridPosition={handleGridPosition}
                     gridDropZone={gridDropZone}
                  />
               </div>
            )}

            <div className="space-y-4 relative z-20">
               {rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="relative">
                     {/* Drop zone before row */}
                     <div
                        className={`h-2 mb-2 rounded transition-all duration-200 
                                  ${
                                     dragOverIndex ===
                                     getRowStartIndex(rows, rowIndex)
                                        ? "bg-blue-500/20 border-2 border-dashed border-blue-500"
                                        : "border border-transparent"
                                  }`}
                        onDragEnter={(e) => {
                           e.preventDefault();
                           setDragOverIndex(getRowStartIndex(rows, rowIndex));
                        }}
                        onDrop={(e) =>
                           handleDrop(e, getRowStartIndex(rows, rowIndex))
                        }
                     />

                     <div className="grid grid-cols-12 gap-4 relative">
                        {row.map((field) => (
                           <div key={field.id} className="relative">
                              {/* Horizontal drop zones */}
                              <HorizontalDropZones
                                 field={field}
                                 isVisible={
                                    showGrid &&
                                    draggingFieldId &&
                                    draggingFieldId !== field.id
                                 }
                                 onDropZone={handleHorizontalDropZone}
                                 horizontalDropZone={horizontalDropZone}
                              />

                              <CanvasField
                                 field={field}
                                 onEdit={onEditField}
                                 onDelete={onDeleteField}
                                 isDragging={draggingFieldId === field.id}
                                 onDragStart={handleFieldDragStart}
                                 onDragEnd={handleFieldDragEnd}
                              />
                           </div>
                        ))}
                     </div>
                  </div>
               ))}

               {/* Drop zone at the end */}
               <div
                  className={`h-8 rounded transition-all duration-200 
                            ${
                               dragOverIndex === fields.length
                                  ? "bg-blue-500/20 border-2 border-dashed border-blue-500"
                                  : "border border-transparent"
                            }`}
                  onDragEnter={(e) => {
                     e.preventDefault();
                     setDragOverIndex(fields.length);
                  }}
                  onDrop={(e) => handleDrop(e, fields.length)}
               />
            </div>
         </div>
      </div>
   );
};

// Grid overlay component for visual positioning
const GridOverlay = ({ rows = [], onGridPosition, gridDropZone }) => {
   const widthOptions = [
      { value: "fourth", label: "25%", cols: 3 },
      { value: "half", label: "50%", cols: 6 },
      { value: "three-fourths", label: "75%", cols: 9 },
      { value: "full", label: "100%", cols: 12 },
   ];

   return (
      <div className="absolute inset-4 pointer-events-auto">
         {/* Existing rows */}
         {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-12 gap-4 mb-4 h-20">
               {Array.from({ length: 12 }).map((_, colIndex) => {
                  const isOccupied = row.some((field) => {
                     const fieldCols = getFieldWidthCols(field.width);
                     const fieldStart = getFieldStartCol(field, row);
                     return (
                        colIndex >= fieldStart &&
                        colIndex < fieldStart + fieldCols
                     );
                  });

                  return (
                     <div
                        key={colIndex}
                        className={`border-2 border-dashed rounded transition-all duration-200 
                                  ${
                                     isOccupied
                                        ? "border-gray-600 bg-gray-800/50"
                                        : "border-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                                  }`}
                     />
                  );
               })}
            </div>
         ))}

         {/* New row grid */}
         <div className="grid grid-cols-12 gap-4 h-20">
            {widthOptions.map((width, index) => (
               <div
                  key={width.value}
                  className={`col-span-${
                     width.cols
                  } border-2 border-dashed rounded 
                            transition-all duration-200 cursor-pointer flex items-center justify-center
                            ${
                               gridDropZone?.width === width.value
                                  ? "border-green-400 bg-green-500/20"
                                  : "border-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                            }`}
                  onDragEnter={(e) =>
                     onGridPosition(e, rows.length, index, width.value)
                  }
                  onDragOver={(e) => e.preventDefault()}
               >
                  <span className="text-blue-400 font-medium">
                     {width.label}
                  </span>
               </div>
            ))}
         </div>
      </div>
   );
};

// Horizontal drop zones component
const HorizontalDropZones = ({
   field,
   isVisible,
   onDropZone,
   horizontalDropZone,
}) => {
   if (!isVisible) return null;

   return (
      <>
         {/* Left drop zone */}
         <div
            className={`absolute left-0 top-0 w-4 h-full bg-blue-500/20 border-2 border-dashed 
                      border-blue-500 rounded-l transition-all duration-200 z-30 cursor-pointer
                      ${
                         horizontalDropZone?.targetFieldId === field.id &&
                         horizontalDropZone?.position === "left"
                            ? "bg-green-500/30 border-green-500"
                            : "opacity-0 hover:opacity-100"
                      }`}
            onDragEnter={(e) => onDropZone(e, field.id, "left")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
               e.preventDefault();
               e.stopPropagation();
            }}
         />

         {/* Right drop zone */}
         <div
            className={`absolute right-0 top-0 w-4 h-full bg-blue-500/20 border-2 border-dashed 
                      border-blue-500 rounded-r transition-all duration-200 z-30 cursor-pointer
                      ${
                         horizontalDropZone?.targetFieldId === field.id &&
                         horizontalDropZone?.position === "right"
                            ? "bg-green-500/30 border-green-500"
                            : "opacity-0 hover:opacity-100"
                      }`}
            onDragEnter={(e) => onDropZone(e, field.id, "right")}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
               e.preventDefault();
               e.stopPropagation();
            }}
         />
      </>
   );
};

// Helper functions
const getRowStartIndex = (rows, rowIndex) => {
   let index = 0;
   for (let i = 0; i < rowIndex; i++) {
      index += rows[i].length;
   }
   return index;
};

const getFieldWidthCols = (width) => {
   switch (width) {
      case "fourth":
         return 3;
      case "half":
         return 6;
      case "three-fourths":
         return 9;
      case "full":
         return 12;
      default:
         return 12;
   }
};

const getFieldStartCol = (field, row) => {
   let startCol = 0;
   for (const rowField of row) {
      if (rowField.id === field.id) break;
      startCol += getFieldWidthCols(rowField.width);
   }
   return startCol;
};

export default FormCanvas;
