// Auto-update checker for Chrome Extension
// This will run in the background script

class ExtensionAutoUpdater {
   constructor() {
      this.updateUrl =
         "https://api.github.com/repos/elsesourav/seller-automation/releases/latest";
      this.currentVersion = chrome.runtime.getManifest().version;
      this.checkInterval = 60 * 60 * 1000; // Check every hour
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
               await this.showUpdateNotification(latestVersion, release);

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

   async showUpdateNotification(version, release) {
      // Create notification
      await chrome.notifications.create("extension-update", {
         type: "basic",
         iconUrl: "/icons/icon.png",
         title: "Seller Automation Update Available",
         message: `Version ${version} is now available. Click to learn more.`,
         buttons: [{ title: "Download Update" }, { title: "Remind Later" }],
      });

      // Store notification data for handling clicks
      await chrome.storage.local.set({
         pendingNotification: {
            version: version,
            downloadUrl: release.html_url,
         },
      });
   }

   async handleNotificationClick(notificationId, buttonIndex) {
      if (notificationId === "extension-update") {
         const data = await chrome.storage.local.get("pendingNotification");

         if (buttonIndex === 0) {
            // Download Update
            // Open GitHub release page
            await chrome.tabs.create({
               url: data.pendingNotification.downloadUrl,
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

   async startPeriodicChecks() {
      // Check immediately
      await this.checkForUpdates();

      // Set up periodic checks
      setInterval(() => {
         this.checkForUpdates();
      }, this.checkInterval);
   }

   async shouldCheck() {
      const storage = await chrome.storage.local.get([
         "lastChecked",
         "remindLater",
      ]);
      const now = Date.now();

      // If user chose "remind later", respect that
      if (storage.remindLater && now < storage.remindLater) {
         return false;
      }

      // Check if enough time has passed since last check
      const lastChecked = storage.lastChecked || 0;
      const timeSinceLastCheck = now - lastChecked;

      return timeSinceLastCheck >= this.checkInterval;
   }
}

// Export for use in background script
// eslint-disable-next-line no-undef
if (typeof module !== "undefined" && module.exports) {
   // eslint-disable-next-line no-undef
   module.exports = ExtensionAutoUpdater;
} else if (typeof window !== "undefined") {
   window.ExtensionAutoUpdater = ExtensionAutoUpdater;
}
