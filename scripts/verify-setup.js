#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verifySetup = () => {
   console.log("🔍 Verifying Auto-Update Setup...\n");

   const projectRoot = path.dirname(__dirname);
   let allGood = true;

   // Check files exist
   const requiredFiles = [
      ".github/workflows/release.yml",
      "src/background.js",
      "scripts/package-extension.js",
      "scripts/create-zip.js",
      "scripts/prepare-release.js",
      "AUTO_UPDATE_SETUP.md",
   ];

   console.log("📁 Checking required files...");
   requiredFiles.forEach((file) => {
      const filePath = path.join(projectRoot, file);
      if (fs.existsSync(filePath)) {
         console.log(`✅ ${file}`);
      } else {
         console.log(`❌ ${file} - MISSING`);
         allGood = false;
      }
   });

   // Check package.json scripts
   console.log("\n📜 Checking package.json scripts...");
   const packageJsonPath = path.join(projectRoot, "package.json");
   if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const requiredScripts = ["build:extension", "package", "zip", "release"];

      requiredScripts.forEach((script) => {
         if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`✅ npm run ${script}`);
         } else {
            console.log(`❌ npm run ${script} - MISSING`);
            allGood = false;
         }
      });
   }

   // Check manifest permissions
   console.log("\n🔐 Checking manifest permissions...");
   const manifestPath = path.join(projectRoot, "public/manifest.json");
   if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const requiredPermissions = ["storage", "notifications", "tabs"];

      requiredPermissions.forEach((permission) => {
         if (
            manifest.permissions &&
            manifest.permissions.includes(permission)
         ) {
            console.log(`✅ ${permission} permission`);
         } else {
            console.log(`❌ ${permission} permission - MISSING`);
            allGood = false;
         }
      });
   }

   // Check background.js configuration
   console.log("\n🔧 Checking background.js configuration...");
   const backgroundPath = path.join(projectRoot, "src/background.js");
   if (fs.existsSync(backgroundPath)) {
      const backgroundContent = fs.readFileSync(backgroundPath, "utf8");

      if (backgroundContent.includes("elsesourav/seller-automation")) {
         console.log("✅ GitHub repository URL configured");
      } else {
         console.log("❌ GitHub repository URL not configured");
         allGood = false;
      }

      if (backgroundContent.includes("ExtensionAutoUpdater")) {
         console.log("✅ Auto-updater class present");
      } else {
         console.log("❌ Auto-updater class missing");
         allGood = false;
      }
   }

   // Check git configuration
   console.log("\n📡 Checking git configuration...");
   try {
      const gitConfigPath = path.join(projectRoot, ".git/config");
      if (fs.existsSync(gitConfigPath)) {
         const gitConfig = fs.readFileSync(gitConfigPath, "utf8");
         if (gitConfig.includes("elsesourav/seller-automation")) {
            console.log("✅ Git remote configured for your repository");
         } else {
            console.log("⚠️  Git remote may not be configured correctly");
         }
      } else {
         console.log("⚠️  Git not initialized");
      }
   } catch {
      console.log("⚠️  Could not check git configuration");
   }

   // Summary
   console.log("\n" + "=".repeat(50));
   if (allGood) {
      console.log("🎉 All setup verification checks passed!");
      console.log("\n📋 Next steps:");
      console.log("1. Test build: npm run build:extension");
      console.log("2. Create first release: npm run release 1.0.0");
      console.log("3. Push to GitHub: git push origin main --tags");
      console.log("4. Check GitHub Actions in your repository");
   } else {
      console.log(
         "❌ Some setup issues found. Please review the errors above."
      );
   }
   console.log("=".repeat(50));
};

verifySetup();
