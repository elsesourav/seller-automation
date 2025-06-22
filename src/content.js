// Content script for Chrome Extension
// This script runs on web pages and can interact with the DOM

console.log("🌐 Seller Automation Extension content script loaded");

// Function to get page information
function getPageInfo() {
   return {
      title: document.title,
      url: window.location.href,
      timestamp: new Date().toISOString(),
   };
}

// Log page title when content script loads
const pageInfo = getPageInfo();
console.log("📄 Current page:", pageInfo.title);
console.log("🔗 URL:", pageInfo.url);

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
   console.log("📨 Content script received message:", request);

   switch (request.action) {
      case "getPageInfo":
         sendResponse(getPageInfo());
         break;

      case "extractData": {
         // Example: Extract specific data from the page
         const data = {
            title: document.title,
            headings: Array.from(document.querySelectorAll("h1, h2, h3")).map(
               (h) => h.textContent
            ),
            links: Array.from(document.querySelectorAll("a")).length,
         };
         sendResponse({ success: true, data });
         break;
      }

      case "highlightElements": {
         // Example: Highlight certain elements on the page
         const elements = document.querySelectorAll(request.selector || "h1");
         elements.forEach((el) => {
            el.style.backgroundColor = "yellow";
            el.style.border = "2px solid red";
         });
         sendResponse({ success: true, count: elements.length });
         break;
      }

      default:
         sendResponse({ success: false, error: "Unknown action" });
   }

   return true; // Keep message channel open for async response
});

// Example: Monitor for dynamic content changes
const observer = new MutationObserver((mutations) => {
   mutations.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
         console.log("🔄 DOM changed - new content detected");
      }
   });
});

// Start observing DOM changes
observer.observe(document.body, {
   childList: true,
   subtree: true,
});
