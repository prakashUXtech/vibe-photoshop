<!-- Version history component -->
<script lang="ts">
  import type { Image, ImageVersion } from '$lib/types';
  
  export let currentImage: Image;
  export let showVersionHistory: boolean;
  export let toggleVersionHistory: () => void;
  export let selectVersion: (version: ImageVersion) => void;
</script>

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