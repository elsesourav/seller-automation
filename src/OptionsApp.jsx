import { useState } from "react";
import Navbar from "./components/Navbar";
import {
   AccountOption,
   HomeOption,
   ListingOption,
   MappingOption,
   SetupOption,
   UpdateOption,
} from "./components/options";

function OptionsApp() {
   const [activeTab, setActiveTab] = useState("setup");

   const renderContent = () => {
      switch (activeTab) {
         case "home":
            return <HomeOption />;
         case "mapping":
            return <MappingOption />;
         case "listing":
            return <ListingOption />;
         case "update":
            return <UpdateOption />;
         case "setup":
            return <SetupOption />;
         case "account":
            return <AccountOption />;
         default:
            return <HomeOption />;
      }
   };

   return (
      <div className="min-h-screen bg-dark-dotted pl-22">
         <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
         <main className="max-w-5xl mx-auto px-4 py-8">{renderContent()}</main>
      </div>
   );
}

export default OptionsApp;
