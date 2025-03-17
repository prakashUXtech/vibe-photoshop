<!--
  VersionThumbnailPanel.svelte
  This component displays thumbnails of all image versions at the bottom of the canvas.
  Users can click on thumbnails to switch between different versions of the image.
-->
<script lang="ts">
  import type { Image, ImageVersion } from '$lib/types';
  import { imageStore } from '$lib/stores/imageStore';
  
  export let currentImage: Image | null = null;
  
  // Track if panel is collapsed
  let isCollapsed = false;
  
  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }
  
  function selectVersion(version: ImageVersion) {
    if (!currentImage) return;
    imageStore.selectVersion(version);
  }
</script>

{#if currentImage && currentImage.versions.length > 1}
  <div class="version-thumbnail-panel {isCollapsed ? 'collapsed' : ''}">
    <div class="panel-header">
      <h3 class="panel-title">Version History ({currentImage.versions.length})</h3>
      <button 
        class="collapse-button"
        on:click={toggleCollapse}
        aria-label={isCollapsed ? "Expand version panel" : "Collapse version panel"}
      >
        {isCollapsed ? '↑' : '↓'}
      </button>
    </div>
    
    {#if !isCollapsed}
      <div class="version-thumbnails">
        {#each currentImage.versions as version, i}
          <button 
            class="version-thumbnail {version.imageUrl === currentImage.imageUrl ? 'active' : ''}"
            on:click={() => selectVersion(version)}
            aria-label={`Select version ${i + 1}`}
          >
            <div class="thumbnail-container">
              <img src={version.imageUrl} alt={version.prompt} class="thumbnail-image" />
            </div>
            <div class="version-label">V{i + 1}</div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .version-thumbnail-panel {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(30, 30, 30, 0.85);
    backdrop-filter: blur(8px);
    border-top: 1px solid var(--ps-border);
    transition: transform 0.3s ease;
    z-index: 10;
  }
  
  .version-thumbnail-panel.collapsed {
    transform: translateY(calc(100% - 36px));
  }
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .panel-title {
    font-size: 12px;
    font-weight: 500;
    color: #fff;
    margin: 0;
  }
  
  .collapse-button {
    background: transparent;
    border: none;
    color: #fff;
    opacity: 0.7;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 8px;
    border-radius: 4px;
  }
  
  .collapse-button:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .version-thumbnails {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 12px 16px;
    justify-content: flex-start;
  }
  
  .version-thumbnail {
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: transparent;
    border: none;
    padding: 0;
    transition: transform 0.2s ease;
  }
  
  .version-thumbnail:hover {
    transform: translateY(-2px);
  }
  
  .thumbnail-container {
    width: 70px;
    height: 70px;
    border-radius: 4px;
    overflow: hidden;
    border: 2px solid transparent;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  .version-thumbnail.active .thumbnail-container {
    border-color: var(--ps-accent, #3b82f6);
  }
  
  .thumbnail-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .version-label {
    margin-top: 6px;
    font-size: 11px;
    color: #fff;
    opacity: 0.8;
  }
</style> 