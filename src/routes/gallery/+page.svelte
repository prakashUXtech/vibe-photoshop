<!-- Gallery page - Apple-inspired minimalist design -->
<script lang="ts">
  import { mockImages } from '$lib/stores/mockData';
  import type { Image } from '$lib/types';
  import { browser } from '$app/environment';
  
  let searchQuery = '';
  let selectedImage: Image | null = null;
  
  // Filtered images for gallery view
  $: filteredImages = mockImages
    .filter(image => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return image.prompt.toLowerCase().includes(query);
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by newest first
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  
  // Select an image to view details
  function selectImage(image: Image) {
    selectedImage = image;
  }
  
  // Close the image detail view
  function closeDetail() {
    selectedImage = null;
  }
  
  // Download the selected image
  function downloadImage() {
    if (selectedImage && browser) {
      const link = document.createElement('a');
      link.href = selectedImage.imageUrl;
      link.download = `vibe-photoshop-${selectedImage.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
</script>

<div class="flex-1 flex flex-col">
  <main class="flex-1 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Search and filter controls -->
      <div class="mb-8">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search by prompt..."
            class="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-transparent sm:text-sm"
          />
        </div>
      </div>
      
      <!-- Gallery header -->
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-medium text-gray-900">Your Images</h2>
        <a 
          href="/"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New
        </a>
      </div>
      
      <!-- Gallery grid -->
      {#if filteredImages.length === 0}
        <div class="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900">No images found</h3>
          <p class="mt-1 text-gray-500">
            {searchQuery ? 'Try adjusting your search' : 'Create your first image to get started'}
          </p>
          {#if searchQuery}
            <button 
              on:click={() => searchQuery = ''}
              class="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear search
            </button>
          {:else}
            <a 
              href="/"
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create New Image
            </a>
          {/if}
        </div>
      {:else}
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {#each filteredImages as image}
            <div>
              <button 
                class="w-full text-left cursor-pointer"
                on:click={() => selectImage(image)}
                aria-label={`View image: ${image.prompt}`}
              >
                <div class="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden bg-gray-100">
                  <img 
                    src={image.imageUrl} 
                    alt={image.prompt}
                    class="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div class="mt-2">
                  <p class="text-sm text-gray-900 truncate">{image.prompt}</p>
                  <p class="text-xs text-gray-500">{new Date(image.createdAt).toLocaleDateString()}</p>
                </div>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>

<!-- Image detail modal -->
{#if selectedImage}
  <div class="fixed inset-0 bg-black/50 z-50" on:click={closeDetail} role="dialog" aria-modal="true">
    <div 
      class="fixed inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto"
      on:click|stopPropagation
    >
      <div class="bg-white rounded-2xl shadow-xl">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-medium text-gray-900">{selectedImage.prompt}</h2>
              <p class="text-sm text-gray-500">{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="flex space-x-2">
              <button 
                on:click={downloadImage}
                class="p-2 rounded-full hover:bg-gray-100"
                title="Download"
                aria-label="Download Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <a 
                href="/"
                class="p-2 rounded-full hover:bg-gray-100"
                title="Edit"
                aria-label="Edit in Studio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </a>
              <button 
                on:click={closeDetail}
                class="p-2 rounded-full hover:bg-gray-100"
                title="Close"
                aria-label="Close Modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-xl overflow-hidden">
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.prompt}
              class="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
          </div>
          
          <!-- Version history -->
          {#if selectedImage.versions && selectedImage.versions.length > 1}
            <div class="mt-6">
              <h3 class="text-sm font-medium text-gray-900 mb-4">Version History</h3>
              <div class="flex space-x-4 overflow-x-auto pb-2">
                {#each selectedImage.versions as version}
                  <div class="flex-shrink-0">
                    <div class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img src={version.imageUrl} alt={version.prompt} class="w-full h-full object-cover" />
                    </div>
                    <p class="mt-1 text-xs text-gray-500 truncate w-24">{new Date(version.createdAt).toLocaleDateString()}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <div class="mt-6 flex justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">Prompt</h3>
              <p class="mt-1 text-sm text-gray-500">{selectedImage.prompt}</p>
            </div>
            <div class="flex space-x-2">
              <a 
                href="/"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Edit in Studio
              </a>
              <button 
                on:click={downloadImage}
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if} 