# 🛒 Seller Automation Chrome Extension

A modern Chrome Extension built with React, Vite, Tailwind CSS, and Firebase Firestore for seller automation and data management.

## 🔧 Tech Stack

-  **React 19** (JavaScript only, no TypeScript)
-  **Vite 6** (latest version for fast development and building)
-  **Tailwind CSS** (for modern, responsive styling)
-  **Firebase Firestore** (for data storage, no auth required)
-  **Chrome Extension Manifest V3** (latest extension format)

## 📁 Project Structure

```
seller-automation/
├── src/
│   ├── PopupApp.jsx          # Main popup React component
│   ├── OptionsApp.jsx        # Settings/options React component
│   ├── popup.jsx             # Popup entry point
│   ├── options.jsx           # Options entry point
│   ├── background.js         # Service worker (background script)
│   ├── content.js            # Content script (runs on web pages)
│   ├── firebaseConfig.js     # Firebase configuration
│   └── index.css             # Global CSS with Tailwind imports
├── public/
│   ├── manifest.json         # Chrome Extension manifest
│   └── icons/                # Extension icons (16, 32, 48, 128px)
├── popup.html                # Popup HTML entry point
├── options.html              # Options HTML entry point
├── vite.config.js            # Vite configuration for extension build
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── package.json              # Project dependencies and scripts
```

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
cd seller-automation
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Firestore Database**
4. Get your Firebase configuration from Project Settings
5. Update `src/firebaseConfig.js` with your config:

```javascript
const firebaseConfig = {
   apiKey: "your-api-key",
   authDomain: "your-project.firebaseapp.com",
   projectId: "your-project-id",
   storageBucket: "your-project.appspot.com",
   messagingSenderId: "123456789",
   appId: "your-app-id",
};
```

### 3. Set Up Firebase Security Rules

⚠️ **Important**: Since this extension doesn't use Firebase Auth, you need to configure Firestore security rules.

For **development/testing** (not secure for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /seller-data/{document} {
      allow read, write: if true;
    }
  }
}
```

📖 **See `FIREBASE_SECURITY.md` for detailed security configuration options.**

### 4. Build the Extension

```bash
npm run build
```

This creates a `dist/` folder with all the extension files.

### 5. Load in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. The extension will appear in your extensions list

### 6. Test the Extension

-  Click the extension icon in the toolbar to open the popup
-  Try saving some data to Firebase
-  Right-click the extension icon → **Options** to access settings
-  Check the browser console for content script logs

## 🛠️ Development

### Development Scripts

```bash
# Start development server (for testing React components)
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Preview built files
npm run preview
```

### Development Workflow

1. **Make changes** to React components in `src/`
2. **Rebuild** the extension: `npm run build`
3. **Reload** the extension in `chrome://extensions/`
4. **Test** your changes

### Hot Reloading

For faster development, you can use `npm run dev` to test React components in a browser, but for final testing, always use the built extension in Chrome.

## 📋 Features

### Popup Interface

-  📝 **Data Input**: Enter and save seller data to Firebase
-  📄 **Page Info Capture**: Get current page title and URL
-  📊 **Data Display**: View recently saved data
-  🔄 **Real-time Sync**: Automatically syncs with Firebase

### Options Page

-  ⚙️ **Settings Management**: Configure extension behavior
-  🔧 **Advanced Options**: Sync intervals, themes, notifications
-  🗑️ **Data Management**: Clear all stored data
-  📖 **Setup Instructions**: Built-in Firebase setup guide

### Background Features

-  🎯 **Extension Lifecycle**: Handles installation and updates
-  📨 **Message Handling**: Communication between components
-  🌐 **Tab Monitoring**: Optional page change tracking

### Content Script Features

-  📄 **Page Analysis**: Extract page information
-  🎯 **Element Highlighting**: Highlight specific page elements
-  🔄 **DOM Monitoring**: Watch for dynamic content changes

## 🎨 Styling

The extension uses **Tailwind CSS** for styling with a clean, modern design:

-  **Popup**: Compact 350x500px interface
-  **Options**: Full-screen responsive layout
-  **Theme**: Light theme with blue accent colors
-  **Responsive**: Works across different screen sizes

## 🔐 Security Considerations

-  **Firebase Rules**: Configure appropriate security rules for your use case
-  **CSP Compliance**: Built to work with Manifest V3 Content Security Policy
-  **Data Validation**: Always validate data before saving
-  **Error Handling**: Graceful error handling throughout the app

## 📦 Chrome Web Store Preparation

The extension is built to be **Chrome Web Store ready**:

1. **Icons**: Add proper icon files to `public/icons/` (16, 32, 48, 128px)
2. **Description**: Update manifest description and extension details
3. **Permissions**: Review and minimize required permissions
4. **Testing**: Test thoroughly across different websites
5. **Documentation**: Prepare store listing with screenshots

## 🔧 Customization

### Adding New Features

1. **React Components**: Add new `.jsx` files in `src/`
2. **Styling**: Use Tailwind classes or add custom CSS
3. **Firebase Collections**: Create new collections in Firestore
4. **Background Logic**: Extend `background.js` for new functionality

### Modifying the Build

-  **Entry Points**: Add new HTML/JS entry points in `vite.config.js`
-  **Assets**: Place static assets in `public/`
-  **Environment Variables**: Use `.env` files for configuration

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Check if all dependencies are installed
2. **Firebase Errors**: Verify configuration and security rules
3. **Extension Not Loading**: Check manifest.json syntax
4. **React Errors**: Check browser console for detailed errors

### Debug Mode

-  Enable **Developer mode** in Chrome extensions
-  Check **Service Worker** logs in extension details
-  Use **React Developer Tools** for component debugging

## 📚 Learning Resources

-  [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
-  [React Documentation](https://react.dev/)
-  [Tailwind CSS Documentation](https://tailwindcss.com/docs)
-  [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
-  [Vite Documentation](https://vite.dev/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review Firebase security rules configuration
3. Ensure all dependencies are up to date
4. Check Chrome extension permissions

---

Built with ❤️ using modern web technologies for seamless seller automation.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

-  [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
-  [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
