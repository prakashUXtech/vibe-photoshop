<!-- Gallery page - Photoshop-inspired design -->
<script lang="ts">
  import { mockImages } from '$lib/stores/mockData';
  import type { Image } from '$lib/types';
  import { browser } from '$app/environment';
  
  let searchQuery = '';
  let selectedImage: Image | null = null;
  let viewMode = 'grid'; // 'grid' or 'list'
  
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
  
  // Toggle view mode
  function toggleViewMode() {
    viewMode = viewMode === 'grid' ? 'list' : 'grid';
  }
</script>

<div class="flex-1 flex flex-col bg-gray-900 text-gray-200">
  <!-- Top menu bar (Photoshop-style) -->
  <div class="bg-gray-800 border-b border-gray-700 py-1 px-4 flex items-center">
    <div class="flex space-x-4 text-xs">
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">File</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Edit</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">View</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Window</div>
      <div class="px-2 py-1 hover:bg-gray-700 cursor-pointer">Help</div>
    </div>
  </div>

  <main class="flex-1 py-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Gallery toolbar -->
      <div class="bg-gray-800 rounded-t-md border border-gray-700 p-3 mb-1">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by prompt..."
                class="block w-64 pl-10 pr-3 py-1.5 border border-gray-600 rounded bg-gray-700 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button 
              on:click={toggleViewMode}
              class="p-1.5 rounded hover:bg-gray-700"
              title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              aria-label={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
            >
              {#if viewMode === 'grid'}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              {/if}
            </button>
          </div>
          
          <div>
            <a 
              href="/"
              class="inline-flex items-center px-3 py-1.5 border border-gray-600 rounded text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              New Image
            </a>
          </div>
        </div>
      </div>
      
      <!-- Gallery content -->
      <div class="bg-gray-800 rounded-b-md border border-t-0 border-gray-700 p-4">
        <!-- Gallery header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-300">Your Images</h2>
          <div class="text-xs text-gray-500">{filteredImages.length} items</div>
        </div>
        
        <!-- Gallery grid -->
        {#if filteredImages.length === 0}
          <div class="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium text-gray-300">No images found</h3>
            <p class="mt-1 text-gray-500">
              {searchQuery ? 'Try adjusting your search' : 'Create your first image to get started'}
            </p>
            {#if searchQuery}
              <button 
                on:click={() => searchQuery = ''}
                class="mt-4 text-sm text-gray-500 hover:text-gray-300"
              >
                Clear search
              </button>
            {:else}
              <a 
                href="/"
                class="mt-4 inline-flex items-center px-4 py-2 border border-gray-600 rounded text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                Create New Image
              </a>
            {/if}
          </div>
        {:else if viewMode === 'grid'}
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {#each filteredImages as image}
              <div>
                <button 
                  class="w-full text-left cursor-pointer"
                  on:click={() => selectImage(image)}
                  aria-label={`View image: ${image.prompt}`}
                >
                  <div class="aspect-w-1 aspect-h-1 rounded overflow-hidden bg-gray-700 border border-gray-600">
                    <div class="relative">
                      <img 
                        src={image.imageUrl} 
                        alt={image.prompt}
                        class="w-full h-full object-cover"
                      />
                      <!-- Checkerboard pattern for transparency -->
                      <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
                    </div>
                  </div>
                  <div class="mt-2">
                    <p class="text-sm text-gray-300 truncate">{image.prompt}</p>
                    <p class="text-xs text-gray-500">{new Date(image.createdAt).toLocaleDateString()}</p>
                  </div>
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <div class="border border-gray-700 rounded overflow-hidden">
            <table class="min-w-full divide-y divide-gray-700">
              <thead class="bg-gray-700">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Preview</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Prompt</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Versions</th>
                  <th scope="col" class="relative px-4 py-2"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="bg-gray-800 divide-y divide-gray-700">
                {#each filteredImages as image}
                  <tr class="hover:bg-gray-700 cursor-pointer" on:click={() => selectImage(image)}>
                    <td class="px-4 py-2 whitespace-nowrap">
                      <div class="w-12 h-12 rounded overflow-hidden bg-gray-700 border border-gray-600">
                        <div class="relative h-full">
                          <img src={image.thumbnail} alt={image.prompt} class="w-full h-full object-cover" />
                          <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap">
                      <div class="text-sm text-gray-300 truncate max-w-xs">{image.prompt}</div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {image.versions ? image.versions.length : 1}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <a href="/" class="text-blue-400 hover:text-blue-300">Edit</a>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      </div>
    </div>
  </main>
</div>

<!-- Image detail modal -->
{#if selectedImage}
  <div class="fixed inset-0 bg-black/70 z-50" on:click={closeDetail} role="dialog" aria-modal="true">
    <div 
      class="fixed inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto"
      on:click|stopPropagation
    >
      <div class="bg-gray-800 rounded-md shadow-xl border border-gray-700">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-medium text-gray-300">{selectedImage.prompt}</h2>
              <p class="text-sm text-gray-500">{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="flex space-x-2">
              <button 
                on:click={downloadImage}
                class="p-2 rounded hover:bg-gray-700"
                title="Download"
                aria-label="Download Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <a 
                href="/"
                class="p-2 rounded hover:bg-gray-700"
                title="Edit"
                aria-label="Edit in Studio"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </a>
              <button 
                on:click={closeDetail}
                class="p-2 rounded hover:bg-gray-700"
                title="Close"
                aria-label="Close Modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="bg-gray-700 rounded overflow-hidden relative">
            <img 
              src={selectedImage.imageUrl} 
              alt={selectedImage.prompt}
              class="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
            <!-- Checkerboard pattern for transparency -->
            <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
          </div>
          
          <!-- Version history -->
          {#if selectedImage.versions && selectedImage.versions.length > 1}
            <div class="mt-6 bg-gray-700 p-4 rounded border border-gray-600">
              <h3 class="text-sm font-medium text-gray-300 mb-4">Version History</h3>
              <div class="flex space-x-4 overflow-x-auto pb-2">
                {#each selectedImage.versions as version}
                  <div class="flex-shrink-0">
                    <div class="w-24 h-24 rounded overflow-hidden bg-gray-600 border border-gray-500 relative">
                      <img src={version.imageUrl} alt={version.prompt} class="w-full h-full object-cover" />
                      <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
                    </div>
                    <p class="mt-1 text-xs text-gray-400 truncate w-24">{new Date(version.createdAt).toLocaleDateString()}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          
          <div class="mt-6 flex justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-300">Prompt</h3>
              <p class="mt-1 text-sm text-gray-400">{selectedImage.prompt}</p>
            </div>
            <div class="flex space-x-2">
              <a 
                href="/"
                class="inline-flex items-center px-4 py-2 border border-gray-600 rounded text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600"
              >
                Edit in Studio
              </a>
              <button 
                on:click={downloadImage}
                class="inline-flex items-center px-4 py-2 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
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

<style>
  /* Checkerboard pattern for transparency */
  .bg-checkerboard {
    background-image: 
      linear-gradient(45deg, #666 25%, transparent 25%), 
      linear-gradient(-45deg, #666 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #666 75%),
      linear-gradient(-45deg, transparent 75%, #666 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: #888;
  }
</style> 