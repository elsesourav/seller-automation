import {
   BasicInfoIcon,
   DescFormIcon,
   DescriptionIcon,
   InfoFormIcon,
   ProductIcon,
   VerticalIcon,
} from "../../icons/SetupIcons";

const tabs = [
   { id: "product", label: "Product", icon: ProductIcon },
   { id: "basicinfo", label: "BasicInfo", icon: BasicInfoIcon },
   { id: "description", label: "Description", icon: DescriptionIcon },
   { id: "infoform", label: "InfoForm", icon: InfoFormIcon },
   { id: "descform", label: "DescForm", icon: DescFormIcon },
   { id: "verticalandcategory", label: "Vertical", icon: VerticalIcon },
];

export default function SetupHeader({ activeTab, setActiveTab }) {
   return (
      <div className="w-full flex justify-center mb-8">
         <div className="flex bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/60 p-1 gap-4">
            {tabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-base transition-all duration-300 focus:outline-none cursor-pointer
                ${
                   isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/60"
                }
              `}
                  >
                     <Icon
                        className={`w-5 h-5 ${isActive ? "scale-110" : ""}`}
                     />
                     <span>{tab.label}</span>
                  </button>
               );
            })}
         </div>
      </div>
   );
}
