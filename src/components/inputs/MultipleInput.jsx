import { useState } from "react";
import DateInput from "./DateInput";
import NumberInput from "./NumberInput";
import NumberSelectInput from "./NumberSelectInput";
import SelectInput from "./SelectInput";
import TextInput from "./TextInput";

/**
 * MultipleInput - A simple input component that opens a modal to collect multiple values of one type
 *
 * @example
 * <MultipleInput
 *    label="Favorite Months"
 *    value={favoriteMonths}
 *    onChange={(months) => setFavoriteMonths(months)}
 *    fieldType="select"
 *    placeholder="Select months"
 *    options={[
 *       { value: "january", label: "January" },
 *       { value: "february", label: "February" },
 *       // ... more options
 *    ]}
 * />
 */

const MultipleInput = ({
   label,
   value = [],
   onChange,
   fieldType = "text",
   placeholder = "Click to add items",
   options = [],
   required = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
   min,
   max,
   step,
}) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [currentValues, setCurrentValues] = useState([]);
   const [focused, setFocused] = useState(false);

   const handleOpenModal = () => {
      const safeValue = value || [];
      setCurrentValues(safeValue.length > 0 ? [...safeValue] : [""]);
      setIsModalOpen(true);
   };

   const handleSave = () => {
      const filteredValues = currentValues.filter((v) => v && v !== "");
      onChange(filteredValues);
      setIsModalOpen(false);
   };

   const handleCancel = () => {
      setCurrentValues([]);
      setIsModalOpen(false);
   };

   const addNewValue = () => {
      setCurrentValues((prev) => [...prev, ""]);
   };

   const removeValue = (index) => {
      if (currentValues.length > 1) {
         setCurrentValues((prev) => prev.filter((_, i) => i !== index));
      }
   };

   const updateValue = (index, newValue) => {
      setCurrentValues((prev) => {
         const updated = [...prev];
         updated[index] = newValue;
         return updated;
      });
   };

   const getDisplayValue = (val) => {
      if (fieldType === "select" || fieldType === "numberSelect") {
         const option = options.find((opt) => opt.value === val);
         return option ? option.label : val;
      }
      if (fieldType === "date" && val) {
         return new Date(val).toLocaleDateString();
      }
      return val;
   };

   const renderInput = (val, index) => {
      const props = {
         value: val,
         onChange: (newVal) => updateValue(index, newVal),
         placeholder: placeholder,
      };

      switch (fieldType) {
         case "text":
            return <TextInput {...props} />;
         case "number":
            return <NumberInput {...props} min={min} max={max} step={step} />;
         case "date":
            return <DateInput {...props} />;
         case "select":
            return <SelectInput {...props} options={options} />;
         case "numberSelect":
            return <NumberSelectInput {...props} options={options} />;
         default:
            return <TextInput {...props} />;
      }
   };

   const renderChipsDisplay = () => {
      const safeValue = value || [];
      if (safeValue.length === 0) {
         return <span className="text-gray-500">{placeholder}</span>;
      }

      return (
         <div className="flex flex-wrap gap-1 -my-1">
            {safeValue.map(
               (val, index) =>
                  val && (
                     <div
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md border border-blue-500/30"
                     >
                        {getDisplayValue(val)}
                     </div>
                  )
            )}
         </div>
      );
   };

   return (
      <div className={`relative ${width} ${className}`}>
         {label && (
            <label className="block text-sm font-medium text-gray-300 mb-2">
               {label}
               {required && <span className="text-red-400 ml-1">*</span>}
            </label>
         )}

         <div className="relative">
            <button
               type="button"
               onClick={handleOpenModal}
               onFocus={() => setFocused(true)}
               onBlur={() => setFocused(false)}
               className={`w-full px-4 py-3 pr-10 bg-gray-800/50 border-2 rounded-xl text-left transition-all duration-300 focus:outline-none ${
                  error
                     ? "border-red-500 focus:border-red-400"
                     : focused
                     ? "border-blue-500 focus:border-blue-400"
                     : "border-gray-600 hover:border-gray-500"
               } hover:bg-gray-800/70 cursor-pointer`}
            >
               {renderChipsDisplay()}

               <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg
                     className="w-5 h-5 text-gray-400"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                     />
                  </svg>
               </div>
            </button>

            {focused && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}
         </div>

         {error && (
            <p className="mt-2 text-sm text-red-400 flex items-center">
               <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path
                     fillRule="evenodd"
                     d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                     clipRule="evenodd"
                  />
               </svg>
               {error}
            </p>
         )}

         {helperText && !error && (
            <p className="mt-2 text-sm text-gray-400">{helperText}</p>
         )}

         {/* Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
               {/* Backdrop */}
               <div
                  className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                  onClick={handleCancel}
               />

               {/* Modal */}
               <div className="relative bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-700">
                     <h3 className="text-xl font-semibold text-white">
                        {label || "Add Multiple Items"}
                     </h3>
                     <button
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                     >
                        <svg
                           className="w-6 h-6"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                           />
                        </svg>
                     </button>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                     {/* Display saved values as chips */}
                     {currentValues.filter((v) => v && v !== "").length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                           {currentValues.map(
                              (val, index) =>
                                 val && (
                                    <div
                                       key={`chip-${index}`}
                                       className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 text-sm rounded-md border border-blue-500/30"
                                    >
                                       <span>{getDisplayValue(val)}</span>
                                       <button
                                          type="button"
                                          onClick={() => removeValue(index)}
                                          className="ml-1 text-blue-400 hover:text-red-400 transition-colors"
                                       >
                                          <svg
                                             className="w-3 h-3"
                                             fill="currentColor"
                                             viewBox="0 0 20 20"
                                          >
                                             <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                             />
                                          </svg>
                                       </button>
                                    </div>
                                 )
                           )}
                        </div>
                     )}

                     {/* Input fields */}
                     {currentValues.map((val, index) => (
                        <div
                           key={index}
                           className="flex items-center gap-2 mb-2"
                        >
                           <div className="flex-1">
                              {renderInput(val, index)}
                           </div>
                           {currentValues.length > 1 && (
                              <button
                                 type="button"
                                 onClick={() => removeValue(index)}
                                 className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                 <svg
                                    className="w-4 h-4"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                 >
                                    <path
                                       fillRule="evenodd"
                                       d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                       clipRule="evenodd"
                                    />
                                 </svg>
                              </button>
                           )}
                        </div>
                     ))}

                     <button
                        type="button"
                        onClick={addNewValue}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                     >
                        <svg
                           className="w-4 h-4"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path
                              fillRule="evenodd"
                              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                              clipRule="evenodd"
                           />
                        </svg>
                        Add another {label?.toLowerCase() || "item"}
                     </button>

                     {helperText && (
                        <p className="mt-3 text-sm text-gray-400">
                           {helperText}
                        </p>
                     )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
                     <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                     >
                        Cancel
                     </button>
                     <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
                     >
                        Save
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default MultipleInput;
