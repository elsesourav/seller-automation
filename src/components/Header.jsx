const Header = ({
   tabs = [],
   activeTab,
   setActiveTab,
   className = "",
   variant = "default", // "default", "compact", "pills"
}) => {
   const getVariantClasses = () => {
      switch (variant) {
         case "compact":
            return {
               container:
                  "flex bg-gray-800/80 rounded-lg shadow border border-gray-700/50 p-0.5 gap-1",
               button: "px-3 py-2 rounded-md text-sm",
               icon: "w-4 h-4",
            };
         case "pills":
            return {
               container: "flex gap-2",
               button: "px-4 py-2 rounded-full text-sm",
               icon: "w-4 h-4",
            };
         default:
            return {
               container:
                  "flex bg-gray-800/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-700/60 p-1 gap-4",
               button: "px-5 py-3 rounded-xl text-base",
               icon: "w-5 h-5",
            };
      }
   };

   const variantClasses = getVariantClasses();

   return (
      <div className={`w-full flex justify-center mb-8 ${className}`}>
         <div className={variantClasses.container}>
            {tabs.map((tab) => {
               const Icon = tab.icon;
               const isActive = activeTab === tab.id;
               return (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-2 ${
                        variantClasses.button
                     } font-semibold transition-all duration-300 focus:outline-none cursor-pointer
                ${
                   isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md"
                      : "text-gray-300 hover:text-white hover:bg-gray-700/60"
                }
              `}
                  >
                     {Icon && (
                        <Icon
                           className={`${variantClasses.icon} ${
                              isActive ? "scale-110" : ""
                           }`}
                        />
                     )}
                     <span>{tab.label}</span>
                  </button>
               );
            })}
         </div>
      </div>
   );
};

export default Header;
