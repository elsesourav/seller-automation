import { FiAlignCenter } from "react-icons/fi";

/**
 * Title/Header input component for section headers
 */
const TitleInput = ({
   label,
   value,
   onChange,
   placeholder = "Enter title here",
   helperText,
   required = false,
   width = "w-full",
   disabled = false,
}) => {
   const handleChange = (e) => {
      if (onChange) {
         onChange(e.target.value);
      }
   };

   return (
      <div className={`${width}`}>
         {label && (
            <label className="block text-sm font-medium text-gray-300 mb-2">
               <div className="flex items-center gap-2">
                  <FiAlignCenter className="w-4 h-4" />
                  {label}
                  {required && <span className="text-red-400 ml-1">*</span>}
               </div>
            </label>
         )}

         <input
            type="text"
            value={value || ""}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg 
                     text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent transition-all disabled:opacity-50 
                     disabled:cursor-not-allowed text-lg font-semibold"
         />

         {helperText && (
            <p className="mt-2 text-sm text-gray-400 flex items-center gap-1">
               <FiAlignCenter className="w-3 h-3" />
               {helperText}
            </p>
         )}
      </div>
   );
};

export default TitleInput;
