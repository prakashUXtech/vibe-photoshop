<!-- Photoshop-inspired layout -->
<script lang="ts">
	import '../app.css';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { page } from '$app/stores';
	import { mockUser } from '$lib/stores/mockData';
	
	// Simplified title since we now have a single-page experience
	const title = 'Vibe Photoshop';
</script>

<div class="min-h-screen flex flex-col bg-gray-900 text-gray-200">
	<!-- Application title bar (Photoshop-style) -->
	<header class="bg-gray-800 border-b border-gray-700 py-1 px-4 flex items-center justify-between">
		<div class="flex items-center">
			<div class="text-blue-400 font-bold mr-6">Vibe Photoshop</div>
			
			<nav class="flex space-x-1">
				<a 
					href="/" 
					class="px-3 py-1 text-sm rounded hover:bg-gray-700 {$page.url.pathname === '/' ? 'bg-gray-700 text-blue-400' : 'text-gray-300'}"
				>
					Studio
				</a>
				<a 
					href="/gallery" 
					class="px-3 py-1 text-sm rounded hover:bg-gray-700 {$page.url.pathname === '/gallery' ? 'bg-gray-700 text-blue-400' : 'text-gray-300'}"
				>
					Gallery
				</a>
			</nav>
		</div>
		
		<div class="flex items-center">
			<div class="flex items-center space-x-2">
				<div class="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium">
					{mockUser.firstName[0]}{mockUser.lastName[0]}
				</div>
				<span class="text-xs text-gray-400">{mockUser.firstName} {mockUser.lastName}</span>
			</div>
		</div>
	</header>
	
	<!-- Page content -->
	<slot />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
		font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>
