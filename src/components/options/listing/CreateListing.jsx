import { useEffect, useState } from "react";
import {
   FiChevronDown,
   FiDownload,
   FiEdit,
   FiEye,
   FiFile,
   FiFileText,
   FiUpload,
} from "react-icons/fi";
import * as XLSX from "xlsx";
import { getCollectedProductData } from "../../../lib/utils";
import CustomAlert from "../../CustomAlert";

export default function CreateListing({ collectedData }) {
   const [selectedFile, setSelectedFile] = useState(null);
   const [alert, setAlert] = useState(null);
   const [excelData, setExcelData] = useState(null);
   const [showFileContent, setShowFileContent] = useState(false);
   const [activeSheet, setActiveSheet] = useState("");
   const [localCollectedData, setLocalCollectedData] = useState(null);

   // Load collected data from localStorage if not provided via props
   useEffect(() => {
      if (!collectedData) {
         const savedData = getCollectedProductData();
         if (savedData) {
            setLocalCollectedData(savedData);
         }
      } else {
         setLocalCollectedData(null);
      }
   }, [collectedData]);

   // Use either passed collectedData or localStorage data
   const effectiveCollectedData = collectedData || localCollectedData;

   const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type === "application/vnd.ms-excel") {
         setSelectedFile(file);

         // Read the Excel file
         const reader = new FileReader();
         reader.onload = (e) => {
            try {
               const data = new Uint8Array(e.target.result);
               const workbook = XLSX.read(data, { type: "array" });

               // Convert all sheets to JSON
               const sheetsData = {};
               workbook.SheetNames.forEach((sheetName) => {
                  const worksheet = workbook.Sheets[sheetName];
                  sheetsData[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
                     header: 1,
                  });
               });

               setExcelData(sheetsData);

               // Set first sheet as active
               const sheetNames = Object.keys(sheetsData);
               if (sheetNames.length > 0) {
                  setActiveSheet(sheetNames[0]);
               }

               setAlert({
                  type: "success",
                  message: `File "${file.name}" uploaded and parsed successfully!`,
               });
            } catch (error) {
               setAlert({
                  type: "error",
                  message:
                     "Error reading Excel file. Please check the file format.",
               });
               console.error("Excel reading error:", error);
            }
         };
         reader.readAsArrayBuffer(file);
      } else {
         setAlert({
            type: "error",
            message: "Please select a valid .xls file",
         });
      }
   };

   const handleEditSpreadsheet = () => {
      if (!selectedFile) {
         setAlert({
            type: "error",
            message: "Please upload an Excel file first",
         });
         return;
      }

      if (!effectiveCollectedData) {
         setAlert({
            type: "error",
            message:
               "Please select product data from the Select Product tab first",
         });
         return;
      }

      // For now, just show that the feature is ready to be implemented
      setAlert({
         type: "success",
         message:
            "Excel editor will open here with your collected data integrated!",
      });
   };

   const handleExportModifiedData = () => {
      if (!selectedFile || !effectiveCollectedData || !excelData) {
         setAlert({
            type: "error",
            message: "Please upload a file and select product data first",
         });
         return;
      }

      try {
         // Create a new workbook
         const workbook = XLSX.utils.book_new();

         // Add original data sheets
         Object.keys(excelData).forEach((sheetName) => {
            const worksheet = XLSX.utils.aoa_to_sheet(excelData[sheetName]);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
         });

         // Add product data sheet
         const productDataSheet = [
            ["Product Data Information"],
            ["Base Form Name", effectiveCollectedData.base_name || ""],
            ["Base Form Label", effectiveCollectedData.base_label || ""],
            [
               "Description Form Name",
               effectiveCollectedData.description_name || "",
            ],
            [
               "Description Form Label",
               effectiveCollectedData.description_label || "",
            ],
            ["Vertical", effectiveCollectedData.vertical || ""],
            ["Category", effectiveCollectedData.category || ""],
            ["Export Date", new Date().toISOString()],
            [],
            ["All Product Data:"],
            ...Object.entries(effectiveCollectedData)
               .filter(
                  ([key]) =>
                     ![
                        "base_name",
                        "base_label",
                        "description_name",
                        "description_label",
                        "vertical",
                        "category",
                     ].includes(key)
               )
               .map(([key, value]) => [
                  key,
                  typeof value === "object" ? JSON.stringify(value) : value,
               ]),
         ];

         const productWorksheet = XLSX.utils.aoa_to_sheet(productDataSheet);
         XLSX.utils.book_append_sheet(
            workbook,
            productWorksheet,
            "Product_Data"
         );

         // Generate Excel file
         const excelBuffer = XLSX.write(workbook, {
            bookType: "xls",
            type: "array",
         });
         const dataBlob = new Blob([excelBuffer], {
            type: "application/vnd.ms-excel",
         });

         const url = URL.createObjectURL(dataBlob);
         const link = document.createElement("a");
         link.href = url;
         link.download = `modified-listing-${new Date()
            .toISOString()
            .slice(0, 10)}.xls`;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
         URL.revokeObjectURL(url);

         setAlert({
            type: "success",
            message: "Modified Excel file exported successfully!",
         });
      } catch (error) {
         setAlert({
            type: "error",
            message: "Error exporting Excel file. Please try again.",
         });
         console.error("Excel export error:", error);
      }
   };

   const toggleFileContent = () => {
      setShowFileContent(!showFileContent);
      // Reset to first sheet when toggling content view
      if (excelData) {
         const sheetNames = Object.keys(excelData);
         if (sheetNames.length > 0) {
            setActiveSheet(sheetNames[0]);
         }
      }
   };

   return (
      <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700 text-white shadow-md">
         {alert && (
            <CustomAlert
               type={alert.type}
               message={alert.message}
               onClose={() => setAlert(null)}
            />
         )}

         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
               <FiFile className="text-blue-400" /> Create Listing
            </h2>
         </div>

         <div className="space-y-6">
            {/* File Upload Section */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FiUpload className="text-green-400" />
                  Upload Excel File (.xls)
               </h3>
               <div className="flex flex-col gap-3">
                  <input
                     type="file"
                     accept=".xls"
                     onChange={handleFileUpload}
                     className="block w-full text-sm text-gray-300
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-600 file:text-white
                        hover:file:bg-blue-700
                        file:cursor-pointer cursor-pointer"
                  />
                  {selectedFile && (
                     <div className="text-sm text-gray-300">
                        <span className="text-green-400">Selected file:</span>{" "}
                        {selectedFile.name}
                        <span className="text-gray-400 ml-2">
                           ({(selectedFile.size / 1024).toFixed(1)} KB)
                        </span>
                     </div>
                  )}

                  {selectedFile && excelData && (
                     <button
                        onClick={toggleFileContent}
                        className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center gap-2 transition-colors"
                     >
                        <FiEye /> {showFileContent ? "Hide" : "View"} File
                        Content
                     </button>
                  )}
               </div>
            </div>

            {/* Excel File Content Display */}
            {selectedFile && excelData && showFileContent && (
               <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                     <FiFile className="text-purple-400" />
                     Excel File Content
                  </h3>

                  {/* Sheet Tabs */}
                  <div className="border-b border-gray-600 mb-4">
                     <div className="flex space-x-2 overflow-x-auto">
                        {Object.keys(excelData).map((sheetName) => (
                           <button
                              key={sheetName}
                              onClick={() => setActiveSheet(sheetName)}
                              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                                 activeSheet === sheetName
                                    ? "bg-blue-600 text-white border-b-2 border-blue-400"
                                    : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                              }`}
                           >
                              <FiFileText className="inline mr-1" size={14} />
                              {sheetName}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Active Sheet Content */}
                  {activeSheet && excelData[activeSheet] && (
                     <div className="bg-gray-800/50 rounded-lg p-3">
                        {(() => {
                           const sheetData = excelData[activeSheet];

                           return (
                              <>
                                 {/* Table Content */}
                                 {sheetData.length > 0 ? (
                                    <>
                                       <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-600 rounded-lg excel-scroll-container relative">
                                          <table className="min-w-full text-xs text-gray-300">
                                             <tbody>
                                                {sheetData.map(
                                                   (row, rowIndex) => (
                                                      <tr
                                                         key={rowIndex}
                                                         className={
                                                            rowIndex === 0
                                                               ? "font-semibold text-yellow-400 bg-gray-700/50 sticky top-0 z-10"
                                                               : "hover:bg-gray-700/30"
                                                         }
                                                      >
                                                         <td className="px-2 py-2 border border-gray-600 text-gray-500 text-xs w-12 bg-gray-700/50 font-mono sticky left-0 z-20">
                                                            {rowIndex + 1}
                                                         </td>
                                                         {row.map(
                                                            (
                                                               cell,
                                                               cellIndex
                                                            ) => (
                                                               <td
                                                                  key={
                                                                     cellIndex
                                                                  }
                                                                  className="px-2 py-2 border border-gray-600 min-w-20"
                                                               >
                                                                  <div
                                                                     className="truncate max-w-32"
                                                                     title={
                                                                        cell ||
                                                                        ""
                                                                     }
                                                                  >
                                                                     {cell ||
                                                                        ""}
                                                                  </div>
                                                               </td>
                                                            )
                                                         )}
                                                      </tr>
                                                   )
                                                )}
                                             </tbody>
                                          </table>
                                       </div>

                                       {/* Footer Info */}
                                       <div className="mt-3 text-xs text-gray-400 flex justify-between items-center">
                                          <span>
                                             Total rows: {sheetData.length}
                                          </span>
                                          <div className="flex items-center gap-3">
                                             {sheetData.length > 15 && (
                                                <span className="text-blue-400 flex items-center gap-1">
                                                   <FiChevronDown size={12} />
                                                   Scroll to view more
                                                </span>
                                             )}
                                             <span className="text-blue-400">
                                                Sheet: {activeSheet}
                                             </span>
                                          </div>
                                       </div>
                                    </>
                                 ) : (
                                    <div className="text-center py-8">
                                       <FiFileText
                                          className="mx-auto text-gray-500 mb-2"
                                          size={32}
                                       />
                                       <p className="text-gray-400 text-sm">
                                          Sheet is empty
                                       </p>
                                    </div>
                                 )}
                              </>
                           );
                        })()}
                     </div>
                  )}
               </div>
            )}

            {/* Product Data Status */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FiFile className="text-orange-400" />
                  Product Data Status
               </h3>
               <div className="text-sm text-gray-300">
                  {effectiveCollectedData ? (
                     <div className="flex gap-2 flex-col">
                        <p className="text-green-400">
                           ✓ Product data is available
                           {localCollectedData && (
                              <span className="text-yellow-400 text-xs ml-2">
                                 (Loaded from saved data)
                              </span>
                           )}
                        </p>
                        <div className="flex gap-2 justify-between px-2">
                           <p>
                              <span className="text-blue-400">Vertical:</span>{" "}
                              {effectiveCollectedData.vertical}
                           </p>
                           <p>
                              <span className="text-blue-400">Category:</span>{" "}
                              {effectiveCollectedData.category}
                           </p>
                           <p>
                              <span className="text-blue-400">Base Data:</span>{" "}
                              {effectiveCollectedData.base_name}
                           </p>
                           <p>
                              <span className="text-blue-400">
                                 Description Data:
                              </span>{" "}
                              {effectiveCollectedData.description_name}
                           </p>
                        </div>
                     </div>
                  ) : (
                     <p className="text-yellow-400">
                        ⚠ No product data selected. Please go to "Select
                        Product" tab first.
                     </p>
                  )}
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
               <button
                  onClick={handleEditSpreadsheet}
                  disabled={!selectedFile || !effectiveCollectedData}
                  className={`px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2 transition-all ${
                     selectedFile && effectiveCollectedData
                        ? "bg-gradient-to-r from-green-500 to-blue-600 text-white hover:from-green-600 hover:to-blue-700 cursor-pointer"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
               >
                  <FiEdit /> Edit Spreadsheet
               </button>

               <button
                  onClick={handleExportModifiedData}
                  disabled={!selectedFile || !effectiveCollectedData}
                  className={`px-4 py-2 rounded-lg font-medium shadow flex items-center gap-2 transition-all ${
                     selectedFile && effectiveCollectedData
                        ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 cursor-pointer"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed"
                  }`}
               >
                  <FiDownload /> Export Modified Data
               </button>
            </div>

            {/* Instructions */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
               <h3 className="text-lg font-semibold mb-3 text-yellow-400">
                  How to Use:
               </h3>
               <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>
                     First, go to "Select Product" tab and choose your base form
                     data and description form data
                  </li>
                  <li>
                     Return here and upload your .xls file using the file input
                     above
                  </li>
                  <li>
                     Click "Edit Spreadsheet" to open the Excel editor with your
                     product data
                  </li>
                  <li>Make your modifications in the spreadsheet editor</li>
                  <li>
                     Click "Export Modified Data" to download the final result
                     as a .xls file
                  </li>
               </ol>
            </div>

            {/* Development Note */}
            {selectedFile && effectiveCollectedData && (
               <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600/50">
                  <h4 className="text-blue-400 font-semibold mb-2">
                     Ready for Integration
                  </h4>
                  <p className="text-sm text-gray-300">
                     Excel editor integration is ready to be implemented. The
                     component has access to:
                  </p>
                  <ul className="text-xs text-gray-400 mt-2 list-disc list-inside">
                     <li>Uploaded Excel file: {selectedFile.name}</li>
                     <li>
                        Product data from selections
                        {localCollectedData && " (saved)"}
                     </li>
                     <li>Export functionality framework</li>
                  </ul>
               </div>
            )}
         </div>
      </div>
   );
}
