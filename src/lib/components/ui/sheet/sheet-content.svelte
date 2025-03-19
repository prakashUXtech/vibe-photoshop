<!-- Sheet content component with slide animations -->
<script lang="ts">
  import { X } from '@lucide/svelte';
  import { cn } from '$lib/utils';
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';

  type Side = 'top' | 'right' | 'bottom' | 'left';

  let className: string | undefined = undefined;
  export { className as class };
  export let side: Side = 'right';
  
  const dispatch = createEventDispatcher();

  function closeSheet() {
    dispatch('close');
  }

  const sideToFly = {
    top: { y: -100, duration: 300 },
    right: { x: 100, duration: 300 },
    bottom: { y: 100, duration: 300 },
    left: { x: -100, duration: 300 }
  };
</script>

<div
  class={cn(
    'fixed z-50 gap-4 bg-[#2a2a2a] text-gray-200 p-6 shadow-lg',
    side === 'left' && 'inset-y-0 left-0 h-full',
    side === 'right' && 'inset-y-0 right-0 h-full',
    side === 'top' && 'inset-x-0 top-0',
    side === 'bottom' && 'inset-x-0 bottom-0',
    className
  )}
  in:fly={sideToFly[side]}
  out:fly={{ ...sideToFly[side], duration: 200 }}
>
  <button 
    class="absolute right-4 top-4 rounded-sm text-gray-400 opacity-70 transition-opacity hover:opacity-100 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-[#2a2a2a] disabled:pointer-events-none"
    on:click={closeSheet}
    aria-label="Close"
  >
    <X class="h-4 w-4" />
    <span class="sr-only">Close</span>
  </button>
  <div class="h-full">
    <slot />
  </div>
</div> 