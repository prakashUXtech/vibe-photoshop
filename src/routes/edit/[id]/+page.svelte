<!-- Image editor page -->
<script lang="ts">
  import { page } from '$app/stores';
  import { mockImages } from '$lib/stores/mockData';
  import type { Image, ImageVersion } from '$lib/types';
  
  // Get image ID from route params
  const imageId = $page.params.id;
  
  // Find image from mock data
  const image = mockImages.find(img => img.id === imageId);
  
  // Mock versions
  let versions: ImageVersion[] = [
    {
      id: '1',
      imageId: imageId || '',
      imageUrl: image?.imageUrl || '',
      prompt: image?.prompt || '',
      createdAt: image?.createdAt || new Date(),
      parentVersionId: undefined
    },
    {
      id: '2',
      imageId: imageId || '',
      imageUrl: image?.imageUrl || '',
      prompt: 'Make the colors more vibrant',
      createdAt: new Date(Date.now() - 3600000),
      parentVersionId: '1'
    }
  ];
  
  let editPrompt = '';
  let isEditing = false;
  let error = '';
  let activeVersion = versions[0];
  
  // Mock image editing
  async function editImage() {
    if (!editPrompt.trim()) {
      error = 'Please enter an edit prompt';
      return;
    }
    
    error = '';
    isEditing = true;
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create new version
      const newVersion: ImageVersion = {
        id: String(versions.length + 1),
        imageId: imageId || '',
        imageUrl: image?.imageUrl || '',
        prompt: editPrompt,
        createdAt: new Date(),
        parentVersionId: activeVersion.id
      };
      
      // Add new version to the beginning of the array
      versions = [newVersion, ...versions];
      activeVersion = newVersion;
      editPrompt = '';
    } catch (err) {
      error = 'Failed to edit image. Please try again.';
      console.error('Edit error:', err);
    } finally {
      isEditing = false;
    }
  }
  
  function setActiveVersion(version: ImageVersion) {
    activeVersion = version;
  }
  
  // Example edit prompts
  const exampleEdits = [
    'Make it more vibrant',
    'Add a vintage filter',
    'Increase contrast',
    'Make it more dramatic'
  ];
  
  function useExampleEdit(example: string) {
    editPrompt = example;
  }
</script>

<div class="py-6">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="md:flex md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Edit Image
        </h2>
      </div>
      <div class="mt-4 flex md:mt-0 md:ml-4">
        <a
          href="/gallery"
          class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Gallery
        </a>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <!-- Image preview and versions -->
      <div class="space-y-6">
        <!-- Current version preview -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <div class="aspect-w-10 aspect-h-7">
              {#if isEditing}
                <div class="rounded-lg bg-gray-100 flex items-center justify-center">
                  <div class="text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="mt-2 text-sm text-gray-500">Applying edits...</p>
                  </div>
                </div>
              {:else}
                <img
                  src={activeVersion.imageUrl}
                  alt={activeVersion.prompt}
                  class="w-full h-full object-cover rounded-lg shadow-lg"
                />
              {/if}
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-500">{activeVersion.prompt}</p>
              <p class="mt-1 text-xs text-gray-400">
                {new Date(activeVersion.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <!-- Version history -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Version History
            </h3>
            <div class="mt-4 space-y-4">
              {#each versions as version}
                <button
                  class="w-full text-left px-4 py-3 rounded-lg {activeVersion.id === version.id ? 'bg-indigo-50 border-2 border-indigo-500' : 'hover:bg-gray-50 border border-gray-200'}"
                  on:click={() => setActiveVersion(version)}
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-medium text-gray-900">
                        {version.prompt}
                      </p>
                      <p class="text-xs text-gray-500">
                        {new Date(version.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {#if activeVersion.id === version.id}
                      <svg class="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Edit controls -->
      <div class="space-y-6">
        <!-- Edit form -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Edit Image
            </h3>
            <div class="mt-2 max-w-xl text-sm text-gray-500">
              <p>Describe how you want to modify the image.</p>
            </div>
            <form class="mt-5 space-y-4" on:submit|preventDefault={editImage}>
              <div>
                <label for="editPrompt" class="sr-only">Edit prompt</label>
                <textarea
                  id="editPrompt"
                  name="editPrompt"
                  rows="4"
                  bind:value={editPrompt}
                  class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Enter your edit instructions..."
                />
              </div>
              {#if error}
                <div class="text-red-600 text-sm">{error}</div>
              {/if}
              <button
                type="submit"
                disabled={isEditing}
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {#if isEditing}
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Applying...
                {:else}
                  Apply Edit
                {/if}
              </button>
            </form>
          </div>
        </div>

        <!-- Example edits -->
        <div class="bg-white shadow sm:rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Example edits
            </h3>
            <div class="mt-4 space-y-3">
              {#each exampleEdits as example}
                <button
                  on:click={() => useExampleEdit(example)}
                  class="text-left w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
                >
                  {example}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div> 