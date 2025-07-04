const DataTable = ({
   headers = [],
   data = [],
   onRowAction,
   actionLabel = "Edit",
   actionIcon: ActionIcon,
   onSecondaryAction,
   secondaryActionLabel = "Delete",
   secondaryActionIcon: SecondaryActionIcon,
   noDataMessage = "No data available",
   className = "",
   showActions = true,
   loading = false,
   onRowClick,
   striped = true,
   hover = true,
   compact = false,
}) => {
   if (loading) {
      return (
         <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading...</p>
         </div>
      );
   }

   return (
      <div
         className={`relative w-full bg-gray-800/70 rounded-2xl overflow-hidden border border-gray-700 shadow-lg ${className}`}
      >
         {/* Table Header */}
         <div
            className={`flex gap-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 text-gray-200 px-4 font-semibold text-sm rounded-t-2xl ${
               compact ? "py-1" : "py-2"
            }`}
         >
            {headers.map((header, index) => (
               <p
                  key={index}
                  className={`${header.className || ""} text-left`}
                  style={{ width: header.width }}
               >
                  {header.label}
               </p>
            ))}
            {showActions && <p className="w-16 text-center">Actions</p>}
         </div>

         {/* Table Body */}
         <div>
            {data.length === 0 ? (
               <div className="text-center text-gray-500 py-4 bg-gray-900/60">
                  {noDataMessage}
               </div>
            ) : (
               data.map((row, rowIndex) => (
                  <div
                     key={row.id || rowIndex}
                     className={`flex items-center gap-2 border-t border-gray-700 ${
                        hover ? "hover:bg-gray-700/40" : ""
                     } ${
                        striped && rowIndex % 2 === 0 ? "bg-black/10" : ""
                     } transition-colors duration-150 group px-4 ${
                        compact ? "py-1" : "py-3"
                     } ${onRowClick ? "cursor-pointer" : ""}`}
                     onClick={() => onRowClick && onRowClick(row, rowIndex)}
                  >
                     {headers.map((header, colIndex) => (
                        <div
                           key={colIndex}
                           className={`${
                              header.className || ""
                           } text-left text-gray-200 ${
                              colIndex === 0
                                 ? "text-white group-hover:text-green-200"
                                 : ""
                           }`}
                           style={{ width: header.width }}
                        >
                           {header.render
                              ? header.render(row, rowIndex)
                              : row[header.key] || "-"}
                        </div>
                     ))}
                     {showActions && (
                        <div className="w-16 flex gap-2 justify-center">
                           {onRowAction && row.showAction !== false && (
                              <button
                                 className="text-blue-400 hover:text-blue-200 flex items-center gap-1 cursor-pointer transition-colors"
                                 onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click when action is clicked
                                    onRowAction(row, rowIndex);
                                 }}
                                 title={actionLabel}
                              >
                                 {ActionIcon && <ActionIcon />}
                              </button>
                           )}
                           {onSecondaryAction && row.showAction !== false && (
                              <button
                                 className="text-red-400 hover:text-red-200 flex items-center gap-1 cursor-pointer transition-colors"
                                 onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click when action is clicked
                                    onSecondaryAction(row, rowIndex);
                                 }}
                                 title={secondaryActionLabel}
                              >
                                 {SecondaryActionIcon && (
                                    <SecondaryActionIcon />
                                 )}
                              </button>
                           )}
                        </div>
                     )}
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

export default DataTable;
