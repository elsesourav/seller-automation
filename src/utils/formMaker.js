/**
 * Form Maker Utilities
 * Contains all the logic and helper functions for the FormMaker component
 */

// Available field types
export const FIELD_TYPES = [
   { value: "text", label: "Text Input", icon: "FiType" },
   { value: "number", label: "Number Input", icon: "FiHash" },
   { value: "date", label: "Date Input", icon: "FiCalendar" },
   { value: "select", label: "Select Dropdown", icon: "FiChevronDown" },
   { value: "multiple", label: "Multiple Values", icon: "FiList" },
   { value: "hr", label: "Horizontal Line", icon: "FiMinus" },
];

// Width options for fields
export const WIDTH_OPTIONS = [
   {
      value: "full",
      label: "Full Width",
      cols: 12,
      icon: "FiMaximize2",
      fraction: "100%",
   },
   {
      value: "three-fourths",
      label: "Three Fourths Width",
      cols: 9,
      icon: "FiGrid",
      fraction: "75%",
   },
   {
      value: "half",
      label: "Half Width",
      cols: 6,
      icon: "FiColumns",
      fraction: "50%",
   },
   {
      value: "fourth",
      label: "Quarter Width",
      cols: 3,
      icon: "FiGrid",
      fraction: "25%",
   },
];

/**
 * Normalize field to ensure it has all required properties
 */
export const normalizeField = (field) => ({
   ...field,
   width: field.type === "hr" ? "full" : field.width || "full",
   padding: field.padding || { top: 0, bottom: 0, left: 0, right: 0 },
   name: field.name || "",
   label: field.label || "",
   placeholder: field.placeholder || "",
   helperText: field.helperText || "",
   min: field.min || "",
   max: field.max || "",
   step: field.step || "",
   options: field.options || [],
   required: field.required || false,
});

/**
 * Create a new field with default properties
 */
export const createNewField = (fieldsLength, type = "text") => {
   const baseField = {
      id: Date.now() + Math.random(), // More unique ID
      type,
      name: `field_${fieldsLength + 1}`,
      label: `Field ${fieldsLength + 1}`,
      placeholder: "",
      required: false,
      options: [],
      min: "",
      max: "",
      step: "",
      helperText: "",
      width: "full",
      padding: { top: 0, bottom: 0, left: 0, right: 0 },
   };

   // Type-specific defaults
   if (type === "hr") {
      return {
         ...baseField,
         name: `hr_${fieldsLength + 1}`,
         label: "Horizontal Line",
         width: "full",
      };
   }

   return baseField;
};

/**
 * Calculate field width in grid columns (out of 12)
 */
export const getFieldColumns = (width) => {
   const widthOption = WIDTH_OPTIONS.find((w) => w.value === width);
   return widthOption ? widthOption.cols : 12;
};

/**
 * Check if two fields can fit in the same row
 */
export const canFieldsFitInRow = (field1Width, field2Width) => {
   const cols1 = getFieldColumns(field1Width);
   const cols2 = getFieldColumns(field2Width);
   return cols1 + cols2 <= 12;
};

/**
 * Group fields into rows based on their width and position
 */
export const groupFieldsIntoRows = (fields) => {
   const rows = [];
   let currentRow = [];
   let currentRowCols = 0;

   fields.forEach((field) => {
      const fieldCols = getFieldColumns(field.width);

      // If field is full width or current row can't fit this field, start new row
      if (fieldCols === 12 || currentRowCols + fieldCols > 12) {
         if (currentRow.length > 0) {
            rows.push([...currentRow]);
         }
         currentRow = [field];
         currentRowCols = fieldCols;
      } else {
         // Add to current row
         currentRow.push(field);
         currentRowCols += fieldCols;
      }
   });

   // Add the last row if it has fields
   if (currentRow.length > 0) {
      rows.push(currentRow);
   }

   return rows;
};

/**
 * Flatten rows back into a linear array
 */
export const flattenRows = (rows) => {
   return rows.flat();
};

/**
 * Calculate possible drop positions for horizontal positioning
 */
export const getHorizontalDropPositions = (fields, draggedField) => {
   const draggedCols = getFieldColumns(draggedField.width);
   const positions = [];

   // Group fields into rows
   const rows = groupFieldsIntoRows(
      fields.filter((f) => f.id !== draggedField.id)
   );

   rows.forEach((row, rowIndex) => {
      const rowCols = row.reduce(
         (sum, field) => sum + getFieldColumns(field.width),
         0
      );
      const availableCols = 12 - rowCols;

      // If dragged field can fit in this row
      if (draggedCols <= availableCols) {
         // Add position at the beginning of the row
         positions.push({
            type: "horizontal",
            rowIndex,
            position: "start",
            afterFieldId: null,
         });

         // Add positions after each field in the row
         row.forEach((field) => {
            positions.push({
               type: "horizontal",
               rowIndex,
               position: "after",
               afterFieldId: field.id,
            });
         });
      }
   });

   return positions;
};

/**
 * Get CSS classes for field width
 */
export const getFieldWidthClass = (width) => {
   const widthOption = WIDTH_OPTIONS.find((w) => w.value === width);
   if (!widthOption) return "col-span-12";

   // Handle the fourth width option
   if (width === "fourth") return "col-span-3";

   return `col-span-${widthOption.cols}`;
};

/**
 * Get field type info by value
 */
export const getFieldTypeInfo = (type) => {
   return FIELD_TYPES.find((t) => t.value === type) || FIELD_TYPES[0];
};

/**
 * Validate field data
 */
export const validateField = (field) => {
   const errors = [];

   if (!field.label.trim()) {
      errors.push("Label is required");
   }

   if (!field.name.trim()) {
      errors.push("Field name is required");
   }

   if (
      (field.type === "select" || field.type === "multiple") &&
      field.options.length === 0
   ) {
      errors.push("At least one option is required for select/multiple fields");
   }

   return errors;
};

/**
 * Generate form JSON schema
 */
export const generateFormSchema = (fields) => {
   const schema = {
      type: "object",
      properties: {},
      required: [],
   };

   fields.forEach((field) => {
      if (field.type === "hr") return;

      const normalizedField = normalizeField(field);

      schema.properties[normalizedField.name] = {
         type: getSchemaType(normalizedField.type),
         title: normalizedField.label,
         description: normalizedField.helperText,
      };

      if (
         normalizedField.type === "select" ||
         normalizedField.type === "multiple"
      ) {
         schema.properties[normalizedField.name].enum =
            normalizedField.options.map((opt) => opt.value);
         schema.properties[normalizedField.name].enumNames =
            normalizedField.options.map((opt) => opt.label);
      }

      if (normalizedField.required) {
         schema.required.push(normalizedField.name);
      }
   });

   return schema;
};

const getSchemaType = (fieldType) => {
   switch (fieldType) {
      case "number":
         return "number";
      case "date":
         return "string";
      case "multiple":
         return "array";
      default:
         return "string";
   }
};
