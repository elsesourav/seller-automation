// Auto-update checker for Chrome Extension
// This will run in the background script

class ExtensionAutoUpdater {
   constructor() {
      this.updateUrl =
         "https://api.github.com/repos/elsesourav/seller-automation/releases/latest";
      this.currentVersion = chrome.runtime.getManifest().version;
      this.checkInterval = 10 * 60 * 1000; // Check every 10 minutes
   }

   async checkForUpdates() {
      try {
         console.log("🔍 Checking for extension updates...");

         const response = await fetch(this.updateUrl);
         const release = await response.json();

         if (response.ok && release.tag_name) {
            const latestVersion = release.tag_name.replace("v", "");

            if (this.isNewerVersion(latestVersion, this.currentVersion)) {
               console.log(
                  `🚀 New version available: ${latestVersion} (current: ${this.currentVersion})`
               );

               // Show notification to user
               await this.showUpdateNotification(latestVersion);

               // Store update info
               await chrome.storage.local.set({
                  updateAvailable: true,
                  latestVersion: latestVersion,
                  releaseInfo: release,
                  lastChecked: Date.now(),
               });
            } else {
               console.log("✅ Extension is up to date");
               await chrome.storage.local.set({
                  updateAvailable: false,
                  lastChecked: Date.now(),
               });
            }
         }
      } catch (error) {
         console.error("❌ Error checking for updates:", error);
      }
   }

   isNewerVersion(latest, current) {
      const latestParts = latest.split(".").map((num) => parseInt(num));
      const currentParts = current.split(".").map((num) => parseInt(num));

      for (
         let i = 0;
         i < Math.max(latestParts.length, currentParts.length);
         i++
      ) {
         const latestPart = latestParts[i] || 0;
         const currentPart = currentParts[i] || 0;

         if (latestPart > currentPart) return true;
         if (latestPart < currentPart) return false;
      }
      return false;
   }

   async showUpdateNotification(version) {
      // Create notification
      await chrome.notifications.create("extension-update", {
         type: "basic",
         iconUrl: "/icons/icon.png",
         title: "Seller Automation Update Available",
         message: `Version ${version} is now available. Click to learn more.`,
         buttons: [{ title: "Download Update" }, { title: "Remind Later" }],
      });
   }

   async startPeriodicChecks() {
      // Check immediately
      await this.checkForUpdates();

      // Set up periodic checks
      setInterval(() => {
         this.checkForUpdates();
      }, this.checkInterval);
   }

   // Initialize the auto-updater with all Chrome event listeners
   init() {
      // Start checking for updates when extension loads
      chrome.runtime.onStartup.addListener(() => {
         this.startPeriodicChecks();
      });

      chrome.runtime.onInstalled.addListener((details) => {
         if (details.reason === "install") {
            console.log("🎉 Seller Automation extension installed!");
         } else if (details.reason === "update") {
            console.log("🔄 Seller Automation extension updated!");
         }

         // Start update checks
         this.startPeriodicChecks();
      });

      // Handle notification clicks
      chrome.notifications.onButtonClicked.addListener(
         async (notificationId, buttonIndex) => {
            if (notificationId === "extension-update") {
               const data = await chrome.storage.local.get("releaseInfo");

               if (buttonIndex === 0) {
                  // Download Update
                  // Open GitHub release page
                  await chrome.tabs.create({
                     url: data.releaseInfo.html_url,
                  });
               } else if (buttonIndex === 1) {
                  // Remind Later
                  // Set reminder for 24 hours
                  await chrome.storage.local.set({
                     remindLater: Date.now() + 24 * 60 * 60 * 1000,
                  });
               }

               // Clear the notification
               chrome.notifications.clear(notificationId);
            }
         }
      );

      // Handle notification clicks (when user clicks the notification itself)
      chrome.notifications.onClicked.addListener(async (notificationId) => {
         if (notificationId === "extension-update") {
            const data = await chrome.storage.local.get("releaseInfo");
            if (data.releaseInfo) {
               await chrome.tabs.create({
                  url: data.releaseInfo.html_url,
               });
            }
            chrome.notifications.clear(notificationId);
         }
      });

      console.log("🔄 Auto-updater initialized");
   }
}

// Export as ES module
export default ExtensionAutoUpdater;
