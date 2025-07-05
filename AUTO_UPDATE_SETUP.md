# Auto-Update Setup Guide

This guide will help you set up automatic updates for your Chrome extension using GitHub releases.

## 🔧 Initial Setup

### 1. GitHub Repository Setup

1. **Create GitHub Repository**:

   ```bash
   # If you haven't already, initialize git and create repository
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/elsesourav/seller-automation.git
   git push -u origin main
   ```

2. **Enable GitHub Actions**:
   -  Go to your repository on GitHub
   -  Click on "Actions" tab
   -  GitHub Actions should be enabled by default

### 2. Update Configuration

1. **Update Auto-Updater URL** in `src/background.js`:

   ```javascript
   // Already updated to use your repository
   this.updateUrl =
      "https://api.github.com/repos/elsesourav/seller-automation/releases/latest";
   ```

2. **Update GitHub Workflow** in `.github/workflows/release.yml`:
   ```yaml
   # Replace YOUR_EXTENSION_ID_HERE with your actual extension ID
   <app appid='YOUR_EXTENSION_ID_HERE'>
   ```

### 3. Initial Release

1. **Prepare first release**:

   ```bash
   npm run release 1.0.0
   ```

2. **Push to GitHub**:

   ```bash
   git push origin main --tags
   ```

3. **Verify GitHub Actions**:
   -  Go to "Actions" tab in your GitHub repository
   -  You should see a workflow running
   -  Wait for it to complete and create a release

## 🚀 How It Works

### Workflow Process

1. **Developer pushes tag**: When you run `npm run release <version>`, it creates a git tag
2. **GitHub Actions triggers**: The workflow detects the new tag and starts building
3. **Extension builds**: GitHub Actions runs `npm run build` and packages the extension
4. **Release created**: A new GitHub release is created with the extension ZIP file
5. **Users get notified**: Extensions automatically check for updates and notify users

### Auto-Update Flow

```
Extension Runtime
       ↓
Check GitHub API every hour
       ↓
Compare versions
       ↓
If newer version available
       ↓
Show notification to user
       ↓
User clicks "Download"
       ↓
Opens GitHub release page
```

## 📝 Release Process

### Quick Release

```bash
# Make your changes
git add .
git commit -m "Your changes"

# Create and push release
npm run release 1.0.1
git push origin main --tags
```

### Manual Release Process

```bash
# 1. Update version in package.json
npm version 1.0.1

# 2. Build extension
npm run build:extension

# 3. Create ZIP
npm run zip

# 4. Commit and tag
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1

# 5. Push
git push origin main --tags
```

## 🔧 Configuration Options

### Update Check Frequency

In `src/background.js`, modify the check interval:

```javascript
this.checkInterval = 60 * 60 * 1000; // Check every hour
// Change to:
this.checkInterval = 24 * 60 * 60 * 1000; // Check daily
```

### Notification Customization

Modify the notification in `src/background.js`:

```javascript
await chrome.notifications.create("extension-update", {
   type: "basic",
   iconUrl: "/icons/icon.png",
   title: "Your Extension Update Available",
   message: `Version ${version} is now available. Click to learn more.`,
   buttons: [{ title: "Download Update" }, { title: "Remind Later" }],
});
```

## 🐛 Troubleshooting

### Common Issues

1. **GitHub Actions not triggering**:

   -  Ensure you pushed the tag: `git push origin --tags`
   -  Check if GitHub Actions is enabled in repository settings
   -  Verify the workflow file is in `.github/workflows/`

2. **Extension not checking for updates**:

   -  Check browser console for error messages
   -  Verify the GitHub API URL is correct
   -  Ensure notifications permission is granted

3. **Version comparison issues**:
   -  Use semantic versioning (e.g., 1.0.1, not 1.0.1-beta)
   -  Ensure version in package.json matches git tag

### Debug Auto-Updates

1. **Check update status**:

   ```javascript
   // In extension console
   chrome.storage.local
      .get(["updateAvailable", "lastChecked", "latestVersion"])
      .then(console.log);
   ```

2. **Force update check**:

   ```javascript
   // In extension console
   // Manually trigger update check (if you expose the method)
   ```

3. **View notification logs**:
   -  Open extension background page in Chrome developer tools
   -  Look for console logs related to update checking

## 🔒 Security Considerations

1. **GitHub Token**: The workflow uses `GITHUB_TOKEN` which is automatically provided
2. **Update URL**: Always use HTTPS for the GitHub API
3. **Version Validation**: The extension validates version format before updating
4. **User Consent**: Users must click to download updates (not automatic installation)

## 📊 Analytics & Monitoring

### Track Update Success

Add analytics to track update adoption:

```javascript
// In background.js, after successful update check
chrome.storage.local.set({
   updateStats: {
      lastCheckTime: Date.now(),
      updateAvailable: true,
      userNotified: true,
   },
});
```

### Monitor GitHub Releases

-  Check GitHub release download statistics
-  Monitor GitHub Actions workflow success rate
-  Review user feedback on updates

## 🎯 Best Practices

1. **Semantic Versioning**: Always use semver (MAJOR.MINOR.PATCH)
2. **Test Before Release**: Thoroughly test in development before releasing
3. **Gradual Rollout**: Consider releasing to a subset of users first
4. **Release Notes**: Include meaningful release notes in GitHub releases
5. **Backup Strategy**: Keep previous versions available for rollback

## 📞 Need Help?

If you encounter issues:

1. Check the troubleshooting section above
2. Review GitHub Actions logs in your repository
3. Check Chrome extension console for errors
4. Verify all configuration steps were completed

## 🔄 Advanced Features

### Staged Rollouts

Implement percentage-based rollouts:

```javascript
// In background.js
const shouldCheckForUser = () => {
   const userId = Math.random();
   const rolloutPercentage = 0.1; // 10% of users
   return userId < rolloutPercentage;
};
```

### A/B Testing Updates

Test different update notification styles:

```javascript
// Randomly choose notification style
const notificationStyle = Math.random() > 0.5 ? "detailed" : "simple";
```

This completes your auto-update setup! Your extension will now automatically check for updates and notify users when new versions are available.
