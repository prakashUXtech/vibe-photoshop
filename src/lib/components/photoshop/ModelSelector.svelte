<!--
  ModelSelector.svelte
  Allows users to select different Gemini models and configurations
-->
<script lang="ts">
  import { uiStore } from '$lib/stores/uiStore';
  import { onMount } from 'svelte';

  const models = [
    { 
      id: 'gemini-2.0-flash-exp-image-generation',
      name: 'Gemini 2.0 Flash Image Generation',
      description: 'Best for generating images'
    },
    { 
      id: 'models/gemini-2.0-flash-exp',
      name: 'Gemini 2.0 Flash (Experimental)',
      description: 'Fast image generation and editing'
    },
    { 
      id: 'models/gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Balanced performance and quality'
    }
  ];

  // Subscribe to store changes
  let selectedModel: string;
  let unsubscribe = uiStore.subscribe(state => {
    selectedModel = state.selectedModel;
  });

  onMount(() => {
    // If no model is selected, set the default
    if (!selectedModel) {
      uiStore.setSelectedModel(models[0].id);
    }
    return unsubscribe;
  });
</script>

<div class="p-3 border-b" style="border-color: var(--ps-border);">
  <label class="text-xs font-medium block mb-1" style="color: var(--ps-text);">Model</label>
  <select
    class="w-full py-1.5 px-2 text-sm rounded appearance-none"
    style="
      background-color: var(--ps-panel);
      color: var(--ps-text);
      border: 1px solid var(--ps-border);
      border-radius: var(--ps-border-radius);
    "
    bind:value={selectedModel}
    on:change={(e) => uiStore.setSelectedModel(e.currentTarget.value)}
  >
    {#each models as model}
      <option value={model.id}>
        {model.name}
      </option>
    {/each}
  </select>
  {#if selectedModel}
    <p class="text-xs mt-1 opacity-70" style="color: var(--ps-text);">
      {models.find(m => m.id === selectedModel)?.description}
    </p>
  {/if}
</div>

<style>
  /* Custom dropdown arrow */
  select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
  }

  /* Remove default focus outline and add custom one */
  select:focus {
    outline: none;
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }

  /* Style for disabled state */
  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style> 