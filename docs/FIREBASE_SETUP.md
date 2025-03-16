# Firebase Setup Guide

This guide walks through setting up Firebase for the Vibe Photoshop application.

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "vibe-photoshop")
4. Choose whether to enable Google Analytics (recommended)
5. Follow the prompts to complete project creation

## 2. Set Up Firebase Authentication

1. In the Firebase console, navigate to "Authentication" from the left menu
2. Click "Get started"
3. Enable the following authentication methods:
   - Email/Password
   - Google (recommended for simplicity)
4. For Google authentication:
   - Configure the OAuth consent screen
   - Add your domain to the authorized domains list

## 3. Set Up Firestore Database

1. Navigate to "Firestore Database" from the left menu
2. Click "Create database"
3. Start in production mode
4. Choose a location closest to your target users
5. Set up the following collections and documents:

```
users/
  {userId}/
    profile: {
      displayName: string,
      email: string,
      photoURL: string,
      apiKey: string (encrypted),
      createdAt: timestamp,
      lastLogin: timestamp
    }
    
images/
  {imageId}/
    metadata: {
      userId: string,
      title: string,
      prompt: string,
      createdAt: timestamp,
      storageUrl: string,
      thumbnailUrl: string,
      isPublic: boolean
    }
    
versions/
  {versionId}/
    metadata: {
      imageId: string,
      versionNumber: number,
      editDescription: string,
      createdAt: timestamp,
      storageUrl: string,
      thumbnailUrl: string
    }
```

## 4. Set Up Firebase Storage

1. Navigate to "Storage" from the left menu
2. Click "Get started"
3. Follow the setup steps (use production mode)
4. Create the following storage structure:

```
/images/{userId}/{imageId}.jpg
/thumbnails/{userId}/{imageId}.jpg
/versions/{userId}/{imageId}/{versionId}.jpg
```

## 5. Set Up Security Rules

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Images can be read by their owners
    match /images/{imageId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Versions can be read by the image owners
    match /versions/{versionId} {
      allow read, write: if request.auth != null && 
                          request.auth.uid == get(/databases/$(database)/documents/images/$(resource.data.imageId)).data.userId;
    }
  }
}
```

### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{userId}/{imageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /thumbnails/{userId}/{imageId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /versions/{userId}/{imageId}/{versionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 6. Set Up Firebase Web App

1. In the Firebase console, navigate to Project Settings
2. Under "Your apps", click the web icon (</>) to add a web app
3. Register your app with a nickname (e.g., "Vibe Photoshop Web")
4. Optionally set up Firebase Hosting
5. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID" // if using Analytics
};
```

## 7. Install Firebase SDK in Your SvelteKit Project

1. Install Firebase:

```bash
npm install firebase
```

2. Create a `src/lib/firebase.js` file with your configuration:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Your Firebase configuration object
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## 8. Set Up Firebase Hosting (Optional for Quick Launch)

1. Install Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Log in to Firebase:

```bash
firebase login
```

3. Initialize Firebase in your project:

```bash
firebase init
```

4. Select Hosting and follow the prompts
5. Set public directory to `build` for SvelteKit
6. Configure as a single-page app: Yes
7. Set up automatic builds and deploys with GitHub: Optional

## 9. Deployment

1. Build your SvelteKit app:

```bash
npm run build
```

2. Deploy to Firebase:

```bash
firebase deploy
``` 