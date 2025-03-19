<!-- RoadmapSheet component for displaying development roadmap
Changes:
- Updated to use tailwind-only Sheet components
- Fixed trigger mechanism to open/close the sheet
- Fixed Lucide icon import to use @lucide/svelte
- Simplified event handling for the Sheet component
- Updated button styling to match app theme
-->
<script lang="ts">
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from "$lib/components/ui/sheet";
  import { Button } from "$lib/components/ui/button";
  import { Map } from "@lucide/svelte";
  import { writable } from "svelte/store";

  const isOpen = writable(false);

  function toggleSheet() {
    $isOpen = !$isOpen;
  }

  const roadmapItems = [
    {
      status: 'completed',
      title: 'Basic Image Generation',
      description: 'Generate images using AI with custom prompts'
    },
    {
      status: 'completed',
      title: 'Image Gallery',
      description: 'View and manage generated images'
    },
    {
      status: 'in-progress',
      title: 'Advanced Editing',
      description: 'Enhanced image manipulation tools'
    },
    {
      status: 'planned',
      title: 'Batch Processing',
      description: 'Generate multiple images in one go'
    },
    {
      status: 'planned',
      title: 'Style Presets',
      description: 'Save and reuse generation settings'
    },
    {
      status: 'planned',
      title: 'Export Options',
      description: 'Multiple format support and sizing options'
    }
  ];
</script>

<Button variant="ghost" size="sm" class="flex items-center gap-1.5 text-gray-600 hover:text-gray-900" on:click={toggleSheet}>
  <Map class="w-4 h-4" />
  <span>Roadmap</span>
</Button>

<Sheet bind:open={$isOpen}>
  <SheetContent side="right" class="w-[400px] sm:w-[540px]">
    <SheetHeader>
      <SheetTitle class="text-gray-200">Development Roadmap</SheetTitle>
    </SheetHeader>
    <div class="mt-6 space-y-6">
      {#each roadmapItems as item}
        <div class="flex gap-4">
          <div class="flex-shrink-0 w-2 h-2 mt-2 rounded-full" class:bg-green-500={item.status === 'completed'} class:bg-blue-500={item.status === 'in-progress'} class:bg-gray-300={item.status === 'planned'}></div>
          <div>
            <h3 class="text-sm font-medium flex items-center gap-2 text-gray-200">
              {item.title}
              {#if item.status === 'completed'}
                <span class="text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-300">Completed</span>
              {:else if item.status === 'in-progress'}
                <span class="text-xs px-2 py-0.5 rounded-full bg-blue-900/50 text-blue-300">In Progress</span>
              {:else}
                <span class="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">Planned</span>
              {/if}
            </h3>
            <p class="mt-1 text-sm text-gray-400">{item.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </SheetContent>
</Sheet> 