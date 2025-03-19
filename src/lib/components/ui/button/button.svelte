<!-- Button component with various styles and variants -->
<script lang="ts">
  import { cn } from "$lib/utils";

  type Variant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  type Size = "default" | "sm" | "lg" | "icon";

  let className: string | undefined = undefined;
  export { className as class };
  export let variant: Variant = "default";
  export let size: Size = "default";
  export let disabled = false;

  const buttonVariants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-gray-300 hover:bg-gray-100 text-gray-700",
    secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
    ghost: "hover:bg-gray-100 text-gray-700",
    link: "underline-offset-4 hover:underline text-blue-600"
  };

  const buttonSizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-8 text-base",
    icon: "h-10 w-10"
  };

  $: classes = cn(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    buttonVariants[variant],
    buttonSizes[size],
    className
  );
</script>

<button class={classes} {...$$restProps} on:click disabled={disabled}>
  <slot />
</button> 