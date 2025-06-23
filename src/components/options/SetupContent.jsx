import { useState } from "react";
import {
   DateInput,
   InputWithOverlay,
   MultipleInput,
   NumberInput,
   SelectInput,
   TextInput,
} from "./../inputs";

export default function SetupContent() {
   const [formData, setFormData] = useState({
      number: 0,
      text: "",
      date: "",
      selection: "",
      customInput: {},
      favoriteMonths: [],
   });

   return (
      <div className="max-w-2xl mx-auto space-y-6 p-6">
         <h2 className="text-2xl font-bold text-white mb-6">
            Setup & Configuration
         </h2>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <NumberInput
               placeholder="Enter a number"
               value={formData.number}
               onChange={(value) =>
                  setFormData((prev) => ({ ...prev, number: value }))
               }
               min={0}
               max={100}
               required
               width="w-full"
            />

            <TextInput
               placeholder="Enter store name"
               value={formData.text}
               onChange={(value) =>
                  setFormData((prev) => ({ ...prev, text: value }))
               }
               required
               width="w-full"
            />

            <DateInput
               value={formData.date}
               onChange={(value) =>
                  setFormData((prev) => ({ ...prev, date: value }))
               }
               required
               width="w-full"
            />

            <SelectInput
               value={formData.selection}
               onChange={(value) =>
                  setFormData((prev) => ({ ...prev, selection: value }))
               }
               required
               width="w-full"
               options={[
                  { value: "option1", label: "Option 1" },
                  { value: "option2", label: "Option 2" },
                  { value: "option3", label: "Option 3" },
               ]}
            />
         </div>

         <div className="mt-8">
            <InputWithOverlay
               value={formData.customInput}
               onChange={(value) =>
                  setFormData((prev) => ({ ...prev, customInput: value }))
               }
               placeholder="Click to configure advanced settings"
               overlayTitle="Advanced Settings"
               width="w-full"
               overlayFields={[
                  {
                     name: "favoriteMonths",
                     label: "Favorite Months",
                     type: "text",
                     multiple: true,
                     placeholder: "Select a month",
                  },
               ]}
            />
         </div>

         <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">
               MultipleInput Examples
            </h3>

            <div className="space-y-4">
               {/* Simple Multiple Months Selection */}
               <MultipleInput
                  label="Favorite Months"
                  value={formData.favoriteMonths}
                  onChange={(months) =>
                     setFormData((prev) => ({
                        ...prev,
                        favoriteMonths: months,
                     }))
                  }
                  fieldType="select"
                  placeholder="Click to select favorite months"
                  options={[
                     { value: "January", label: "January" },
                     { value: "February", label: "February" },
                     { value: "March", label: "March" },
                     { value: "April", label: "April" },
                     { value: "May", label: "May" },
                     { value: "June", label: "June" },
                     { value: "July", label: "July" },
                     { value: "August", label: "August" },
                     { value: "September", label: "September" },
                     { value: "October", label: "October" },
                     { value: "November", label: "November" },
                     { value: "December", label: "December" },
                  ]}
                  required={true}
                  helperText="Select all months you prefer for peak business"
                  width="w-full"
               />
            </div>
         </div>

         <div className="bg-gray-800/50 rounded-xl p-4 mt-8">
            <h3 className="text-lg font-semibold text-white mb-3">
               Current Configuration
            </h3>
            <pre className="text-gray-300 text-sm overflow-auto">
               {JSON.stringify(formData, null, 2)}
            </pre>
         </div>
      </div>
   );
}
