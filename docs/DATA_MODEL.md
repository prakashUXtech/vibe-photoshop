# Data Model

This document describes the data model for the Vibe Photoshop application. We use Firebase Firestore as our primary database and Firebase Storage for file storage.

## Database Schema

### Collection: `users`

Stores user profile information and settings.

```
users/
  {userId}/     // Firebase Auth UID
    profile: {
      displayName: string,
      email: string,
      photoURL: string,
      createdAt: timestamp,
      lastLogin: timestamp
    },
    settings: {
      apiKey: string (encrypted),    // User's Gemini API key
      defaultPrivacy: boolean,       // Default privacy setting for new images
      theme: string,                 // UI theme preference
      notificationsEnabled: boolean  // Notification preferences
    },
    stats: {
      totalImages: number,           // Total images created
      totalEdits: number,            // Total edits made
      lastActivity: timestamp        // Last activity timestamp
    }
```

### Collection: `images`

Stores metadata for all generated images.

```
images/
  {imageId}/    // UUID v4
    metadata: {
      userId: string,                // Reference to user who created the image
      prompt: string,                // Text prompt used to generate the image
      title: string,                 // Auto-generated or user-provided title
      createdAt: timestamp,          // Creation timestamp
      storageUrl: string,            // URL to full-size image in Firebase Storage
      thumbnailUrl: string,          // URL to thumbnail in Firebase Storage
      isPublic: boolean,             // Whether the image is publicly viewable
      tags: array<string>,           // User-defined tags (optional)
      latestVersionId: string,       // Reference to latest version
      versionCount: number           // Number of versions
    }
```

### Collection: `versions`

Stores metadata for all image versions.

```
versions/
  {versionId}/  // UUID v4
    metadata: {
      imageId: string,               // Reference to parent image
      userId: string,                // Reference to user who created this version
      versionNumber: number,         // Sequential version number (1-based)
      editDescription: string,       // Description of the edits made
      createdAt: timestamp,          // Creation timestamp
      storageUrl: string,            // URL to full-size image in Firebase Storage
      thumbnailUrl: string,          // URL to thumbnail in Firebase Storage
      editParameters: object         // Parameters used for the edit (optional)
    }
```

## Storage Structure

### Firebase Storage

```
/images/{userId}/{imageId}.jpg            // Original generated images
/thumbnails/{userId}/{imageId}.jpg        // Thumbnails for gallery view
/versions/{userId}/{imageId}/{versionId}.jpg  // Version images
/thumbnails/{userId}/{imageId}/{versionId}.jpg  // Version thumbnails
```

## Relationships

```
┌───────────┐             ┌───────────┐             ┌───────────┐
│           │             │           │             │           │
│   User    │─────────────▶   Image   │─────────────▶  Version  │
│           │   1      *  │           │   1      *  │           │
└───────────┘             └───────────┘             └───────────┘
```

- A User can have multiple Images
- An Image can have multiple Versions
- A Version belongs to exactly one Image
- All entities include a userId reference for security rules

## Indexing Requirements

For optimal query performance, create the following indexes:

1. Collection: `images`, Fields: `userId` ASC, `createdAt` DESC
   - For querying a user's images sorted by creation date

2. Collection: `versions`, Fields: `imageId` ASC, `versionNumber` ASC
   - For retrieving versions of an image in sequence

3. Collection: `versions`, Fields: `imageId` ASC, `createdAt` DESC
   - For retrieving versions of an image by creation date

## Security Considerations

1. Use Firebase security rules to ensure users can only access their own data
2. API keys should be encrypted before storage and decrypted at runtime
3. Consider field-level security for sensitive data
4. Implement appropriate data validation at the application level

## Query Patterns

### Common Queries

1. Get a user's images:
```javascript
const imagesRef = collection(db, 'images');
const q = query(imagesRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
```

2. Get versions of an image:
```javascript
const versionsRef = collection(db, 'versions');
const q = query(versionsRef, where('imageId', '==', imageId), orderBy('versionNumber', 'asc'));
```

3. Get latest version of an image:
```javascript
const versionsRef = collection(db, 'versions');
const q = query(versionsRef, where('imageId', '==', imageId), orderBy('versionNumber', 'desc'), limit(1));
```

## Data Integrity

To maintain data integrity:

1. Use transactions for operations that update multiple documents
2. Implement data validation in client code
3. Set up Cloud Functions for cascade operations (optional)
4. Consider using Firestore triggers for denormalization updates

## Performance Considerations

1. Limit the size of documents to avoid performance degradation
2. Use pagination for gallery views and version history
3. Store only essential metadata in Firestore; keep large data in Storage
4. Consider caching frequently accessed data

## Data Migration Strategy

For future versions:

1. Use document versioning with a version field in each document
2. Implement migration logic in the application to handle schema updates
3. Consider using Cloud Functions for batch migrations 