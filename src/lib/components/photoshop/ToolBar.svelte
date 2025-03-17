<!-- Tool options bar component -->
<script lang="ts">
  import type { Image } from '$lib/types';
  
  export let currentImage: Image | null;
  export let resetSession: () => void;
  export let downloadImage: () => void;
</script>

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