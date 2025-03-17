<!-- Photoshop-inspired application page -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { currentTheme } from '$lib/stores/themeStore';
  import { imageStore, chatStore, uiStore } from '$lib/stores';
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
    AdjustmentsPanel,
    PanelTabs
  } from '$lib/components/photoshop';
  
  // Handle file upload
  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      imageStore.setUploading(true);
      imageStore.setSelectedImage(input.files[0]);
      
      // Add message
      chatStore.addMessage('Uploading image...', 'system');
      
      // Simulate upload delay
      setTimeout(() => {
        const previewUrl = $imageStore.previewUrl;
        
        imageStore.setUploading(false);
        
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
      }, 1500);
    }
  }
  
  // Process user input
  async function processInput() {
    if (!$chatStore.prompt.trim()) {
      chatStore.setError('Please enter a prompt');
      return;
    }
    
    chatStore.setError('');
    const userPrompt = $chatStore.prompt;
    chatStore.clearPrompt();
    
    // Add user message
    chatStore.addMessage(userPrompt, 'user');
    
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
    imageStore.setGenerating(true);
    chatStore.addMessage('Generating image from prompt...', 'system');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock generated image
      const newImage: Image = {
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
      
      imageStore.setCurrentImage(newImage);
      chatStore.addMessage('Image generated successfully', 'system');
    } catch (err) {
      chatStore.setError('Failed to generate image');
      chatStore.addMessage('Failed to generate image. Please try again.', 'system');
      console.error(err);
    } finally {
      imageStore.setGenerating(false);
    }
  }
  
  // Generate a new version of the image
  async function generateNewVersion(userPrompt: string) {
    if (!$imageStore.currentImage) return;
    
    imageStore.setGenerating(true);
    chatStore.addMessage('Generating new version of the image...', 'system');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentImage = $imageStore.currentImage;
      
      // Create a new version
      const newVersion: ImageVersion = {
        id: `v-${Date.now()}`,
        imageId: currentImage.id,
        prompt: userPrompt,
        imageUrl: `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(),
        parentVersionId: currentImage.versions[currentImage.versions.length - 1].id
      };
      
      // Add the new version to the current image
      imageStore.addVersion(newVersion);
      
      chatStore.addMessage('New version generated successfully', 'system');
    } catch (err) {
      chatStore.setError('Failed to generate new version');
      chatStore.addMessage('Failed to generate new version. Please try again.', 'system');
      console.error(err);
    } finally {
      imageStore.setGenerating(false);
    }
  }
  
  // Reset the current session
  function resetSession() {
    imageStore.resetSession();
    chatStore.addMessage('Started a new session', 'system');
  }
  
  // Download the current image
  function downloadImage() {
    if ($imageStore.currentImage && browser) {
      const link = document.createElement('a');
      link.href = $imageStore.currentImage.imageUrl;
      link.download = `vibe-photoshop-${$imageStore.currentImage.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      chatStore.addMessage('Image downloaded', 'system');
    }
  }
  
  // Set active tab
  function setActiveTab(tab: string) {
    uiStore.setActiveTab(tab);
  }
  
  // Initialize with a welcome message and loading simulation
  onMount(() => {
    if ($chatStore.messages.length === 0) {
      chatStore.addMessage('Welcome to Vibe Photoshop! Upload an image or enter a prompt to get started.', 'system');
    }
    
    // Start loading simulation
    uiStore.simulateLoading();
  });
</script>

{#if $uiStore.isLoading}
  <LoadingScreen loadingProgress={$uiStore.loadingProgress} loadingText={$uiStore.loadingText} />
{:else}
  <!-- Photoshop-inspired UI with theme variables -->
  <div class="h-full flex flex-col" style="background-color: var(--ps-primary); color: var(--ps-text);">
    <!-- Main content area -->
    <main class="flex flex-col md:flex-row flex-1 overflow-hidden">
      <!-- Left side: Image display (main canvas) -->
      <div class="w-full md:w-2/3 flex flex-col h-full overflow-hidden">
        <!-- Tool options bar -->
        <ToolBar 
          currentImage={$imageStore.currentImage} 
          resetSession={resetSession} 
          downloadImage={downloadImage} 
        />
        
        <!-- Canvas area -->
        <div class="flex-1 p-4 flex flex-col overflow-auto" style="background-color: var(--ps-primary);">
          <ImageCanvas 
            currentImage={$imageStore.currentImage}
            isUploading={$imageStore.isUploading}
            isGenerating={$imageStore.isGenerating}
            handleFileSelect={handleFileSelect}
          />
          
          <!-- Version history under the main image -->
          {#if $imageStore.currentImage && $imageStore.showVersionHistory}
            <VersionHistory 
              currentImage={$imageStore.currentImage}
              showVersionHistory={$imageStore.showVersionHistory}
              toggleVersionHistory={imageStore.toggleVersionHistory}
              selectVersion={imageStore.selectVersion}
            />
          {/if}
        </div>
        
        <!-- Status bar -->
        <StatusBar currentImage={$imageStore.currentImage} />
      </div>
      
      <!-- Right side: Panels -->
      <div class="w-full md:w-1/3 border-l flex flex-col h-full overflow-hidden" style="border-color: var(--ps-border);">
        <!-- Panel tabs - Photoshop style -->
        <PanelTabs activeTab={$uiStore.activeTab} setActiveTab={setActiveTab} />
        
        <!-- Panel content -->
        <div class="flex-1 overflow-hidden flex flex-col h-full" style="background-color: var(--ps-secondary);">
          {#if $uiStore.activeTab === 'vibe'}
            <!-- Vibe Create panel (chat) -->
            <ChatPanel 
              messages={$chatStore.messages}
              isGenerating={$imageStore.isGenerating}
              prompt={$chatStore.prompt}
              error={$chatStore.error}
              processInput={processInput}
            />
          {:else if $uiStore.activeTab === 'history'}
            <!-- History panel -->
            <HistoryPanel 
              currentImage={$imageStore.currentImage}
              selectVersion={imageStore.selectVersion}
            />
          {:else if $uiStore.activeTab === 'adjustments'}
            <!-- Adjustments panel -->
            <AdjustmentsPanel />
          {/if}
        </div>
      </div>
    </main>
  </div>
{/if}

<style>
  /* Global styles that might be needed */
  :global(.bg-checkerboard) {
    background-image: 
      linear-gradient(45deg, var(--ps-panel) 25%, transparent 25%), 
      linear-gradient(-45deg, var(--ps-panel) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--ps-panel) 75%),
      linear-gradient(-45deg, transparent 75%, var(--ps-panel) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: var(--ps-secondary);
  }
</style>
