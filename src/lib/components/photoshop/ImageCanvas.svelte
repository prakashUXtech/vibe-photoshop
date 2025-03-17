<!--
  ImageCanvas.svelte
  This component displays the current image and handles image uploads.
-->
<script lang="ts">
  import type { Image } from '$lib/types';
  import { createEventDispatcher } from 'svelte';
  
  export let currentImage: Image | null = null;
  export let isUploading = false;
  export let isGenerating = false;
  export let handleFileSelect: (event: Event) => void;
  
  const dispatch = createEventDispatcher();
  
  let dragOver = false;
  
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
</script>

<div 
  class="relative w-full h-full"
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover|preventDefault
  on:drop={handleDrop}
  on:paste={handlePaste}
>
  <!-- Canvas background -->
  <div 
    class="absolute inset-0 grid"
    style="background-size: 16px 16px; background-image: linear-gradient(to right, #333333 1px, transparent 1px), linear-gradient(to bottom, #333333 1px, transparent 1px);"
  >
  </div>
  
  <!-- Image display -->
  {#if currentImage}
    <div class="absolute inset-0 flex items-center justify-center">
      <img
        src={currentImage.imageUrl}
        alt={currentImage.prompt}
        class="max-w-full max-h-full object-contain"
        style="image-rendering: pixelated;"
      />
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
  .grid {
    background-color: #1a1a1a;
  }
</style> 