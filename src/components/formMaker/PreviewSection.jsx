import React from "react";
import { FiCode, FiCopy, FiDownload, FiEye } from "react-icons/fi";
import {
   generateFormSchema,
   getFieldWidthClass,
   groupFieldsIntoRows,
} from "../../utils/formMaker";
import {
   DateInput,
   MultipleInput,
   NumberInput,
   SelectInput,
   TextInput,
} from "../inputs";

const PreviewSection = ({ fields, formData, handleFormDataChange }) => {
   const fieldRows = groupFieldsIntoRows(fields);
   const [showCode, setShowCode] = React.useState(false);
   const [copied, setCopied] = React.useState(false);

   const handleCopySchema = async () => {
      const schema = generateFormSchema(fields);
      try {
         await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
      } catch (err) {
         console.error("Failed to copy:", err);
      }
   };

   const handleExportForm = () => {
      const formConfig = {
         fields: fields,
         schema: generateFormSchema(fields),
         metadata: {
            created: new Date().toISOString(),
            fieldCount: fields.filter((f) => f.type !== "hr").length,
            version: "1.0.0",
         },
      };

      const blob = new Blob([JSON.stringify(formConfig, null, 2)], {
         type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "form-config.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
   };

   if (fields.length === 0) {
      return (
         <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
               <FiEye className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
               No Fields to Preview
            </h3>
            <p className="text-gray-500 mb-6">
               Add some fields to see the form preview
            </p>
         </div>
      );
   }

   return (
      <div className="space-y-6">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div>
               <h3 className="text-xl font-bold text-white mb-2">
                  Form Preview
               </h3>
               <p className="text-gray-400">
                  See how your form will look and function
               </p>
            </div>
            <div className="flex items-center gap-2">
               <button
                  onClick={() => setShowCode(!showCode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                     showCode
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
               >
                  <FiCode className="w-4 h-4" />
                  {showCode ? "Form View" : "Code View"}
               </button>
               <button
                  onClick={handleExportForm}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 
                           text-white rounded-lg transition-colors"
               >
                  <FiDownload className="w-4 h-4" />
                  Export
               </button>
            </div>
         </div>

         {showCode ? (
            // Code View
            <div className="space-y-4">
               {/* JSON Schema */}
               <div className="bg-gray-900 rounded-xl border border-gray-700">
                  <div className="flex items-center justify-between p-4 border-b border-gray-700">
                     <h4 className="text-white font-semibold">JSON Schema</h4>
                     <button
                        onClick={handleCopySchema}
                        className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                           copied
                              ? "bg-green-500 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        }`}
                     >
                        <FiCopy className="w-4 h-4" />
                        {copied ? "Copied!" : "Copy"}
                     </button>
                  </div>
                  <div className="p-4">
                     <pre className="text-sm text-gray-300 overflow-auto">
                        {JSON.stringify(generateFormSchema(fields), null, 2)}
                     </pre>
                  </div>
               </div>

               {/* Form Data */}
               <div className="bg-gray-900 rounded-xl border border-gray-700">
                  <div className="p-4 border-b border-gray-700">
                     <h4 className="text-white font-semibold">
                        Current Form Data
                     </h4>
                  </div>
                  <div className="p-4">
                     <pre className="text-sm text-gray-300 overflow-auto">
                        {JSON.stringify(formData, null, 2)}
                     </pre>
                  </div>
               </div>
            </div>
         ) : (
            // Form View
            <div className="bg-white rounded-xl p-8 border border-gray-300">
               <div className="space-y-6">
                  {fieldRows.map((row, rowIndex) => (
                     <div key={rowIndex} className="grid grid-cols-12 gap-4">
                        {row.map((field) => {
                           const widthClass = getFieldWidthClass(field.width);

                           if (field.type === "hr") {
                              return (
                                 <div key={field.id} className="col-span-12">
                                    <hr className="border-gray-300 my-4" />
                                 </div>
                              );
                           }

                           return (
                              <div key={field.id} className={widthClass}>
                                 {field.type === "text" && (
                                    <TextInput
                                       label={field.label}
                                       value={formData[field.name] || ""}
                                       onChange={(value) =>
                                          handleFormDataChange(
                                             field.name,
                                             value
                                          )
                                       }
                                       placeholder={field.placeholder}
                                       required={field.required}
                                       helperText={field.helperText}
                                       width="w-full"
                                    />
                                 )}
                                 {field.type === "number" && (
                                    <NumberInput
                                       label={field.label}
                                       value={formData[field.name] || ""}
                                       onChange={(value) =>
                                          handleFormDataChange(
                                             field.name,
                                             value
                                          )
                                       }
                                       placeholder={field.placeholder}
                                       required={field.required}
                                       helperText={field.helperText}
                                       min={field.min}
                                       max={field.max}
                                       step={field.step}
                                       width="w-full"
                                    />
                                 )}
                                 {field.type === "date" && (
                                    <DateInput
                                       label={field.label}
                                       value={formData[field.name] || ""}
                                       onChange={(value) =>
                                          handleFormDataChange(
                                             field.name,
                                             value
                                          )
                                       }
                                       required={field.required}
                                       helperText={field.helperText}
                                       width="w-full"
                                    />
                                 )}
                                 {field.type === "select" && (
                                    <SelectInput
                                       label={field.label}
                                       value={formData[field.name] || ""}
                                       onChange={(value) =>
                                          handleFormDataChange(
                                             field.name,
                                             value
                                          )
                                       }
                                       options={field.options}
                                       required={field.required}
                                       helperText={field.helperText}
                                       width="w-full"
                                    />
                                 )}
                                 {field.type === "multiple" && (
                                    <MultipleInput
                                       label={field.label}
                                       values={formData[field.name] || []}
                                       onChange={(values) =>
                                          handleFormDataChange(
                                             field.name,
                                             values
                                          )
                                       }
                                       required={field.required}
                                       helperText={field.helperText}
                                       width="w-full"
                                    />
                                 )}
                              </div>
                           );
                        })}
                     </div>
                  ))}

                  {/* Sample Submit Button */}
                  <div className="pt-6 border-t border-gray-200">
                     <button
                        type="button"
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg 
                                 hover:bg-blue-700 transition-colors font-medium"
                        onClick={() =>
                           alert(
                              "This is a preview - form submission is not functional"
                           )
                        }
                     >
                        Submit Form (Preview Only)
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Stats */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
               <div className="text-2xl font-bold text-blue-400 mb-1">
                  {fields.filter((f) => f.type !== "hr").length}
               </div>
               <div className="text-blue-300 text-sm">Input Fields</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
               <div className="text-2xl font-bold text-purple-400 mb-1">
                  {fields.filter((f) => f.type === "hr").length}
               </div>
               <div className="text-purple-300 text-sm">Dividers</div>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
               <div className="text-2xl font-bold text-green-400 mb-1">
                  {fieldRows.length}
               </div>
               <div className="text-green-300 text-sm">Rows</div>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
               <div className="text-2xl font-bold text-orange-400 mb-1">
                  {fields.filter((f) => f.required).length}
               </div>
               <div className="text-orange-300 text-sm">Required</div>
            </div>
         </div>
      </div>
   );
};

export default PreviewSection;
