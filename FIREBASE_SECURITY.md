# Firebase Security Rules for Chrome Extension

Since this Chrome Extension doesn't use Firebase Authentication, you'll need to configure Firestore security rules to allow read/write access.

## ⚠️ WARNING

The rules below are for development/testing purposes and allow public read/write access to your Firestore database. **This is NOT secure for production use**.

## Development Rules (Not Secure - Use for Testing Only)

```javascript
// Firestore Security Rules - DEVELOPMENT ONLY
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to seller-data collection
    match /seller-data/{document} {
      allow read, write: if true;
    }

    // Deny access to all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Production Recommendations

For production use, consider these alternatives:

### Option 1: Use Firebase Authentication

-  Implement Firebase Auth in your extension
-  Use authenticated user rules
-  Most secure approach

### Option 2: Use API Keys with Server Validation

-  Create a backend API that validates requests
-  Use server-side authentication
-  Route Chrome Extension through your API

### Option 3: Restricted Public Access with Validation

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /seller-data/{document} {
      allow read: if true;
      allow write: if request.auth == null
        && resource == null
        && request.resource.data.keys().hasAll(['text', 'timestamp', 'source'])
        && request.resource.data.source == 'chrome-extension'
        && request.resource.data.text is string
        && request.resource.data.timestamp is string;
    }
  }
}
```

## How to Apply Rules

1. Go to Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Click on "Rules" tab
5. Replace the existing rules with the appropriate rules above
6. Click "Publish"

## Additional Security Measures

1. **Environment Variables**: Store your Firebase config in environment variables
2. **Domain Restrictions**: Configure Firebase to only allow requests from specific domains
3. **Rate Limiting**: Implement rate limiting in your Firebase project
4. **Data Validation**: Always validate data on the client side before sending to Firebase
5. **Monitoring**: Set up monitoring and alerts for unusual activity

## Testing Your Rules

Use the Firebase Rules Simulator in the console to test your rules before deploying them.

Remember: Security rules are your last line of defense, but they should be combined with other security measures for a robust solution.
