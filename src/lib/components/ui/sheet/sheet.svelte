<!-- Sheet component wrapper that handles visibility state -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let open = false;
  
  const dispatch = createEventDispatcher();
  
  function handleClose() {
    open = false;
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      handleClose();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="fixed inset-0 z-50">
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm"
      transition:fade={{ duration: 100 }}
      on:click={handleClose}
      on:keydown={() => {}}
      role="presentation"
    />
    
    <!-- Content -->
    <div on:close={handleClose}>
      <slot />
    </div>
  </div>
{/if} 