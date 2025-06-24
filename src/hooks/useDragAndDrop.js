import { useCallback, useEffect, useRef, useState } from "react";

export const useDragAndDrop = (fields) => {
   const [draggedId, setDraggedId] = useState(null);
   const [isDragging, setIsDragging] = useState(false);
   const [dragPreview, setDragPreview] = useState(null);
   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
   const dragStartPos = useRef({ x: 0, y: 0 });

   // Drag move handler for drag preview
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
      setIsDragging(false);
      setDragPreview(null);
      setMousePosition({ x: 0, y: 0 });
      dragStartPos.current = { x: 0, y: 0 };
   }, []);

   // Handle drag start for canvas fields
   const handleDragStart = useCallback(
      (e, fieldId) => {
         // Store initial position
         dragStartPos.current = { x: e.clientX, y: e.clientY };
         setMousePosition({ x: e.clientX, y: e.clientY });

         // Find the dragged field
         const draggedField = fields.find((field) => field.id === fieldId);

         if (!draggedField) {
            return;
         }

         setDraggedId(fieldId);
         setIsDragging(true);

         const preview = createDragPreview(draggedField);
         setDragPreview(preview);

         // Configure drag transfer
         if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData(
               "application/json",
               JSON.stringify({
                  type: "canvas-field",
                  fieldId: fieldId,
               })
            );
         }

         // Add visual feedback to dragged element
         requestAnimationFrame(() => {
            if (e.target) {
               e.target.style.opacity = "0.6";
            }
         });
      },
      [fields, createDragPreview]
   );

   // Clean drag end handler
   const handleDragEnd = useCallback(
      (e) => {
         // Reset visual styling
         if (e.target) {
            e.target.style.opacity = "";
         }

         resetDragState();
      },
      [resetDragState]
   );

   // Utility function to check if item is being dragged
   const isItemDragged = useCallback(
      (fieldId) => draggedId === fieldId,
      [draggedId]
   );

   return {
      // State
      draggedId,
      isDragging,
      dragPreview,
      mousePosition,

      // Handlers
      handleDragStart,
      handleDragEnd,

      // Utilities
      isItemDragged,
      resetDragState,
   };
};
