#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageExtension = () => {
   console.log("📦 Packaging Chrome Extension...");

   const projectRoot = path.dirname(__dirname);
   const distPath = path.join(projectRoot, "dist");
   const packageJsonPath = path.join(projectRoot, "package.json");
   const manifestPath = path.join(distPath, "manifest.json");

   // Check if dist folder exists
   if (!fs.existsSync(distPath)) {
      console.error('❌ dist folder not found. Run "npm run build" first.');
      process.exit(1);
   }

   // Read version from package.json
   const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
   const version = packageJson.version;

   console.log(`📌 Current version: ${version}`);

   // Update manifest.json version
   if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      manifest.version = version;
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 3));
      console.log("✅ Updated manifest.json version");
   } else {
      console.error("❌ manifest.json not found in dist folder");
      process.exit(1);
   }

   // Copy additional files that might be needed
   const filesToCopy = ["README.md"];
   filesToCopy.forEach((file) => {
      const srcFile = path.join(projectRoot, file);
      const destFile = path.join(distPath, file);
      if (fs.existsSync(srcFile)) {
         fs.copyFileSync(srcFile, destFile);
         console.log(`✅ Copied ${file} to dist`);
      }
   });

   console.log("✅ Extension packaging completed!");
   console.log(`📁 Extension files are ready in: ${distPath}`);
   console.log('💡 Run "npm run zip" to create a ZIP file for distribution');
};

packageExtension();
