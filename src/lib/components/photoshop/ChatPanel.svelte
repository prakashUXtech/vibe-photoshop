<!-- Chat panel component -->
<script lang="ts">
  import { browser } from '$app/environment';
  
  export let messages: {text: string, type: 'user' | 'system', timestamp: Date}[];
  export let isGenerating: boolean;
  export let prompt: string;
  export let error: string;
  export let processInput: () => Promise<void>;
  
  let chatContainer: HTMLElement | null = null;
  
  // Scroll to bottom when messages change
  $: if (browser && chatContainer && messages) {
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }
</script>

<div class="flex flex-col h-full">
  <div 
    bind:this={chatContainer}
    class="flex-1 overflow-y-auto p-3 space-y-3"
  >
    {#each messages as message}
      <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="rounded px-3 py-2 max-w-[85%] shadow-md" 
          style="
            background-color: {message.type === 'user' ? 'var(--ps-accent)' : 'var(--ps-panel)'};
            border-radius: var(--ps-border-radius);
            box-shadow: var(--ps-shadow);
          "
        >
          <p class="text-sm">{message.text}</p>
          <p class="text-xs opacity-70 mt-1 text-right">{message.timestamp.toLocaleTimeString()}</p>
        </div>
      </div>
    {/each}
    
    {#if isGenerating}
      <div class="flex justify-start">
        <div class="rounded px-3 py-2 shadow-md" 
          style="
            background-color: var(--ps-panel);
            border-radius: var(--ps-border-radius);
            box-shadow: var(--ps-shadow);
          "
        >
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full animate-pulse opacity-50"></div>
            <div class="w-2 h-2 rounded-full animate-pulse delay-75 opacity-50"></div>
            <div class="w-2 h-2 rounded-full animate-pulse delay-150 opacity-50"></div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Prompt input - Fixed at bottom, styled like Photoshop -->
  <div class="p-3 border-t" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
    <form on:submit|preventDefault={processInput} class="flex items-center">
      <div class="flex-grow relative">
        <input
          type="text"
          bind:value={prompt}
          placeholder="Enter a prompt..."
          class="prompt-input w-full py-2 px-3 text-sm focus:outline-none focus:ring-1"
          style="
            background-color: var(--ps-panel);
            border: 1px solid var(--ps-border);
            border-radius: var(--ps-border-radius);
            color: var(--ps-text);
          "
        />
        {#if error}
          <div class="absolute -top-6 left-0 text-xs" style="color: var(--ps-accent);">{error}</div>
        {/if}
      </div>
      <button
        type="submit"
        disabled={isGenerating}
        class="ml-2 p-2 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        style="
          background-color: var(--ps-accent);
          border-radius: var(--ps-border-radius);
        "
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </form>
  </div>
</div>

<style>
  /* Focus styles for prompt input */
  .prompt-input:focus {
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }
</style> 