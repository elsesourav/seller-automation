/**
 * Form Maker Utilities
 * Contains all the logic and helper functions for the FormMaker component
 */

// Available field types
export const FIELD_TYPES = [
   { value: "title", label: "Title Header", icon: "FiAlignCenter" },
   { value: "text", label: "Text Input", icon: "FiType" },
   { value: "number", label: "Number Input", icon: "FiHash" },
   { value: "date", label: "Date Input", icon: "FiCalendar" },
   { value: "select", label: "Select Dropdown", icon: "FiChevronDown" },
   { value: "multiple", label: "Multiple Values", icon: "FiList" },
   { value: "spacer", label: "Spacer Field", icon: "FiBox" },
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
   if (type === "spacer") {
      return {
         ...baseField,
         name: `spacer_${fieldsLength + 1}`,
         label: "Spacer Field",
         width: "fourth", // Default to quarter width, but can be changed
      };
   }

   if (type === "title") {
      return {
         ...baseField,
         name: `title_${fieldsLength + 1}`,
         label: `Header Title ${fieldsLength + 1}`,
         placeholder: "Enter your title here",
         width: "full", // Titles typically take full width
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

/**
 * Get number of sectors a field occupies (1-4 sectors, each 25%)
 */
export const getFieldSectorCount = (width) => {
   switch (width) {
      case "fourth":
         return 1; // Takes 1 sector (25%)
      case "half":
         return 2; // Takes 2 sectors (50%)
      case "three-fourths":
         return 3; // Takes 3 sectors (75%)
      case "full":
         return 4; // Takes all 4 sectors (100%)
      default:
         return 1;
   }
};

/**
 * Organize fields into sector-based rows for manual placement
 * Each row has 4 sectors (25% each)
 * Fields with explicit sector positions are placed exactly where specified
 * Fields without explicit positions are auto-placed in available sectors
 */
export const organizeFieldsIntoSectors = (fields) => {
   const rows = [];

   // First pass: identify unique row indices and sort fields
   const fieldsWithRows = fields.map((field, index) => ({
      ...field,
      originalIndex: index,
      effectiveRowIndex:
         field.rowIndex !== null ? field.rowIndex : Math.floor(index / 4), // Default: 4 fields per row attempt
   }));

   // Group fields by their effective row index
   const fieldsByRow = {};
   fieldsWithRows.forEach((field) => {
      const rowIndex = field.effectiveRowIndex;
      if (!fieldsByRow[rowIndex]) {
         fieldsByRow[rowIndex] = [];
      }
      fieldsByRow[rowIndex].push(field);
   });

   // Sort row indices and process each row
   const sortedRowIndices = Object.keys(fieldsByRow)
      .map(Number)
      .sort((a, b) => a - b);

   sortedRowIndices.forEach((rowIndex) => {
      const rowFields = fieldsByRow[rowIndex];
      const sectors = [null, null, null, null]; // 4 sectors per row

      // First, place fields with explicit sector positions
      rowFields.forEach((field) => {
         if (
            field.sectorPosition !== null &&
            field.sectorPosition >= 0 &&
            field.sectorPosition <= 3
         ) {
            const sectorCount = getFieldSectorCount(field.width);
            const startSector = field.sectorPosition;

            // Check if the field can fit in the specified position
            let canFit = true;
            for (let i = 0; i < sectorCount && startSector + i < 4; i++) {
               if (sectors[startSector + i] !== null) {
                  canFit = false;
                  break;
               }
            }

            // Place the field if it fits, otherwise it will be auto-placed later
            if (canFit) {
               for (let i = 0; i < sectorCount && startSector + i < 4; i++) {
                  sectors[startSector + i] = {
                     field,
                     sectorIndex: i,
                     totalSectors: sectorCount,
                     startSector,
                     isExplicitlyPlaced: true,
                  };
               }
            }
         }
      });

      // Then, auto-place fields without explicit positions
      rowFields.forEach((field) => {
         // Skip if already placed
         if (
            field.sectorPosition !== null &&
            sectors.some((s) => s && s.field.id === field.id)
         ) {
            return;
         }

         const sectorCount = getFieldSectorCount(field.width);
         let placed = false;

         // Find first available position for auto-placement
         for (
            let startSector = 0;
            startSector <= 4 - sectorCount && !placed;
            startSector++
         ) {
            let canFit = true;
            for (let i = 0; i < sectorCount; i++) {
               if (sectors[startSector + i] !== null) {
                  canFit = false;
                  break;
               }
            }

            if (canFit) {
               for (let i = 0; i < sectorCount; i++) {
                  sectors[startSector + i] = {
                     field,
                     sectorIndex: i,
                     totalSectors: sectorCount,
                     startSector,
                     isExplicitlyPlaced: false,
                  };
               }
               placed = true;
            }
         }

         // If couldn't fit in current row, create a new row
         if (!placed) {
            // Finish current row
            rows.push(sectors);

            // Create new row with this field
            const newSectors = [null, null, null, null];
            for (let i = 0; i < sectorCount; i++) {
               newSectors[i] = {
                  field,
                  sectorIndex: i,
                  totalSectors: sectorCount,
                  startSector: 0,
                  isExplicitlyPlaced: false,
               };
            }
            rows.push(newSectors);
            return;
         }
      });

      rows.push(sectors);
   });

   return rows;
};
