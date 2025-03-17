<!-- Photoshop-inspired application page -->
<script lang="ts">
  import { mockImages } from '$lib/stores/mockData';
  import type { Image, ImageVersion } from '$lib/types';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { psTheme } from '$lib/stores/themeStore';
  
  // State management
  let prompt = '';
  let isGenerating = false;
  let isUploading = false;
  let selectedImage: File | null = null;
  let previewUrl: string | null = null;
  let currentImage: Image | null = null;
  let showVersionHistory = true;
  let showLayers = true;
  let error = '';
  let messages: {text: string, type: 'user' | 'system', timestamp: Date}[] = [];
  let chatContainer: HTMLElement | null = null;
  let activeTab = 'vibe'; // 'vibe', 'history', 'adjustments'
  
  // Loading screen state
  let isLoading = false;
  let loadingProgress = 0;
  let loadingText = 'Initializing...';
  
  // Handle file upload
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      isUploading = true;
      selectedImage = input.files[0];
      
      // Create preview URL
      previewUrl = URL.createObjectURL(input.files[0]);
      
      // Add message
      addMessage('Uploading image...', 'system');
      
      // Simulate upload delay
      setTimeout(() => {
        isUploading = false;
        currentImage = {
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
        
        addMessage('Image uploaded successfully', 'system');
      }, 1500);
    }
  }
  
  // Add message to chat
  function addMessage(text: string, type: 'user' | 'system') {
    messages = [...messages, {
      text,
      type,
      timestamp: new Date()
    }];
    
    // Scroll to bottom of chat - only in browser
    if (browser) {
      setTimeout(() => {
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      }, 100);
    }
  }
  
  // Process user input
  async function processInput() {
    if (!prompt.trim()) {
      error = 'Please enter a prompt';
      return;
    }
    
    error = '';
    const userPrompt = prompt;
    prompt = '';
    
    // Add user message
    addMessage(userPrompt, 'user');
    
    // If we have a current image, generate a new version
    if (currentImage) {
      await generateNewVersion(userPrompt);
    } else {
      // Otherwise generate a new image
      await generateImage(userPrompt);
    }
  }
  
  // Generate new image
  async function generateImage(userPrompt: string) {
    isGenerating = true;
    addMessage('Generating image from prompt...', 'system');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock generated image
      currentImage = {
        id: `gen-${Date.now()}`,
        userId: '1',
        prompt: userPrompt,
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        thumbnail: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
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
            imageId: `gen-${Date.now()}`,
            prompt: userPrompt,
            imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date()
          }
        ]
      };
      
      addMessage('Image generated successfully', 'system');
    } catch (err) {
      error = 'Failed to generate image';
      addMessage('Failed to generate image. Please try again.', 'system');
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }
  
  // Generate a new version of the image
  async function generateNewVersion(userPrompt: string) {
    if (!currentImage) return;
    
    isGenerating = true;
    addMessage('Generating new version of the image...', 'system');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a new version
      const newVersion: ImageVersion = {
        id: `v-${Date.now()}`,
        imageId: currentImage.id,
        prompt: userPrompt,
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(),
        parentVersionId: currentImage.versions[currentImage.versions.length - 1].id
      };
      
      // Update the current image with the new version
      currentImage = {
        ...currentImage,
        prompt: userPrompt,
        imageUrl: newVersion.imageUrl,
        updatedAt: new Date(),
        versions: [...currentImage.versions, newVersion]
      };
      
      addMessage('New version generated successfully', 'system');
    } catch (err) {
      error = 'Failed to generate new version';
      addMessage('Failed to generate new version. Please try again.', 'system');
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }
  
  // Reset the current session
  function resetSession() {
    currentImage = null;
    previewUrl = null;
    selectedImage = null;
    prompt = '';
    error = '';
    addMessage('Started a new session', 'system');
  }
  
  // Toggle version history
  function toggleVersionHistory() {
    showVersionHistory = !showVersionHistory;
  }
  
  // Select a specific version
  function selectVersion(version: ImageVersion) {
    if (!currentImage) return;
    
    // Create a new current image with the selected version as the current one
    currentImage = {
      ...currentImage,
      imageUrl: version.imageUrl,
      prompt: version.prompt
    };
    
    addMessage(`Reverted to version from ${new Date(version.createdAt).toLocaleString()}`, 'system');
  }
  
  // Download the current image
  function downloadImage() {
    if (currentImage && browser) {
      const link = document.createElement('a');
      link.href = currentImage.imageUrl;
      link.download = `vibe-photoshop-${currentImage.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addMessage('Image downloaded', 'system');
    }
  }
  
  // Simulate loading progress
  function simulateLoading() {
    const interval = setInterval(() => {
      if (loadingProgress < 100) {
        loadingProgress += 10;
        
        if (loadingProgress < 30) {
          loadingText = 'Initializing application...';
        } else if (loadingProgress < 60) {
          loadingText = 'Loading resources...';
        } else if (loadingProgress < 90) {
          loadingText = 'Preparing workspace...';
        } else {
          loadingText = 'Almost ready...';
        }
      } else {
        clearInterval(interval);
        setTimeout(() => {
          isLoading = false;
        }, 300);
      }
    }, 50);
  }
  
  // Initialize with a welcome message
  onMount(() => {
    if (messages.length === 0) {
      addMessage('Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.', 'system');
    }
    
    // Start loading simulation
    simulateLoading();
  });
</script>

{#if isLoading}
  <!-- Photoshop-style loading screen -->
  <div class="fixed inset-0 flex flex-col items-center justify-center z-50" style="background-color: var(--ps-primary);">
    <div class="relative max-w-md w-full">
      <!-- Splash image container -->
      <div class="relative mb-6 shadow-xl overflow-hidden" style="border-radius: var(--ps-border-radius);">
        <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-800 to-gray-900">
          <!-- Splash image content -->
          <div class="p-6 flex flex-col h-full">
            <div class="flex-1 flex items-center justify-center">
              <div class="text-center">
                <div class="flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                  </svg>
                </div>
                <h1 class="text-3xl font-bold mb-1">
                  <span class="text-red-500">Vibe</span>
                  <span class="text-white">Photoshop</span>
                </h1>
                <p class="text-xs text-gray-400 mb-4">Powered by AI</p>
                <div class="text-xs text-gray-400 mt-4">
                  © 2024 Vibe Photoshop. All rights reserved.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Loading progress -->
      <div class="text-center">
        <div class="w-full bg-gray-700 rounded-full h-1.5 mb-2">
          <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: {loadingProgress}%"></div>
        </div>
        <p class="text-sm text-gray-300">{loadingText}</p>
      </div>
    </div>
  </div>
{:else}
  <!-- Photoshop-inspired UI with theme variables -->
  <div class="h-full flex flex-col" style="background-color: var(--ps-primary); color: var(--ps-text);">
    <!-- Main content area -->
    <main class="flex flex-col md:flex-row flex-1 overflow-hidden">
      <!-- Left side: Image display (main canvas) -->
      <div class="w-full md:w-2/3 flex flex-col h-full overflow-hidden">
        <!-- Tool options bar -->
        <div class="p-2 flex items-center justify-between" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
          <div class="flex space-x-2">
            <button 
              class="p-1 rounded hover:opacity-80"
              title="New Image"
              aria-label="New Image"
              on:click={resetSession}
              style="background-color: var(--ps-button);"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
            </button>
            <button 
              class="p-1 rounded hover:opacity-80"
              title="Download"
              aria-label="Download Image"
              on:click={downloadImage}
              style="background-color: var(--ps-button);"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div class="text-xs opacity-70">
            {currentImage ? `${currentImage.metadata.width} × ${currentImage.metadata.height} px` : '800 × 600 px'}
          </div>
        </div>
        
        <!-- Canvas area -->
        <div class="flex-1 p-4 flex flex-col overflow-auto" style="background-color: var(--ps-primary);">
          <div class="flex-1 flex items-center justify-center">
            {#if currentImage}
              <!-- Image display -->
              <div class="relative shadow-lg" style="background-color: var(--ps-secondary); box-shadow: var(--ps-shadow);">
                <img 
                  src={currentImage.imageUrl} 
                  alt={currentImage.prompt}
                  class="max-w-full max-h-[calc(100vh-300px)] object-contain"
                />
                <!-- Checkerboard pattern for transparency -->
                <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
              </div>
            {:else if isUploading || isGenerating}
              <!-- Loading state -->
              <div class="text-center">
                <div class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-t-[var(--ps-accent)]" style="border-color: var(--ps-border);"></div>
                <p class="mt-4 text-sm opacity-70">
                  {isUploading ? 'Uploading image...' : 'Generating image...'}
                </p>
              </div>
            {:else}
              <!-- Empty state - Photoshop style -->
              <div class="text-center max-w-md">
                <div class="p-6 rounded-lg shadow-lg" style="background-color: var(--ps-secondary); box-shadow: var(--ps-shadow); border-radius: var(--ps-border-radius);">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 class="text-lg font-medium mb-2">No image selected</h3>
                  <p class="opacity-70 mb-4">
                    Upload an image or enter a prompt to get started.
                  </p>
                  <label 
                    class="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:opacity-80"
                    style="
                      background-color: var(--ps-button);
                      border: 1px solid var(--ps-border);
                      border-radius: var(--ps-border-radius);
                    "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Upload Image
                    <input type="file" class="hidden" accept="image/*" on:change={handleFileSelect} />
                  </label>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Version history under the main image -->
          {#if currentImage && currentImage.versions.length > 1 && showVersionHistory}
            <div class="mt-4 p-3 rounded border" style="background-color: var(--ps-secondary); border-color: var(--ps-border); border-radius: var(--ps-border-radius);">
              <div class="flex justify-between items-center mb-2">
                <h3 class="text-xs font-medium">Version History</h3>
                <button 
                  on:click={toggleVersionHistory}
                  class="text-xs opacity-70 hover:opacity-100"
                  aria-label="Hide Version History"
                >
                  Hide
                </button>
              </div>
              <div class="flex space-x-3 overflow-x-auto pb-2">
                {#each currentImage.versions as version, i}
                  <button 
                    class="flex-shrink-0 cursor-pointer group text-left"
                    on:click={() => selectVersion(version)}
                    aria-label={`Select version ${i + 1}`}
                  >
                    <div class="w-20 h-20 rounded overflow-hidden border-2" 
                      style="
                        background-color: var(--ps-panel);
                        border-color: {version.imageUrl === currentImage.imageUrl ? 'var(--ps-accent)' : 'var(--ps-border)'};
                        border-radius: var(--ps-border-radius);
                      "
                    >
                      <div class="relative h-full">
                        <img src={version.imageUrl} alt={version.prompt} class="w-full h-full object-cover" />
                        <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
                      </div>
                    </div>
                    <p class="mt-1 text-xs opacity-70 truncate w-20">Version {i + 1}</p>
                  </button>
                {/each}
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Status bar -->
        <div class="p-1 flex justify-between text-xs opacity-70" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
          <div>
            {currentImage ? `${currentImage.prompt}` : 'Ready'}
          </div>
          <div>
            {currentImage ? `Last modified: ${new Date(currentImage.updatedAt).toLocaleString()}` : ''}
          </div>
        </div>
      </div>
      
      <!-- Right side: Panels -->
      <div class="w-full md:w-1/3 border-l flex flex-col h-full overflow-hidden" style="border-color: var(--ps-border);">
        <!-- Panel tabs - Photoshop style -->
        <div class="flex border-b" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
          <button 
            class="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
            style="
              border-color: {activeTab === 'vibe' ? 'var(--ps-accent)' : 'transparent'};
              color: {activeTab === 'vibe' ? 'var(--ps-accent)' : 'var(--ps-text)'};
            "
            on:click={() => activeTab = 'vibe'}
          >
            Vibe Create
          </button>
          <button 
            class="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
            style="
              border-color: {activeTab === 'history' ? 'var(--ps-accent)' : 'transparent'};
              color: {activeTab === 'history' ? 'var(--ps-accent)' : 'var(--ps-text)'};
            "
            on:click={() => activeTab = 'history'}
          >
            History
          </button>
          <button 
            class="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
            style="
              border-color: {activeTab === 'adjustments' ? 'var(--ps-accent)' : 'transparent'};
              color: {activeTab === 'adjustments' ? 'var(--ps-accent)' : 'var(--ps-text)'};
            "
            on:click={() => activeTab = 'adjustments'}
          >
            Adjustments
          </button>
        </div>
        
        <!-- Panel content -->
        <div class="flex-1 overflow-hidden flex flex-col h-full" style="background-color: var(--ps-secondary);">
          {#if activeTab === 'vibe'}
            <!-- Vibe Create panel (chat) - Full height with fixed input at bottom -->
            <div class="flex flex-col h-full">
              <div 
                bind:this={chatContainer}
                class="flex-1 overflow-y-auto p-3 space-y-3"
              >
                {#each messages as message}
                  <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
                    <div class="rounded px-3 py-2 max-w-[85%] shadow-md" 
                      style="
                        background-color: {message.type === 'user' ? 'var(--ps-accent)' : 'var(--ps-panel)'};
                        border-radius: var(--ps-border-radius);
                        box-shadow: var(--ps-shadow);
                      "
                    >
                      <p class="text-sm">{message.text}</p>
                      <p class="text-xs opacity-70 mt-1 text-right">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                {/each}
                
                {#if isGenerating}
                  <div class="flex justify-start">
                    <div class="rounded px-3 py-2 shadow-md" 
                      style="
                        background-color: var(--ps-panel);
                        border-radius: var(--ps-border-radius);
                        box-shadow: var(--ps-shadow);
                      "
                    >
                      <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 rounded-full animate-pulse opacity-50"></div>
                        <div class="w-2 h-2 rounded-full animate-pulse delay-75 opacity-50"></div>
                        <div class="w-2 h-2 rounded-full animate-pulse delay-150 opacity-50"></div>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
              
              <!-- Prompt input - Fixed at bottom, styled like Photoshop -->
              <div class="p-3 border-t" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
                <form on:submit|preventDefault={processInput} class="flex items-center">
                  <div class="flex-grow relative">
                    <input
                      type="text"
                      bind:value={prompt}
                      placeholder="Enter a prompt..."
                      class="prompt-input w-full py-2 px-3 text-sm focus:outline-none focus:ring-1"
                      style="
                        background-color: var(--ps-panel);
                        border: 1px solid var(--ps-border);
                        border-radius: var(--ps-border-radius);
                        color: var(--ps-text);
                      "
                    />
                    {#if error}
                      <div class="absolute -top-6 left-0 text-xs" style="color: var(--ps-accent);">{error}</div>
                    {/if}
                  </div>
                  <button
                    type="submit"
                    disabled={isGenerating || isUploading}
                    class="ml-2 p-2 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                    style="
                      background-color: var(--ps-accent);
                      border-radius: var(--ps-border-radius);
                    "
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          {:else if activeTab === 'history'}
            <!-- History panel -->
            <div class="flex-1 p-3 overflow-y-auto h-full">
              <div class="mb-3 flex justify-between items-center">
                <h3 class="text-xs font-medium">Layers</h3>
                <div class="flex space-x-1">
                  <button class="p-1 opacity-70 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button class="p-1 opacity-70 hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {#if currentImage}
                <div class="rounded border" style="background-color: var(--ps-panel); border-color: var(--ps-border); border-radius: var(--ps-border-radius);">
                  <div class="p-2 border-b flex items-center justify-between hover:opacity-80 cursor-pointer" style="border-color: var(--ps-border);">
                    <div class="flex items-center">
                      <div class="w-4 h-4 mr-2 rounded-sm" style="background-color: var(--ps-accent);"></div>
                      <span class="text-xs">Background</span>
                    </div>
                    <div class="opacity-70">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M16.707 2.293a1 1 0 011.414 1.414l-14 14a1 1 0 01-1.414-1.414l14-14z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <!-- Version layers -->
                  {#each currentImage.versions as version, i}
                    <div 
                      class="p-2 flex items-center justify-between hover:opacity-80 cursor-pointer"
                      style="
                        background-color: {version.imageUrl === currentImage.imageUrl ? 'var(--ps-button)' : 'transparent'};
                      "
                      on:click={() => selectVersion(version)}
                    >
                      <div class="flex items-center">
                        <div class="w-4 h-4 mr-2 rounded-sm opacity-50" style="background-color: var(--ps-accent);"></div>
                        <span class="text-xs truncate max-w-[150px]">Version {i + 1}</span>
                      </div>
                      <div class="text-xs opacity-70">
                        {new Date(version.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center p-4 text-xs opacity-70">
                  No layers available
                </div>
              {/if}
            </div>
          {:else if activeTab === 'adjustments'}
            <!-- Adjustments panel -->
            <div class="flex-1 p-3 overflow-y-auto h-full">
              <h3 class="text-xs font-medium mb-3">Adjustments</h3>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-xs opacity-70 mb-1">Brightness</label>
                  <input 
                    type="range" 
                    class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer" 
                    style="background-color: var(--ps-panel);"
                  />
                </div>
                
                <div>
                  <label class="block text-xs opacity-70 mb-1">Contrast</label>
                  <input 
                    type="range" 
                    class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style="background-color: var(--ps-panel);"
                  />
                </div>
                
                <div>
                  <label class="block text-xs opacity-70 mb-1">Saturation</label>
                  <input 
                    type="range" 
                    class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style="background-color: var(--ps-panel);"
                  />
                </div>
                
                <div>
                  <label class="block text-xs opacity-70 mb-1">Temperature</label>
                  <input 
                    type="range" 
                    class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer"
                    style="background-color: var(--ps-panel);"
                  />
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </main>
  </div>
{/if}

<style>
  /* Checkerboard pattern for transparency */
  .bg-checkerboard {
    background-image: 
      linear-gradient(45deg, var(--ps-panel) 25%, transparent 25%), 
      linear-gradient(-45deg, var(--ps-panel) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--ps-panel) 75%),
      linear-gradient(-45deg, transparent 75%, var(--ps-panel) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: var(--ps-secondary);
  }
  
  /* Custom range input styling */
  input[type="range"] {
    -webkit-appearance: none;
    height: 2px;
    border-radius: 2px;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    background: var(--ps-accent);
  }
  
  /* Focus styles for prompt input */
  .prompt-input:focus {
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }
  
  /* Aspect ratio utility for splash screen */
  .aspect-w-16 {
    position: relative;
    padding-bottom: calc(9 / 16 * 100%);
  }
  
  .aspect-h-9 > * {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>
