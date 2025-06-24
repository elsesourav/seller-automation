import {
   FiCalendar,
   FiChevronDown,
   FiHash,
   FiList,
   FiMinus,
   FiType,
} from "react-icons/fi";
import { getWidthIcon } from "../../utils/widthIcons";

const DragPreview = ({ dragPreview, mousePosition }) => {
   if (!dragPreview) {
      return null;
   }

   const getFieldIcon = (type) => {
      const icons = {
         text: FiType,
         number: FiHash,
         date: FiCalendar,
         select: FiChevronDown,
         multiple: FiList,
         hr: FiMinus,
      };
      const IconComponent = icons[type] || FiType;
      return <IconComponent className="w-4 h-4" />;
   };

   const getWidthClass = (width) => {
      switch (width) {
         case "fourth":
            return "w-1/4"; // 25%
         case "half":
            return "w-1/2"; // 50%
         case "three-fourths":
            return "w-3/4"; // 75%
         case "full":
         default:
            return "w-full"; // 100%
      }
   };

   return (
      <div
         className="fixed pointer-events-none z-[9999] transform -translate-x-1/2 -translate-y-1/2"
         style={{
            left: mousePosition.x,
            top: mousePosition.y,
         }}
      >
         <div
            className={`${getWidthClass(
               dragPreview.width
            )} min-w-[200px] max-w-[400px]`}
         >
            <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl border border-blue-500/50 shadow-2xl p-4 transform rotate-3 scale-95">
               {dragPreview.type === "hr" ? (
                  // HR Field Preview
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                        <FiMinus className="w-4 h-4 text-gray-400" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-white font-medium text-sm">
                           Horizontal Divider
                        </h4>
                        <div className="h-px bg-gray-600 mt-2" />
                     </div>
                  </div>
               ) : (
                  // Regular Field Preview
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                           {getFieldIcon(dragPreview.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                           <h4 className="text-white font-medium text-sm truncate">
                              {dragPreview.label}
                           </h4>
                           <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400 capitalize">
                                 {dragPreview.type}
                              </span>
                           </div>
                        </div>
                     </div>
                     {/* Width indicator */}
                     <div className="ml-2 flex items-center gap-1">
                        <div className="w-5 h-5 bg-blue-500/20 rounded-md flex items-center justify-center">
                           {getWidthIcon(
                              dragPreview.width,
                              "w-3 h-3 text-blue-400"
                           )}
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};

export default DragPreview;
