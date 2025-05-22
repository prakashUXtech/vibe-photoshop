<!-- Logo component for Vide Edit
Changes:
- Replaced text-based logo mark with an image (vide-edit-logo.png)
- Kept the app name text "Vide Edit"
- Adjusted sizing for the image logo
-->
<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const imageSizes = {
		sm: 'w-8 h-8',
		md: 'w-10 h-10',
		lg: 'w-12 h-12'
	};

	// borderSizes and textSizes for the logo mark are no longer needed for the image itself
	// textSizes for the app name can remain if we want to scale it, but for simplicity, keeping it fixed for now.
</script>

<div class="flex items-center gap-2">
  <!-- Image Logo mark -->
  <img 
    src="/vide-edit-logo.png" 
    alt="Vide Edit Logo" 
    class="{imageSizes[size]}" 
  />
  
  <!-- App name - hidden on mobile unless specified -->
  <span class="hidden md:inline-block text-sm font-semibold" style="color: var(--ps-accent)">
    Vide Edit
  </span> 
  <span class="text-xs font-semibold opacity-50"> 0.1 - alpha</span>
</div>
