export default function ConfirmDialog({
   open,
   title,
   message,
   onConfirm,
   onCancel,
}) {
   if (!open) return null;
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
         <div className="bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 max-w-sm w-full p-6 relative flex flex-col items-center">
            <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
            <div className="text-gray-300 mb-6 text-center">{message}</div>
            <div className="flex gap-4 w-full justify-center">
               <button
                  onClick={onCancel}
                  className="px-5 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium cursor-pointer"
               >
                  Cancel
               </button>
               <button
                  onClick={onConfirm}
                  className="px-5 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-medium cursor-pointer"
               >
                  Confirm
               </button>
            </div>
         </div>
      </div>
   );
}
