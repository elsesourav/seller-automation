import {
   FiCalendar,
   FiChevronDown,
   FiEdit2,
   FiHash,
   FiList,
   FiMinus,
   FiTrash2,
   FiType,
} from "react-icons/fi";
import {
   createNewField,
   FIELD_TYPES,
   getFieldTypeInfo,
} from "../../utils/formMaker";

const AddFieldSection = ({
   fields,
   setFields,
   setEditingField,
   removeField,
}) => {
   const handleAddField = (type = "text") => {
      const newField = createNewField(fields.length, type);
      setFields([...fields, newField]);
      setEditingField(newField.id);
   };

   const getIcon = (iconName) => {
      const icons = {
         FiType: FiType,
         FiHash: FiHash,
         FiCalendar: FiCalendar,
         FiChevronDown: FiChevronDown,
         FiList: FiList,
         FiMinus: FiMinus,
      };
      const IconComponent = icons[iconName] || FiType;
      return <IconComponent className="w-5 h-5" />;
   };

   return (
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 h-full">
         {/* Left Column - Field Type Cards */}
         <div className="space-y-6">
            <div>
               <h3 className="text-xl font-bold text-white mb-2">
                  Add Field Types
               </h3>
            </div>

            <div className="grid grid-cols-6 gap-2">
               {FIELD_TYPES.map((fieldType) => (
                  <button
                     key={fieldType.value}
                     onClick={() => handleAddField(fieldType.value)}
                     className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 
                              rounded-xl p-3 border border-gray-700 hover:border-blue-500 
                              transition-all duration-300 hover:scale-105 hover:shadow-xl
                              text-left"
                  >
                     {/* Background Gradient */}
                     <div
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-600/0 
                                   group-hover:from-blue-500/10 group-hover:to-purple-600/10 
                                   transition-all duration-300"
                     />

                     {/* Content */}
                     <div className="relative flex flex-col items-center justify-between h-full">
                        <div className="relative flex w-full h-full items-center justify-between p-3">
                           <div
                              className="flex items-center justify-center w-8 h-8 bg-gray-700 rounded-lg group-hover:bg-blue-500 transition-colors duration-300"
                           >
                              {getIcon(fieldType.icon)}
                           </div>

                           {/* Hover Effect */}
                           <div
                              className="relative opacity-0 group-hover:opacity-100 
                                   transition-opacity duration-300"
                           >
                              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                 <span className="text-white text-xs font-bold">
                                    +
                                 </span>
                              </div>
                           </div>
                        </div>

                        <p className="text-white text-[12px] font-semibold mb-2">
                           {fieldType.label}
                        </p>
                     </div>
                  </button>
               ))}
            </div>
         </div>

         {/* Right Column - Created Fields List */}
         <div className="space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-xl font-bold text-white mb-2">
                     Created Fields
                  </h3>
                  <p className="text-gray-400">
                     {fields.length} field{fields.length !== 1 ? "s" : ""}{" "}
                     created
                  </p>
               </div>
               {fields.length > 0 && (
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                     {fields.length}
                  </div>
               )}
            </div>

            {/* Fields List */}
            <div className="bg-gray-800/50 rounded-xl border border-gray-700 h-[500px] overflow-hidden">
               {fields.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                     <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <FiList className="w-8 h-8 text-gray-500" />
                     </div>
                     <h4 className="text-gray-400 font-medium mb-2">
                        No fields created yet
                     </h4>
                     <p className="text-gray-500 text-sm">
                        Click on field type cards to start building your form
                     </p>
                  </div>
               ) : (
                  <div className="p-4 h-full overflow-y-auto custom-scrollbar">
                     <div className="space-y-3">
                        {fields.map((field, index) => {
                           const fieldTypeInfo = getFieldTypeInfo(field.type);
                           return (
                              <div
                                 key={field.id}
                                 className="group bg-gray-700/30 rounded-lg border border-gray-600 
                                          hover:border-gray-500 transition-all duration-200 p-4"
                              >
                                 <div className="flex items-center gap-3">
                                    {/* Field Icon */}
                                    <div
                                       className="flex-shrink-0 w-10 h-10 bg-gray-600 rounded-lg 
                                                  flex items-center justify-center"
                                    >
                                       {getIcon(fieldTypeInfo.icon)}
                                    </div>

                                    {/* Field Info */}
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2 mb-1">
                                          <h4 className="text-white font-medium text-sm truncate">
                                             {field.label ||
                                                `Field ${index + 1}`}
                                          </h4>
                                          {field.required && (
                                             <span className="text-red-400 text-xs">
                                                *
                                             </span>
                                          )}
                                       </div>
                                       <div className="flex items-center gap-2 text-xs text-gray-400">
                                          <span>{fieldTypeInfo.label}</span>
                                          <span>•</span>
                                          <span>{field.name}</span>
                                       </div>
                                    </div>

                                    {/* Actions */}
                                    <div
                                       className="flex items-center gap-1 opacity-0 group-hover:opacity-100 
                                                  transition-opacity duration-200"
                                    >
                                       <button
                                          onClick={() =>
                                             setEditingField(field.id)
                                          }
                                          className="p-2 text-blue-400 hover:text-blue-300 
                                                   hover:bg-blue-500/20 rounded-lg transition-colors"
                                          title="Edit Field"
                                       >
                                          <FiEdit2 className="w-4 h-4" />
                                       </button>
                                       <button
                                          onClick={() => removeField(field.id)}
                                          className="p-2 text-red-400 hover:text-red-300 
                                                   hover:bg-red-500/20 rounded-lg transition-colors"
                                          title="Delete Field"
                                       >
                                          <FiTrash2 className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default AddFieldSection;
