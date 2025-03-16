<!-- Page header component with navigation and customizable title -->
<script lang="ts">
  import { page } from '$app/stores';
  import { mockUser } from '$lib/stores/mockData';
  
  export let title: string;
</script>

<header class="border-b border-gray-100 bg-white">
  <!-- Main navigation -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center space-x-8">
        <a href="/" class="text-xl font-medium text-indigo-600">Vibe Photoshop</a>
        <nav class="hidden md:flex space-x-6">
          <a 
            href="/" 
            class="text-sm font-medium {$page.url.pathname === '/' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors"
          >
            Dashboard
          </a>
          <a 
            href="/create" 
            class="text-sm font-medium {$page.url.pathname === '/create' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors"
          >
            Create
          </a>
          <a 
            href="/gallery" 
            class="text-sm font-medium {$page.url.pathname === '/gallery' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'} transition-colors"
          >
            Gallery
          </a>
        </nav>
      </div>
      <div class="flex items-center">
        <div class="flex items-center space-x-2">
          <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
            {mockUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <span class="hidden md:inline-block text-sm font-medium text-gray-700">{mockUser.name}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Page-specific header -->
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center border-t border-gray-50">
    <h1 class="text-xl font-medium text-gray-900">{title}</h1>
    <div class="flex items-center space-x-4">
      <slot></slot>
    </div>
  </div>
</header>