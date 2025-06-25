import { groupFieldsIntoRows } from "../../utils/formMaker";
import {
   DateInput,
   MultipleInput,
   NumberInput,
   SelectInput,
   TextInput,
   TitleBar,
   SpaceBar,
} from "../inputs";

const FormPreview = ({ fields, formData, onFormDataChange, onBack }) => {
   // Group fields into rows using the same logic as FormCanvas
   const rows = groupFieldsIntoRows(fields);

   // Helper: get Tailwind col-span class for 4-section grid
   const getColSpan = (width) => {
      switch (width) {
         case "fourth":
            return "col-span-1";
         case "half":
            return "col-span-2";
         case "three-fourths":
            return "col-span-3";
         case "full":
         default:
            return "col-span-4";
      }
   };

   // Render a single field using the correct input component
   const renderField = (field) => {
      const commonProps = {
         label: field.label,
         value: formData[field.name] || (field.type === "multiple" ? [] : ""),
         onChange: (value) => onFormDataChange(field.name, value),
         placeholder: field.placeholder,
         required: field.required,
         helperText: field.helperText,
         width: "w-full",
         options: field.options,
         min: field.min,
         max: field.max,
         step: field.step,
         disabled: field.disabled,
      };
      switch (field.type) {
         case "title":
            return (
               <TitleBar
                  value={field.label}
                  width="w-full"
               />
            );
         case "text":
            return <TextInput {...commonProps} />;
         case "number":
            return <NumberInput {...commonProps} />;
         case "date":
            return <DateInput {...commonProps} />;
         case "select":
            return <SelectInput {...commonProps} />;
         case "multiple":
            return <MultipleInput {...commonProps} fieldType="select" />;
         case "spacer":
            return <SpaceBar {...commonProps} />;
         default:
            return null;
      }
   };

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
               onClick={onBack}
               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
               ← Back to Editor
            </button>
            <h3 className="text-lg font-semibold text-white">Form Preview</h3>
         </div>
         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto space-y-6">
               <form className="flex flex-col">
                  {rows.map((row, rowIdx) => (
                     <div key={rowIdx} className="grid grid-cols-4 h-26 gap-4">
                        {row.map((field) => (
                           <div
                              key={field.id}
                              className={getColSpan(field.width)}
                           >
                              {renderField(field)}
                           </div>
                        ))}
                     </div>
                  ))}
                  {fields.length > 0 && (
                     <div className="pt-4">
                        <button
                           type="button"
                           className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                        >
                           Submit Form
                        </button>
                     </div>
                  )}
               </form>
            </div>
         </div>
      </div>
   );
};

export default FormPreview;
