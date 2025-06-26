import { useState } from "react";
import CustomForm from "../formMaker/CustomForm";
import FormBuilder from "../formMaker/FormBuilder";
import {} from "../inputs";

export default function SetupContent() {
   const [isFormBuilderOpen, setIsFormBuilderOpen] = useState(false);
   const [savedSchema, setSavedSchema] = useState(null);
   const [showCustomForm, setShowCustomForm] = useState(false);
   const [customFormData, setCustomFormData] = useState(null);

   // Handler to receive schema from FormBuilder and show CustomForm
   const handleFormBuilderSave = (schema) => {
      console.log("Received schema from FormBuilder:", schema);
      setSavedSchema(schema);
      setShowCustomForm(true);
   };

   return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
         <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">
               Dynamic Form Builder
            </h3>
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-600">
               <div className="text-center">
                  <svg
                     className="w-12 h-12 text-gray-400 mx-auto mb-4"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                     />
                  </svg>
                  <h4 className="text-lg font-semibold text-white mb-2">
                     Create Custom Forms
                  </h4>
                  <p className="text-gray-400 mb-6">
                     Build dynamic forms with text, number, date, select, and
                     multiple-value inputs
                  </p>
                  <button
                     onClick={() => setIsFormBuilderOpen(true)}
                     className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
                  >
                     Open Form Builder
                  </button>
               </div>
            </div>

            <FormBuilder
               isOpen={isFormBuilderOpen}
               onClose={() => setIsFormBuilderOpen(false)}
               onSaveSchema={handleFormBuilderSave}
            />
         </div>

         {/* Show the custom form if schema is saved */}
         {showCustomForm && savedSchema && (
            <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-gray-600">
               <CustomForm
                  schema={savedSchema}
                  onSubmit={(data) => setCustomFormData(data)}
               />

               {customFormData && (
                  <div className="mt-4">
                     <h4 className="text-white font-semibold mb-2">
                        Submitted Data
                     </h4>
                     <pre className="text-gray-300 text-sm overflow-auto bg-gray-900 rounded p-2">
                        {JSON.stringify(customFormData, null, 2)}
                     </pre>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
