<!-- Adjustments panel component -->
<script lang="ts">
  // No props needed for now, but could add adjustment values and handlers later
</script>

<div class="flex-1 p-3 overflow-y-auto h-full">
  <h3 class="text-xs font-medium mb-3">Adjustments</h3>
  
  <div class="space-y-4">
    <div>
      <label class="block text-xs opacity-70 mb-1">Brightness</label>
      <input 
        type="range" 
        class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer" 
        style="background-color: var(--ps-panel);"
      />
    </div>
    
    <div>
      <label class="block text-xs opacity-70 mb-1">Contrast</label>
      <input 
        type="range" 
        class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer"
        style="background-color: var(--ps-panel);"
      />
    </div>
    
    <div>
      <label class="block text-xs opacity-70 mb-1">Saturation</label>
      <input 
        type="range" 
        class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer"
        style="background-color: var(--ps-panel);"
      />
    </div>
    
    <div>
      <label class="block text-xs opacity-70 mb-1">Temperature</label>
      <input 
        type="range" 
        class="theme-range w-full h-1 rounded-lg appearance-none cursor-pointer"
        style="background-color: var(--ps-panel);"
      />
    </div>
  </div>
</div>

<style>
  /* Custom range input styling */
  input[type="range"] {
    -webkit-appearance: none;
    height: 2px;
    border-radius: 2px;
  }
  
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    cursor: pointer;
    background: var(--ps-accent);
  }
</style> 