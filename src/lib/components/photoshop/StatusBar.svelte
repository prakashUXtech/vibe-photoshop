<!-- Status bar component -->
<script lang="ts">
  import type { Image } from '$lib/types';
  
  export let currentImage: Image | null;
  
  // Get dimensions string if image is available
  function getDimensions(image: Image | null): string {
    if (!image || !image.metadata) return '';
    const { width, height } = image.metadata;
    return `${width} × ${height}px`;
  }
</script>

<div class="p-1 flex justify-between w-full items-center text-xs opacity-80" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
  <!-- Left section -->
  <div class="flex items-center gap-3">
    <span class="status-indicator">
      {#if currentImage}
        <span class="status-dot ready"></span> Image loaded
      {:else}
        <span class="status-dot idle"></span> Ready
      {/if}
    </span>
    
    {#if currentImage && currentImage.metadata}
      <span class="px-3 border-l border-r border-gray-600">{getDimensions(currentImage)}</span>
      <span>{currentImage.metadata.format.toUpperCase()}</span>
    {/if}
  </div>
  
  <!-- Right section - timestamp -->
  <div class="flex justify-end">
    {#if currentImage}
      <span class="timestamp text-right">Modified: {new Date(currentImage.updatedAt).toLocaleString()}</span>
    {/if}
  </div>
</div>

<style>
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    display: inline-block;
  }
  
  .ready {
    background-color: #4ade80; /* green */
  }
  
  .idle {
    background-color: #a1a1aa; /* neutral */
  }
  
  .timestamp {
    color: #d4d4d8;
  }
</style> 