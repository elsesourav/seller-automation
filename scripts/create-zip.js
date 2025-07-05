#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createZip = () => {
   console.log("🗜️ Creating ZIP file for Chrome Extension...");

   const projectRoot = path.dirname(__dirname);
   const distPath = path.join(projectRoot, "dist");
   const packageJsonPath = path.join(projectRoot, "package.json");

   // Check if dist folder exists
   if (!fs.existsSync(distPath)) {
      console.error(
         '❌ dist folder not found. Run "npm run build:extension" first.'
      );
      process.exit(1);
   }

   // Read version from package.json
   const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
   const version = packageJson.version;
   const extensionName = packageJson.name;

   const zipFileName = `${extensionName}-v${version}.zip`;
   const zipPath = path.join(projectRoot, zipFileName);

   try {
      // Remove existing zip file if it exists
      if (fs.existsSync(zipPath)) {
         fs.unlinkSync(zipPath);
         console.log(`🗑️ Removed existing ${zipFileName}`);
      }

      // Create ZIP file
      console.log(`📦 Creating ${zipFileName}...`);

      // Change to dist directory and create zip
      process.chdir(distPath);
      execSync(`zip -r "${zipPath}" .`, { stdio: "inherit" });

      // Change back to project root
      process.chdir(projectRoot);

      // Verify ZIP file was created
      if (fs.existsSync(zipPath)) {
         const stats = fs.statSync(zipPath);
         const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

         console.log("✅ ZIP file created successfully!");
         console.log(`📁 File: ${zipFileName}`);
         console.log(`📏 Size: ${fileSizeInMB} MB`);
         console.log(`📍 Location: ${zipPath}`);
         console.log("");
         console.log(
            "🚀 Ready for upload to Chrome Web Store or manual distribution!"
         );
      } else {
         throw new Error("ZIP file was not created");
      }
   } catch (error) {
      console.error("❌ Error creating ZIP file:", error.message);
      process.exit(1);
   }
};

createZip();
