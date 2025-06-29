import { useState } from "react";
import {
   BasicInfo,
   DescForm,
   Description,
   InfoForm,
   Product,
   SetupHeader,
   VerticalAndCategory,
} from "./setup";

export default function SetupContent() {
   const [activeTab, setActiveTab] = useState("description");
   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
         <SetupHeader activeTab={activeTab} setActiveTab={setActiveTab} />
         {activeTab === "product" && <Product />}
         {activeTab === "basicinfo" && <BasicInfo />}
         {activeTab === "description" && <Description />}
         {activeTab === "infoform" && <InfoForm />}
         {activeTab === "descform" && <DescForm />}
         {activeTab === "verticalandcategory" && <VerticalAndCategory />}
      </div>
   );
}
