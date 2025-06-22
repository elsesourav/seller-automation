// Options React component for Chrome Extension Settings
import { useCallback, useEffect, useState } from "react";

function OptionsApp() {
   // State for settings
   const [settings, setSettings] = useState({
      isEnabled: true,
      autoSave: true,
      notifications: true,
      syncInterval: 300, // seconds
      theme: "light",
   });
   const [saved, setSaved] = useState(false);
   const [loading, setLoading] = useState(false);

   // Load settings from Chrome storage
   const loadSettings = useCallback(async () => {
      try {
         setLoading(true);
         // Check if Chrome extension APIs are available
         if (typeof chrome !== "undefined" && chrome.storage) {
            const result = await chrome.storage.sync.get(["settings"]);
            if (result.settings) {
               setSettings((prev) => ({ ...prev, ...result.settings }));
            }
         } else {
            console.warn(
               "Chrome extension APIs not available (running in dev mode)"
            );
            // Use default settings when Chrome APIs aren't available
         }
      } catch (error) {
         console.error("Error loading settings:", error);
      } finally {
         setLoading(false);
      }
   }, []);

   // Load settings on component mount
   useEffect(() => {
      loadSettings();
   }, [loadSettings]);

   // Save settings to Chrome storage
   const saveSettings = async () => {
      try {
         setLoading(true);
         // Check if Chrome extension APIs are available
         if (typeof chrome !== "undefined" && chrome.storage) {
            await chrome.storage.sync.set({ settings });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
         } else {
            console.warn(
               "Chrome extension APIs not available (running in dev mode)"
            );
            // Simulate successful save in dev mode
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
         }
      } catch (error) {
         console.error("Error saving settings:", error);
      } finally {
         setLoading(false);
      }
   };

   // Handle input changes
   const handleChange = (key, value) => {
      setSettings((prev) => ({
         ...prev,
         [key]: value,
      }));
   };

   // Clear all data
   const clearAllData = async () => {
      if (
         confirm(
            "Are you sure you want to clear all extension data? This cannot be undone."
         )
      ) {
         try {
            // Check if Chrome extension APIs are available
            if (typeof chrome !== "undefined" && chrome.storage) {
               await chrome.storage.sync.clear();
            } else {
               console.warn(
                  "Chrome extension APIs not available (running in dev mode)"
               );
            }
            setSettings({
               isEnabled: true,
               autoSave: true,
               notifications: true,
               syncInterval: 300,
               theme: "light",
            });
            alert("All data cleared successfully");
         } catch (error) {
            console.error("Error clearing data:", error);
            alert("Error clearing data");
         }
      }
   };

   return (
      <div className="extension-options bg-gray-50 min-h-screen">
         {/* Header */}
         <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">
               🛒 Seller Automation Settings
            </h1>
            <p className="text-blue-100 mt-2">
               Configure your extension preferences
            </p>
         </div>

         {/* Main Content */}
         <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md">
               <div className="p-6">
                  {/* General Settings */}
                  <section className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        General Settings
                     </h2>

                     <div className="space-y-4">
                        {/* Extension Enabled */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                           <div>
                              <label className="text-sm font-medium text-gray-700">
                                 Extension Enabled
                              </label>
                              <p className="text-xs text-gray-500">
                                 Enable or disable the extension functionality
                              </p>
                           </div>
                           <input
                              type="checkbox"
                              checked={settings.isEnabled}
                              onChange={(e) =>
                                 handleChange("isEnabled", e.target.checked)
                              }
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                           />
                        </div>

                        {/* Auto Save */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                           <div>
                              <label className="text-sm font-medium text-gray-700">
                                 Auto Save
                              </label>
                              <p className="text-xs text-gray-500">
                                 Automatically save data as you work
                              </p>
                           </div>
                           <input
                              type="checkbox"
                              checked={settings.autoSave}
                              onChange={(e) =>
                                 handleChange("autoSave", e.target.checked)
                              }
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                           />
                        </div>

                        {/* Notifications */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
                           <div>
                              <label className="text-sm font-medium text-gray-700">
                                 Notifications
                              </label>
                              <p className="text-xs text-gray-500">
                                 Show desktop notifications for important events
                              </p>
                           </div>
                           <input
                              type="checkbox"
                              checked={settings.notifications}
                              onChange={(e) =>
                                 handleChange("notifications", e.target.checked)
                              }
                              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                           />
                        </div>
                     </div>
                  </section>

                  {/* Advanced Settings */}
                  <section className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Advanced Settings
                     </h2>

                     <div className="space-y-4">
                        {/* Sync Interval */}
                        <div className="p-4 bg-gray-50 rounded">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Sync Interval (seconds)
                           </label>
                           <p className="text-xs text-gray-500 mb-3">
                              How often to sync data with Firebase
                           </p>
                           <input
                              type="number"
                              min="60"
                              max="3600"
                              value={settings.syncInterval}
                              onChange={(e) =>
                                 handleChange(
                                    "syncInterval",
                                    parseInt(e.target.value)
                                 )
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           />
                        </div>

                        {/* Theme */}
                        <div className="p-4 bg-gray-50 rounded">
                           <label className="block text-sm font-medium text-gray-700 mb-2">
                              Theme
                           </label>
                           <p className="text-xs text-gray-500 mb-3">
                              Choose your preferred theme
                           </p>
                           <select
                              value={settings.theme}
                              onChange={(e) =>
                                 handleChange("theme", e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                           >
                              <option value="light">Light</option>
                              <option value="dark">Dark</option>
                              <option value="auto">Auto (System)</option>
                           </select>
                        </div>
                     </div>
                  </section>

                  {/* Firebase Configuration */}
                  <section className="mb-8">
                     <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Firebase Information
                     </h2>
                     <div className="p-4 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">
                           <strong>📋 Setup Instructions:</strong>
                        </p>
                        <ol className="text-sm text-blue-700 space-y-1 ml-4 list-decimal">
                           <li>
                              Go to the Firebase Console and create a new
                              project
                           </li>
                           <li>Enable Firestore Database in your project</li>
                           <li>Add your web app and copy the configuration</li>
                           <li>
                              Update the configuration in src/firebaseConfig.js
                           </li>
                           <li>
                              Set up Firestore security rules (see
                              documentation)
                           </li>
                        </ol>
                        <p className="text-xs text-blue-600 mt-3">
                           ⚠️ Remember to configure Firebase security rules to
                           allow read/write access for your extension
                        </p>
                     </div>
                  </section>

                  {/* Actions */}
                  <section>
                     <h2 className="text-xl font-semibold text-gray-800 mb-4">
                        Actions
                     </h2>

                     <div className="flex space-x-4">
                        {/* Save Button */}
                        <button
                           onClick={saveSettings}
                           disabled={loading}
                           className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                           {loading ? "Saving..." : "Save Settings"}
                        </button>

                        {/* Clear Data Button */}
                        <button
                           onClick={clearAllData}
                           className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                           Clear All Data
                        </button>
                     </div>

                     {/* Save Confirmation */}
                     {saved && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                           ✅ Settings saved successfully!
                        </div>
                     )}
                  </section>
               </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-sm text-gray-500">
               <p>Seller Automation Extension v1.0.0</p>
               <p className="mt-1">
                  Built with React, Vite, Tailwind CSS, and Firebase
               </p>
            </div>
         </div>
      </div>
   );
}

export default OptionsApp;
