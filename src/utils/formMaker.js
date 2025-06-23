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
      fraction: "1/1",
   },
   {
      value: "half",
      label: "Half Width",
      cols: 6,
      icon: "FiColumns",
      fraction: "1/2",
   },
   {
      value: "third",
      label: "Third Width",
      cols: 4,
      icon: "FiGrid",
      fraction: "1/3",
   },
   {
      value: "fourth",
      label: "Quarter Width",
      cols: 3,
      icon: "FiGrid",
      fraction: "1/4",
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
 * Group fields into rows based on their width settings
 */
export const groupFieldsIntoRows = (fieldsArray) => {
   const rows = [];
   let currentRow = [];
   let currentRowWidth = 0;

   for (const rawField of fieldsArray) {
      const field = normalizeField(rawField);

      // HR lines always take full width and force a new row
      if (field.type === "hr") {
         if (currentRow.length > 0) {
            rows.push(currentRow);
         }
         rows.push([field]);
         currentRow = [];
         currentRowWidth = 0;
         continue;
      }

      const widthOption = WIDTH_OPTIONS.find((w) => w.value === field.width);
      const fieldWidth = widthOption ? widthOption.cols : 12;

      if (currentRowWidth + fieldWidth > 12 || field.width === "full") {
         if (currentRow.length > 0) {
            rows.push(currentRow);
         }
         currentRow = [field];
         currentRowWidth = fieldWidth;
      } else {
         currentRow.push(field);
         currentRowWidth += fieldWidth;
      }
   }

   if (currentRow.length > 0) {
      rows.push(currentRow);
   }

   return rows;
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
