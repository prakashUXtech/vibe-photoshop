<!--
  ChatPanel.svelte
  This component handles user input and displays chat messages
  for image generation and editing conversations.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { chatStore, type ChatMessage } from '$lib/stores/chatStore';
  import { uiStore } from '$lib/stores/uiStore';
  import { generateContent, editImage, fileToBase64, getUserApiKey } from '$lib/services/api/gemini';
  import { toast } from '$lib/stores/toastStore';
  import SvelteMarkdown from 'svelte-markdown';
  import ModelSelector from './ModelSelector.svelte';
  
  // Props (optional)
  export let messages: ChatMessage[] = $chatStore.messages;
  export let isGenerating: boolean = false;
  export let prompt: string = '';
  export let error: string = '';
  export let processInput: (() => Promise<void>) | undefined = undefined;
  
  let inputElement: HTMLInputElement;
  let currentStreamingMessage = '';
  
  // Handle form submission
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!prompt.trim() || isGenerating) return;
    
    // If processInput is provided, use it
    if (processInput) {
      chatStore.setPrompt(prompt);
      await processInput();
      return;
    }
    
    try {
      isGenerating = true;
      uiStore.setStreaming(true);
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
      currentStreamingMessage = '';
      
      // Add initial assistant message
      const streamingMessage: ChatMessage = {
        type: 'assistant',
        text: '',
        timestamp: new Date()
      };
      chatStore.addMessage(streamingMessage);
      
      // Check if we're using the image generation model
      if ($uiStore.selectedModel === 'gemini-2.0-flash-exp-image-generation') {
        // Use server endpoint for image generation
        await generateImageWithServer(currentPrompt, streamingMessage);
      } else {
        // Process the input with streaming for text generation
        await generateContent(currentPrompt, {
          onTextToken: (text) => {
            currentStreamingMessage += text;
            streamingMessage.text = currentStreamingMessage;
            chatStore.updateLastMessage(streamingMessage);
          },
          onImage: (image) => {
            if (!streamingMessage.images) streamingMessage.images = [];
            streamingMessage.images.push(image);
            chatStore.updateLastMessage(streamingMessage);
            uiStore.setSelectedImage(image);
          },
          onComplete: () => {
            uiStore.setStreaming(false);
          }
        });
      }
    } catch (error) {
      console.error('Error processing input:', error);
      toast.error('Failed to process your request. Please try again.');
    } finally {
      isGenerating = false;
      uiStore.setStreaming(false);
    }
  }
  
  // Generate image using server endpoint
  async function generateImageWithServer(prompt: string, message: ChatMessage) {
    const apiKey = getUserApiKey();
    
    if (!apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }
    
    console.log('🖼️ Generating image with server endpoint:', { prompt });
    
    try {
      // Set initial message text
      message.text = 'Generating image...';
      chatStore.updateLastMessage(message);
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }
      
      const data = await response.json();
      console.log('🖼️ Image generation response:', {
        textCount: data.text.length,
        imageCount: data.images.length,
        textSample: data.text.length > 0 ? data.text[0].substring(0, 50) + '...' : 'No text'
      });
      
      // Update message with text response
      if (data.text.length > 0) {
        message.text = data.text.join('\n');
      } else {
        message.text = 'Image generated successfully';
      }
      
      // Add images to message
      if (data.images.length > 0) {
        if (!message.images) message.images = [];
        for (const image of data.images) {
          message.images.push(image);
          uiStore.setSelectedImage(image);
        }
      } else {
        message.text += '\n\nNo image was generated. Please try a different prompt.';
      }
      
      // Update the message
      chatStore.updateLastMessage(message);
    } catch (error) {
      console.error('Error generating image:', error);
      message.text = `Error: ${error.message || 'Failed to generate image'}`;
      chatStore.updateLastMessage(message);
      throw error;
    }
  }
  
  // Handle keydown events
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  }
  
  // Focus input on mount
  onMount(() => {
    inputElement?.focus();
  });

  // Debug log chat messages
  $: {
    console.log('Current chat messages:', messages);
  }
  
  // Use store values if props are not provided
  $: {
    if (!messages) messages = $chatStore.messages;
    if (!prompt) prompt = $chatStore.prompt;
    if (!error) error = $chatStore.error;
  }
</script>

<div class="flex flex-col h-full" style="background-color: var(--ps-secondary);">
  <!-- Model selector -->
  <ModelSelector />
  
  <!-- Chat messages -->
  <div class="flex-1 overflow-y-auto p-3 space-y-3">
    {#each messages as message}
      <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
        <div 
          class="rounded px-3 py-2 max-w-[85%] shadow-md" 
          style="
            background-color: {message.type === 'user' ? 'var(--ps-accent)' : message.type === 'system' ? 'var(--ps-border)' : 'var(--ps-panel)'};
            border-radius: var(--ps-border-radius);
            box-shadow: var(--ps-shadow);
          "
        >
          <div class="text-sm prose dark:prose-invert" style="color: var(--ps-text);">
            <SvelteMarkdown source={message.text} />
          </div>
          
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
          placeholder={$uiStore.selectedModel === 'gemini-2.0-flash-exp-image-generation' 
            ? "Describe the image you want to generate..." 
            : $uiStore.selectedImage 
              ? "Describe how to edit the image..." 
              : "Ask a question or describe what you want..."}
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
  
  :global(.prose) {
    max-width: none;
  }
  
  :global(.prose pre) {
    background-color: var(--ps-panel);
    border-radius: var(--ps-border-radius);
  }
  
  :global(.prose code) {
    background-color: var(--ps-panel);
    border-radius: var(--ps-border-radius);
    padding: 0.2em 0.4em;
  }
</style> 