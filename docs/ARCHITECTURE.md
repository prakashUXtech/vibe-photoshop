# Architecture Guide

This document outlines the architecture of Vibe Photoshop, a SvelteKit application integrated with Firebase and Google's Gemini 2.0 Flash API.

## High-Level Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│  SvelteKit    │────▶│   Firebase    │────▶│  Gemini 2.0   │
│  Frontend     │◀────│   Services    │◀────│  Flash API    │
│               │     │               │     │               │
└───────────────┘     └───────────────┘     └───────────────┘
```

## Component Breakdown

### Frontend (SvelteKit)

- **Pages**:
  - Home/Landing Page: Introduction and login
  - Dashboard: Main interface for creation and editing
  - Gallery: View past creations and versions
  - Settings: Manage API keys and user preferences

- **Components**:
  - ImageGenerator: Text-to-image generation interface
  - ImageEditor: Simple image editing interface
  - VersionHistory: View and manage image versions
  - ApiKeyManager: Handle user API key entry and validation
  - Gallery: Display user's image collection
  - AuthWrapper: Handle authentication state

### Backend Services (Firebase)

- **Authentication**: User management via Firebase Auth
  - Email/Password
  - Google OAuth (recommended)

- **Database (Firestore)**:
  - User profiles
  - API key storage (encrypted)
  - Image metadata
  - Version history
  - User settings

- **Storage**:
  - Image file storage

### External Services

- **Gemini 2.0 Flash API**:
  - Image generation
  - Image editing capabilities

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Firebase Auth
   - App retrieves user profile from Firestore
   - App checks for stored API key (or prompts user to enter one)

2. **Image Generation Flow**:
   - User enters text prompt in UI
   - App sends request to Gemini API using user's API key
   - Generated image is saved to Firebase Storage
   - Metadata is saved to Firestore

3. **Image Editing Flow**:
   - User selects image to edit
   - App loads image from Firebase Storage
   - User makes edits via UI
   - App sends edit instructions to Gemini API
   - New version is saved to Firebase Storage
   - Version metadata is updated in Firestore

4. **Gallery/History Flow**:
   - App queries Firestore for user's images
   - Thumbnails are loaded from Firebase Storage
   - User can select images to view version history
   - Version timeline is displayed from Firestore data

## Technical Considerations

### Security

- User API keys must be stored securely (encrypted at rest)
- All Firebase rules should restrict access to user's own data only
- Consider server-side proxy for API calls to avoid exposing keys in frontend

### Performance

- Implement pagination for gallery views
- Use image compression for thumbnails
- Consider caching strategies for frequently viewed images

### Scalability

- Firestore scales automatically with user growth
- Monitor API usage to avoid rate limits
- Consider implementing request queuing for heavy usage

## Deployment Architecture

```
┌───────────────┐     ┌───────────────┐
│               │     │               │
│  Firebase     │────▶│  End Users    │
│  Hosting      │◀────│               │
│               │     │               │
└───────────────┘     └───────────────┘
        ▲
        │
        ▼
┌───────────────┐
│               │
│  Firebase     │
│  Services     │
│               │
└───────────────┘
        ▲
        │
        ▼
┌───────────────┐
│               │
│  Gemini 2.0   │
│  Flash API    │
│               │
└───────────────┘
``` 