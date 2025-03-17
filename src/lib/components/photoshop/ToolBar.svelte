<!--
  ToolBar.svelte
  This component provides the main toolbar with image manipulation tools.
-->
<script lang="ts">
  import type { Image } from '$lib/types';
  
  export let currentImage: Image | null;
  export let resetSession: () => void;
  export let downloadImage: () => void;
  
  const tools = [
    {
      id: 'new',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/>`,
      label: 'New',
      action: resetSession
    },
    {
      id: 'download',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>`,
      label: 'Download',
      action: downloadImage,
      disabled: !currentImage
    },
    {
      id: 'move',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 9l4-4 4 4m0 6l-4 4-4-4"/>`,
      label: 'Move',
      disabled: !currentImage
    },
    {
      id: 'crop',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h18M3 16h18"/>`,
      label: 'Crop',
      disabled: !currentImage
    },
    {
      id: 'brush',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>`,
      label: 'Brush',
      disabled: !currentImage
    },
    {
      id: 'eraser',
      icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>`,
      label: 'Eraser',
      disabled: !currentImage
    }
  ];
</script>

<div class="h-full flex flex-col py-2 gap-2">
  {#each tools as tool}
    <div class="px-2">
      <button
        class="w-full aspect-square rounded flex items-center justify-center group relative"
        disabled={tool.disabled}
        on:click={tool.action}
        style="
          background-color: {tool.disabled ? 'transparent' : 'var(--ps-button-bg)'};
          opacity: {tool.disabled ? '0.5' : '1'};
          border-radius: var(--ps-border-radius);
        "
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          class="h-5 w-5" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          style="color: var(--ps-text);"
        >
          {@html tool.icon}
        </svg>
        
        <!-- Tooltip -->
        <div
          class="absolute left-full ml-2 px-2 py-1 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
          style="
            background-color: var(--ps-panel);
            color: var(--ps-text);
            border-radius: var(--ps-border-radius);
          "
        >
          {tool.label}
        </div>
      </button>
    </div>
  {/each}
</div>

<style>
  button {
    transition: all 0.2s;
  }
  
  button:not(:disabled):hover {
    background-color: var(--ps-button-hover) !important;
  }
  
  button:disabled {
    cursor: not-allowed;
  }
</style> 