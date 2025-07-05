import { useState } from "react";
import Header from "../Header";
import {
   BasicInfoIcon,
   DescFormIcon,
   DescriptionIcon,
   InfoFormIcon,
   ProductIcon,
   VerticalIcon,
} from "../icons/SetupIcons";
import {
   BasicInfo,
   DescForm,
   Description,
   InfoForm,
   Product,
   VerticalAndCategory,
} from "./setup";

const setupTabs = [
   { id: "product", label: "Product", icon: ProductIcon },
   { id: "basicinfo", label: "BasicInfo", icon: BasicInfoIcon },
   { id: "description", label: "Description", icon: DescriptionIcon },
   { id: "infoform", label: "InfoForm", icon: InfoFormIcon },
   { id: "descform", label: "DescForm", icon: DescFormIcon },
   { id: "verticalandcategory", label: "Vertical", icon: VerticalIcon },
];

export default function SetupContent() {
   const [activeTab, setActiveTab] = useState("product");
   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
         <Header
            tabs={setupTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
         />
         {activeTab === "product" && <Product />}
         {activeTab === "basicinfo" && <BasicInfo />}
         {activeTab === "description" && <Description />}
         {activeTab === "infoform" && <InfoForm />}
         {activeTab === "descform" && <DescForm />}
         {activeTab === "verticalandcategory" && <VerticalAndCategory />}
      </div>
   );
}
