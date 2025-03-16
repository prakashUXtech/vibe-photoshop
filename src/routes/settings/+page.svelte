<!-- Settings page -->
<script lang="ts">
  import { mockUser } from '$lib/stores/mockData';
  
  let apiKey = '••••••••••••••••';
  let showApiKey = false;
  let notificationEmail = mockUser.email;
  let theme = 'light';
  let autoSave = true;
  let maxVersions = '10';
  let isSaving = false;
  let successMessage = '';
  let errorMessage = '';
  
  // Mock save settings
  async function saveSettings() {
    isSaving = true;
    errorMessage = '';
    successMessage = '';
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      successMessage = 'Settings saved successfully';
    } catch (err) {
      errorMessage = 'Failed to save settings. Please try again.';
      console.error('Settings error:', err);
    } finally {
      isSaving = false;
    }
  }
  
  function toggleApiKey() {
    showApiKey = !showApiKey;
  }
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
      Settings
    </h2>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mt-8">
      <div class="space-y-6">
        <!-- API Key section -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              API Key
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Your Google Gemini API key for image generation.</p>
            </div>
            <div class="mt-5">
              <div class="flex space-x-4">
                <div class="flex-grow">
                  <label for="api-key" class="sr-only">API Key</label>
                  <div class="mt-1 flex rounded-md shadow-sm">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      name="api-key"
                      id="api-key"
                      value={apiKey}
                      class="flex-1 min-w-0 block w-full px-3 py-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                      placeholder="Enter your API key"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  on:click={toggleApiKey}
                  class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification settings -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Notifications
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Manage your notification preferences.</p>
            </div>
            <div class="mt-5">
              <label for="email" class="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                bind:value={notificationEmail}
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Appearance settings -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Appearance
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Customize the look and feel of the application.</p>
            </div>
            <div class="mt-5">
              <label for="theme" class="block text-sm font-medium text-gray-700">
                Theme
              </label>
              <select
                id="theme"
                name="theme"
                bind:value={theme}
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Image settings -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Image Settings
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Configure image generation and storage settings.</p>
            </div>
            <div class="mt-5 space-y-6">
              <div class="flex items-start">
                <div class="flex items-center h-5">
                  <input
                    id="auto-save"
                    name="auto-save"
                    type="checkbox"
                    bind:checked={autoSave}
                    class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                </div>
                <div class="ml-3 text-sm">
                  <label for="auto-save" class="font-medium text-gray-700">Auto-save versions</label>
                  <p class="text-gray-500">Automatically save image versions when editing</p>
                </div>
              </div>

              <div>
                <label for="max-versions" class="block text-sm font-medium text-gray-700">
                  Maximum versions per image
                </label>
                <select
                  id="max-versions"
                  name="max-versions"
                  bind:value={maxVersions}
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="5">5 versions</option>
                  <option value="10">10 versions</option>
                  <option value="20">20 versions</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Save button -->
        <div class="flex justify-end">
          {#if successMessage}
            <p class="mr-4 text-sm text-green-600">{successMessage}</p>
          {/if}
          {#if errorMessage}
            <p class="mr-4 text-sm text-red-600">{errorMessage}</p>
          {/if}
          <button
            type="button"
            on:click={saveSettings}
            disabled={isSaving}
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {#if isSaving}
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            {:else}
              Save Settings
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
</div> 