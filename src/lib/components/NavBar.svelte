<!-- Navigation bar component with unified header
Changes:
- Unified header styling and functionality
- Integrated theme switcher
- Added PS version selector
- Improved layout and styling
- Added mobile responsiveness
-->
<script lang="ts">
  import { page } from '$app/stores';
  import { mockUser } from '$lib/stores/mockData';
  import { psTheme, psVersions, currentTheme } from '$lib/stores/themeStore';
  import Logo from './Logo.svelte';
  import RoadmapSheet from './RoadmapSheet.svelte';
  
  export let title: string;
  
  // Theme dropdown state
  let showThemeDropdown = false;
  let showMobileNav = false;
  
  function toggleThemeDropdown(): void {
    showThemeDropdown = !showThemeDropdown;
  }
  
  function toggleMobileNav(): void {
    showMobileNav = !showMobileNav;
  }
  
  function selectTheme(theme: string): void {
    psTheme.set(theme);
    showThemeDropdown = false;
  }
  
  function handleClickOutside(): void {
    if (showThemeDropdown) {
      showThemeDropdown = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header 
  class="border-b flex-shrink-0"
  style="
    background-color: var(--ps-secondary);
    border-color: var(--ps-border);
  "
>
  <div class="flex items-center justify-between py-1 px-4">
    <!-- Left section with logo and navigation -->
    <div class="flex items-center">
      <Logo size="sm" />
      <!-- Desktop navigation -->
      <nav class="hidden md:flex space-x-1 ml-6">
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
      
      <!-- Mobile menu button -->
      <button 
        class="md:hidden ml-4 p-1 rounded hover:bg-opacity-80"
        style="color: var(--ps-text);"
        on:click={toggleMobileNav}
        aria-label="Toggle navigation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- Right section with theme and user -->
    <div class="flex items-center space-x-4">
      <!-- Theme switcher dropdown -->
      <div class="relative hidden md:block">
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

      <div class="flex items-center gap-4">
        <div 
          class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
          style="
            background-color: var(--ps-accent);
            border-radius: 50%;
          "
        >
          {mockUser.firstName[0]}{mockUser.lastName[0]}
        </div>
        <div class="hidden md:block">
          <RoadmapSheet />
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile navigation menu -->
  {#if showMobileNav}
    <div 
      class="md:hidden border-t"
      style="background-color: var(--ps-secondary); border-color: var(--ps-border);"
    >
      <nav class="px-4 py-2 space-y-1">
        <a 
          href="/" 
          class="block px-3 py-2 text-sm rounded hover:bg-opacity-80"
          style="
            background-color: {$page.url.pathname === '/' ? 'var(--ps-button)' : 'transparent'};
            color: {$page.url.pathname === '/' ? 'var(--ps-accent)' : 'var(--ps-text)'};
            border-radius: var(--ps-border-radius);
          "
          on:click={() => showMobileNav = false}
        >
          Studio
        </a>
        <a 
          href="/gallery" 
          class="block px-3 py-2 text-sm rounded hover:bg-opacity-80"
          style="
            background-color: {$page.url.pathname === '/gallery' ? 'var(--ps-button)' : 'transparent'};
            color: {$page.url.pathname === '/gallery' ? 'var(--ps-accent)' : 'var(--ps-text)'};
            border-radius: var(--ps-border-radius);
          "
          on:click={() => showMobileNav = false}
        >
          Gallery
        </a>
        <!-- Mobile theme switcher -->
        <div class="pt-2 border-t" style="border-color: var(--ps-border);">
          {#each psVersions as version}
            <button
              class="w-full text-left px-3 py-2 text-sm rounded hover:bg-opacity-80"
              style="
                background-color: {$psTheme === version.value ? 'var(--ps-button)' : 'transparent'};
                color: {$psTheme === version.value ? 'var(--ps-accent)' : 'var(--ps-text)'};
                border-radius: var(--ps-border-radius);
              "
              on:click={() => {
                selectTheme(version.value);
                showMobileNav = false;
              }}
            >
              {version.label}
            </button>
          {/each}
        </div>
      </nav>
    </div>
  {/if}

  {#if title}
    <div 
      class="px-4 py-2 flex justify-between items-center border-t"
      style="border-color: var(--ps-border);"
    >
      <h1 class="text-base font-medium" style="color: var(--ps-text);">{title}</h1>
      <div class="flex items-center space-x-4">
        <slot></slot>
      </div>
    </div>
  {/if}
</header>

<style>
  /* Add any additional styles here */
</style>