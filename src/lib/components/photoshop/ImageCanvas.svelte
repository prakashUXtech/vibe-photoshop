<!-- Image canvas component -->
<script lang="ts">
  import type { Image } from '$lib/types';
  
  export let currentImage: Image | null;
  export let isUploading: boolean;
  export let isGenerating: boolean;
  export let handleFileSelect: (event: Event) => void;
</script>

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
</style> 