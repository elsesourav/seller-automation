#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const release = () => {
   console.log("🚀 Creating release...");

   const projectRoot = path.dirname(__dirname);
   const distPath = path.join(projectRoot, "dist");
   const packageJsonPath = path.join(projectRoot, "package.json");
   const manifestPath = path.join(distPath, "manifest.json");

   // Get version from command line argument
   const newVersion = process.argv[2];
   if (!newVersion) {
      console.log("❌ Please provide a version number");
      console.log("💡 Usage: npm run release 1.0.2");
      process.exit(1);
   }

   // Validate version format
   if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
      console.error("❌ Invalid version format. Use: 1.0.2");
      process.exit(1);
   }

   try {
      console.log(`📝 Updating to version ${newVersion}...`);

      // Update package.json version
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      packageJson.version = newVersion;
      fs.writeFileSync(
         packageJsonPath,
         JSON.stringify(packageJson, null, 2) + "\n"
      );
      console.log("✅ Updated package.json");

      // Update public manifest.json version
      const publicManifestPath = path.join(
         projectRoot,
         "public",
         "manifest.json"
      );
      if (fs.existsSync(publicManifestPath)) {
         const manifest = JSON.parse(
            fs.readFileSync(publicManifestPath, "utf8")
         );
         manifest.version = newVersion;
         fs.writeFileSync(
            publicManifestPath,
            JSON.stringify(manifest, null, 3) + "\n"
         );
         console.log("✅ Updated public/manifest.json");
      }

      // Update dist manifest.json version if it exists
      if (fs.existsSync(manifestPath)) {
         const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
         manifest.version = newVersion;
         fs.writeFileSync(
            manifestPath,
            JSON.stringify(manifest, null, 3) + "\n"
         );
         console.log("✅ Updated dist/manifest.json");
      }

      // Git operations
      console.log("📋 Committing and tagging...");
      execSync("git add .", { stdio: "inherit" });
      execSync(`git commit -m "Release v${newVersion}"`, { stdio: "inherit" });
      execSync(`git tag v${newVersion}`, { stdio: "inherit" });

      console.log("");
      console.log("🎉 Release ready!");
      console.log("");
      console.log("📋 Next step:");
      console.log(`   git push origin master --tags`);
      console.log("");
      console.log("🤖 This will trigger GitHub Actions to:");
      console.log("   • Build the extension");
      console.log("   • Create a ZIP file");
      console.log("   • Create a GitHub release");
      console.log("   • Enable auto-updates for users");
   } catch (error) {
      console.error("❌ Error creating release:", error.message);
      process.exit(1);
   }
};

release();
