import { useState } from "react";
import { FiBox, FiPlus } from "react-icons/fi";
import Header from "../Header";
import { CreateListing, SelectProduct } from "./listing";

const listingTabs = [
   { id: "selectproduct", label: "Select Product", icon: FiBox },
   { id: "createlisting", label: "Create Listing", icon: FiPlus },
];

export default function ListingContent() {
   const [activeTab, setActiveTab] = useState("selectproduct");

   // Persistent state for SelectProduct that survives tab changes
   const [selectedBaseFormData, setSelectedBaseFormData] = useState("");
   const [selectedDescFormData, setSelectedDescFormData] = useState("");
   const [collectedData, setCollectedData] = useState(null);

   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
         <Header
            tabs={listingTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
         />
         {activeTab === "selectproduct" && (
            <SelectProduct
               selectedBaseFormData={selectedBaseFormData}
               setSelectedBaseFormData={setSelectedBaseFormData}
               selectedDescFormData={selectedDescFormData}
               setSelectedDescFormData={setSelectedDescFormData}
               collectedData={collectedData}
               setCollectedData={setCollectedData}
            />
         )}
         {activeTab === "createlisting" && (
            <CreateListing collectedData={collectedData} />
         )}
      </div>
   );
}
