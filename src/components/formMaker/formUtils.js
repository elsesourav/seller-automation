import {
   FiAlignCenter,
   FiBox,
   FiCalendar,
   FiChevronDown,
   FiHash,
   FiList,
   FiMinus,
   FiType,
} from "react-icons/fi";

export const FIELD_TYPES = [
   { value: "title", label: "Title Header", icon: "FiAlignCenter" },
   { value: "text", label: "Text Input", icon: "FiType" },
   { value: "number", label: "Number Input", icon: "FiHash" },
   { value: "date", label: "Date Input", icon: "FiCalendar" },
   { value: "select", label: "Select Dropdown", icon: "FiChevronDown" },
   { value: "multiple", label: "Multiple Values", icon: "FiList" },
   { value: "textarea", label: "Text Area", icon: "FiType" },
   { value: "spacer", label: "Spacer Field", icon: "FiBox" },
];
export const FIELD_ICONS = {
   FiType,
   FiAlignCenter,
   FiHash,
   FiCalendar,
   FiChevronDown,
   FiList,
   FiMinus,
   FiBox,
};
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
export const FIELD_DESCRIPTIONS = {
   text: "Single line text input",
   title: "Header title for sections",
   number: "Numeric with validation",
   date: "Date picker input",
   select: "Dropdown selection",
   multiple: "Multiple choice options",
   spacer: "Empty space for layout",
   textarea: "Multi-line text input",
};
export const getFieldTypeInfo = (type) =>
   FIELD_TYPES.find((t) => t.value === type) || FIELD_TYPES[0];
export const getFieldDescription = (type) =>
   FIELD_DESCRIPTIONS[type] || "Form field";
export const normalizeField = (field) => ({
   ...field,
   width: field.width || "full",
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
export const createNewField = (fieldsLength, type = "text") => {
   const baseField = {
      id: Date.now() + Math.random(),
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
   if (type === "spacer")
      return {
         ...baseField,
         name: `spacer_${fieldsLength + 1}`,
         label: "Spacer Field",
         width: "fourth",
      };
   if (type === "title")
      return {
         ...baseField,
         name: `title_${fieldsLength + 1}`,
         label: `Header Title ${fieldsLength + 1}`,
         placeholder: "Enter your title here",
         width: "full",
      };
   return baseField;
};
export const groupFieldsIntoRows = (fieldsArray) => {
   const rows = [];
   let currentRow = [];
   let currentRowWidth = 0;
   for (const rawField of fieldsArray) {
      const field = normalizeField(rawField);
      const widthOption = WIDTH_OPTIONS.find((w) => w.value === field.width);
      const fieldWidth = widthOption ? widthOption.cols : 12;
      if (currentRowWidth + fieldWidth > 12 || field.width === "full") {
         if (currentRow.length > 0) rows.push(currentRow);
         currentRow = [field];
         currentRowWidth = fieldWidth;
      } else {
         currentRow.push(field);
         currentRowWidth += fieldWidth;
      }
   }
   if (currentRow.length > 0) rows.push(currentRow);
   return rows;
};
export const makeSchemaWithWidths = (fields) => {
   // Group fields into rows based on width (4 columns per row)
   const rows = [];
   let currentRow = [];
   let currentSpan = 0;
   const getColSpan = (width) => {
      switch (width) {
         case "fourth":
            return 1;
         case "half":
            return 2;
         case "three-fourths":
            return 3;
         case "full":
         default:
            return 4;
      }
   };
   for (const field of fields) {
      const span = getColSpan(field.width);
      if (currentSpan + span > 4) {
         rows.push(currentRow);
         currentRow = [];
         currentSpan = 0;
      }
      currentRow.push(field);
      currentSpan += span;
   }
   if (currentRow.length > 0) rows.push(currentRow);
   const widths = rows.map((row) => row.map((f) => f.width || "full"));
   return { schema: fields, widths };
};

/**
 * Reverse function for makeSchemaWithWidths
 * Converts a schema with widths back to a flat array of fields with width properties
 * @param {Object} schemaWithWidths - Object containing schema and widths arrays
 * @param {Array} schemaWithWidths.schema - Array of field objects
 * @param {Array} schemaWithWidths.widths - Nested array of width values organized by rows
 * @returns {Array} Array of field objects with width properties applied
 */
export const parseSchemaWithWidths = (schemaWithWidths) => {
   if (!schemaWithWidths || !schemaWithWidths.schema) {
      return [];
   }

   const { schema, widths } = schemaWithWidths;

   // If no widths provided, return schema as-is with normalized fields
   if (!widths || !Array.isArray(widths)) {
      return schema.map((field) => normalizeField(field));
   }

   // Flatten the nested widths array to match field order
   const flatWidths = widths.flat();

   // Apply widths to corresponding fields
   return schema.map((field, index) => {
      const normalizedField = normalizeField(field);
      return {
         ...normalizedField,
         width: flatWidths[index] || field.width || "full",
      };
   });
};
