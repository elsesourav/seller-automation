import { useState } from "react";

const NumberInput = ({
   label,
   value,
   onChange,
   placeholder = "",
   min,
   max,
   step = 1,
   required = false,
   disabled = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
}) => {
   const [focused, setFocused] = useState(false);

   const handleChange = (e) => {
      const newValue = e.target.value;

      // Allow empty value
      if (newValue === "") {
         onChange("");
         return;
      }

      // Allow only numbers, minus sign, and decimal point
      if (!/^-?\d*\.?\d*$/.test(newValue)) {
         return;
      }

      const numValue = Number(newValue);

      // Check if it's a valid number
      if (!isNaN(numValue)) {
         // Apply min/max constraints
         if (min !== undefined && numValue < min) return;
         if (max !== undefined && numValue > max) return;

         onChange(numValue);
      }
   };

   const increment = () => {
      const newValue = (value || 0) + step;
      if (!max || newValue <= max) {
         onChange(newValue);
      }
   };

   const decrement = () => {
      const newValue = (value || 0) - step;
      if (!min || newValue >= min) {
         onChange(newValue);
      }
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
            <input
               type="text"
               inputMode="numeric"
               value={value || ""}
               onChange={handleChange}
               onFocus={() => setFocused(true)}
               onBlur={() => setFocused(false)}
               placeholder={placeholder}
               disabled={disabled}
               className={`w-full px-4 py-3 pr-12 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none ${
                  error
                     ? "border-red-500 focus:border-red-400"
                     : focused
                     ? "border-blue-500 focus:border-blue-400"
                     : "border-gray-600 hover:border-gray-500"
               } ${
                  disabled
                     ? "opacity-50 cursor-not-allowed"
                     : "hover:bg-gray-800/70"
               }`}
            />

            {/* Number controls */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
               <button
                  type="button"
                  onClick={increment}
                  disabled={disabled || (max && value >= max)}
                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <svg
                     className="w-3 h-3"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
               <button
                  type="button"
                  onClick={decrement}
                  disabled={disabled || (min && value <= min)}
                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <svg
                     className="w-3 h-3"
                     fill="currentColor"
                     viewBox="0 0 20 20"
                  >
                     <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                     />
                  </svg>
               </button>
            </div>

            {focused && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}
         </div>

         {error && (
            <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
      </div>
   );
};

export default NumberInput;
