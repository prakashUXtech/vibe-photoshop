<!--
  SettingsPanel.svelte
  This component provides a user interface for configuring application settings.
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { uiStore } from '$lib/stores';
  import { userService } from '$lib/services/api';
  import { toast } from '$lib/stores/toastStore';
  import type { Theme } from '$lib/stores/uiStore';

  let apiKey = '';
  let isLoading = false;
  let showApiKey = false;
  let mounted = false;

  // Theme options
  const themes: Array<{value: Theme, label: string}> = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  let selectedTheme: Theme = 'system';

  onMount(async () => {
    mounted = true;
    selectedTheme = $uiStore.theme;
    
    if (browser) {
      try {
        isLoading = true;
        const key = await userService.getUserApiKey();
        apiKey = key || '';
      } catch (error) {
        console.error('Failed to load API key:', error);
        toast.error('Failed to load settings');
      } finally {
        isLoading = false;
      }
    }
  });

  async function saveSettings() {
    if (!browser) return;
    
    try {
      isLoading = true;
      
      // Save API key
      await userService.saveUserApiKey(apiKey);
      
      // Save theme
      uiStore.setTheme(selectedTheme);
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      isLoading = false;
    }
  }

  function handleThemeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedTheme = target.value as Theme;
  }
</script>

<div class="settings-panel">
  <h2 class="text-xl font-semibold mb-6">Settings</h2>
  
  <div class="space-y-6">
    <!-- API Key Section -->
    <div class="setting-group">
      <h3 class="text-lg font-medium mb-2">API Configuration</h3>
      <div class="mb-4">
        <label for="apiKey" class="block text-sm font-medium mb-1">
          Gemini API Key
        </label>
        <div class="flex">
          <input
            type={showApiKey ? 'text' : 'password'}
            id="apiKey"
            bind:value={apiKey}
            placeholder="Enter your Gemini API key"
            class="flex-1 px-3 py-2 border rounded-l-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            class="px-3 py-2 border border-l-0 rounded-r-md bg-gray-100 hover:bg-gray-200 transition-colors"
            on:click={() => (showApiKey = !showApiKey)}
            aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {#if showApiKey}
              <span class="text-xs">Hide</span>
            {:else}
              <span class="text-xs">Show</span>
            {/if}
          </button>
        </div>
        {#if !apiKey}
          <div class="mt-2 mb-1">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              class="text-blue-500 hover:text-blue-600 text-xs flex items-center"
            >
              <span class="opacity-80">Need a key?</span>
              <span class="ml-1 font-medium">Get one from Google AI Studio →</span>
            </a>
          </div>
        {/if}
        <p class="text-xs text-gray-500 mt-1">
          Your API key is stored locally and never sent to our servers.
        </p>
      </div>
    </div>

    <!-- Theme Section -->
    <div class="setting-group">
      <h3 class="text-lg font-medium mb-2">Appearance</h3>
      <div class="mb-4">
        <label for="theme" class="block text-sm font-medium mb-1">
          Theme
        </label>
        <select
          id="theme"
          value={selectedTheme}
          on:change={handleThemeChange}
          class="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {#each themes as theme}
            <option value={theme.value}>{theme.label}</option>
          {/each}
        </select>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-8">
      <button
        type="button"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={saveSettings}
        disabled={isLoading}
      >
        {#if isLoading}
          Saving...
        {:else}
          Save Settings
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .settings-panel {
    padding: 1.5rem;
    height: 100%;
    overflow-y: auto;
  }

  .setting-group {
    padding: 1rem;
    border: 1px solid var(--ps-border);
    border-radius: 0.375rem;
    background-color: var(--ps-panel-bg);
  }

  /* Ensure inputs have proper colors in dark mode */
  :global(.dark) input,
  :global(.dark) select {
    background-color: var(--ps-input-bg);
    color: var(--ps-text);
    border-color: var(--ps-border);
  }
  
  :global(.dark) button[type="button"]:not(.bg-blue-600) {
    background-color: var(--ps-button-bg);
    color: var(--ps-text);
    border-color: var(--ps-border);
  }
</style> 