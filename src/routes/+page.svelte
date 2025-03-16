<!-- Photoshop-inspired application page -->
<script lang="ts">
  import { mockImages } from '$lib/stores/mockData';
  import type { Image, ImageVersion } from '$lib/types';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  // State management
  let prompt = '';
  let isGenerating = false;
  let isUploading = false;
  let selectedImage: File | null = null;
  let previewUrl: string | null = null;
  let currentImage: Image | null = null;
  let showVersionHistory = false;
  let showLayers = true;
  let error = '';
  let messages: {text: string, type: 'user' | 'system', timestamp: Date}[] = [];
  let chatContainer: HTMLElement | null = null;
  let activeTab = 'history'; // 'history', 'layers', 'adjustments'
  
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
  
  // Initialize with a welcome message
  onMount(() => {
    if (messages.length === 0) {
      addMessage('Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.', 'system');
    }
  });
</script>

<!-- Photoshop-inspired UI with dark theme -->
<div class="flex-1 flex flex-col bg-gray-900 text-gray-200">
  <!-- Top menu bar (Photoshop-style) -->
  <div class="bg-gray-800 border-b border-gray-700 py-1 px-4 flex items-center">
    <div class="flex space-x-4 text-xs">
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">File</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Edit</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Image</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Layer</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Select</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Filter</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">View</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Window</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Help</div>
    </div>
  </div>
  
  <!-- Main content area -->
  <main class="flex-1 flex flex-col md:flex-row">
    <!-- Left side: Image display (main canvas) -->
    <div class="w-full md:w-2/3 flex flex-col">
      <!-- Tool options bar -->
      <div class="bg-gray-800 border-b border-gray-700 p-2 flex items-center justify-between">
        <div class="flex space-x-2">
          <button 
            class="p-1 rounded hover:bg-gray-700"
            title="New Image"
            aria-label="New Image"
            on:click={resetSession}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
          </button>
          <button 
            class="p-1 rounded hover:bg-gray-700"
            title="Download"
            aria-label="Download Image"
            on:click={downloadImage}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div class="text-xs text-gray-400">
          {currentImage ? `${currentImage.metadata.width} × ${currentImage.metadata.height} px` : '800 × 600 px'}
        </div>
      </div>
      
      <!-- Canvas area -->
      <div class="flex-1 bg-gray-700 p-4 flex items-center justify-center overflow-auto">
        {#if currentImage}
          <!-- Image display -->
          <div class="relative bg-gray-800 shadow-lg">
            <img 
              src={currentImage.imageUrl} 
              alt={currentImage.prompt}
              class="max-w-full max-h-[calc(100vh-200px)] object-contain"
            />
            <!-- Checkerboard pattern for transparency -->
            <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
          </div>
        {:else if isUploading || isGenerating}
          <!-- Loading state -->
          <div class="text-center">
            <div class="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-gray-600 border-t-blue-500"></div>
            <p class="mt-4 text-sm text-gray-400">
              {isUploading ? 'Uploading image...' : 'Generating image...'}
            </p>
          </div>
        {:else}
          <!-- Empty state -->
          <div class="text-center p-6 bg-gray-800 rounded-lg shadow-lg max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-300 mb-2">No image selected</h3>
            <p class="text-gray-400 mb-4">
              Upload an image or enter a prompt to get started.
            </p>
            <label class="inline-flex items-center px-4 py-2 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Image
              <input type="file" class="hidden" accept="image/*" on:change={handleFileSelect} />
            </label>
          </div>
        {/if}
      </div>
      
      <!-- Status bar -->
      <div class="bg-gray-800 border-t border-gray-700 p-1 flex justify-between text-xs text-gray-400">
        <div>
          {currentImage ? `${currentImage.prompt}` : 'Ready'}
        </div>
        <div>
          {currentImage ? `Last modified: ${new Date(currentImage.updatedAt).toLocaleString()}` : ''}
        </div>
      </div>
    </div>
    
    <!-- Right side: Panels (Photoshop-style) -->
    <div class="w-full md:w-1/3 border-l border-gray-700 flex flex-col">
      <!-- Panel tabs -->
      <div class="bg-gray-800 border-b border-gray-700 flex">
        <button 
          class="px-4 py-2 text-xs font-medium {activeTab === 'history' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}"
          on:click={() => activeTab = 'history'}
        >
          History
        </button>
        <button 
          class="px-4 py-2 text-xs font-medium {activeTab === 'layers' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}"
          on:click={() => activeTab = 'layers'}
        >
          Layers
        </button>
        <button 
          class="px-4 py-2 text-xs font-medium {activeTab === 'adjustments' ? 'bg-gray-700 text-blue-400' : 'text-gray-400 hover:bg-gray-700'}"
          on:click={() => activeTab = 'adjustments'}
        >
          Adjustments
        </button>
      </div>
      
      <!-- Panel content -->
      <div class="flex-1 bg-gray-800 overflow-hidden flex flex-col">
        {#if activeTab === 'history'}
          <!-- History panel (chat) -->
          <div 
            bind:this={chatContainer}
            class="flex-1 overflow-y-auto p-3 space-y-3"
          >
            {#each messages as message}
              <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
                <div class="{message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} rounded px-3 py-2 max-w-[85%] shadow-md">
                  <p class="text-sm">{message.text}</p>
                  <p class="text-xs opacity-70 mt-1 text-right">{message.timestamp.toLocaleTimeString()}</p>
                </div>
              </div>
            {/each}
            
            {#if isGenerating}
              <div class="flex justify-start">
                <div class="bg-gray-700 text-gray-200 rounded px-3 py-2 shadow-md">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-gray-500 animate-pulse"></div>
                    <div class="w-2 h-2 rounded-full bg-gray-500 animate-pulse delay-75"></div>
                    <div class="w-2 h-2 rounded-full bg-gray-500 animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
          
          <!-- Prompt input -->
          <div class="p-3 border-t border-gray-700">
            <form on:submit|preventDefault={processInput} class="flex items-center">
              <div class="flex-grow relative">
                <input
                  type="text"
                  bind:value={prompt}
                  placeholder="Enter a prompt..."
                  class="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                {#if error}
                  <div class="absolute -top-6 left-0 text-xs text-red-400">{error}</div>
                {/if}
              </div>
              <button
                type="submit"
                disabled={isGenerating || isUploading}
                class="ml-2 p-2 bg-blue-600 rounded text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isGenerating || isUploading}
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                {:else}
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                  </svg>
                {/if}
              </button>
            </form>
          </div>
        {:else if activeTab === 'layers'}
          <!-- Layers panel -->
          <div class="flex-1 p-3">
            <div class="mb-3 flex justify-between items-center">
              <h3 class="text-xs font-medium text-gray-300">Layers</h3>
              <div class="flex space-x-1">
                <button class="p-1 text-gray-400 hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button class="p-1 text-gray-400 hover:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {#if currentImage}
              <div class="bg-gray-700 rounded border border-gray-600">
                <div class="p-2 border-b border-gray-600 flex items-center justify-between hover:bg-gray-600 cursor-pointer">
                  <div class="flex items-center">
                    <div class="w-4 h-4 mr-2 bg-blue-500 rounded-sm"></div>
                    <span class="text-xs">Background</span>
                  </div>
                  <div class="text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14z" clip-rule="evenodd" />
                      <path fill-rule="evenodd" d="M16.707 2.293a1 1 0 011.414 1.414l-14 14a1 1 0 01-1.414-1.414l14-14z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <!-- Version layers -->
                {#each currentImage.versions as version, i}
                  <div 
                    class="p-2 flex items-center justify-between hover:bg-gray-600 cursor-pointer {i === currentImage.versions.length - 1 ? 'bg-gray-600' : ''}"
                    on:click={() => selectVersion(version)}
                  >
                    <div class="flex items-center">
                      <div class="w-4 h-4 mr-2 bg-gray-500 rounded-sm"></div>
                      <span class="text-xs truncate max-w-[150px]">Version {i + 1}</span>
                    </div>
                    <div class="text-gray-400 text-xs">
                      {new Date(version.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-center p-4 text-gray-500 text-xs">
                No layers available
              </div>
            {/if}
          </div>
        {:else if activeTab === 'adjustments'}
          <!-- Adjustments panel -->
          <div class="flex-1 p-3">
            <h3 class="text-xs font-medium text-gray-300 mb-3">Adjustments</h3>
            
            <div class="space-y-4">
              <div>
                <label class="block text-xs text-gray-400 mb-1">Brightness</label>
                <input type="range" class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
              
              <div>
                <label class="block text-xs text-gray-400 mb-1">Contrast</label>
                <input type="range" class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
              
              <div>
                <label class="block text-xs text-gray-400 mb-1">Saturation</label>
                <input type="range" class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
              
              <div>
                <label class="block text-xs text-gray-400 mb-1">Temperature</label>
                <input type="range" class="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<style>
  /* Checkerboard pattern for transparency */
  .bg-checkerboard {
    background-image: 
      linear-gradient(45deg, #666 25%, transparent 25%), 
      linear-gradient(-45deg, #666 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #666 75%),
      linear-gradient(-45deg, transparent 75%, #666 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #888;
  }
</style>
