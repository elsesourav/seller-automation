/**
 * Modern Drag and Drop Logic for FormMaker
 * Optimized and reliable drag and drop implementation with floating preview
 */

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
                  e.target.style.transform = "rotate(2deg)";
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
            e.target.style.transform = "";
         }

         resetDragState();
      },
      [resetDragState]
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

   // Handle horizontal drop
   const handleHorizontalDrop = useCallback(
      (e, fieldId, position) => {
         e.preventDefault();

         if (!draggedId || !horizontalDropZone) {
            resetDragState();
            return;
         }

         const draggedIndex = fields.findIndex((f) => f.id === draggedId);
         const targetIndex = fields.findIndex((f) => f.id === fieldId);

         if (draggedIndex === -1 || targetIndex === -1) {
            resetDragState();
            return;
         }

         // Create new fields array
         const newFields = [...fields];
         const [draggedField] = newFields.splice(draggedIndex, 1);

         // Calculate insertion index based on position
         let insertIndex;
         if (position === "left") {
            insertIndex =
               draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
         } else {
            // 'right'
            insertIndex =
               draggedIndex < targetIndex ? targetIndex : targetIndex + 1;
         }

         newFields.splice(insertIndex, 0, draggedField);

         setFields(newFields);
         resetDragState();
      },
      [fields, draggedId, horizontalDropZone, setFields, resetDragState]
   );

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
