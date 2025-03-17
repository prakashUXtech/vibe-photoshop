<!-- Status bar component -->
<script lang="ts">
  import type { Image } from '$lib/types';
  
  export let currentImage: Image | null;
</script>

<div class="p-1 flex justify-between text-xs opacity-70" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
  <div>
    {currentImage ? `${currentImage.prompt}` : 'Ready'}
  </div>
  <div>
    {currentImage ? `Last modified: ${new Date(currentImage.updatedAt).toLocaleString()}` : ''}
  </div>
</div> 