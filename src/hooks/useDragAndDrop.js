/**
 * Drag and Drop Logic for FormMaker
 * Handles all drag and drop functionality with improved UX
 */

import { useCallback, useState } from "react";

export const useDragAndDrop = (fields, setFields) => {
   const [draggedItem, setDraggedItem] = useState(null);
   const [dragOverIndex, setDragOverIndex] = useState(null);
   const [isDragging, setIsDragging] = useState(false);

   // Reset drag state
   const resetDragState = useCallback(() => {
      setDraggedItem(null);
      setDragOverIndex(null);
      setIsDragging(false);
   }, []);

   // Start dragging
   const handleDragStart = useCallback(
      (e, fieldId) => {
         const field = fields.find((f) => f.id === fieldId);
         if (!field) return;

         setDraggedItem(field);
         setIsDragging(true);

         // Set drag effect
         e.dataTransfer.effectAllowed = "move";
         e.dataTransfer.setData("text/plain", fieldId.toString());

         // Add drag image styling
         e.target.style.opacity = "0.5";
      },
      [fields]
   );

   // Handle drag over
   const handleDragOver = useCallback((e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
   }, []);

   // Handle drag enter
   const handleDragEnter = useCallback(
      (e, dropIndex) => {
         e.preventDefault();
         if (draggedItem && dropIndex !== undefined) {
            setDragOverIndex(dropIndex);
         }
      },
      [draggedItem]
   );

   // Handle drag leave
   const handleDragLeave = useCallback((e) => {
      e.preventDefault();

      // Only clear if we're actually leaving the drop zone
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
         setDragOverIndex(null);
      }
   }, []);

   // Handle drop
   const handleDrop = useCallback(
      (e, dropIndex) => {
         e.preventDefault();

         if (!draggedItem || dropIndex === undefined) return;

         const draggedIndex = fields.findIndex(
            (field) => field.id === draggedItem.id
         );
         if (draggedIndex === -1) return;

         // Don't drop on the same position
         if (draggedIndex === dropIndex) {
            resetDragState();
            return;
         }

         // Create new fields array
         const newFields = [...fields];
         const draggedField = newFields[draggedIndex];

         // Remove the dragged field
         newFields.splice(draggedIndex, 1);

         // Calculate correct insert index
         let insertIndex = dropIndex;
         if (draggedIndex < dropIndex) {
            insertIndex = dropIndex - 1;
         }

         // Ensure we don't go out of bounds
         insertIndex = Math.max(0, Math.min(insertIndex, newFields.length));

         // Insert at new position
         newFields.splice(insertIndex, 0, draggedField);

         // Update fields
         setFields(newFields);
         resetDragState();
      },
      [fields, draggedItem, setFields, resetDragState]
   );

   // Handle drag end
   const handleDragEnd = useCallback(
      (e) => {
         // Reset drag image styling
         e.target.style.opacity = "1";
         resetDragState();
      },
      [resetDragState]
   );

   // Check if item is being dragged
   const isItemDragged = useCallback(
      (fieldId) => {
         return draggedItem?.id === fieldId;
      },
      [draggedItem]
   );

   // Check if position is drag target
   const isDragTarget = useCallback(
      (index) => {
         return dragOverIndex === index;
      },
      [dragOverIndex]
   );

   return {
      // State
      draggedItem,
      dragOverIndex,
      isDragging,

      // Handlers
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,

      // Utilities
      isItemDragged,
      isDragTarget,
      resetDragState,
   };
};
