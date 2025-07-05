import { useCallback, useEffect, useState } from "react";
import {
   FiBox,
   FiDownload,
   FiFileText,
   FiSave,
   FiTrash2,
} from "react-icons/fi";
import { getAllBaseFormData } from "../../../api/baseFormDataApi";
import { getAllBaseForms } from "../../../api/baseFormsApi";
import { getAllCategories } from "../../../api/categoriesApi";
import { getAllDataStores } from "../../../api/dataStoreApi";
import { getAllDescriptionFormData } from "../../../api/descriptionFormDataApi";
import { getAllDescriptionForms } from "../../../api/descriptionFormsApi";
import { getAllVerticals } from "../../../api/verticalsApi";
import {
   clearAdditionalProductFields,
   clearSelectedData,
   getAdditionalProductFields,
   getCollectedProductData,
   getSelectedBaseFormData,
   getSelectedDescFormData,
   saveAdditionalProductFields,
   saveCollectedProductData,
   saveSelectedBaseFormData,
   saveSelectedDescFormData,
} from "../../../lib/utils";
import CustomAlert from "../../CustomAlert";
import { DateInput, NumberInput, SelectInput, TextInput } from "../../inputs";

export default function SelectProduct({
   selectedBaseFormData,
   setSelectedBaseFormData,
   selectedDescFormData,
   setSelectedDescFormData,
   collectedData,
   setCollectedData,
}) {
   const [baseFormData, setBaseFormData] = useState([]);
   const [descriptionFormData, setDescriptionFormData] = useState([]);
   const [baseForms, setBaseForms] = useState([]);
   const [descriptionForms, setDescriptionForms] = useState([]);
   const [dataStores, setDataStores] = useState([]);
   const [verticals, setVerticals] = useState([]);
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [alert, setAlert] = useState(null);

   // Additional product fields
   const [listingStatus, setListingStatus] = useState("");
   const [mrp, setMrp] = useState("");
   const [sellingPrice, setSellingPrice] = useState("");
   const [procurementType, setProcurementType] = useState("");
   const [procurementSLA, setProcurementSLA] = useState("");
   const [stock, setStock] = useState("");
   const [localHandlingFee, setLocalHandlingFee] = useState("");
   const [zonalHandlingFee, setZonalHandlingFee] = useState("");
   const [nationalHandlingFee, setNationalHandlingFee] = useState("");
   const [manufacturerDetails, setManufacturerDetails] = useState("");
   const [packerDetails, setPackerDetails] = useState("");
   const [importerDetails, setImporterDetails] = useState("");
   const [manufacturingDate, setManufacturingDate] = useState("");

   // Load saved data from localStorage on component mount
   useEffect(() => {
      const savedBaseFormData = getSelectedBaseFormData();
      const savedDescFormData = getSelectedDescFormData();
      const savedCollectedData = getCollectedProductData();
      const savedAdditionalFields = getAdditionalProductFields();

      if (savedBaseFormData) {
         setSelectedBaseFormData(savedBaseFormData);
      }
      if (savedDescFormData) {
         setSelectedDescFormData(savedDescFormData);
      }
      if (savedCollectedData) {
         setCollectedData(savedCollectedData);
      }

      // Load additional product fields - use saved data or set defaults
      if (savedAdditionalFields) {
         setListingStatus(savedAdditionalFields.listingStatus || "Inactive");
         setMrp(savedAdditionalFields.mrp || "499");
         setSellingPrice(savedAdditionalFields.sellingPrice || "199");
         setProcurementType(savedAdditionalFields.procurementType || "express");
         setProcurementSLA(savedAdditionalFields.procurementSLA || "1");
         setStock(savedAdditionalFields.stock || "5000");
         setLocalHandlingFee(savedAdditionalFields.localHandlingFee || "0");
         setZonalHandlingFee(savedAdditionalFields.zonalHandlingFee || "0");
         setNationalHandlingFee(
            savedAdditionalFields.nationalHandlingFee || "0"
         );
         setManufacturerDetails(
            savedAdditionalFields.manufacturerDetails || "PuravEnterprise"
         );
         setPackerDetails(
            savedAdditionalFields.packerDetails || "PuravEnterprise"
         );
         setImporterDetails(
            savedAdditionalFields.importerDetails || "PuravEnterprise"
         );
         setManufacturingDate(
            savedAdditionalFields.manufacturingDate ||
               new Date(Date.now() - 172800000).toISOString().slice(0, 10)
         );
      } else {
         // Set default values when no saved data exists
         setListingStatus("Inactive");
         setMrp("499");
         setSellingPrice("199");
         setProcurementType("express");
         setProcurementSLA("1");
         setStock("5000");
         setLocalHandlingFee("0");
         setZonalHandlingFee("0");
         setNationalHandlingFee("0");
         setManufacturerDetails("PuravEnterprise");
         setPackerDetails("PuravEnterprise");
         setImporterDetails("PuravEnterprise");
         setManufacturingDate(
            new Date(Date.now() - 172800000).toISOString().slice(0, 10)
         );
      }
   }, [setSelectedBaseFormData, setSelectedDescFormData, setCollectedData]);

   // Save selected base form data to localStorage
   const handleBaseFormDataChange = (value) => {
      setSelectedBaseFormData(value);
   };

   // Save selected description form data to localStorage
   const handleDescFormDataChange = (value) => {
      setSelectedDescFormData(value);
   };

   // Clear all saved data
   const handleClearSavedData = () => {
      clearSelectedData();
      clearAdditionalProductFields();
      setSelectedBaseFormData("");
      setSelectedDescFormData("");
      setCollectedData(null);

      // Clear additional product fields
      setListingStatus("");
      setMrp("");
      setSellingPrice("");
      setProcurementType("");
      setProcurementSLA("");
      setStock("");
      setLocalHandlingFee("");
      setZonalHandlingFee("");
      setNationalHandlingFee("");
      setManufacturerDetails("");
      setPackerDetails("");
      setImporterDetails("");
      setManufacturingDate("");

      setAlert({
         type: "success",
         message: "All saved data cleared successfully",
      });
   };

   // Save current data manually
   const handleSaveData = () => {
      try {
         // Save base and desc form data if selected
         if (selectedBaseFormData) {
            saveSelectedBaseFormData(selectedBaseFormData);
         }
         if (selectedDescFormData) {
            saveSelectedDescFormData(selectedDescFormData);
         }

         // Save additional product fields
         const additionalFields = {
            listingStatus,
            mrp,
            sellingPrice,
            procurementType,
            procurementSLA,
            stock,
            localHandlingFee,
            zonalHandlingFee,
            nationalHandlingFee,
            manufacturerDetails,
            packerDetails,
            importerDetails,
            manufacturingDate,
         };

         saveAdditionalProductFields(additionalFields);

         // Save collected data if available
         if (collectedData) {
            saveCollectedProductData(collectedData);
         }

         setAlert({
            type: "success",
            message: "Data saved successfully to local storage",
         });
      } catch (error) {
         console.error("Error saving data:", error);
         setAlert({
            type: "error",
            message: "Failed to save data. Please try again.",
         });
      }
   };

   useEffect(() => {
      async function fetchData() {
         setLoading(true);
         try {
            const [bfd, dfd, bf, df, ds, v, c] = await Promise.all([
               getAllBaseFormData(),
               getAllDescriptionFormData(),
               getAllBaseForms(),
               getAllDescriptionForms(),
               getAllDataStores(),
               getAllVerticals(),
               getAllCategories(),
            ]);
            setBaseFormData(bfd);
            setDescriptionFormData(dfd);
            setBaseForms(bf);
            setDescriptionForms(df);
            setDataStores(ds);
            setVerticals(v);
            setCategories(c);
         } catch (err) {
            console.error("Failed to fetch data:", err);
            setAlert({ type: "error", message: "Failed to fetch data" });
         } finally {
            setLoading(false);
         }
      }
      fetchData();
   }, []);

   const getBaseFormName = (baseFormId) => {
      const baseForm = baseForms.find((bf) => bf.id === baseFormId);
      return baseForm?.name || "-";
   };

   const getDescriptionFormName = (descFormId) => {
      const descForm = descriptionForms.find((df) => df.id === descFormId);
      return descForm?.name || "-";
   };

   const getVerticalName = useCallback(
      (verticalId) => {
         const vertical = verticals.find((v) => v.id === verticalId);
         return vertical?.name || "-";
      },
      [verticals]
   );

   const getCategoryName = useCallback(
      (categoryId) => {
         const category = categories.find((c) => c.id === categoryId);
         return category?.name || "-";
      },
      [categories]
   );

   // Auto-collect data when both selections are made
   useEffect(() => {
      // Get data store data by data_id
      const getDataStoreData = (dataId) => {
         return dataStores.find((ds) => ds.id === dataId);
      };

      if (
         selectedBaseFormData &&
         selectedDescFormData &&
         baseFormData.length > 0 &&
         descriptionFormData.length > 0 &&
         dataStores.length > 0
      ) {
         const baseFormDataSelected = baseFormData.find(
            (bfd) => bfd.id === selectedBaseFormData
         );

         const descFormDataSelected = descriptionFormData.find(
            (dfd) => dfd.id === selectedDescFormData
         );

         if (baseFormDataSelected && descFormDataSelected) {
            // Get related data store data for base form data
            const baseFormDataStore = getDataStoreData(
               baseFormDataSelected.data_id
            );

            // Get related data store data for description form data
            const descFormDataStore = getDataStoreData(
               descFormDataSelected.data_id
            );

            // Collect all data in JSON format
            const collectedJson = {
               base_name: baseFormDataSelected.name || "",
               base_label: baseFormDataSelected.label || "",
               description_name: descFormDataSelected.name || "",
               description_label: descFormDataSelected.label || "",
               vertical:
                  getVerticalName(baseFormDataSelected.vertical_id) || "",
               category:
                  getCategoryName(baseFormDataSelected.category_id) || "",
               // Additional product fields
               listing_status: listingStatus || "",
               mrp_inr: mrp || "",
               selling_price_inr: sellingPrice || "",
               procurement_type: procurementType || "",
               procurement_sla_days: procurementSLA || "",
               stock: stock || "",
               local_handling_fee_inr: localHandlingFee || "",
               zonal_handling_fee_inr: zonalHandlingFee || "",
               national_handling_fee_inr: nationalHandlingFee || "",
               manufacturer_details: manufacturerDetails || "",
               packer_details: packerDetails || "",
               importer_details: importerDetails || "",
               manufacturing_date: manufacturingDate || "",
               ...(baseFormDataStore?.data || {}),
               ...(descFormDataStore?.data || {}),
            };

            setCollectedData(collectedJson);
         }
      } else {
         setCollectedData(null);
      }
   }, [
      selectedBaseFormData,
      selectedDescFormData,
      baseFormData,
      descriptionFormData,
      dataStores,
      verticals,
      categories,
      getVerticalName,
      getCategoryName,
      setCollectedData,
      listingStatus,
      mrp,
      sellingPrice,
      procurementType,
      procurementSLA,
      stock,
      localHandlingFee,
      zonalHandlingFee,
      nationalHandlingFee,
      manufacturerDetails,
      packerDetails,
      importerDetails,
      manufacturingDate,
   ]);

   // Get data store data by data_id (for UI info display)
   const getDataStoreData = (dataId) => {
      return dataStores.find((ds) => ds.id === dataId);
   };

   const handleDownloadData = () => {
      if (!collectedData) {
         setAlert({ type: "error", message: "No data to download" });
         return;
      }

      const dataStr = JSON.stringify(collectedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product-data-${new Date()
         .toISOString()
         .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAlert({ type: "success", message: "Data downloaded successfully" });
   };

   if (loading) {
      return (
         <div className="text-center text-gray-400 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading data...</p>
         </div>
      );
   }

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
               <FiBox className="text-blue-400" /> Select Product
            </h2>
            {(selectedBaseFormData || selectedDescFormData) && (
               <div className="text-xs text-green-400 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  Data loaded from saved selections
               </div>
            )}
         </div>

         <div className="space-y-6">
            {/* Base Form Data Selection */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FiFileText className="text-green-400" />
                  Select Base Form Data
               </h3>
               <SelectInput
                  value={selectedBaseFormData}
                  onChange={handleBaseFormDataChange}
                  options={baseFormData.map((bfd) => ({
                     value: bfd.id,
                     label: `${bfd.name}${
                        bfd.label ? ` (${bfd.label})` : ""
                     } - ${getBaseFormName(bfd.base_form_id)}`,
                  }))}
                  placeholder="Choose base form data..."
                  className="w-full"
               />
               {selectedBaseFormData && (
                  <div className="mt-3 text-sm text-gray-300">
                     {(() => {
                        const selected = baseFormData.find(
                           (bfd) => bfd.id === selectedBaseFormData
                        );
                        const hasDataStore = getDataStoreData(
                           selected?.data_id
                        );
                        return (
                           <p>
                              <span className="text-blue-400">Base Form:</span>{" "}
                              {getBaseFormName(selected?.base_form_id)} |{" "}
                              <span className="text-purple-400">
                                 Data Store:
                              </span>{" "}
                              {hasDataStore ? "Available" : "Not Available"}
                           </p>
                        );
                     })()}
                  </div>
               )}
            </div>

            {/* Description Form Data Selection */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FiFileText className="text-orange-400" />
                  Select Description Form Data
               </h3>
               <SelectInput
                  value={selectedDescFormData}
                  onChange={handleDescFormDataChange}
                  options={descriptionFormData.map((dfd) => ({
                     value: dfd.id,
                     label: `${dfd.name}${
                        dfd.label ? ` (${dfd.label})` : ""
                     } - ${getDescriptionFormName(dfd.description_form_id)}`,
                  }))}
                  placeholder="Choose description form data..."
                  className="w-full"
               />
               {selectedDescFormData && (
                  <div className="mt-3 text-sm text-gray-300">
                     {(() => {
                        const selected = descriptionFormData.find(
                           (dfd) => dfd.id === selectedDescFormData
                        );
                        const hasDataStore = getDataStoreData(
                           selected?.data_id
                        );
                        return (
                           <p>
                              <span className="text-blue-400">
                                 Description Form:
                              </span>{" "}
                              {getDescriptionFormName(
                                 selected?.description_form_id
                              )}{" "}
                              |{" "}
                              <span className="text-purple-400">
                                 Data Store:
                              </span>{" "}
                              {hasDataStore ? "Available" : "Not Available"}
                           </p>
                        );
                     })()}
                  </div>
               )}
            </div>

            {/* Additional Product Details */}
            <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
               <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <FiBox className="text-cyan-400" />
                  Additional Product Details
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Listing Status */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Listing Status
                     </label>
                     <SelectInput
                        value={listingStatus}
                        onChange={setListingStatus}
                        options={[
                           { value: "Active", label: "Active" },
                           { value: "Inactive", label: "Inactive" },
                        ]}
                        placeholder="Select listing status..."
                        className="w-full"
                     />
                  </div>

                  {/* MRP */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        MRP (INR)
                     </label>
                     <NumberInput
                        value={mrp}
                        onChange={setMrp}
                        placeholder="Enter MRP amount..."
                        className="w-full"
                     />
                  </div>

                  {/* Selling Price */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Your Selling Price (INR)
                     </label>
                     <NumberInput
                        value={sellingPrice}
                        onChange={setSellingPrice}
                        placeholder="Enter selling price..."
                        className="w-full"
                     />
                  </div>

                  {/* Procurement Type */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Procurement Type
                     </label>
                     <SelectInput
                        value={procurementType}
                        onChange={setProcurementType}
                        options={[
                           { value: "instock", label: "instock" },
                           { value: "express", label: "express" },
                           {
                              value: "domestic procurement",
                              label: "domestic procurement",
                           },
                        ]}
                        placeholder="Select procurement type..."
                        className="w-full"
                     />
                  </div>

                  {/* Procurement SLA */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Procurement SLA (Days)
                     </label>
                     <SelectInput
                        value={procurementSLA}
                        onChange={setProcurementSLA}
                        options={[
                           { value: "1", label: "1" },
                           { value: "2", label: "2" },
                           { value: "3", label: "3" },
                        ]}
                        placeholder="Select SLA in days..."
                        className="w-full"
                     />
                  </div>

                  {/* Stock */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stock
                     </label>
                     <NumberInput
                        value={stock}
                        onChange={setStock}
                        placeholder="Enter stock quantity..."
                        className="w-full"
                     />
                  </div>

                  {/* Local Handling Fee */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Local Handling Fee (INR)
                     </label>
                     <NumberInput
                        value={localHandlingFee}
                        onChange={setLocalHandlingFee}
                        placeholder="Enter local handling fee..."
                        className="w-full"
                     />
                  </div>

                  {/* Zonal Handling Fee */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Zonal Handling Fee (INR)
                     </label>
                     <NumberInput
                        value={zonalHandlingFee}
                        onChange={setZonalHandlingFee}
                        placeholder="Enter zonal handling fee..."
                        className="w-full"
                     />
                  </div>

                  {/* National Handling Fee */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        National Handling Fee (INR)
                     </label>
                     <NumberInput
                        value={nationalHandlingFee}
                        onChange={setNationalHandlingFee}
                        placeholder="Enter national handling fee..."
                        className="w-full"
                     />
                  </div>

                  {/* Manufacturing Date */}
                  <div>
                     <label className="block text-sm font-medium text-gray-300 mb-2">
                        Manufacturing Date
                     </label>
                     <DateInput
                        value={manufacturingDate}
                        onChange={setManufacturingDate}
                        placeholder="Select manufacturing date..."
                        className="w-full"
                     />
                  </div>

                  <div className="relative col-span-2 gap-2 grid grid-cols-1 md:grid-cols-3">
                     {/* Manufacturer Details */}
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                           Manufacturer Details
                        </label>
                        <TextInput
                           value={manufacturerDetails}
                           onChange={setManufacturerDetails}
                           placeholder="Enter manufacturer details..."
                           className="w-full"
                        />
                     </div>

                     {/* Packer Details */}
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                           Packer Details
                        </label>
                        <TextInput
                           value={packerDetails}
                           onChange={setPackerDetails}
                           placeholder="Enter packer details..."
                           className="w-full"
                        />
                     </div>

                     {/* Importer Details */}
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                           Importer Details
                        </label>
                        <TextInput
                           value={importerDetails}
                           onChange={setImporterDetails}
                           placeholder="Enter importer details..."
                           className="w-full"
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
               {/* Save Button - always visible */}
               <button
                  onClick={handleSaveData}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium shadow flex items-center gap-2 cursor-pointer transition-all"
               >
                  <FiSave /> Save Data
               </button>

               {/* Download Button - only show when data is available */}
               {collectedData && (
                  <>
                     <button
                        onClick={handleDownloadData}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 font-medium shadow flex items-center gap-2 cursor-pointer transition-all"
                     >
                        <FiDownload /> Download JSON
                     </button>
                     <button
                        onClick={handleClearSavedData}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 font-medium shadow flex items-center gap-2 cursor-pointer transition-all"
                     >
                        <FiTrash2 /> Clear Saved Data
                     </button>
                  </>
               )}
            </div>

            {/* Data Preview */}
            {collectedData && (
               <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-lg font-semibold mb-3 text-green-400">
                     Collected Product Data Preview
                  </h3>
                  <div className="flex gap-2 flex-col text-sm">
                     <div className="flex gap-2 justify-between px-2">
                        <div>
                           <span className="text-blue-400">Vertical:</span>{" "}
                           {collectedData.vertical}
                        </div>
                        <div>
                           <span className="text-blue-400">Category:</span>{" "}
                           {collectedData.category}
                        </div>
                        <div>
                           <span className="text-blue-400">Base:</span>{" "}
                           {collectedData.base_name}
                        </div>
                        <div>
                           <span className="text-blue-400">Description:</span>{" "}
                           {collectedData.description_name}
                        </div>
                     </div>
                     <div className="mt-4 max-h-64 overflow-y-auto bg-gray-800/60 rounded p-3">
                        <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                           {JSON.stringify(collectedData, null, 4)}
                        </pre>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}
