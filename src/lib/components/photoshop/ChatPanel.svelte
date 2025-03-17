<!--
  ChatPanel.svelte
  This component handles user input and displays chat messages
  for image generation and editing conversations.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { chatStore, type ChatMessage } from '$lib/stores/chatStore';
  import { uiStore } from '$lib/stores/uiStore';
  import { generateImage, editImage, fileToBase64 } from '$lib/services/api/gemini';
  import { toast } from '$lib/stores/toastStore';
  
  let prompt = '';
  let inputElement: HTMLInputElement;
  let isGenerating = false;
  
  // Handle form submission
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!prompt.trim() || isGenerating) return;
    
    try {
      isGenerating = true;
      console.log('Submitting prompt:', prompt);
      
      // Add user message to chat
      const userMessage: ChatMessage = {
        type: 'user',
        text: prompt,
        timestamp: new Date()
      };
      chatStore.addMessage(userMessage);
      
      // Clear input and save current prompt
      const currentPrompt = prompt;
      prompt = '';
      
      // Process the input
      await processInput(currentPrompt);
    } catch (error) {
      console.error('Error processing input:', error);
      toast.error('Failed to process your request. Please try again.');
    } finally {
      isGenerating = false;
    }
  }
  
  // Handle keydown events
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }
  
  // Process user input
  async function processInput(input: string) {
    try {
      console.log('Processing input:', input);
      console.log('Current UI state:', $uiStore);
      
      const response = $uiStore.selectedImage 
        ? await editImage($uiStore.selectedImage, input)
        : await generateImage(input);
      
      console.log('Gemini response:', response);
      
      // Extract text from response
      const responseText = Array.isArray(response.text) 
        ? response.text.join('\n')
        : typeof response.text === 'string' 
          ? response.text 
          : 'No response text available';
      
      // Add response to chat
      const assistantMessage: ChatMessage = {
        type: 'assistant',
        text: responseText,
        timestamp: new Date(),
        images: response.images || []
      };
      chatStore.addMessage(assistantMessage);
      
      // Update the selected image if we got one back
      if (response.images?.[0]) {
        console.log('Setting new selected image');
        uiStore.setSelectedImage(response.images[0]);
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        type: 'system',
        text: error instanceof Error ? error.message : 'An error occurred while processing your request.',
        timestamp: new Date()
      };
      chatStore.addMessage(errorMessage);
      
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  }
  
  // Focus input on mount
  onMount(() => {
    inputElement?.focus();
  });

  // Debug log chat messages
  $: {
    console.log('Current chat messages:', $chatStore.messages);
  }
</script>

<div class="flex flex-col h-full" style="background-color: var(--ps-secondary);">
  <!-- Chat messages -->
  <div class="flex-1 overflow-y-auto p-3 space-y-3">
    {#each $chatStore.messages as message}
      <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
        <div 
          class="rounded px-3 py-2 max-w-[85%] shadow-md" 
          style="
            background-color: {message.type === 'user' ? 'var(--ps-accent)' : message.type === 'system' ? 'var(--ps-border)' : 'var(--ps-panel)'};
            border-radius: var(--ps-border-radius);
            box-shadow: var(--ps-shadow);
          "
        >
          <p class="text-sm" style="color: var(--ps-text);">{message.text}</p>
          {#if message.images && message.images.length > 0}
            <div class="mt-2 space-y-2">
              {#each message.images as image}
                <img 
                  src="data:image/jpeg;base64,{image}" 
                  alt="Generated" 
                  class="max-w-full rounded cursor-pointer hover:opacity-90 transition-opacity"
                  style="border-radius: var(--ps-border-radius);"
                  on:click={() => uiStore.setSelectedImage(image)}
                />
              {/each}
            </div>
          {/if}
          <p class="text-xs opacity-70 mt-1 text-right" style="color: var(--ps-text);">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    {/each}
  </div>
  
  <!-- Input form -->
  <div class="p-3 border-t" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
    <form on:submit={handleSubmit} class="flex items-center">
      <div class="flex-grow relative">
        <input
          type="text"
          bind:value={prompt}
          bind:this={inputElement}
          placeholder={$uiStore.selectedImage ? "Describe how to edit the image..." : "Describe the image you want to generate..."}
          class="w-full py-2 px-3 text-sm focus:outline-none focus:ring-1"
          style="
            background-color: var(--ps-panel);
            border: 1px solid var(--ps-border);
            border-radius: var(--ps-border-radius);
            color: var(--ps-text);
          "
          disabled={isGenerating}
          on:keydown={handleKeydown}
        />
      </div>
      <button
        type="submit"
        class="ml-2 p-2 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
        style="
          background-color: var(--ps-accent);
          border-radius: var(--ps-border-radius);
        "
        disabled={isGenerating || !prompt.trim()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </form>
  </div>
</div>

<style>
  /* Hide scrollbar for Chrome, Safari and Opera */
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
  
  /* Hide scrollbar for IE, Edge and Firefox */
  .overflow-y-auto {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  
  /* Focus styles for input */
  input:focus {
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }
  
  /* Disabled state */
  input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 