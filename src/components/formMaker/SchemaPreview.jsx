import { generateFormSchema } from "../../utils/formMaker";

const SchemaPreview = ({ fields, onBack }) => {
   const schema = generateFormSchema(fields);

   return (
      <div className="flex-1 flex flex-col">
         <div className="p-4 border-b border-gray-700 flex items-center gap-4">
            <button
               onClick={onBack}
               className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
               ← Back to Editor
            </button>
            <h3 className="text-lg font-semibold text-white">Form Schema</h3>
         </div>
         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <pre className="bg-gray-800 p-4 rounded-lg text-sm text-green-400 font-mono overflow-x-auto">
               {JSON.stringify(schema, null, 2)}
            </pre>
         </div>
      </div>
   );
};

export default SchemaPreview;
