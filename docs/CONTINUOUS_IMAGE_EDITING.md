# Continuous Image Editing with Gemini API

This document explains how the continuous image editing feature works in the Vibe Photoshop application.

## Overview

The continuous image editing feature allows users to have a multi-turn conversation with the Gemini AI model to progressively edit an image. This enables a more interactive and iterative editing experience, where each edit builds upon the previous ones.

## How It Works

1. **Initial Image Upload/Generation**: The user either uploads an image or generates one using the Gemini API.

2. **First Edit**: The user provides instructions to edit the image (e.g., "Add a blue sky in the background").

3. **Continuous Editing**: After the first edit, the application maintains a conversation history that includes:
   - The original image
   - All user instructions
   - All model responses (text and images)

4. **Subsequent Edits**: Each new instruction is added to the conversation history, allowing the model to understand the context of previous edits.

## Technical Implementation

### Client-Side Components

1. **ChatPanel.svelte**: Manages the chat interface and tracks the conversation state.
   - Maintains the `conversationHistory` array
   - Tracks whether we're in an editing session with `isEditingImage`
   - Provides different UI based on the editing state

2. **Gemini API Service**: Provides functions to interact with the Gemini API.
   - `editImage()`: Handles the initial image edit
   - `continueImageEditing()`: Handles subsequent edits in the conversation
   - `formatChatHistoryForGemini()`: Formats chat messages for the Gemini API

### Server-Side Endpoints

1. **/api/gemini**: General endpoint for image generation and initial image editing.

2. **/api/gemini/continuous-edit**: Specialized endpoint for continuous image editing.
   - Takes a conversation history and a new instruction
   - Returns updated text, images, and conversation history

### Conversation History Format

The conversation history follows the Gemini API format:

```javascript
[
  {
    role: "user",
    parts: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: "base64_image_data"
        }
      },
      { text: "Initial edit instruction" }
    ]
  },
  {
    role: "model",
    parts: [
      { text: "Model response text" },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: "base64_edited_image_data"
        }
      }
    ]
  },
  {
    role: "user",
    parts: [
      { text: "Second edit instruction" }
    ]
  },
  // And so on...
]
```

## User Experience

1. When a user uploads or generates an image, they can start editing it with text instructions.

2. After the first edit, the UI indicates that they're in a continuous editing session.

3. Each subsequent instruction builds on previous edits, allowing for progressive refinement.

4. The conversation history is maintained until:
   - The user selects a different image
   - The user generates a new image
   - The user clears the chat

## Limitations

1. The conversation history can become quite large, especially with multiple image edits.

2. There's a limit to how many turns the model can effectively remember and process.

3. The quality of continuous edits may degrade after several turns.

## Future Improvements

1. Add ability to branch edits (create alternative versions)

2. Implement conversation history pruning to manage memory usage

3. Add ability to save and load editing sessions

4. Provide UI to view and navigate the edit history 