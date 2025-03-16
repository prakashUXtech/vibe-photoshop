<!-- Global layout -->
<script lang="ts">
	import '../app.css';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { page } from '$app/stores';
	import { mockUser } from '$lib/stores/mockData';
	
	// Simplified title since we now have a single-page experience
	const title = 'Vibe Photoshop';
</script>

<div class="min-h-screen bg-white text-gray-900 flex flex-col">
	<!-- Simplified header for single-page experience -->
	<header class="border-b border-gray-100 bg-white">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			<div class="flex justify-between items-center h-16">
				<div class="flex items-center space-x-8">
					<a href="/" class="text-xl font-medium text-indigo-600">Vibe Photoshop</a>
					<nav class="hidden md:flex space-x-6">
						<a 
							href="/" 
							class="text-sm font-medium {$page.url.pathname === '/' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'} transition-colors"
						>
							Studio
						</a>
						<a 
							href="/gallery" 
							class="text-sm font-medium {$page.url.pathname === '/gallery' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'} transition-colors"
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
	</header>
	
	<!-- Page content -->
	<slot />
</div>

<style>
	:global(body) {
		@apply antialiased;
	}
</style>
