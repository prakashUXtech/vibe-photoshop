<!-- History panel component -->
<script lang="ts">
  import type { Image, ImageVersion } from '$lib/types';
  import { imageStore } from '$lib/stores/imageStore';
  
  export let currentImage: Image | null;
  
  // Function to select a version
  function selectVersion(version: ImageVersion) {
    if (!currentImage) return;
    imageStore.selectVersion(version);
  }
</script>

<div class="flex-1 p-3 overflow-y-auto h-full">
  <div class="mb-3 flex justify-between items-center">
    <h3 class="text-xs font-medium">Version History</h3>
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
            <span class="text-xs truncate max-w-[150px]">Version {i + 1}: {version.prompt.substring(0, 20)}{version.prompt.length > 20 ? '...' : ''}</span>
          </div>
          <div class="text-xs opacity-70">
            {new Date(version.createdAt).toLocaleTimeString()}
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Version thumbnails -->
    <div class="mt-4">
      <h3 class="text-xs font-medium mb-2">Version Previews</h3>
      <div class="flex flex-wrap gap-2">
        {#each currentImage.versions as version, i}
          <div 
            class="cursor-pointer group"
            on:click={() => selectVersion(version)}
          >
            <div class="w-16 h-16 rounded overflow-hidden border-2" 
              style="
                background-color: var(--ps-panel);
                border-color: {version.imageUrl === currentImage.imageUrl ? 'var(--ps-accent)' : 'var(--ps-border)'};
                border-radius: var(--ps-border-radius);
              "
            >
              <img src={version.imageUrl} alt={version.prompt} class="w-full h-full object-cover" />
            </div>
            <p class="mt-1 text-xs opacity-70 truncate w-16">V{i + 1}</p>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="text-center p-4 text-xs opacity-70">
      No versions available
    </div>
  {/if}
</div> 