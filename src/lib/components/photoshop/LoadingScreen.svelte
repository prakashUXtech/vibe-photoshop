<!-- Photoshop-style loading screen component -->
<script lang="ts">
  export let loadingProgress: number;
  export let loadingText: string;
</script>

<div class="fixed inset-0 flex flex-col items-center justify-center z-50" style="background-color: var(--ps-primary);">
  <div class="relative max-w-md w-full">
    <!-- Splash image container -->
    <div class="relative mb-6 shadow-xl overflow-hidden" style="border-radius: var(--ps-border-radius);">
      <div class="aspect-w-16 aspect-h-9 bg-gradient-to-br from-gray-800 to-gray-900">
        <!-- Splash image content -->
        <div class="p-6 flex flex-col h-full">
          <div class="flex-1 flex items-center justify-center">
            <div class="text-center">
              <div class="flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                </svg>
              </div>
              <h1 class="text-3xl font-bold mb-1">
                <span class="text-red-500">Vibe</span>
                <span class="text-white">Photoshop</span>
              </h1>
              <p class="text-xs text-gray-400 mb-4">Powered by AI</p>
              <div class="text-xs text-gray-400 mt-4">
                © 2024 Vibe Photoshop. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Loading progress -->
    <div class="text-center">
      <div class="w-full bg-gray-700 rounded-full h-1.5 mb-2">
        <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: {loadingProgress}%"></div>
      </div>
      <p class="text-sm text-gray-300">{loadingText}</p>
    </div>
  </div>
</div>

<style>
  /* Aspect ratio utility for splash screen */
  .aspect-w-16 {
    position: relative;
    padding-bottom: calc(9 / 16 * 100%);
  }
  
  .aspect-h-9 > * {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style> 