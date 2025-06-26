import { useState } from "react";

const TextArea = ({
   label,
   value,
   onChange,
   placeholder = "",
   required = false,
   disabled = false,
   error = "",
   helperText = "",
   className = "",
   width = "w-full",
   rows = 4,
   onFocus,
}) => {
   const [focused, setFocused] = useState(false);

   const handleFocus = (e) => {
      setFocused(true);
      if (onFocus) onFocus(e);
   };

   return (
      <div
         className={`relative grid grid-rows-[24px_1fr] h-full ${width} ${className}`}
      >
         {label && (
            <label className="block text-sm font-medium text-gray-300 mb-1">
               {label}
               {required && <span className="text-red-400 ml-1">*</span>}
            </label>
         )}
         <div className="relative size-full">
            <div className="absolute size-full">
               <textarea
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  onFocus={handleFocus}
                  onBlur={() => setFocused(false)}
                  placeholder={placeholder}
                  disabled={disabled}
                  required={required}
                  rows={rows}
                  className={`relative w-full h-full px-4 py-3 bg-gray-800/50 border-2 rounded-xl text-white placeholder-gray-500 transition-all duration-300 focus:outline-none resize-none ${
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
            </div>
            {focused && !error && (
               <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 pointer-events-none"></div>
            )}
         </div>
         {error && (
            <p className="mt-1 text-sm text-red-400 flex items-center">
               <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
               >
                  <path
                     fillRule="evenodd"
                     d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zm-7-4a1 1 0 10-2 0v4a1 1 0 002 0V6zm-1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                     clipRule="evenodd"
                  />
               </svg>
               {error}
            </p>
         )}
         {helperText && !error && (
            <p className="mt-1 text-sm text-gray-400">{helperText}</p>
         )}
      </div>
   );
};

export default TextArea;
