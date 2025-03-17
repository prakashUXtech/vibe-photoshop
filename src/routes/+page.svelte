<!-- Photoshop-inspired application page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { currentTheme } from '$lib/stores/themeStore';
  import { imageStore, chatStore, uiStore } from '$lib/stores';
  import type { Image, ImageVersion } from '$lib/types';
  
  // Import services
  import { 
    generateImage as apiGenerateImage, 
    editImage as apiEditImage,
    fileToBase64,
    userService
  } from '$lib/services';
  
  import { 
    saveGeneratedImage, 
    addImageVersion 
  } from '$lib/services';
  
  // Import components
  import {
    LoadingScreen,
    ToolBar,
    ImageCanvas,
    VersionHistory,
    StatusBar,
    ChatPanel,
    HistoryPanel,
    AdjustmentsPanel,
    PanelTabs,
    SettingsPanel
  } from '$lib/components/photoshop';
  
  let mounted = false;
  
  // Handle file upload
  async function handleFileSelect(event: Event) {
    if (!browser) return;
    
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      imageStore.setUploading(true);
      imageStore.setSelectedImage(input.files[0]);
      
      // Add message
      chatStore.addMessage('Uploading image...', 'system');
      
      try {
        // Convert file to base64
        const base64Data = await fileToBase64(input.files[0]);
        const previewUrl = $imageStore.previewUrl;
        
        // Create a mock image object
        const newImage: Image = {
          id: `upload-${Date.now()}`,
          userId: '1',
          prompt: 'Uploaded image',
          imageUrl: previewUrl || '',
          thumbnail: previewUrl || '',
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            width: 800,
            height: 600,
            format: 'jpeg',
            size: 1024000
          },
          versions: [
            {
              id: `v-${Date.now()}`,
              imageId: `upload-${Date.now()}`,
              prompt: 'Original upload',
              imageUrl: previewUrl || '',
              createdAt: new Date()
            }
          ]
        };
        
        imageStore.setCurrentImage(newImage);
        chatStore.addMessage('Image uploaded successfully', 'system');
      } catch (error) {
        console.error('Error uploading image:', error);
        chatStore.addMessage('Error uploading image. Please try again.', 'system');
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
      
      // Save the generated image
      const newImage = await saveGeneratedImage(
        '1', // User ID
        result.images[0],
        userPrompt,
        result.text.join('\n')
      );
      
      imageStore.setCurrentImage(newImage);
      
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
      
      // Extract base64 data from image URL
      // This is a simplification - in a real app, you'd need to handle different URL formats
      let base64Data = '';
      if (currentImage.imageUrl.startsWith('data:')) {
        base64Data = currentImage.imageUrl.split(',')[1];
      } else {
        // For demo purposes with picsum photos, we'll generate a new random image
        // In a real app, you'd need to fetch the image and convert it to base64
        const result = await apiGenerateImage(userPrompt);
        
        if (result.images.length === 0) {
          throw new Error('No image was generated. Please try a different prompt.');
        }
        
        base64Data = result.images[0];
      }
      
      // Call the Gemini API to edit the image
      const result = await apiEditImage(base64Data, userPrompt);
      
      if (result.images.length === 0) {
        throw new Error('No image was generated. Please try a different prompt.');
      }
      
      // Add the new version to the current image
      const updatedImage = addImageVersion(
        currentImage.id,
        result.images[0],
        userPrompt
      );
      
      if (updatedImage) {
        imageStore.setCurrentImage(updatedImage);
      }
      
      // Add any text response from the API
      if (result.text.length > 0) {
        chatStore.addMessage({
          type: 'system',
          text: result.text.join('\n'),
          timestamp: new Date()
        });
      }
      
      chatStore.addMessage({
        type: 'system',
        text: 'New version generated successfully',
        timestamp: new Date()
      });
    } catch (err) {
      const error = err as Error;
      chatStore.setError(error.message || 'Failed to generate new version');
      chatStore.addMessage({
        type: 'system',
        text: error.message || 'Failed to generate new version. Please try again.',
        timestamp: new Date()
      });
      console.error(err);
    } finally {
      imageStore.setGenerating(false);
    }
  }
  
  // Reset the current session
  function resetSession() {
    if (!browser) return;
    
    imageStore.resetSession();
    chatStore.addMessage({
      type: 'system',
      text: 'Started a new session',
      timestamp: new Date()
    });
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
  
  // Add a test function to directly call our server endpoint
  async function testServerEndpoint() {
    const apiKey = await userService.getUserApiKey();
    if (!apiKey) {
      alert('Please set your Gemini API key in Settings');
      return;
    }
    
    console.log('🧪 TEST: Directly calling server endpoint');
    
    try {
      // Show a loading message
      chatStore.addMessage({
        type: 'system',
        text: 'Testing image generation...',
        timestamp: new Date()
      });
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Generate a simple painting of grass with blue sky and a few white clouds',
          apiKey
        })
      });
      
      console.log('🧪 TEST: Response status:', response.status);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('🧪 TEST: API error:', error);
        chatStore.addMessage({
          type: 'system',
          text: `Error: ${error.message || 'Failed to generate image'}`,
          timestamp: new Date()
        });
        return;
      }
      
      const data = await response.json();
      console.log('🧪 TEST: Response data:', {
        textCount: data.text.length,
        imageCount: data.images.length,
        textSample: data.text.length > 0 ? data.text[0].substring(0, 50) + '...' : 'No text'
      });
      
      // Create a message with the response
      const message: ChatMessage = {
        type: 'assistant',
        text: data.text.length > 0 ? data.text.join('\n') : 'Image generated successfully',
        timestamp: new Date(),
        images: data.images.length > 0 ? [...data.images] : undefined
      };
      
      // Add the message to the chat
      chatStore.addMessage(message);
      
      // Display the generated image in the canvas
      if (data.images.length > 0) {
        // Create a new image object
        const newImage = await saveGeneratedImage(
          '1', // User ID
          data.images[0],
          'Generate a simple painting of grass with blue sky and a few white clouds',
          data.text.join('\n')
        );
        
        // Set as current image
        imageStore.setCurrentImage(newImage);
      } else {
        chatStore.addMessage({
          type: 'system',
          text: 'No image was generated. Please try a different prompt.',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('🧪 TEST: Error:', error);
      chatStore.addMessage({
        type: 'system',
        text: `Error: ${error}`,
        timestamp: new Date()
      });
    }
  }
  
  // Initialize with a welcome message and loading simulation
  onMount(async () => {
    mounted = true;
    
    if ($chatStore.messages.length === 0) {
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
  <div class="flex-1 flex flex-col overflow-hidden bg-neutral-900">
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
    <div class="border-b" style="border-color: var(--ps-border);">
      <PanelTabs activeTab={$uiStore.activeTab} setActiveTab={setActiveTab} />
    </div>
    
    <!-- Panel content -->
    <div class="flex-1 overflow-hidden">
      {#if $uiStore.activeTab === 'vibe'}
        <ChatPanel 
          messages={$chatStore.messages}
          isGenerating={$imageStore.isGenerating}
          prompt={$chatStore.prompt}
          error={$chatStore.error}
          {processInput}
        />
      {:else if $uiStore.activeTab === 'history'}
        <HistoryPanel 
          currentImage={$imageStore.currentImage}
          selectVersion={imageStore.selectVersion}
        />
      {:else if $uiStore.activeTab === 'adjustments'}
        <AdjustmentsPanel />
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

<!-- Add a test button in a visible location -->
<div class="absolute top-2 right-2 z-50">
  <button 
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
    on:click={testServerEndpoint}
  >
    Test Server
  </button>
</div>
{/if}

<style>
  :global(.dark) {
    color-scheme: dark;
  }
  
  :global(input[type="file"]) {
    display: none;
  }
</style>
