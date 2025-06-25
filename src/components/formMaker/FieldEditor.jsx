import {
   FiAlignCenter,
   FiCalendar,
   FiChevronDown,
   FiHash,
   FiList,
   FiPlus,
   FiSave,
   FiTrash2,
   FiType,
   FiX,
} from "react-icons/fi";
import { normalizeField } from "../../utils/formMaker";
import { NumberInput, TextInput, TitleInput } from "../inputs";

const FieldEditor = ({
   field,
   isOpen,
   onClose,
   onSave,
   onUpdate,
   onDelete,
   onAddOption,
   onUpdateOption,
   onRemoveOption,
}) => {
   if (!isOpen || !field) return null;

   const normalizedField = normalizeField(field);

   const getFieldIcon = (type) => {
      const icons = {
         text: FiType,
         title: FiAlignCenter,
         number: FiHash,
         date: FiCalendar,
         select: FiChevronDown,
         multiple: FiList,
      };
      const IconComponent = icons[type] || FiType;
      return <IconComponent className="w-5 h-5" />;
   };

   const handleSave = () => {
      if (onSave) {
         onSave();
      } else {
         onClose();
      }
   };

   const handleDelete = () => {
      onDelete(normalizedField.id);
      onClose();
   };

   return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
         {/* Backdrop */}
         <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
         />

         {/* Modal */}
         <div className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                     {getFieldIcon(normalizedField.type)}
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-white">
                        Edit Field
                     </h2>
                     <p className="text-gray-400 text-sm">
                        Configure your form field
                     </p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 
                           rounded-lg transition-colors"
               >
                  <FiX className="w-5 h-5" />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
               <div className="space-y-6">
                  {/* Title Field Settings - Show for title fields */}
                  {normalizedField.type === "title" && (
                     <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                        <h3 className="text-lg font-semibold text-white mb-4">
                           Title Settings
                        </h3>
                        <div className="space-y-4">
                           <TitleInput
                              label="Title Text"
                              value={normalizedField.label}
                              onChange={(value) =>
                                 onUpdate(normalizedField.id, {
                                    label: value,
                                 })
                              }
                              placeholder="Enter title text"
                              helperText="This is how your title will appear in the form"
                              width="w-full"
                           />
                        </div>
                     </div>
                  )}

                  {/* Regular Field Settings - Show for non-title fields */}
                  {normalizedField.type !== "title" && (
                     <>
                        {/* Basic Settings */}
                        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                           <h3 className="text-lg font-semibold text-white mb-4">
                              Basic Settings
                           </h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Field Name */}
                              <TextInput
                                 label="Field Name"
                                 value={normalizedField.name}
                                 onChange={(value) =>
                                    onUpdate(normalizedField.id, {
                                       name: value,
                                    })
                                 }
                                 placeholder="field_name"
                                 helperText="Used as the key in form data"
                                 width="w-full"
                              />

                              {/* Field Label */}
                              <TextInput
                                 label="Field Label"
                                 value={normalizedField.label}
                                 onChange={(value) =>
                                    onUpdate(normalizedField.id, {
                                       label: value,
                                    })
                                 }
                                 placeholder="Field Label"
                                 helperText="Displayed above the input"
                                 width="w-full"
                              />

                              {/* Placeholder */}
                              <TextInput
                                 label="Placeholder"
                                 value={normalizedField.placeholder}
                                 onChange={(value) =>
                                    onUpdate(normalizedField.id, {
                                       placeholder: value,
                                    })
                                 }
                                 placeholder="Enter placeholder text"
                                 helperText="Hint text inside the input"
                                 width="w-full"
                              />
                           </div>
                        </div>

                        {/* Number Field Settings */}
                        {normalizedField.type === "number" && (
                           <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                 Number Validation
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <NumberInput
                                    label="Minimum Value"
                                    value={normalizedField.min}
                                    onChange={(value) =>
                                       onUpdate(normalizedField.id, {
                                          min: value,
                                       })
                                    }
                                    placeholder="Min"
                                    width="w-full"
                                 />
                                 <NumberInput
                                    label="Maximum Value"
                                    value={normalizedField.max}
                                    onChange={(value) =>
                                       onUpdate(normalizedField.id, {
                                          max: value,
                                       })
                                    }
                                    placeholder="Max"
                                    width="w-full"
                                 />
                                 <NumberInput
                                    label="Step"
                                    value={normalizedField.step}
                                    onChange={(value) =>
                                       onUpdate(normalizedField.id, {
                                          step: value,
                                       })
                                    }
                                    placeholder="1"
                                    helperText="Increment value"
                                    width="w-full"
                                 />
                              </div>
                           </div>
                        )}

                        {/* Options for Select/Multiple */}
                        {(normalizedField.type === "select" ||
                           normalizedField.type === "multiple") && (
                           <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                              <div className="flex items-center justify-between mb-4">
                                 <h3 className="text-lg font-semibold text-white">
                                    Options
                                 </h3>
                                 <button
                                    onClick={() =>
                                       onAddOption(normalizedField.id)
                                    }
                                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 
                                             text-white rounded-lg transition-colors text-sm"
                                 >
                                    <FiPlus className="w-4 h-4" />
                                    Add Option
                                 </button>
                              </div>

                              {normalizedField.options.length === 0 ? (
                                 <div className="text-center py-8 text-gray-400">
                                    <FiList className="w-8 h-8 mx-auto mb-2" />
                                    <p>No options added yet</p>
                                 </div>
                              ) : (
                                 <div className="space-y-3">
                                    {normalizedField.options.map(
                                       (option, index) => (
                                          <div
                                             key={index}
                                             className="flex items-center gap-3 p-3 bg-gray-600/30 rounded-lg"
                                          >
                                             <span className="text-gray-400 text-sm font-mono w-8">
                                                {index + 1}
                                             </span>
                                             <TextInput
                                                placeholder="Option Value"
                                                value={option.value}
                                                onChange={(value) =>
                                                   onUpdateOption(
                                                      normalizedField.id,
                                                      index,
                                                      { value }
                                                   )
                                                }
                                                width="flex-1"
                                             />
                                             <TextInput
                                                placeholder="Option Label"
                                                value={option.label}
                                                onChange={(label) =>
                                                   onUpdateOption(
                                                      normalizedField.id,
                                                      index,
                                                      { label }
                                                   )
                                                }
                                                width="flex-1"
                                             />
                                             <button
                                                onClick={() =>
                                                   onRemoveOption(
                                                      normalizedField.id,
                                                      index
                                                   )
                                                }
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 
                                                      rounded-lg transition-colors"
                                             >
                                                <FiTrash2 className="w-4 h-4" />
                                             </button>
                                          </div>
                                       )
                                    )}
                                 </div>
                              )}
                           </div>
                        )}

                        {/* Additional Settings - Only for input fields */}
                        {normalizedField.type !== "title" && (
                           <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600">
                              <h3 className="text-lg font-semibold text-white mb-4">
                                 Additional Settings
                              </h3>
                              <div className="space-y-4">
                                 {/* Helper Text */}
                                 <TextInput
                                    label="Helper Text"
                                    value={normalizedField.helperText}
                                    onChange={(value) =>
                                       onUpdate(normalizedField.id, {
                                          helperText: value,
                                       })
                                    }
                                    placeholder="Optional helper text"
                                    helperText="Additional guidance for users"
                                    width="w-full"
                                 />

                                 {/* Required Toggle */}
                                 <div className="flex items-center gap-3">
                                    <input
                                       type="checkbox"
                                       id="required"
                                       checked={normalizedField.required}
                                       onChange={(e) =>
                                          onUpdate(normalizedField.id, {
                                             required: e.target.checked,
                                          })
                                       }
                                       className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 
                                                rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label
                                       htmlFor="required"
                                       className="text-white text-sm font-medium"
                                    >
                                       Required field
                                    </label>
                                 </div>
                              </div>
                           </div>
                        )}
                     </>
                  )}
               </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
               <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 
                           text-white rounded-lg transition-colors"
               >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Field
               </button>
               <div className="flex items-center gap-3">
                  <button
                     onClick={onClose}
                     className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white 
                              rounded-lg transition-colors"
                  >
                     Cancel
                  </button>
                  <button
                     onClick={handleSave}
                     className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 
                              text-white rounded-lg transition-colors font-medium"
                  >
                     <FiSave className="w-4 h-4" />
                     Save Changes
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

export default FieldEditor;
