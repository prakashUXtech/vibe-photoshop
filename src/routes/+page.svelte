<!-- Photoshop-inspired application page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { imageStore, imageVersions } from '$lib/stores/imageStore';
  import { chatStore, type ChatMessage } from '$lib/stores/chatStore';
  import { uiStore } from '$lib/stores/uiStore';
  import * as userService from '$lib/services/api/user';
  import { generateImage as apiGenerateImage, editImage as apiEditImage, fileToBase64 } from '$lib/services/api/gemini';
  import type { Image, ImageVersion } from '$lib/types';
  
  // Import components
  import {
    LoadingScreen,
    ToolBar,
    ImageCanvas,
    VersionHistory,
    StatusBar,
    ChatPanel,
    HistoryPanel,
    SessionsPanel,
    PanelTabs,
    SettingsPanel,
    VersionThumbnailPanel
  } from '$lib/components/photoshop';
  
  let mounted = false;
  
  // Handle file upload
  async function handleFileSelect(event: Event) {
    if (!browser) return;
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      imageStore.setUploading(true);
      
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(input.files[0]);
        
        // Create a data URL from the base64 data
        const fileType = input.files[0].type || 'image/jpeg';
        const dataUrl = `data:${fileType};base64,${base64Data}`;
        
        // Set the selected image with the preview URL
        imageStore.setSelectedImage(input.files[0], dataUrl);
        
        // Create the image metadata
        const img = new Image();
        const dimensions = await new Promise<{width: number, height: number}>((resolve) => {
          img.onload = () => {
            resolve({
              width: img.width,
              height: img.height
            });
          };
          img.src = dataUrl;
        });
        
        // Create a mock image object
        const timestamp = new Date();
        const imageId = `upload-${timestamp.getTime()}`;
        const newImage: Image = {
          id: imageId,
          userId: '1',
          prompt: 'Uploaded image',
          imageUrl: dataUrl,
          thumbnail: dataUrl,
          status: 'completed',
          createdAt: timestamp,
          updatedAt: timestamp,
          metadata: {
            width: dimensions.width,
            height: dimensions.height,
            format: input.files[0].type.split('/')[1] || 'jpeg',
            size: input.files[0].size
          },
          versions: [
            {
              id: `v-${timestamp.getTime()}`,
              imageId,
              prompt: 'Original upload',
              imageUrl: dataUrl,
              createdAt: timestamp
            }
          ]
        };
        
        imageStore.setCurrentImage(newImage);
        
        // Use the current session or create a new one for this image
        const fileName = input.files[0].name || 'Uploaded image';
        const sessionName = `${fileName.split('.')[0]} - ${timestamp.toLocaleString()}`;
        
        // Only create a new session if we don't have an active one with messages
        if (chatStore.messages.length <= 1) { // Only has welcome message or is empty
          chatStore.createSession(sessionName, imageId);
        } else {
          // Find if there's already a session for this image
          let existingSession = null;
          for (const session of chatStore.sessions) {
            if (session.imageId === imageId) {
              existingSession = session;
              break;
            }
          }
          
          if (existingSession) {
            // If there's an existing session for this image, switch to it
            chatStore.setActiveSession(existingSession.id);
          } else {
            // Otherwise, update the current active session to point to this image
            const activeSessionId = $chatStore.activeSessionId;
            if (activeSessionId) {
              // Update the session to point to this image
              chatStore.updateSessionImageId(activeSessionId, imageId);
            }
          }
        }
        
        // Add a welcome message to the session
        chatStore.addMessage({
          type: 'system',
          text: 'Image uploaded successfully. You can now edit the image using text prompts.',
          timestamp: new Date()
        });
        
        // Switch to the vibe tab for editing
        uiStore.setActiveTab('vibe');
      } catch (error) {
        console.error('Error uploading image:', error);
        chatStore.addMessage({
          type: 'system',
          text: 'Error uploading image. Please try again.',
          timestamp: new Date()
        });
      } finally {
        imageStore.setUploading(false);
      }
    }
  }
  
  // Process user input
  async function processInput() {
    if (!browser) return;
    
    if (!$chatStore.prompt.trim()) {
      chatStore.setError('Please enter a prompt');
      return;
    }
    
    // Check if API key is set
    const apiKey = await userService.getUserApiKey();
    if (!apiKey) {
      chatStore.setError('Please set your Gemini API key in Settings');
      chatStore.addMessage({
        type: 'system',
        text: 'Please set your Gemini API key in Settings to generate images.',
        timestamp: new Date()
      });
      uiStore.setActiveTab('settings');
      return;
    }
    
    chatStore.setError('');
    const userPrompt = $chatStore.prompt;
    chatStore.clearPrompt();
    
    // Add user message
    chatStore.addMessage({
      type: 'user',
      text: userPrompt,
      timestamp: new Date()
    });
    
    // If we have a current image, generate a new version
    if ($imageStore.currentImage) {
      await generateNewVersion(userPrompt);
    } else {
      // Otherwise generate a new image
      await generateImage(userPrompt);
    }
  }
  
  // Generate new image
  async function generateImage(userPrompt: string) {
    if (!browser) return;
    
    imageStore.setGenerating(true);
    chatStore.addMessage({
      type: 'system',
      text: 'Generating image from prompt...',
      timestamp: new Date()
    });
    
    try {
      // Get API key
      const apiKey = await userService.getUserApiKey();
      
      if (!apiKey) {
        throw new Error('No API key found. Please add your Gemini API key in settings.');
      }
      
      // Call the server endpoint directly
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          apiKey
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }
      
      const result = await response.json();
      console.log('Image generation response:', {
        textCount: result.text.length,
        imageCount: result.images.length,
        textSample: result.text.length > 0 ? result.text[0].substring(0, 50) + '...' : 'No text'
      });
      
      // Create a message with the response
      const message: ChatMessage = {
        type: 'assistant',
        text: result.text.length > 0 ? result.text.join('\n') : 'Image generated successfully',
        timestamp: new Date(),
        images: result.images.length > 0 ? [...result.images] : undefined
      };
      
      // Add the message to the chat
      chatStore.addMessage(message);
      
      if (result.images.length === 0) {
        throw new Error('No image was generated. Please try a different prompt.');
      }
      
      // Create image object in memory
      const timestamp = new Date();
      const imageId = `img-${timestamp.getTime()}`;
      
      // Create image object
      const newImage: Image = {
        id: imageId,
        userId: '1', // Default user ID
        prompt: userPrompt,
        imageUrl: `data:image/jpeg;base64,${result.images[0]}`,
        thumbnail: `data:image/jpeg;base64,${result.images[0]}`,
        status: 'completed',
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'jpeg',
          size: result.images[0].length
        },
        versions: [
          {
            id: `v-${timestamp.getTime()}`,
            imageId,
            prompt: userPrompt,
            imageUrl: `data:image/jpeg;base64,${result.images[0]}`,
            createdAt: timestamp
          }
        ]
      };
      
      // Update the image store
      imageStore.setCurrentImage(newImage);
      
      // Use the current session or create a new one for this image
      const sessionName = `Generated: ${userPrompt.substring(0, 30)}${userPrompt.length > 30 ? '...' : ''}`;
      
      // Only create a new session if we don't have an active one with messages
      if (chatStore.messages.length <= 1) { // Only has welcome message or is empty
        chatStore.createSession(sessionName, imageId);
      } else {
        // Find if there's already a session for this image
        let existingSession = null;
        for (const session of chatStore.sessions) {
          if (session.imageId === imageId) {
            existingSession = session;
            break;
          }
        }
        
        if (existingSession) {
          // If there's an existing session for this image, switch to it
          chatStore.setActiveSession(existingSession.id);
        } else {
          // Otherwise, update the current active session to point to this image
          const activeSessionId = $chatStore.activeSessionId;
          if (activeSessionId) {
            // Update the session to point to this image
            chatStore.updateSessionImageId(activeSessionId, imageId);
          }
        }
      }
      
      chatStore.addMessage({
        type: 'system',
        text: 'Image generated successfully',
        timestamp: new Date()
      });
    } catch (err) {
      const error = err as Error;
      chatStore.setError(error.message || 'Failed to generate image');
      chatStore.addMessage({
        type: 'system',
        text: error.message || 'Failed to generate image. Please try again.',
        timestamp: new Date()
      });
      console.error(err);
    } finally {
      imageStore.setGenerating(false);
    }
  }
  
  // Generate a new version of the image
  async function generateNewVersion(userPrompt: string) {
    if (!browser || !$imageStore.currentImage) return;
    
    imageStore.setGenerating(true);
    chatStore.addMessage({
      type: 'system',
      text: 'Generating new version of the image...',
      timestamp: new Date()
    });
    
    try {
      // Get the current image
      const currentImage = $imageStore.currentImage;
      console.log('🎨 EDIT: Starting image edit with current image:', {
        imageId: currentImage.id,
        versionsCount: currentImage.versions.length,
        prompt: userPrompt
      });
      
      // Extract base64 data from image URL
      let base64Data = '';
      if (currentImage.imageUrl.startsWith('data:')) {
        base64Data = currentImage.imageUrl.split(',')[1];
        console.log('🖼️ EDIT: Successfully extracted base64 data from current image');
      } else {
        console.log('⚠️ EDIT: Image URL is not base64, generating new image instead');
        const result = await apiGenerateImage(userPrompt);
        
        if (result.images.length === 0) {
          throw new Error('No image was generated. Please try a different prompt.');
        }
        
        base64Data = result.images[0];
      }
      
      // Call the Gemini API to edit the image
      console.log('📤 EDIT: Calling Gemini API with prompt:', userPrompt);
      const result = await apiEditImage(base64Data, userPrompt);
      
      console.log('📥 EDIT: Received API response:', {
        hasImages: result.images.length > 0,
        hasText: result.text.length > 0,
        firstImageSize: result.images[0]?.length || 0
      });
      
      if (result.images.length === 0) {
        throw new Error('No image was generated. Please try a different prompt.');
      }
      
      // Create new version
      const timestamp = new Date();
      const newVersion = {
        id: `v-${timestamp.getTime()}`,
        imageId: currentImage.id,
        prompt: userPrompt,
        imageUrl: `data:image/jpeg;base64,${result.images[0]}`,
        createdAt: timestamp
      };
      
      // Add version to current image in memory
      imageStore.addVersion(newVersion);
      
      // Add the edited image to the chat
      chatStore.addMessage({
        type: 'assistant',
        text: result.text.length > 0 ? result.text.join('\n') : 'Image edited successfully',
        timestamp: new Date(),
        images: [`${result.images[0]}`] // Add the edited image to the chat
      });
      
      chatStore.addMessage({
        type: 'system',
        text: 'New version generated successfully',
        timestamp: new Date()
      });
    } catch (err) {
      const error = err as Error;
      console.error('❌ EDIT: Error generating new version:', error);
      chatStore.setError(error.message || 'Failed to generate new version');
      chatStore.addMessage({
        type: 'system',
        text: error.message || 'Failed to generate new version. Please try again.',
        timestamp: new Date()
      });
    } finally {
      imageStore.setGenerating(false);
    }
  }
  
  // Reset the current session
  function resetSession() {
    if (!browser) return;
    
    // Reset the image store
    imageStore.reset();
    
    // Create a new chat session
    const timestamp = new Date();
    const sessionName = `New Session - ${timestamp.toLocaleString()}`;
    chatStore.createSession(sessionName);
    
    // Add a welcome message
    chatStore.addMessage({
      type: 'system',
      text: 'Started a new session. Upload an image or enter a prompt to get started.',
      timestamp: new Date()
    });
    
    // Switch to the vibe tab
    uiStore.setActiveTab('vibe');
  }
  
  // Download the current image
  function downloadImage() {
    if (!browser || !$imageStore.currentImage) return;
    
    const link = document.createElement('a');
    link.href = $imageStore.currentImage.imageUrl;
    link.download = `vibe-photoshop-${$imageStore.currentImage.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    chatStore.addMessage({
      type: 'system',
      text: 'Image downloaded',
      timestamp: new Date()
    });
  }
  
  // Set active tab
  function setActiveTab(tab: string) {
    uiStore.setActiveTab(tab);
  }
  
  // Initialize with a welcome message and loading simulation
  onMount(async () => {
    mounted = true;
    
    // Initialize chat store
    chatStore.init();
    
    if (chatStore.messages.length === 0) {
      chatStore.addMessage({
        type: 'system',
        text: 'Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.',
        timestamp: new Date()
      });
      
      // Check if API key is set
      const apiKey = await userService.getUserApiKey();
      if (!apiKey) {
        chatStore.addMessage({
          type: 'system',
          text: 'Please set your Gemini API key in Settings to generate images.',
          timestamp: new Date()
        });
        // We'll wait a bit before switching to settings to let the user see the welcome message
        setTimeout(() => {
          uiStore.setActiveTab('settings');
        }, 2000);
      }
    }
    
    // Start loading simulation
    uiStore.simulateLoading();
  });
</script>

{#if browser && mounted}
<!-- Main application layout -->
<div class="flex h-full">
  <!-- Left sidebar with tools -->
  <div 
    class="w-16 border-r flex flex-col"
    style="background-color: var(--ps-secondary); border-color: var(--ps-border);"
  >
    <ToolBar 
      currentImage={$imageStore.currentImage} 
      resetSession={resetSession} 
      downloadImage={downloadImage} 
    />
  </div>
  
  <!-- Main content area -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Main canvas area -->
    <div class="flex-1 overflow-hidden relative flex items-center justify-center">
      <div class="relative w-full h-full flex items-center justify-center">
        <ImageCanvas 
          currentImage={$imageStore.currentImage}
          isUploading={$imageStore.isUploading}
          isGenerating={$imageStore.isGenerating}
          handleFileSelect={handleFileSelect}
        />
        
        {#if !$imageStore.currentImage && !$imageStore.isGenerating && !$imageStore.isUploading}
          <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div class="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-xl font-medium text-gray-300 mb-2">No image selected</h3>
            <p class="text-gray-400 mb-6">Upload an image or enter a prompt to get started.</p>
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              style="border-radius: var(--ps-border-radius);"
              on:click={() => {
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) {
                  (fileInput as HTMLInputElement).click();
                }
              }}
            >
              Upload Image
            </button>
          </div>
        {/if}
      </div>
      
      <!-- Add version thumbnail panel at the bottom of the canvas -->
      {#if $imageStore.currentImage}
        <div class="absolute bottom-0 left-0 right-0">
          <VersionThumbnailPanel currentImage={$imageStore.currentImage} />
        </div>
      {/if}
      
      {#if $imageStore.isGenerating || $imageStore.isUploading}
        <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div class="text-white text-center">
            <div class="mb-4">
              <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <div class="text-lg font-medium">
              {$imageStore.isGenerating ? 'Generating image...' : 'Uploading image...'}
            </div>
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Status bar -->
    <div 
      class="h-6 border-t flex items-center px-4 text-xs"
      style="background-color: var(--ps-secondary); border-color: var(--ps-border);"
    >
      <StatusBar currentImage={$imageStore.currentImage} />
    </div>
  </div>
  
  <!-- Right panel with tabs -->
  <div 
    class="w-[26rem] border-l flex flex-col"
    style="background-color: var(--ps-secondary); border-color: var(--ps-border);"
  >
    <!-- Panel tabs -->
    <div>
      <PanelTabs activeTab={$uiStore.activeTab} setActiveTab={setActiveTab} />
    </div>
    
    <!-- Panel content -->
    <div class="flex-1 overflow-hidden">
      {#if $uiStore.activeTab === 'vibe'}
        <ChatPanel 
          isGenerating={$imageStore.isGenerating}
          prompt={$chatStore.prompt}
          error={$chatStore.error}
          {processInput}
        />
      {:else if $uiStore.activeTab === 'history'}
        <HistoryPanel 
          currentImage={$imageStore.currentImage}
        />
      {:else if $uiStore.activeTab === 'sessions'}
        <SessionsPanel />
      {:else if $uiStore.activeTab === 'settings'}
        <SettingsPanel />
      {/if}
    </div>
  </div>
</div>

<!-- Loading screen -->
{#if $uiStore.isLoading}
  <LoadingScreen loadingProgress={$uiStore.loadingProgress} loadingText={$uiStore.loadingText} />
{/if}

<style>
  :global(.dark) {
    color-scheme: dark;
  }
  
  :global(input[type="file"]) {
    display: none;
  }
</style>
{/if}
