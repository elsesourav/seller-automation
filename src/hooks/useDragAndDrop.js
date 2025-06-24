import { useCallback, useEffect, useRef, useState } from "react";
import { canFieldsFitInRow } from "../utils/formMaker";

export const useDragAndDrop = (fields, setFields) => {
   const [draggedId, setDraggedId] = useState(null);
   const [dragOverIndex, setDragOverIndex] = useState(null);
   const [horizontalDropZone, setHorizontalDropZone] = useState(null); // New: for horizontal drops
   const [isDragging, setIsDragging] = useState(false);
   const [dragPreview, setDragPreview] = useState(null);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const dragStartPos = useRef({ x: 0, y: 0 });

   // Drag move handler for drag preview (works during drag operations)
   const handleDragMove = useCallback(
      (e) => {
         if (isDragging) {
            setMousePosition({ x: e.clientX, y: e.clientY });
         }
      },
      [isDragging]
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
      (e, dropIndex) => {
         e.preventDefault();

         if (
            draggedId &&
            dropIndex !== undefined &&
            dropIndex !== dragOverIndex
         ) {
            setDragOverIndex(dropIndex);
         }
      },
      [draggedId, dragOverIndex]
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
      }
   }, []);

   // Enhanced drop handler with better logic
   const handleDrop = useCallback(
      (e, dropIndex) => {
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

         // Calculate if this is actually a position change
         const isSamePosition =
            draggedIndex === dropIndex ||
            (draggedIndex < dropIndex && draggedIndex === dropIndex - 1);

         if (isSamePosition) {
            resetDragState();
            return;
         }

         // Perform the reorder
         const newFields = [...fields];
         const [draggedField] = newFields.splice(draggedIndex, 1);

         // Calculate insertion index
         const insertIndex =
            draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
         newFields.splice(insertIndex, 0, draggedField);

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

         // Check if fields can fit together
         if (canFieldsFitInRow(draggedField.width, targetField.width)) {
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
      (index) => dragOverIndex === index,
      [dragOverIndex]
   );

   return {
      // State
      draggedId,
      dragOverIndex,
      horizontalDropZone,
      isDragging,
      dragPreview,
      mousePosition,

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
