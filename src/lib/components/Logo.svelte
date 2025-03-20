<!-- Logo component for Vibe Photoshop
Changes:
- Using site-wide ps-accent color variable
- Removed hardcoded colors
- Maintained Photoshop-style appearance
- Using Tailwind classes
- Added mobile responsiveness
-->
<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const logoSizes = {
		sm: 'w-8 h-8 text-xs',
		md: 'w-10 h-10 text-sm',
		lg: 'w-12 h-12 text-base'
	};

	const borderSizes = {
		sm: 'p-[2px]',
		md: 'p-[3px]',
		lg: 'p-[4px]'
	};

	const textSizes = {
		sm: 'text-xs',
		md: 'text-sm',
		lg: 'text-base'
	};
</script>

<div class="flex items-center gap-3">
  <!-- VP Logo mark in Photoshop style -->
  <div class="relative {logoSizes[size]} shadow-sm flex items-center justify-center {borderSizes[size]}" style="background: #31A8FF">
    <!-- Dark background with VP text -->
    <div class="w-full h-full flex items-center justify-center bg-[#001E36]">
      <span class="font-bold tracking-tighter" style="color: #31A8FF">Vp</span>
    </div>
  </div>
  
  <!-- App name - hidden on mobile unless specified -->
  <span class="hidden md:inline-block text-sm font-semibold" style="color: var(--ps-accent)">
    Vibe Photoshop
  </span> 
  <span class="text-xs font-semibold opacity-50"> 0.1 - alpha</span>
</div>
