<!-- Dashboard page -->
<script lang="ts">
  import { mockUser, mockImages } from '$lib/stores/mockData';
  
  // Get recent images
  const recentImages = mockImages.slice(0, 3);
  
  // Mock statistics
  const stats = [
    { name: 'Total Images', value: mockImages.length },
    { name: 'Images Generated', value: '24' },
    { name: 'Storage Used', value: '1.2 GB' },
    { name: 'API Credits', value: '850' }
  ];
</script>

<div class="py-6">
  <!-- Welcome section -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 class="text-2xl font-semibold text-gray-900">Welcome back, {mockUser.name}!</h1>
    <p class="mt-1 text-sm text-gray-500">Here's what's happening with your account today.</p>
  </div>

  <!-- Stats -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="mt-8">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {#each stats as stat}
          <div class="bg-white overflow-hidden shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <dt class="text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </dt>
              <dd class="mt-1 text-3xl font-semibold text-gray-900">
                {stat.value}
              </dd>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- Quick actions -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Quick Actions
        </h3>
        <div class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href="/create"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Create New Image
          </a>
          <a
            href="/gallery"
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View Gallery
          </a>
          <a
            href="/settings"
            class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Manage Settings
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Recent activity -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
    <div class="bg-white shadow sm:rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900">
          Recent Activity
        </h3>
        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {#each recentImages as image}
            <div class="relative group">
              <div class="aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100">
                <img src={image.thumbnail} alt={image.prompt} class="object-cover pointer-events-none" />
                <div class="flex items-end opacity-0 p-4 group-hover:opacity-100 absolute inset-0 bg-gradient-to-t from-black/60">
                  <div>
                    <p class="mt-1 text-sm text-white truncate">
                      {image.prompt}
                    </p>
                    <p class="text-sm font-medium text-white">
                      {new Date(image.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              <a href={`/edit/${image.id}`} class="absolute inset-0 focus:outline-none">
                <span class="sr-only">View details for {image.prompt}</span>
              </a>
            </div>
          {/each}
        </div>
        {#if mockImages.length > 3}
          <div class="mt-6 text-center">
            <a href="/gallery" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View all images <span aria-hidden="true">→</span>
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div> 