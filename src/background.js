// Background service worker for Chrome Extension
// This script runs in the background and handles extension lifecycle events

console.log("🚀 Seller Automation Extension background script loaded");

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
   console.log("📦 Extension installed:", details.reason);

   if (details.reason === "install") {
      console.log("🎉 Extension installed for the first time");

      // Set default settings
      chrome.storage.sync.set({
         isEnabled: true,
         settings: {
            autoSave: true,
            notifications: true,
         },
      });
   } else if (details.reason === "update") {
      console.log("🔄 Extension updated");
   }
});

// Listen for tab updates (optional - for monitoring page changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
   if (changeInfo.status === "complete" && tab.url) {
      console.log("🌐 Page loaded:", tab.url);
   }
});

// Handle messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   console.log("📨 Message received:", request);

   switch (request.action) {
      case "getData":
         // Handle data requests
         sendResponse({ success: true, data: "Background data" });
         break;

      case "saveData":
         // Handle save requests
         console.log("💾 Saving data:", request.data);
         sendResponse({ success: true });
         break;

      default:
         sendResponse({ success: false, error: "Unknown action" });
   }

   return true; // Keep message channel open for async response
});
