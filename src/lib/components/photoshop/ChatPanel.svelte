<!--
  ChatPanel.svelte
  This component handles user input and displays chat messages
  for image generation and editing conversations.
  Updated to support continuous image editing with conversation history.
-->

<script lang="ts">
  import { onMount, afterUpdate } from 'svelte';
  import { chatStore, type ChatMessage } from '$lib/stores/chatStore';
  import { uiStore } from '$lib/stores/uiStore';
  import { imageStore } from '$lib/stores/imageStore';
  import { 
    generateContent, 
    editImage, 
    continueImageEditing,
    fileToBase64, 
    getUserApiKey,
    formatChatHistoryForGemini
  } from '$lib/services/api/gemini';
  import { toast } from '$lib/stores/toastStore';
  import SvelteMarkdown from 'svelte-markdown';
  import ModelSelector from './ModelSelector.svelte';
  
  // Props (optional)
  export let isGenerating: boolean = false;
  export let prompt: string = '';
  export let error: string = '';
  export let processInput: (() => Promise<void>) | undefined = undefined;
  
  let inputElement: HTMLInputElement;
  let chatContainer: HTMLDivElement;
  let currentStreamingMessage = '';
  let conversationHistory: any[] = [];
  let isEditingImage = false;
  
  // Load messages from the chat store
  let messages: ChatMessage[] = [];
  
  // Update messages whenever the store changes
  function updateMessages() {
    messages = chatStore.messages;
    console.log('Messages updated:', messages);
  }
  
  // Subscribe to the chatStore and update messages when it changes
  const unsubscribe = chatStore.subscribe(() => {
    updateMessages();
  });
  
  // Initial load and cleanup
  onMount(() => {
    updateMessages();
    return unsubscribe;
  });
  
  // Scroll to bottom of chat
  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }
  
  // Scroll to bottom after messages update
  afterUpdate(() => {
    scrollToBottom();
  });
  
  // Also watch messages explicitly for changes
  $: if (messages.length) {
    setTimeout(scrollToBottom, 100);
  }
  
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
        timestamp: new Date(),
        images: $uiStore.selectedImage ? [$uiStore.selectedImage] : undefined
      };
      chatStore.addMessage(userMessage);
      scrollToBottom();
      
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
      } else if ($uiStore.selectedImage) {
        // We have a selected image, so we're editing
        if (isEditingImage && conversationHistory.length > 0) {
          // Continue the editing conversation
          await continueImageEditingWithServer(currentPrompt, streamingMessage);
        } else {
          // Start a new image editing conversation
          await editImageWithServer(currentPrompt, streamingMessage);
        }
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
      error = error.message || 'An error occurred';
      streamingMessage.text = `Error: ${error}`;
      chatStore.updateLastMessage(streamingMessage);
    } finally {
      isGenerating = false;
      uiStore.setStreaming(false);
    }
  }
  
  // Generate image using server endpoint
  async function generateImageWithServer(prompt: string, message: ChatMessage) {
    try {
      console.log('Generating image with prompt:', prompt);
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          apiKey: getUserApiKey()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate image');
      }
      
      const data = await response.json();
      
      // Update the message with the response
      message.text = data.text.join('\n');
      
      if (data.images && data.images.length > 0) {
        message.images = data.images;
        // Set the first image as the selected image
        uiStore.setSelectedImage(data.images[0]);
      }
      
      chatStore.updateLastMessage(message);
      
      // Reset conversation history since we're starting fresh
      conversationHistory = [];
      isEditingImage = false;
      
    } catch (error) {
      console.error('Error generating image:', error);
      message.text = `Error: ${error.message || 'Failed to generate image'}`;
      chatStore.updateLastMessage(message);
      throw error;
    }
  }
  
  // Edit image using server endpoint
  async function editImageWithServer(instructions: string, message: ChatMessage) {
    try {
      console.log('Editing image with instructions:', instructions);
      
      // Get the selected image
      const imageData = $uiStore.selectedImage;
      if (!imageData) {
        throw new Error('No image selected for editing');
      }
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: instructions,
          apiKey: getUserApiKey(),
          imageData
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to edit image');
      }
      
      const data = await response.json();
      
      // Update the message with the response
      message.text = data.text.join('\n');
      
      if (data.images && data.images.length > 0) {
        message.images = data.images;
        // Set the first image as the selected image
        uiStore.setSelectedImage(data.images[0]);
      }
      
      chatStore.updateLastMessage(message);
      
      // Initialize conversation history for continuous editing
      // Start with the initial user message and model response
      conversationHistory = [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageData
              }
            },
            { text: instructions }
          ]
        },
        {
          role: 'model',
          parts: [
            ...(data.text.map(text => ({ text }))),
            ...(data.images?.map(img => ({ 
              inlineData: { 
                mimeType: 'image/jpeg', 
                data: img 
              } 
            })) || [])
          ]
        }
      ];
      
      // Mark that we're now in an editing session
      isEditingImage = true;
      
    } catch (error) {
      console.error('Error editing image:', error);
      message.text = `Error: ${error.message || 'Failed to edit image'}`;
      chatStore.updateLastMessage(message);
      throw error;
    }
  }
  
  // Continue image editing conversation
  async function continueImageEditingWithServer(instructions: string, message: ChatMessage) {
    try {
      console.log('Continuing image edit with instructions:', instructions);
      console.log('Using conversation history with length:', conversationHistory.length);
      
      const response = await fetch('/api/gemini/continuous-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: instructions,
          apiKey: getUserApiKey(),
          conversationHistory
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to continue image editing');
      }
      
      const data = await response.json();
      
      // Update the message with the response
      message.text = data.text.join('\n');
      
      if (data.images && data.images.length > 0) {
        message.images = data.images;
        // Set the first image as the selected image
        uiStore.setSelectedImage(data.images[0]);
      }
      
      chatStore.updateLastMessage(message);
      
      // Update conversation history with the new exchange
      if (data.updatedHistory) {
        conversationHistory = data.updatedHistory;
      } else {
        // Fallback if updatedHistory is not provided
        conversationHistory.push(
          {
            role: 'user',
            parts: [{ text: instructions }]
          },
          {
            role: 'model',
            parts: [
              ...(data.text.map(text => ({ text }))),
              ...(data.images?.map(img => ({ 
                inlineData: { 
                  mimeType: 'image/jpeg', 
                  data: img 
                } 
              })) || [])
            ]
          }
        );
      }
      
    } catch (error) {
      console.error('Error continuing image edit:', error);
      message.text = `Error: ${error.message || 'Failed to continue image editing'}`;
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
  
  // Reset editing state when selected image changes
  $: if ($uiStore.selectedImage) {
    // Only reset if we're not already editing this image
    if (!isEditingImage) {
      conversationHistory = [];
    }
  } else {
    // No image selected, reset editing state
    isEditingImage = false;
    conversationHistory = [];
  }
  
  // Use store values if props are not provided
  $: {
    if (!prompt) prompt = $chatStore.prompt;
    if (!error) error = $chatStore.error;
  }

  // Subscribe to imageStore changes to update chat when image is uploaded from canvas
  $: if ($imageStore.currentImage && 
        $imageStore.currentImage.prompt === 'Uploaded image' && // Only trigger for uploaded images
        !messages.some(m => 
          m.images?.some(img => 
            img === $imageStore.currentImage?.imageUrl || 
            img === $imageStore.currentImage?.thumbnail
          )
        )
      ) {
    // Add system message about upload
    chatStore.addMessage({
      type: 'system',
      text: 'Image uploaded successfully. You can now edit the image using text prompts.',
      timestamp: new Date()
    });

    // Add user message with the uploaded image
    chatStore.addMessage({
      type: 'user',
      text: 'Uploaded an image',
      timestamp: new Date(),
      images: [$imageStore.currentImage.imageUrl]
    });

    // Scroll to bottom
    scrollToBottom();
  }

  // Handle file upload
  async function handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    try {
      // Convert file to base64
      const base64Image = await fileToBase64(file);
      
      // Create a new image in the imageStore
      const timestamp = new Date();
      const imageId = `img-${timestamp.getTime()}`;
      const newImage = {
        id: imageId,
        userId: '1',
        prompt: 'Uploaded image',
        imageUrl: base64Image,
        thumbnail: base64Image,
        status: 'completed' as const,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'jpeg',
          size: base64Image.length
        },
        versions: [
          {
            id: `v-${timestamp.getTime()}`,
            imageId,
            prompt: 'Initial upload',
            imageUrl: base64Image,
            createdAt: timestamp
          }
        ]
      };

      // Update imageStore
      imageStore.setCurrentImage(newImage);
      
      // Clear the input
      input.value = '';
      
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload image');
    }
  }

  // Handle image selection from chat
  function handleImageClick(image: string, message: ChatMessage) {
    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    
    if (!$imageStore.currentImage) {
      // If no current image, create a new one
      const timestamp = new Date();
      const imageId = `img-${timestamp.getTime()}`;
      const newImage = {
        id: imageId,
        userId: '1',
        prompt: message.text,
        imageUrl: imageUrl,
        thumbnail: imageUrl,
        status: 'completed' as const,
        createdAt: timestamp,
        updatedAt: timestamp,
        metadata: {
          width: 1024,
          height: 1024,
          format: 'jpeg',
          size: typeof image === 'string' ? image.length : 0
        },
        versions: [
          {
            id: `v-${timestamp.getTime()}`,
            imageId,
            prompt: message.text,
            imageUrl: imageUrl,
            createdAt: timestamp
          }
        ]
      };
      imageStore.setCurrentImage(newImage);
    } else {
      // Check if this exact image URL already exists in versions
      const existingVersion = $imageStore.currentImage.versions.find(v => v.imageUrl === imageUrl);
      
      if (existingVersion) {
        // If the version already exists, just select it
        imageStore.selectVersion(existingVersion);
      } else {
        // Add as a new version if it doesn't exist
        const timestamp = new Date();
        const newVersion = {
          id: `v-${timestamp.getTime()}`,
          imageId: $imageStore.currentImage.id,
          prompt: message.text,
          imageUrl: imageUrl,
          createdAt: timestamp
        };
        imageStore.addVersion(newVersion);
      }
    }
    
    // Update UI store with the correct format
    uiStore.setSelectedImage(imageUrl);
  }

  // Handle image download
  function downloadImage(image: string, message: ChatMessage) {
    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const promptSnippet = message.text.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `vide-edit-${promptSnippet}-${timestamp}.jpg`;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Image downloaded successfully');
  }
</script>

<div class="flex flex-col h-full" style="background-color: var(--ps-secondary);">
  <!-- Model selector -->
  <ModelSelector />
  
  <!-- Chat messages -->
  <div 
    class="flex-1 overflow-y-auto p-3 space-y-3 relative" 
    bind:this={chatContainer}
  >
    {#each messages as message}
      <div class="flex {message.type === 'user' ? 'justify-end' : 'justify-start'}">
        <div 
          class="{message.type === 'system' ? 'max-w-full w-full' : 'max-w-[85%]'} rounded px-3 py-2 shadow-md relative {message.type === 'system' ? 'system-message' : ''}" 
          style="
            background-color: {
              message.type === 'user' 
                ? 'var(--ps-accent)' 
                : message.type === 'system' 
                  ? 'transparent' 
                  : 'var(--ps-panel)'
            };
            border: {message.type === 'system' ? '1px solid var(--ps-border)' : 'none'};
            border-radius: var(--ps-border-radius);
            box-shadow: {message.type === 'system' ? 'none' : 'var(--ps-shadow)'};
          "
        >
          <div 
            class="text-xs prose dark:prose-invert {message.type === 'system' ? 'system-text' : ''}" 
            style="
              color: {
                message.type === 'system' 
                  ? 'var(--ps-text-secondary)' 
                  : 'var(--ps-text)'
              };
              font-style: {message.type === 'system' ? 'italic' : 'normal'};
              opacity: {message.type === 'system' ? '0.8' : '1'};
            "
          >
            <SvelteMarkdown source={message.text} />
          </div>
          
          {#if message.images && message.images.length > 0}
            <div class="mt-2 space-y-2">
              {#each message.images as image}
                <div class="relative bg-[#1a1a1a] rounded overflow-hidden">
                  <div class="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30 pointer-events-none"></div>
                  <img 
                    src={image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`}
                    alt="Generated or Uploaded" 
                    class="max-w-full w-full rounded cursor-pointer hover:opacity-90 transition-opacity relative z-10"
                    style="border-radius: var(--ps-border-radius);"
                    on:click={() => handleImageClick(image, message)}
                  />
                  <button
                    class="absolute top-2 right-2 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 z-20"
                    style="border-radius: var(--ps-border-radius);"
                    on:click|stopPropagation={() => downloadImage(image, message)}
                    title="Download image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          {/if}
          
          <p class="text-[10px] opacity-70 mt-1 text-right" style="color: var(--ps-text);">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    {/each}

    <!-- Mobile Upload Button -->
    <button
      class="md:hidden fixed bottom-20 right-4 p-3 rounded-full shadow-lg z-10 transition-all duration-200 hover:scale-105"
      style="background-color: var(--ps-accent);"
      on:click={() => document.getElementById('mobile-file-input')?.click()}
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
    </button>

    <!-- Hidden file input -->
    <input
      type="file"
      id="mobile-file-input"
      accept="image/*"
      class="hidden"
      on:change={handleFileUpload}
    />
  </div>
  
  <!-- Input form with enhanced styling -->
  <div class="p-3 border-t" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
    <form on:submit={handleSubmit} class="flex items-center gap-2">
      <div class="flex-grow relative">
        <input
          type="text"
          bind:value={prompt}
          bind:this={inputElement}
          placeholder={$uiStore.selectedModel === 'gemini-2.0-flash-exp-image-generation' 
            ? "Describe the image you want to generate..." 
            : $uiStore.selectedImage 
              ? isEditingImage 
                ? "Continue editing the image..." 
                : "Describe how to edit the image..." 
              : "Ask a question or describe what you want..."}
          class="w-full py-2.5 px-4 text-sm focus:outline-none focus:ring-2 transition-all duration-200"
          style="
            background-color: var(--ps-panel);
            border: 1px solid var(--ps-border);
            border-radius: var(--ps-border-radius);
            color: var(--ps-text);
          "
          disabled={isGenerating}
          on:keydown={handleKeydown}
        />
        {#if isGenerating}
          <div class="absolute right-3 top-1/2 -translate-y-1/2">
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        {/if}
      </div>
      <button
        type="submit"
        class="p-2.5 rounded flex items-center justify-center transition-all duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px]"
        style="
          background-color: var(--ps-accent);
          border-radius: var(--ps-border-radius);
        "
        disabled={isGenerating || !prompt.trim()}
      >
        {#if isGenerating}
          <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        {/if}
      </button>
    </form>
    
    {#if isEditingImage && conversationHistory.length > 0}
      <div class="mt-2 text-xs opacity-70 text-center" style="color: var(--ps-text);">
        Continuing image editing conversation ({conversationHistory.length / 2} exchanges)
      </div>
    {/if}
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
    box-shadow: 0 0 0 2px var(--ps-accent);
  }
  
  /* Disabled state */
  input:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    background-color: var(--ps-secondary);
  }
  
  /* Input hover state */
  input:not(:disabled):hover {
    border-color: var(--ps-accent);
    background-color: color-mix(in srgb, var(--ps-panel) 95%, var(--ps-accent));
  }
  
  :global(.prose) {
    max-width: none;
    font-size: 0.85em;
  }
  
  :global(.prose pre) {
    background-color: var(--ps-panel);
    border-radius: var(--ps-border-radius);
    font-size: 0.9em;
  }
  
  :global(.prose code) {
    background-color: var(--ps-panel);
    border-radius: var(--ps-border-radius);
    padding: 0.2em 0.4em;
    font-size: 0.9em;
  }

  .system-message {
    background: linear-gradient(
      to right,
      rgba(var(--ps-border-rgb), 0.05),
      rgba(var(--ps-border-rgb), 0.1)
    );
    backdrop-filter: blur(8px);
  }

  .system-text {
    font-size: 0.8em;
    line-height: 1.4;
  }

  /* Mobile upload button styles */
  button:active {
    transform: scale(0.95);
  }

  :global(.prose img) {
    margin: 0;
    border-radius: var(--ps-border-radius);
    background-color: #1a1a1a;
  }
</style> 