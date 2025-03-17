<!-- Gallery page - Photoshop-inspired design -->
<script lang="ts">
  import { mockImages } from '$lib/stores/mockData';
  import type { Image } from '$lib/types';
  import { browser } from '$app/environment';
  import { psTheme } from '$lib/stores/themeStore';
  
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

<div class="flex-1 flex flex-col h-full" style="background-color: var(--ps-primary); color: var(--ps-text);">
  <main class="flex-1 py-6 overflow-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Gallery toolbar -->
      <div class="rounded-t-md border p-3 mb-1" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search by prompt..."
                class="search-input block w-64 pl-10 pr-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-1"
                style="
                  background-color: var(--ps-panel);
                  border-color: var(--ps-border);
                  border-radius: var(--ps-border-radius);
                  color: var(--ps-text);
                "
              />
            </div>
            
            <button 
              on:click={toggleViewMode}
              class="p-1.5 rounded hover:opacity-80"
              title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              aria-label={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
              style="background-color: var(--ps-button); border-radius: var(--ps-border-radius);"
            >
              {#if viewMode === 'grid'}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              {/if}
            </button>
          </div>
          
          <div>
            <a 
              href="/"
              class="inline-flex items-center px-3 py-1.5 border rounded text-sm font-medium hover:opacity-80"
              style="
                background-color: var(--ps-button);
                border-color: var(--ps-border);
                border-radius: var(--ps-border-radius);
              "
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
      <div class="rounded-b-md border border-t-0 p-4" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
        <!-- Gallery header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Your Images</h2>
          <div class="text-xs opacity-50">{filteredImages.length} items</div>
        </div>
        
        <!-- Gallery grid -->
        {#if filteredImages.length === 0}
          <div class="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 class="text-lg font-medium">No images found</h3>
            <p class="mt-1 opacity-50">
              {searchQuery ? 'Try adjusting your search' : 'Create your first image to get started'}
            </p>
            {#if searchQuery}
              <button 
                on:click={() => searchQuery = ''}
                class="mt-4 text-sm opacity-50 hover:opacity-100"
              >
                Clear search
              </button>
            {:else}
              <a 
                href="/"
                class="mt-4 inline-flex items-center px-4 py-2 border rounded text-sm font-medium hover:opacity-80"
                style="
                  background-color: var(--ps-button);
                  border-color: var(--ps-border);
                  border-radius: var(--ps-border-radius);
                "
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
                  <div class="aspect-w-1 aspect-h-1 rounded overflow-hidden border" 
                    style="
                      background-color: var(--ps-panel);
                      border-color: var(--ps-border);
                      border-radius: var(--ps-border-radius);
                    "
                  >
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
                    <p class="text-sm truncate">{image.prompt}</p>
                    <p class="text-xs opacity-50">{new Date(image.createdAt).toLocaleDateString()}</p>
                  </div>
                </button>
              </div>
            {/each}
          </div>
        {:else}
          <div class="border rounded overflow-hidden" style="border-color: var(--ps-border); border-radius: var(--ps-border-radius);">
            <table class="min-w-full divide-y" style="border-color: var(--ps-border);">
              <thead style="background-color: var(--ps-panel);">
                <tr>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider opacity-70">Preview</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider opacity-70">Prompt</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider opacity-70">Date</th>
                  <th scope="col" class="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider opacity-70">Versions</th>
                  <th scope="col" class="relative px-4 py-2"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
                {#each filteredImages as image}
                  <tr class="hover:opacity-80 cursor-pointer" on:click={() => selectImage(image)}>
                    <td class="px-4 py-2 whitespace-nowrap">
                      <div class="w-12 h-12 rounded overflow-hidden border" 
                        style="
                          background-color: var(--ps-panel);
                          border-color: var(--ps-border);
                          border-radius: var(--ps-border-radius);
                        "
                      >
                        <div class="relative h-full">
                          <img src={image.thumbnail} alt={image.prompt} class="w-full h-full object-cover" />
                          <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap">
                      <div class="text-sm truncate max-w-xs">{image.prompt}</div>
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm opacity-50">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-sm opacity-50">
                      {image.versions ? image.versions.length : 1}
                    </td>
                    <td class="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                      <a href="/" style="color: var(--ps-accent);" class="hover:opacity-80">Edit</a>
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
  <div class="fixed inset-0 z-50" style="background-color: rgba(0,0,0,0.7);" on:click={closeDetail} role="dialog" aria-modal="true">
    <div 
      class="fixed inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-auto"
      on:click|stopPropagation
    >
      <div class="rounded-md shadow-xl border" style="background-color: var(--ps-secondary); border-color: var(--ps-border); border-radius: var(--ps-border-radius); box-shadow: var(--ps-shadow);">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-xl font-medium">{selectedImage.prompt}</h2>
              <p class="text-sm opacity-50">{new Date(selectedImage.createdAt).toLocaleDateString()}</p>
            </div>
            <div class="flex space-x-2">
              <button 
                on:click={downloadImage}
                class="p-2 rounded hover:opacity-80"
                title="Download"
                aria-label="Download Image"
                style="background-color: var(--ps-button); border-radius: var(--ps-border-radius);"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
              <a 
                href="/"
                class="p-2 rounded hover:opacity-80"
                title="Edit"
                aria-label="Edit in Studio"
                style="background-color: var(--ps-button); border-radius: var(--ps-border-radius);"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </a>
              <button 
                on:click={closeDetail}
                class="p-2 rounded hover:opacity-80"
                title="Close"
                aria-label="Close Detail View"
                style="background-color: var(--ps-button); border-radius: var(--ps-border-radius);"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-70" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row gap-6">
            <div class="flex-1">
              <div class="relative rounded overflow-hidden shadow-lg" style="background-color: var(--ps-panel); box-shadow: var(--ps-shadow); border-radius: var(--ps-border-radius);">
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.prompt}
                  class="w-full h-auto max-h-[70vh] object-contain"
                />
                <!-- Checkerboard pattern for transparency -->
                <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
              </div>
            </div>
            
            <div class="md:w-1/3 space-y-4">
              <div class="border rounded p-4" style="background-color: var(--ps-panel); border-color: var(--ps-border); border-radius: var(--ps-border-radius);">
                <h3 class="text-sm font-medium mb-2">Image Details</h3>
                <dl class="space-y-2">
                  <div class="flex justify-between">
                    <dt class="text-xs opacity-50">Dimensions</dt>
                    <dd class="text-xs">{selectedImage.metadata.width} × {selectedImage.metadata.height} px</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-xs opacity-50">Format</dt>
                    <dd class="text-xs">{selectedImage.metadata.format}</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-xs opacity-50">Size</dt>
                    <dd class="text-xs">{(selectedImage.metadata.size / 1024).toFixed(0)} KB</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt class="text-xs opacity-50">Created</dt>
                    <dd class="text-xs">{new Date(selectedImage.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
              
              {#if selectedImage.versions && selectedImage.versions.length > 1}
                <div class="border rounded p-4" style="background-color: var(--ps-panel); border-color: var(--ps-border); border-radius: var(--ps-border-radius);">
                  <h3 class="text-sm font-medium mb-2">Versions</h3>
                  <div class="space-y-2">
                    {#each selectedImage.versions as version, i}
                      <div class="flex items-center space-x-2 p-2 rounded hover:opacity-80" style="background-color: {version.imageUrl === selectedImage.imageUrl ? 'var(--ps-button)' : 'transparent'};">
                        <div class="w-10 h-10 rounded overflow-hidden border" style="border-color: var(--ps-border); border-radius: var(--ps-border-radius);">
                          <div class="relative h-full">
                            <img src={version.imageUrl} alt={version.prompt} class="w-full h-full object-cover" />
                            <div class="absolute inset-0 -z-10 bg-checkerboard"></div>
                          </div>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-xs truncate">Version {i + 1}</p>
                          <p class="text-xs opacity-50 truncate">{new Date(version.createdAt).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    {/each}
                  </div>
                </div>
              {/if}
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
      linear-gradient(45deg, var(--ps-panel) 25%, transparent 25%), 
      linear-gradient(-45deg, var(--ps-panel) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--ps-panel) 75%),
      linear-gradient(-45deg, transparent 75%, var(--ps-panel) 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: var(--ps-secondary);
  }
  
  /* Aspect ratio utility for gallery items */
  .aspect-w-1 {
    position: relative;
    padding-bottom: 100%;
  }
  
  .aspect-w-1 > * {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  
  /* Focus styles for search input */
  .search-input:focus {
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }
  
  input[type="text"]:focus {
    border-color: var(--ps-accent);
    box-shadow: 0 0 0 1px var(--ps-accent);
  }
</style> 