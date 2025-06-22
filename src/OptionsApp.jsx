import { useState } from "react";
import Navbar from "./components/Navbar";

function HomeContent() {
   return <div>Home</div>;
}

function MappingContent() {
   return <div>Mapping</div>;
}

function ListingContent() {
   return <div>Listing</div>;
}

function UpdateContent() {
   return <div>Update</div>;
}

function SetupContent() {
   return <div>Setup</div>;
}

function OptionsApp() {
   const [activeTab, setActiveTab] = useState("home");

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
