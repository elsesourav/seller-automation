// Popup React component for Chrome Extension
import {
   addDoc,
   collection,
   getDocs,
   limit,
   orderBy,
   query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "./firebaseConfig";

function PopupApp() {
   // State management
   const [inputText, setInputText] = useState("");
   const [dataList, setDataList] = useState([]);
   const [loading, setLoading] = useState(false);
   const [status, setStatus] = useState("");

   // Load data from Firestore on component mount
   useEffect(() => {
      loadData();
   }, []);

   // Function to load data from Firestore
   const loadData = async () => {
      try {
         setLoading(true);
         const q = query(
            collection(db, "seller-data"),
            orderBy("timestamp", "desc"),
            limit(10)
         );
         const querySnapshot = await getDocs(q);
         const data = [];
         querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
         });
         setDataList(data);
         setStatus("✅ Data loaded successfully");
      } catch (error) {
         console.error("Error loading data:", error);
         setStatus("❌ Error loading data: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   // Function to save data to Firestore
   const saveData = async () => {
      if (!inputText.trim()) {
         setStatus("⚠️ Please enter some text");
         return;
      }

      try {
         setLoading(true);
         setStatus("💾 Saving data...");

         await addDoc(collection(db, "seller-data"), {
            text: inputText,
            timestamp: new Date().toISOString(),
            source: "chrome-extension",
         });

         setInputText("");
         setStatus("✅ Data saved successfully");

         // Reload data to show the new entry
         await loadData();
      } catch (error) {
         console.error("Error saving data:", error);
         setStatus("❌ Error saving data: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   // Function to get current page info
   const getPageInfo = async () => {
      try {
         // Check if Chrome extension APIs are available
         if (typeof chrome !== "undefined" && chrome.tabs) {
            const [tab] = await chrome.tabs.query({
               active: true,
               currentWindow: true,
            });
            const response = await chrome.tabs.sendMessage(tab.id, {
               action: "getPageInfo",
            });
            setInputText(`Page: ${response.title} - URL: ${response.url}`);
            setStatus("📄 Page info captured");
         } else {
            console.warn(
               "Chrome extension APIs not available (running in dev mode)"
            );
            setInputText("Page: Demo Page - URL: http://localhost:5173");
            setStatus("📄 Demo page info captured (dev mode)");
         }
      } catch (error) {
         console.error("Error getting page info:", error);
         setStatus("❌ Error getting page info");
      }
   };

   return (
      <div className="extension-popup bg-white">
         {/* Header */}
         <div className="bg-blue-600 text-white p-4">
            <h1 className="text-lg font-bold">🛒 Seller Automation</h1>
            <p className="text-sm opacity-90">Manage your selling data</p>
         </div>

         {/* Main Content */}
         <div className="p-4 space-y-4">
            {/* Status Display */}
            {status && (
               <div className="text-sm p-2 bg-gray-100 rounded border-l-4 border-blue-500">
                  {status}
               </div>
            )}

            {/* Input Section */}
            <div className="space-y-2">
               <label className="block text-sm font-medium text-gray-700">
                  Enter Data:
               </label>
               <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Enter seller data, notes, or information..."
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows="3"
               />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
               <button
                  onClick={saveData}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                  {loading ? "💾 Saving..." : "💾 Save Data"}
               </button>
               <button
                  onClick={getPageInfo}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
               >
                  📄 Get Page Info
               </button>
            </div>

            {/* Refresh Button */}
            <button
               onClick={loadData}
               disabled={loading}
               className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
               {loading ? "🔄 Loading..." : "🔄 Refresh Data"}
            </button>

            {/* Data List */}
            <div className="space-y-2">
               <h3 className="text-sm font-medium text-gray-700">
                  Recent Data:
               </h3>
               {dataList.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                     No data found. Add some data to get started!
                  </p>
               ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2">
                     {dataList.map((item) => (
                        <div
                           key={item.id}
                           className="p-2 bg-gray-50 rounded border text-sm"
                        >
                           <p className="text-gray-800">{item.text}</p>
                           <p className="text-xs text-gray-500 mt-1">
                              {new Date(item.timestamp).toLocaleString()}
                           </p>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t text-center">
               <button
                  onClick={() => {
                     if (typeof chrome !== "undefined" && chrome.runtime) {
                        chrome.runtime.openOptionsPage();
                     } else {
                        console.warn(
                           "Chrome extension APIs not available (running in dev mode)"
                        );
                        // In dev mode, you could open options in a new tab or show a message
                        window.open("/options.html", "_blank");
                     }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
               >
                  ⚙️ Open Settings
               </button>
            </div>
         </div>
      </div>
   );
}

export default PopupApp;
