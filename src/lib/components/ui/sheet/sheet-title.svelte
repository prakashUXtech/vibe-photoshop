<!-- Sheet title component -->
<script lang="ts">
  import { cn } from '$lib/utils';

  let className: string | undefined = undefined;
  export { className as class };
</script>

<h2 class={cn('text-lg font-semibold text-foreground', className)} {...$$restProps}>
  <slot />
</h2> 