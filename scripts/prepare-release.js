#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prepareRelease = () => {
   console.log("🚀 Preparing release for Chrome Extension...");

   const projectRoot = path.dirname(__dirname);
   const packageJsonPath = path.join(projectRoot, "package.json");

   // Read current version
   const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
   const currentVersion = packageJson.version;

   console.log(`📌 Current version: ${currentVersion}`);

   // Ask for new version (you can modify this to accept command line args)
   const versionArg = process.argv[2];
   if (!versionArg) {
      console.log("💡 Usage: npm run release <version>");
      console.log("💡 Example: npm run release 1.0.1");
      process.exit(1);
   }

   const newVersion = versionArg;

   // Validate version format
   const versionRegex = /^\d+\.\d+\.\d+$/;
   if (!versionRegex.test(newVersion)) {
      console.error(
         "❌ Invalid version format. Use semantic versioning (e.g., 1.0.1)"
      );
      process.exit(1);
   }

   try {
      console.log(`📝 Updating version to ${newVersion}...`);

      // Update package.json version
      packageJson.version = newVersion;
      fs.writeFileSync(
         packageJsonPath,
         JSON.stringify(packageJson, null, 2) + "\n"
      );
      console.log("✅ Updated package.json");

      // Update manifest.json version in public folder
      const manifestPath = path.join(projectRoot, "public", "manifest.json");
      if (fs.existsSync(manifestPath)) {
         const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
         manifest.version = newVersion;
         fs.writeFileSync(
            manifestPath,
            JSON.stringify(manifest, null, 3) + "\n"
         );
         console.log("✅ Updated manifest.json");
      }

      // Build and package extension
      console.log("🔨 Building extension...");
      execSync("npm run build:extension", { stdio: "inherit" });

      // Create ZIP file
      console.log("📦 Creating ZIP file...");
      execSync("npm run zip", { stdio: "inherit" });

      // Git operations
      console.log("📋 Preparing Git commit and tag...");
      execSync("git add .", { stdio: "inherit" });
      execSync(`git commit -m "Release v${newVersion}"`, { stdio: "inherit" });
      execSync(`git tag v${newVersion}`, { stdio: "inherit" });

      console.log("");
      console.log("🎉 Release preparation completed!");
      console.log("");
      console.log("📋 Next steps:");
      console.log(`   1. Push to GitHub: git push origin main --tags`);
      console.log(`   2. GitHub Actions will automatically create a release`);
      console.log(`   3. The extension ZIP will be available in the release`);
      console.log("");
      console.log("💡 Or push manually:");
      console.log(`   git push origin v${newVersion}`);
   } catch (error) {
      console.error("❌ Error preparing release:", error.message);
      process.exit(1);
   }
};

prepareRelease();
