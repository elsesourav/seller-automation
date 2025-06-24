import { useCallback, useMemo, useRef, useState } from "react";
import { FiMenu, FiPlus } from "react-icons/fi";
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
   const [draggingFieldId, setDraggingFieldId] = useState(null);
   const [draggingRowIndex, setDraggingRowIndex] = useState(null);
   const [rowDropTarget, setRowDropTarget] = useState(null);
   const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
   const [showGrid, setShowGrid] = useState(false);
   const [gridDropZone, setGridDropZone] = useState(null);
   const [horizontalDropZone, setHorizontalDropZone] = useState(null);
   const canvasRef = useRef(null);

   // Handle drag over with grid visualization
   const handleDragOver = useCallback(
      (e) => {
         e.preventDefault();
         e.dataTransfer.dropEffect = "move";

         // Show grid when dragging, but not when dragging rows
         if (!showGrid && draggingRowIndex === null) {
            setShowGrid(true);
         }
      },
      [showGrid, draggingRowIndex]
   );

   // Handle drag enter for grid positioning
   const handleDragEnter = useCallback(
      (e) => {
         e.preventDefault();

         // Show grid when dragging, but not when dragging rows
         if (draggingRowIndex === null) {
            setShowGrid(true);
         }
      },
      [draggingRowIndex]
   );

   // Handle drag leave
   const handleDragLeave = useCallback((e) => {
      // Only hide grid if we're leaving the canvas entirely
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
                  if (gridDropZone) {
                     // Grid positioning - update field width and reorder
                     const field = fields[sourceIndex];
                     const updatedField = {
                        ...field,
                        width: gridDropZone.width,
                     };

                     // Update the field with new width
                     const newFields = [...fields];
                     newFields[sourceIndex] = updatedField;

                     // If dropping to a specific position, also reorder
                     if (dropIndex !== null && sourceIndex !== dropIndex) {
                        const [movedField] = newFields.splice(sourceIndex, 1);
                        const insertIndex =
                           sourceIndex < dropIndex ? dropIndex - 1 : dropIndex;
                        newFields.splice(insertIndex, 0, movedField);
                     }

                     // Use the callback to update fields directly since we're handling both width and position
                     onReorderFields(0, 0, newFields); // Special case - pass the full array
                  } else if (horizontalDropZone) {
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
         setDraggingFieldId(null);
         setRowDropTarget(null);
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
   }, []);

   // Group fields into rows - memoized to prevent dependency issues (moved here to be available for row drag handlers)
   const rows = useMemo(() => {
      return fields.length > 0 ? groupFieldsIntoRows(fields) : [];
   }, [fields]);

   // Handle row dragging
   const handleRowDragStart = useCallback((e, rowIndex) => {
      setDraggingRowIndex(rowIndex);
      // Don't show the grid overlay during row dragging
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
      setHoveredRowIndex(null);
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
                  // Calculate field indices for row reordering
                  let sourceStartIndex = 0;
                  let targetStartIndex = 0;

                  // Calculate source row start index
                  for (let i = 0; i < sourceRowIndex; i++) {
                     sourceStartIndex += rows[i].length;
                  }

                  // Calculate target row start index
                  for (let i = 0; i < targetRowIndex; i++) {
                     targetStartIndex += rows[i].length;
                  }

                  // Move entire row by moving all fields in the row
                  const sourceRow = rows[sourceRowIndex];
                  const newFields = [...fields];

                  // Remove source row fields
                  const movedFields = newFields.splice(
                     sourceStartIndex,
                     sourceRow.length
                  );

                  // Adjust target index if source is before target
                  const adjustedTargetIndex =
                     sourceRowIndex < targetRowIndex
                        ? targetStartIndex - sourceRow.length
                        : targetStartIndex;

                  // Insert moved fields at target position
                  newFields.splice(adjustedTargetIndex, 0, ...movedFields);

                  // Update fields with the new order
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

         // Place fields in sections
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

         // Get available width for a section based on remaining space
         const getAvailableWidthForSection = (sectionIndex, sections) => {
            // Count consecutive empty sections from this position
            let consecutiveEmpty = 0;
            for (let i = sectionIndex; i < 4; i++) {
               if (!sections[i]) {
                  consecutiveEmpty++;
               } else {
                  break;
               }
            }

            // Return appropriate width based on available consecutive sections
            // Always allow at least 25% if there's space
            if (consecutiveEmpty >= 4) return "full"; // 100%
            if (consecutiveEmpty >= 3) return "three-fourths"; // 75%
            if (consecutiveEmpty >= 2) return "half"; // 50%
            if (consecutiveEmpty >= 1) return "fourth"; // 25%
            return null; // No space available
         };

         // Get CSS class for section span
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

         // Get width label
         const getWidthLabel = (width) => {
            const labels = {
               fourth: "25%",
               half: "50%",
               "three-fourths": "75%",
               full: "100%",
            };
            return labels[width] || width;
         };

         // Render sections
         return sections
            .map((section, sectionIndex) => {
               if (section && section.sectionIndex === 0) {
                  // Render the field (only on first section of multi-section fields)
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
                        />
                     </div>
                  );
               } else if (!section && showGrid && draggingRowIndex === null) {
                  // Render available space drop zone only if there's actual space and we're not dragging rows
                  const availableWidth = getAvailableWidthForSection(
                     sectionIndex,
                     sections
                  );

                  // Only render if there's available space
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
                              // Calculate insertion index
                              let insertIndex = 0;
                              for (let i = 0; i < rowIndex; i++) {
                                 insertIndex += rows[i].length;
                              }
                              // Add position within current row
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

               // Skip sections that are part of multi-section fields
               return null;
            })
            .filter(Boolean);
      },
      [
         showGrid,
         draggingRowIndex,
         gridDropZone,
         draggingFieldId,
         onEditField,
         onDeleteField,
         handleFieldDragStart,
         handleFieldDragEnd,
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
            onMouseMove={(e) => {
               // During row drag, detect which row we're hovering near
               if (draggingRowIndex !== null) {
                  const canvasRect = canvasRef.current?.getBoundingClientRect();
                  if (!canvasRect) return;

                  const relativeY = e.clientY - canvasRect.top;
                  const scrollTop = canvasRef.current.scrollTop;
                  const absoluteY = relativeY + scrollTop;

                  // Find the closest row based on Y position
                  const rowElements =
                     canvasRef.current.querySelectorAll("[data-row-index]");
                  let closestRowIndex = null;
                  let minDistance = Infinity;

                  rowElements.forEach((element, index) => {
                     const rect = element.getBoundingClientRect();
                     const canvasRelativeTop =
                        rect.top - canvasRect.top + scrollTop;
                     const rowCenter = canvasRelativeTop + rect.height / 2;
                     const distance = Math.abs(absoluteY - rowCenter);

                     // Only consider if we're within reasonable distance (e.g., 100px)
                     if (distance < 100 && distance < minDistance) {
                        minDistance = distance;
                        closestRowIndex = index;
                     }
                  });

                  setHoveredRowIndex(closestRowIndex);
               }
            }}
         >
            <div className="space-y-4 relative z-20">
               {/* Drop zone before first row - show when hovering near first row, at top, or when no specific row is hovered */}
               {draggingRowIndex !== null &&
                  (hoveredRowIndex === 0 ||
                     hoveredRowIndex === null ||
                     rows.length <= 2) && (
                     <div
                        className={`h-8 mx-4 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center
                        ${
                           rowDropTarget === "before-0"
                              ? "border-blue-400 bg-blue-400/30 shadow-lg"
                              : "border-blue-300/70 hover:border-blue-400 bg-blue-400/10"
                        }
                     `}
                        onDragOver={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           setRowDropTarget("before-0");
                        }}
                        onDrop={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleRowDrop(e, 0);
                        }}
                     >
                        <div className="text-sm text-blue-400 font-medium">
                           Drop here to move to top
                        </div>
                     </div>
                  )}

               {rows.map((row, rowIndex) => (
                  <div key={`row-container-${rowIndex}`}>
                     {/* Drop zone above each row - show when hovering near this row or adjacent rows */}
                     {rowIndex > 0 &&
                        draggingRowIndex !== null &&
                        draggingRowIndex !== rowIndex &&
                        (hoveredRowIndex === rowIndex ||
                           hoveredRowIndex === rowIndex - 1 ||
                           (hoveredRowIndex === null && rows.length <= 3)) && (
                           <div
                              className={`h-8 mx-4 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center mb-2
                                 ${
                                    rowDropTarget === `before-${rowIndex}`
                                       ? "border-blue-400 bg-blue-400/30 shadow-lg"
                                       : "border-blue-300/70 hover:border-blue-400 bg-blue-400/10"
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
                           >
                              <div className="text-sm text-blue-400 font-medium">
                                 Drop here
                              </div>
                           </div>
                        )}

                     <div
                        className={`relative group ${
                           draggingRowIndex === rowIndex
                              ? "opacity-30 scale-95 transform rotate-1"
                              : ""
                        } ${
                           rowDropTarget === rowIndex
                              ? "ring-2 ring-blue-400 rounded-lg"
                              : ""
                        } transition-all duration-200`}
                        data-row-index={rowIndex}
                        onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                        onMouseLeave={() => setHoveredRowIndex(null)}
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
                              className={`p-2 rounded cursor-grab active:cursor-grabbing border shadow-lg transition-colors
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

               {/* Drop zone after last row - show when hovering near last row, at bottom, or when no specific row is hovered */}
               {draggingRowIndex !== null &&
                  (hoveredRowIndex === rows.length - 1 ||
                     hoveredRowIndex === null ||
                     rows.length <= 2) && (
                     <div
                        className={`h-8 mx-4 rounded-lg border-2 border-dashed transition-all duration-200 flex items-center justify-center mt-2
                        ${
                           rowDropTarget === `after-${rows.length - 1}`
                              ? "border-blue-400 bg-blue-400/30 shadow-lg"
                              : "border-blue-300/70 hover:border-blue-400 bg-blue-400/10"
                        }
                     `}
                        onDragOver={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           setRowDropTarget(`after-${rows.length - 1}`);
                        }}
                        onDrop={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           handleRowDrop(e, rows.length);
                        }}
                     >
                        <div className="text-sm text-blue-400 font-medium">
                           Drop here to move to bottom
                        </div>
                     </div>
                  )}
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
      { value: "fourth", label: "25%", cols: 1, zone: 0 },
      { value: "half", label: "50%", cols: 2, zone: 1 },
      { value: "three-fourths", label: "75%", cols: 3, zone: 2 },
      { value: "full", label: "100%", cols: 4, zone: 3 },
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

export default FormCanvas;
