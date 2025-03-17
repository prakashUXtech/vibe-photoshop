<!--
  Toast.svelte
  This component displays toast notifications.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { toast, type Toast } from '$lib/stores/toastStore';
  import { fly, fade } from 'svelte/transition';

  let toasts: Toast[] = [];
  let mounted = false;
  
  // Subscribe to toast store only on client-side
  onMount(() => {
    mounted = true;
    
    const unsubscribe = toast.subscribe(value => {
      toasts = value;
    });

    return () => {
      unsubscribe();
    };
  });

  // Get icon and background color based on toast type
  function getToastStyles(type: Toast['type']) {
    switch (type) {
      case 'success':
        return {
          icon: '✓',
          bgColor: 'bg-green-500',
          textColor: 'text-white'
        };
      case 'error':
        return {
          icon: '✕',
          bgColor: 'bg-red-500',
          textColor: 'text-white'
        };
      case 'warning':
        return {
          icon: '⚠',
          bgColor: 'bg-yellow-500',
          textColor: 'text-white'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ',
          bgColor: 'bg-blue-500',
          textColor: 'text-white'
        };
    }
  }
</script>

{#if browser && mounted}
  <div class="toast-container">
    {#each toasts as t (t.id)}
      <div 
        class="toast-item {getToastStyles(t.type).bgColor} {getToastStyles(t.type).textColor}"
        in:fly={{ y: 50, duration: 300 }}
        out:fade={{ duration: 200 }}
      >
        <div class="toast-icon">
          {getToastStyles(t.type).icon}
        </div>
        <div class="toast-message">
          {t.message}
        </div>
        <button 
          class="toast-close"
          on:click={() => toast.remove(t.id)}
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .toast-container {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-width: 24rem;
    width: calc(100% - 2rem);
  }

  .toast-item {
    display: flex;
    align-items: center;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    animation: slide-in 0.2s ease-out;
  }

  .toast-icon {
    margin-right: 0.75rem;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-message {
    flex: 1;
    font-size: 0.875rem;
  }

  .toast-close {
    background: transparent;
    border: none;
    color: currentColor;
    opacity: 0.7;
    cursor: pointer;
    font-size: 0.75rem;
    padding: 0.25rem;
    margin-left: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toast-close:hover {
    opacity: 1;
  }

  @keyframes slide-in {
    from {
      transform: translateY(1rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
</style> 