<!-- Photoshop-inspired layout -->
<script lang="ts">
	import '../app.css';
	import SEO from '$lib/components/SEO.svelte';


	import Toast from '$lib/components/ui/Toast.svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { mockUser } from '$lib/stores/mockData';
	import { psTheme, psVersions, currentTheme } from '$lib/stores/themeStore';
	import { uiStore } from '$lib/stores';
	import { onMount } from 'svelte';
	import RoadmapSheet from '$lib/components/RoadmapSheet.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	
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
		if (!browser) return;
		if (showThemeDropdown) {
			showThemeDropdown = false;
		}
	}
	
	// Simplified title since we now have a single-page experience
	const title = 'Vibe Photoshop';

	// Default theme class
	let themeClass = '';
	
	// Update theme class on client-side only
	onMount(() => {
		// Update theme class when uiStore changes
		const updateThemeClass = () => {
			if (browser) {
				const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
				themeClass = $uiStore.theme === 'dark' || 
					($uiStore.theme === 'system' && isDarkMode) 
					? 'dark' : 'light';
			}
		};
		
		// Initial update
		updateThemeClass();
		
		// Subscribe to uiStore changes
		const unsubscribe = uiStore.subscribe(updateThemeClass);
		
		// Set up listener for system theme changes
		if (browser) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			const handleChange = () => updateThemeClass();
			mediaQuery.addEventListener('change', handleChange);
			
			return () => {
				mediaQuery.removeEventListener('change', handleChange);
				unsubscribe();
			};
		}
		
		return () => {
			unsubscribe();
		};
	});
</script>

<svelte:window on:click={handleClickOutside} />

<SEO />

<div 
	class="h-screen flex flex-col overflow-hidden {themeClass}"
	style="
		--ps-primary: {$currentTheme.primary};
		--ps-secondary: {$currentTheme.secondary};
		--ps-accent: {$currentTheme.accent};
		--ps-text: {$currentTheme.text};
		--ps-border: {$currentTheme.border};
		--ps-panel: {$currentTheme.panel};
		--ps-panel-bg: {$currentTheme.panelBg || $currentTheme.panel};
		--ps-button: {$currentTheme.button};
		--ps-button-hover: {$currentTheme.buttonHover};
		--ps-button-bg: {$currentTheme.buttonBg || $currentTheme.button};
		--ps-input-bg: {$currentTheme.inputBg || $currentTheme.secondary};
		--ps-border-radius: {$currentTheme.borderRadius};
		--ps-shadow: {$currentTheme.shadow};
		background-color: var(--ps-primary);
		color: var(--ps-text);
		font-family: {$currentTheme.fontFamily};
	"
>
	{#if $page.url.pathname !== '/auth'}
		<NavBar title={$page.data.title || ''}>
			<slot name="header" />
		</NavBar>
	{/if}
	
	<!-- Page content -->
	<div class="flex-1 overflow-hidden">
		<slot />
	</div>

	<!-- Toast notifications -->
	<Toast />
</div>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
</style>
