<!--
  ImageCanvas.svelte
  This component displays the current image and handles image uploads.
  Updated with centered Polaroid-style frame and improved prompt display.
-->
<script lang="ts">
  import type { Image, ImageVersion } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  import { imageStore } from '$lib/stores/imageStore';
  import { uiStore } from '$lib/stores/uiStore';
  import { toast } from '$lib/stores/toastStore';
  
  export let currentImage: Image | null = null;
  export let isUploading = false;
  export let isGenerating = false;
  export let handleFileSelect: (event: Event) => void;
  
  const dispatch = createEventDispatcher();
  
  let dragOver = false;
  let showPrompt = true;
  let scanPosition = 0;
  let scanAnimation: number;
  
  // Start scan animation
  function startScanAnimation() {
    let direction = 1;
    scanPosition = 0;
    
    scanAnimation = window.setInterval(() => {
      scanPosition += direction * 2;
      if (scanPosition >= 100) {
        direction = -1;
      } else if (scanPosition <= 0) {
        direction = 1;
      }
    }, 20);
  }
  
  // Stop scan animation
  function stopScanAnimation() {
    if (scanAnimation) {
      clearInterval(scanAnimation);
      scanPosition = 0;
    }
  }
  
  // Watch isGenerating changes
  $: if (isGenerating) {
    startScanAnimation();
  } else {
    stopScanAnimation();
  }

  // Copy prompt to clipboard
  async function copyPrompt() {
    if (!currentImage) return;
    await navigator.clipboard.writeText(currentImage.prompt);
    toast.success('Prompt copied to clipboard');
  }

  // Download current image
  function downloadImage() {
    if (!currentImage) return;
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptSnippet = currentImage.prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `vide-edit-${promptSnippet}-${timestamp}.jpg`;
    
    const link = document.createElement('a');
    link.href = currentImage.imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  }

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    dragOver = true;
  }
  
  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
  }
  
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    
    if (e.dataTransfer?.files) {
      handleFileSelect({
        target: { files: e.dataTransfer.files }
      } as unknown as Event);
    }
  }
  
  function handlePaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        const file = item.getAsFile();
        if (file) {
          handleFileSelect({
            target: { files: [file] }
          } as unknown as Event);
          break;
        }
      }
    }
  }

  // Toggle border visibility
  function toggleBorder() {
    uiStore.toggleImageBorder();
  }
  
  // Toggle prompt visibility
  function togglePrompt() {
    showPrompt = !showPrompt;
  }
</script>

<div 
  class="relative w-full h-full grid-background"
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover|preventDefault
  on:drop={handleDrop}
  on:paste={handlePaste}
>
  <!-- Image display -->
  {#if currentImage || isGenerating}
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="image-container {$uiStore.showImageBorder ? 'polaroid-border' : ''}">
        <div class="relative image-wrapper">
          {#if currentImage}
            <img
              src={currentImage.imageUrl}
              alt={currentImage.prompt}
              class="image"
            />
          {:else if isGenerating}
            <!-- Placeholder for generation -->
            <div class="image-placeholder">
              <!-- Empty div to maintain size during generation -->
              <div style="width: 512px; height: 512px;"></div>
            </div>
          {/if}
          
          <!-- Scanning animation overlay -->
          {#if isGenerating}
            <div class="scan-overlay">
              <div 
                class="scan-line"
                style="top: {scanPosition}%"
              ></div>
              <div class="scan-glow"></div>
            </div>
          {/if}
          
          <!-- Controls -->
          <div class="control-buttons">
            <!-- Download button -->
            <button
              class="control-button"
              on:click={downloadImage}
              title="Download Image"
              class:invisible={!currentImage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- Border toggle button -->
            <button
              class="control-button ml-2"
              on:click={toggleBorder}
              title={$uiStore.showImageBorder ? "Hide Frame" : "Show Frame"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4h12v12H4V4z" fill="none" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            
            {#if $uiStore.showImageBorder && currentImage}
              <!-- Prompt toggle button -->
              <button
                class="control-button ml-2"
                on:click={togglePrompt}
                title={showPrompt ? "Hide Prompt" : "Show Prompt"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            {/if}
          </div>
        </div>
        
        <!-- Prompt display -->
        {#if $uiStore.showImageBorder && showPrompt && currentImage?.prompt}
          <div class="prompt-container">
            <p class="prompt-text">{currentImage.prompt}</p>
            <button 
              class="copy-button" 
              on:click={copyPrompt}
              title="Copy prompt"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  
  <!-- Drag overlay -->
  {#if dragOver}
    <div 
      class="absolute inset-0 bg-blue-500 bg-opacity-20 border-2 border-blue-500 border-dashed flex items-center justify-center"
      style="border-radius: var(--ps-border-radius);"
    >
      <div class="bg-blue-500 text-white px-6 py-4 rounded-lg backdrop-blur-sm">
        Drop image here
      </div>
    </div>
  {/if}
  
  <!-- File input (hidden) -->
  <input
    type="file"
    accept="image/*"
    on:change={handleFileSelect}
    class="hidden"
  />
</div>

<style>
  /* Ensure the component takes up the full space */
  div {
    width: 100%;
    height: 100%;
  }
  
  /* Style the grid background */
  .grid-background {
    background-color: var(--ps-secondary);
    background-size: 16px 16px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  }

  /* Image container */
  .image-container {
    max-width: 85%;
    max-height: 85%;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* Polaroid-style border */
  .polaroid-border {
    background: white;
    padding: 20px 20px 50px 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }

  /* Dark mode support */
  :global(.dark) {
    .grid-background {
      background-color: #1a1a1a;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    }
    
    .polaroid-border {
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    }
  }

  /* Image wrapper */
  .image-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    min-width: 512px;
    min-height: 512px;
  }

  /* Image styling */
  .image {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: block;
  }

  /* Controls positioning */
  .control-buttons {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    opacity: 1;
    z-index: 10;
  }

  .image-wrapper:hover .control-buttons {
    opacity: 1;
  }

  /* Button styling */
  .control-button {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 9999px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .control-button:hover {
    background: rgba(0, 0, 0, 0.8);
  }

  .ml-2 {
    margin-left: 8px;
  }

  /* Prompt container */
  .prompt-container {
    width: 100%;
    margin-top: 15px;
    padding: 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .prompt-text {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: #333;
    line-height: 1.4;
    margin: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .copy-button {
    padding: 6px;
    color: #666;
    border-radius: 4px;
    transition: all 0.2s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .copy-button:hover {
    background: #f0f0f0;
    color: #333;
  }

  /* Scanning animation styles */
  .scan-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(1px);
  }

  .scan-line {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(0, 255, 255, 0.8) 20%,
      rgba(0, 255, 255, 1) 50%,
      rgba(0, 255, 255, 0.8) 80%,
      transparent 100%
    );
    box-shadow: 
      0 0 10px rgba(0, 255, 255, 0.5),
      0 0 20px rgba(0, 255, 255, 0.3),
      0 0 30px rgba(0, 255, 255, 0.2);
    transition: top 0.05s linear;
  }

  .scan-glow {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle at 50% var(--scan-position, 50%),
      rgba(0, 255, 255, 0.1) 0%,
      transparent 60%
    );
    --scan-position: 50%;
  }
  
  /* Image placeholder styling */
  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    overflow: hidden;
    width: 512px;
    height: 512px;
  }

  .invisible {
    opacity: 0;
    pointer-events: none;
  }
</style> 