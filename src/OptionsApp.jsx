import { useState } from "react";
import Navbar from "./components/Navbar";
import HomeContent from "./components/options/HomeContent";
import MappingContent from "./components/options/MappingContent";
import ListingContent from "./components/options/ListingContent";
import UpdateContent from "./components/options/UpdateContent";
import SetupContent from "./components/options/SetupContent";


function OptionsApp() {
   const [activeTab, setActiveTab] = useState("setup");

   const renderContent = () => {
      switch (activeTab) {
         case "home":
            return <HomeContent />;
         case "mapping":
            return <MappingContent />;
         case "listing":
            return <ListingContent />;
         case "update":
            return <UpdateContent />;
         case "setup":
            return <SetupContent />;
         default:
            return <HomeContent />;
      }
   };

   return (
      <div className="min-h-screen bg-dark-dotted pl-22">
         <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
         <main className="max-w-4xl mx-auto px-4 py-8">{renderContent()}</main>
      </div>
   );
}

export default OptionsApp;
