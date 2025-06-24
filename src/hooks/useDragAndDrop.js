import { useCallback, useEffect, useRef, useState } from "react";

export const useDragAndDrop = (fields, setFields) => {
   const [draggedId, setDraggedId] = useState(null);
   const [dragOverIndex, setDragOverIndex] = useState(null);
   const [horizontalDropZone, setHorizontalDropZone] = useState(null); // New: for horizontal drops
   const [isDragging, setIsDragging] = useState(false);
   const [dragPreview, setDragPreview] = useState(null);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const dragStartPos = useRef({ x: 0, y: 0 });
   const scrollContainerRef = useRef(null);
   const autoScrollInterval = useRef(null);

   // Auto-scroll functionality
   const handleAutoScroll = useCallback(
      (e) => {
         if (!scrollContainerRef.current || !isDragging) return;

         const container = scrollContainerRef.current;
         const rect = container.getBoundingClientRect();
         const scrollZone = 60; // Pixels from edge to trigger scroll
         const scrollSpeed = 8; // Scroll speed

         const mouseY = e.clientY - rect.top;
         const containerHeight = rect.height;

         // Clear existing interval
         if (autoScrollInterval.current) {
            clearInterval(autoScrollInterval.current);
            autoScrollInterval.current = null;
         }

         // Check if mouse is in scroll zones
         if (mouseY < scrollZone && container.scrollTop > 0) {
            // Scroll up
            autoScrollInterval.current = setInterval(() => {
               container.scrollTop = Math.max(
                  0,
                  container.scrollTop - scrollSpeed
               );
            }, 16);
         } else if (
            mouseY > containerHeight - scrollZone &&
            container.scrollTop <
               container.scrollHeight - container.clientHeight
         ) {
            // Scroll down
            autoScrollInterval.current = setInterval(() => {
               container.scrollTop = Math.min(
                  container.scrollHeight - container.clientHeight,
                  container.scrollTop + scrollSpeed
               );
            }, 16);
         }
      },
      [isDragging]
   );

   // Drag move handler for drag preview and auto-scroll
   const handleDragMove = useCallback(
      (e) => {
         if (isDragging) {
            setMousePosition({ x: e.clientX, y: e.clientY });
            handleAutoScroll(e);
         }
      },
      [isDragging, handleAutoScroll]
   );

   // Add/remove drag move listener when dragging starts/stops
   useEffect(() => {
      if (isDragging) {
         document.addEventListener("dragover", handleDragMove);
         return () => {
            document.removeEventListener("dragover", handleDragMove);
         };
      }
   }, [isDragging, handleDragMove]);

   // Create drag preview content
   const createDragPreview = useCallback((field) => {
      return {
         id: field.id,
         label: field.label,
         type: field.type,
         width: field.width,
      };
   }, []);

   // Reset all drag state
   const resetDragState = useCallback(() => {
      setDraggedId(null);
      setDragOverIndex(null);
      setHorizontalDropZone(null); // Reset horizontal drop zone
      setIsDragging(false);
      setDragPreview(null);
      setMousePosition({ x: 0, y: 0 });
      dragStartPos.current = { x: 0, y: 0 };

      // Clear auto-scroll interval
      if (autoScrollInterval.current) {
         clearInterval(autoScrollInterval.current);
         autoScrollInterval.current = null;
      }
   }, []);

   // Handle drag start with threshold
   const handleDragStart = useCallback(
      (e, fieldId) => {
         try {
            // Store initial position
            dragStartPos.current = { x: e.clientX, y: e.clientY };
            setMousePosition({ x: e.clientX, y: e.clientY });

            // Find the dragged field
            const draggedField = fields.find((field) => field.id === fieldId);

            if (!draggedField) {
               console.error("❌ [HOOK] Field not found:", fieldId);
               return;
            }

            setDraggedId(fieldId);
            setIsDragging(true);

            const preview = createDragPreview(draggedField);
            setDragPreview(preview);

            // Configure drag transfer
            if (e.dataTransfer) {
               e.dataTransfer.effectAllowed = "move";
               e.dataTransfer.setData("text/plain", fieldId.toString());
            } else {
               console.error("❌ [HOOK] No dataTransfer available");
            }

            // Add visual feedback to dragged element
            requestAnimationFrame(() => {
               if (e.target) {
                  e.target.style.opacity = "0.6";
               }
            });
         } catch (error) {
            console.error("💥 [HOOK] Error in handleDragStart:", error);
         }
      },
      [fields, createDragPreview]
   );

   // Handle drag over with optimized performance
   const handleDragOver = useCallback((e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
   }, []);

   // Handle drag enter with debouncing
   const handleDragEnter = useCallback(
      (e, dropIndex, sectorInfo) => {
         e.preventDefault();

         if (!draggedId) return;

         // Handle sector-specific targeting
         if (sectorInfo && sectorInfo.startsWith("sector-")) {
            // Validate that the dragged field can fit in this sector
            const draggedField = fields.find(f => f.id === draggedId);
            if (draggedField) {
               const sectorParts = sectorInfo.split("-");
               const sectorIndex = parseInt(sectorParts[2]);
               
               const getFieldSectorCount = (width) => {
                  switch (width) {
                     case "fourth": return 1;
                     case "half": return 2;
                     case "three-fourths": return 3;
                     case "full": return 4;
                     default: return 1;
                  }
               };
               
               const fieldSectorCount = getFieldSectorCount(draggedField.width);
               
               // Only set as target if field can fit
               if (!isNaN(sectorIndex) && sectorIndex + fieldSectorCount <= 4) {
                  setHorizontalDropZone(sectorInfo);
                  setDragOverIndex(null); // Clear linear drop zones
                  return;
               }
            }
         }

         // Handle linear drop targeting
         if (
            draggedId &&
            dropIndex !== undefined &&
            dropIndex !== dragOverIndex
         ) {
            setDragOverIndex(dropIndex);
            setHorizontalDropZone(null); // Clear sector targeting
         }
      },
      [draggedId, dragOverIndex, fields]
   );

   // Optimized drag leave handler
   const handleDragLeave = useCallback((e) => {
      e.preventDefault();

      // Use more reliable boundary detection
      const rect = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;

      // Add small buffer to prevent flickering
      const buffer = 5;
      if (
         clientX < rect.left - buffer ||
         clientX > rect.right + buffer ||
         clientY < rect.top - buffer ||
         clientY > rect.bottom + buffer
      ) {
         setDragOverIndex(null);
         setHorizontalDropZone(null); // Also clear sector targeting
      }
   }, []);

   // Enhanced drop handler with better logic
   const handleDrop = useCallback(
      (e, dropIndex, sectorInfo) => {
         e.preventDefault();

         if (!draggedId || dropIndex === undefined) {
            resetDragState();
            return;
         }

         const draggedIndex = fields.findIndex(
            (field) => field.id === draggedId
         );

         if (draggedIndex === -1) {
            resetDragState();
            return;
         }

         const draggedField = fields[draggedIndex];

         // Handle sector-based drop
         if (sectorInfo && sectorInfo.startsWith("sector-")) {
            const sectorParts = sectorInfo.split("-");
            const rowIndex = parseInt(sectorParts[1]);
            const sectorIndex = parseInt(sectorParts[2]);

            if (!isNaN(rowIndex) && !isNaN(sectorIndex)) {
               // Get field sector count based on width
               const getFieldSectorCount = (width) => {
                  switch (width) {
                     case "fourth": return 1;
                     case "half": return 2;
                     case "three-fourths": return 3;
                     case "full": return 4;
                     default: return 1;
                  }
               };

               const fieldSectorCount = getFieldSectorCount(draggedField.width);
               
               // Check if field can fit in the target sector position
               if (sectorIndex + fieldSectorCount <= 4) {
                  console.log("✅ Sector drop successful:", {
                     fieldId: draggedField.id,
                     fieldWidth: draggedField.width,
                     sectorCount: fieldSectorCount,
                     targetRow: rowIndex,
                     targetSector: sectorIndex
                  });
                  
                  // Update the field with explicit sector positioning
                  const newFields = [...fields];
                  const updatedField = {
                     ...draggedField,
                     sectorPosition: sectorIndex,
                     rowIndex: rowIndex,
                  };

                  newFields[draggedIndex] = updatedField;
                  setFields(newFields);
                  resetDragState();
                  return;
               } else {
                  // Field doesn't fit in this position, reset and do nothing
                  console.log("❌ Field too wide for sector position:", {
                     fieldId: draggedField.id,
                     fieldWidth: draggedField.width,
                     sectorCount: fieldSectorCount,
                     targetSector: sectorIndex,
                     maxSectors: 4,
                     wouldOverflow: sectorIndex + fieldSectorCount
                  });
                  resetDragState();
                  return;
               }
            }
         }

         // Regular linear drop handling (when not dropping into a sector)
         const isSamePosition =
            draggedIndex === dropIndex ||
            (draggedIndex < dropIndex && draggedIndex === dropIndex - 1);

         if (isSamePosition) {
            resetDragState();
            return;
         }

         // Perform the reorder
         const newFields = [...fields];
         const [draggedFieldToMove] = newFields.splice(draggedIndex, 1);

         // Calculate insertion index
         const insertIndex =
            draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
         newFields.splice(insertIndex, 0, draggedFieldToMove);

         setFields(newFields);
         resetDragState();
      },
      [fields, draggedId, setFields, resetDragState]
   );

   // Clean drag end handler
   const handleDragEnd = useCallback(
      (e) => {
         console.log("🏁 Drag End - dropEffect:", e.dataTransfer?.dropEffect);

         // Reset visual styling
         if (e.target) {
            e.target.style.opacity = "";
         }

         resetDragState();
      },
      [resetDragState]
   );

   // Handle horizontal drop
   const handleHorizontalDrop = useCallback(
      (e, fieldId, position) => {
         e.preventDefault();

         if (!draggedId) {
            resetDragState();
            return;
         }

         const draggedIndex = fields.findIndex((f) => f.id === draggedId);
         const targetIndex = fields.findIndex((f) => f.id === fieldId);

         if (draggedIndex === -1 || targetIndex === -1) {
            resetDragState();
            return;
         }

         const draggedField = fields[draggedIndex];
         const targetField = fields[targetIndex];

         // Create new fields array without the dragged field
         const newFields = fields.filter((_, index) => index !== draggedIndex);

         // Find the adjusted target index after removing dragged field
         const adjustedTargetIndex = newFields.findIndex(
            (f) => f.id === fieldId
         );

         let insertIndex;
         if (position === "left") {
            // Insert immediately before the target field
            insertIndex = adjustedTargetIndex;
         } else if (position.startsWith("right")) {
            // Insert immediately after the target field
            insertIndex = adjustedTargetIndex + 1;
         } else {
            // Default: insert after target
            insertIndex = adjustedTargetIndex + 1;
         }

         // Insert the dragged field at the calculated position
         newFields.splice(insertIndex, 0, draggedField);

         console.log("🔄 Horizontal Drop:", {
            draggedFieldId: draggedField.id,
            targetFieldId: targetField.id,
            position,
            draggedIndex,
            targetIndex,
            adjustedTargetIndex,
            insertIndex,
            oldLength: fields.length,
            newLength: newFields.length,
         });

         setFields(newFields);
         resetDragState();
      },
      [fields, draggedId, setFields, resetDragState]
   );

   // Handle horizontal drop zone enter
   const handleHorizontalDropEnter = useCallback(
      (e, fieldId, position) => {
         e.preventDefault();

         if (!draggedId) return;

         const draggedField = fields.find((f) => f.id === draggedId);
         const targetField = fields.find((f) => f.id === fieldId);

         if (!draggedField || !targetField) return;

         // Simple width check - can fields fit in 4 sectors (100%)?
         const getFieldSectorCount = (width) => {
            switch (width) {
               case "fourth":
                  return 1;
               case "half":
                  return 2;
               case "three-fourths":
                  return 3;
               case "full":
                  return 4;
               default:
                  return 1;
            }
         };

         const draggedSectors = getFieldSectorCount(draggedField.width);
         const targetSectors = getFieldSectorCount(targetField.width);

         if (draggedSectors + targetSectors <= 4) {
            setHorizontalDropZone({
               fieldId,
               position, // 'left' or 'right'
            });
            setDragOverIndex(null); // Clear vertical drop zones
         }
      },
      [draggedId, fields]
   );

   // Handle horizontal drop zone leave
   const handleHorizontalDropLeave = useCallback((e) => {
      e.preventDefault();

      const rect = e.currentTarget.getBoundingClientRect();
      const { clientX, clientY } = e;
      const buffer = 5;

      if (
         clientX < rect.left - buffer ||
         clientX > rect.right + buffer ||
         clientY < rect.top - buffer ||
         clientY > rect.bottom + buffer
      ) {
         setHorizontalDropZone(null);
      }
   }, []);

   // Utility functions
   const isItemDragged = useCallback(
      (fieldId) => draggedId === fieldId,
      [draggedId]
   );

   const isDragTarget = useCallback(
      (index, sectorInfo) => {
         if (sectorInfo) {
            // Check if this specific sector is the target
            return horizontalDropZone === sectorInfo;
         }
         return dragOverIndex === index;
      },
      [dragOverIndex, horizontalDropZone]
   );

   return {
      // State
      draggedId,
      dragOverIndex,
      horizontalDropZone,
      isDragging,
      dragPreview,
      mousePosition,

      // Refs
      scrollContainerRef,

      // Handlers
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      handleHorizontalDropEnter,
      handleHorizontalDropLeave,
      handleHorizontalDrop,

      // Utilities
      isItemDragged,
      isDragTarget,
      resetDragState,
   };
};
