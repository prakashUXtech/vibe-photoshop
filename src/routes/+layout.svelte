<!-- Photoshop-inspired layout -->
<script lang="ts">
	import '../app.css';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { page } from '$app/stores';
	import { mockUser } from '$lib/stores/mockData';
	import { psTheme, psVersions, currentTheme } from '$lib/stores/themeStore';
	
	// Toggle dropdown visibility
	let showThemeDropdown = false;
	
	function toggleThemeDropdown(): void {
		showThemeDropdown = !showThemeDropdown;
	}
	
	function selectTheme(theme: string): void {
		psTheme.set(theme);
		showThemeDropdown = false;
	}
	
	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent): void {
		if (showThemeDropdown) {
			showThemeDropdown = false;
		}
	}
	
	// Simplified title since we now have a single-page experience
	const title = 'Vibe Photoshop';
</script>

<svelte:window on:click={handleClickOutside} />

<div 
	class="h-screen flex flex-col overflow-hidden"
	style="
		--ps-primary: {$currentTheme.primary};
		--ps-secondary: {$currentTheme.secondary};
		--ps-accent: {$currentTheme.accent};
		--ps-text: {$currentTheme.text};
		--ps-border: {$currentTheme.border};
		--ps-panel: {$currentTheme.panel};
		--ps-button: {$currentTheme.button};
		--ps-button-hover: {$currentTheme.buttonHover};
		--ps-border-radius: {$currentTheme.borderRadius};
		--ps-shadow: {$currentTheme.shadow};
		background-color: var(--ps-primary);
		color: var(--ps-text);
		font-family: {$currentTheme.fontFamily};
	"
>
	<!-- Application title bar (Photoshop-style) -->
	<header 
		class="border-b flex items-center justify-between py-1 px-4 flex-shrink-0"
		style="
			background-color: var(--ps-secondary);
			border-color: var(--ps-border);
		"
	>
		<div class="flex items-center">
			<div 
				class="font-bold mr-6"
				style="color: var(--ps-accent);"
			>
				Vibe Photoshop
			</div>
			
			<nav class="flex space-x-1">
				<a 
					href="/" 
					class="px-3 py-1 text-sm rounded hover:bg-opacity-80"
					style="
						background-color: {$page.url.pathname === '/' ? 'var(--ps-button)' : 'transparent'};
						color: {$page.url.pathname === '/' ? 'var(--ps-accent)' : 'var(--ps-text)'};
						border-radius: var(--ps-border-radius);
					"
				>
					Studio
				</a>
				<a 
					href="/gallery" 
					class="px-3 py-1 text-sm rounded hover:bg-opacity-80"
					style="
						background-color: {$page.url.pathname === '/gallery' ? 'var(--ps-button)' : 'transparent'};
						color: {$page.url.pathname === '/gallery' ? 'var(--ps-accent)' : 'var(--ps-text)'};
						border-radius: var(--ps-border-radius);
					"
				>
					Gallery
				</a>
			</nav>
		</div>
		
		<div class="flex items-center space-x-4">
			<!-- Theme switcher dropdown -->
			<div class="relative">
				<button 
					class="flex items-center px-3 py-1 text-sm rounded hover:bg-opacity-80"
					style="
						background-color: transparent;
						color: var(--ps-text);
						border-radius: var(--ps-border-radius);
					"
					on:click|stopPropagation={toggleThemeDropdown}
				>
					<span class="mr-1">PS {$psTheme}</span>
					<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</button>
				
				{#if showThemeDropdown}
					<div 
						class="absolute right-0 mt-1 w-56 border rounded shadow-lg z-10"
						style="
							background-color: var(--ps-secondary);
							border-color: var(--ps-border);
							border-radius: var(--ps-border-radius);
							box-shadow: var(--ps-shadow);
						"
						on:click|stopPropagation
					>
						<div class="py-1">
							{#each psVersions as version}
								<button
									class="w-full text-left px-4 py-2 text-sm"
									style="
										background-color: {$psTheme === version.value ? 'var(--ps-button)' : 'transparent'};
										color: {$psTheme === version.value ? 'var(--ps-accent)' : 'var(--ps-text)'};
									"
									on:click={() => selectTheme(version.value)}
								>
									{version.label}
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
			
			<div class="flex items-center space-x-2">
				<div 
					class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
					style="
						background-color: var(--ps-accent);
						border-radius: 50%;
					"
				>
					{mockUser.firstName[0]}{mockUser.lastName[0]}
				</div>
				<!-- <span class="text-xs opacity-70">{mockUser.firstName} {mockUser.lastName}</span> -->
			</div>
		</div>
	</header>
	
	<!-- Page content -->
	<div class="flex-1 overflow-hidden">
		<slot />
	</div>
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
