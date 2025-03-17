<!-- Panel tabs component -->
<script lang="ts">
  export let activeTab: string;
  export let setActiveTab: (tab: string) => void;
</script>

<div class="flex border-b" style="background-color: var(--ps-secondary); border-color: var(--ps-border);">
  <button 
    class="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
    style="
      border-color: {activeTab === 'vibe' ? 'var(--ps-accent)' : 'transparent'};
      color: {activeTab === 'vibe' ? 'var(--ps-accent)' : 'var(--ps-text)'};
    "
    on:click={() => setActiveTab('vibe')}
  >
    Vibe Create
  </button>
  <button 
    class="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
    style="
      border-color: {activeTab === 'history' ? 'var(--ps-accent)' : 'transparent'};
      color: {activeTab === 'history' ? 'var(--ps-accent)' : 'var(--ps-text)'};
    "
    on:click={() => setActiveTab('history')}
  >
    History
  </button>
  <button 
    class="px-4 py-2 text-xs font-medium border-b-2 transition-colors"
    style="
      border-color: {activeTab === 'adjustments' ? 'var(--ps-accent)' : 'transparent'};
      color: {activeTab === 'adjustments' ? 'var(--ps-accent)' : 'var(--ps-text)'};
    "
    on:click={() => setActiveTab('adjustments')}
  >
    Adjustments
  </button>
</div> 