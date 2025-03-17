<!-- Panel tabs component (Photoshop-style) -->
<script lang="ts">
  export let activeTab: string;
  export let setActiveTab: (tab: string) => void;
  
  // Tab definitions
  const tabs = [
    {
      id: 'vibe',
      name: 'Vibe Create',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
        </svg>
      `
    },
    {
      id: 'history',
      name: 'History',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
        </svg>
      `
    },
    {
      id: 'sessions',
      name: 'Sessions',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd" />
          <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
        </svg>
      `
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
      `
    }
  ];
</script>

<div class="tabs-container">
  {#each tabs as tab, i}
    <button 
      class="tab {activeTab === tab.id ? 'active' : ''}"
      on:click={() => setActiveTab(tab.id)}
      aria-label={tab.name}
    >
      <!-- Tab content -->
      <div class="tab-content">
        <span class="tab-icon">{@html tab.icon}</span>
        <span class="tab-name">{tab.name}</span>
      </div>
      
      <!-- Separator (except after last tab) -->
      {#if i < tabs.length - 1 && activeTab !== tab.id && activeTab !== tabs[i+1].id}
        <span class="tab-separator"></span>
      {/if}
      
      <!-- Active indicator -->
      {#if activeTab === tab.id}
        <div class="active-indicator"></div>
      {/if}
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    display: flex;
    height: 24px;
    width: 100%;
    background-color: var(--ps-secondary);
    box-shadow: 0 1px 0 var(--ps-border);
  }
  
  .tab {
    position: relative;
    flex-grow: 1;
    padding: 0 6px;
    height: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--ps-text);
    opacity: 0.65;
    transition: all 0.15s ease;
  }
  
  .tab:hover {
    opacity: 0.9;
    background-color: rgba(255, 255, 255, 0.05);
  }
  
  .tab.active {
    opacity: 1;
    background-color: var(--ps-panel);
  }
  
  .tab-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    height: 100%;
  }
  
  .tab-icon {
    display: flex;
    align-items: center;
  }
  
  .tab-name {
    font-size: 10px;
    font-weight: 400;
    letter-spacing: 0.2px;
  }
  
  .tab-separator {
    position: absolute;
    right: 0;
    top: 5px;
    bottom: 5px;
    width: 1px;
    background-color: var(--ps-border);
    opacity: 0.35;
  }
  
  .active-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: var(--ps-accent);
  }
</style> 