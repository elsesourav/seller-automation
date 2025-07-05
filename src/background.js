import ExtensionAutoUpdater from "./lib/autoUpdater.js";
import {} from "./lib/utils.js";

// Initialize auto-updater (handles all update-related functionality)
const autoUpdater = new ExtensionAutoUpdater();
autoUpdater.init();

// =============================================================================
// YOUR MAIN EXTENSION LOGIC GOES HERE
// =============================================================================

// Example: Add your main background script functionality below
// chrome.tabs.onActivated.addListener(...);
// chrome.action.onClicked.addListener(...);
// etc.
