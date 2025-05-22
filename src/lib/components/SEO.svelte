<script lang="ts">
  import { page } from '$app/stores';

  export let title = 'Vide Edit - AI Image Editor';
  export let description = 'Transform your images with AI-powered editing. Generate, edit, and enhance photos with natural language prompts.';
  export let keywords = 'AI image editor, photo editing, image generation, AI photo enhancement, Vide Edit';
  export let image = '/vide-edit-logo.png';
  export let imageAlt = 'Vide Edit Interface';
  export let type = 'website';
  
  // Compute the full URL for meta tags
  $: url = $page.url.href;
  $: canonicalUrl = url.split('?')[0].split('#')[0];
  $: imageUrl = new URL(image, url).href;
</script>

<svelte:head>
  <!-- Basic Meta Tags -->
  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
  <meta name="keywords" content={keywords} />
  <link rel="canonical" href={canonicalUrl} />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={imageUrl} />
  <meta property="og:image:alt" content={imageAlt} />
  <meta property="og:site_name" content="Vide Edit" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content={url} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={imageUrl} />
  <meta name="twitter:image:alt" content={imageAlt} />
  
  <!-- Additional SEO -->
  <meta name="robots" content="index, follow" />
  <meta name="googlebot" content="index, follow" />
  <meta name="author" content="Vide Edit" />
  <meta name="publisher" content="Vide Edit" />
  
  <!-- Article Specific (if type is article) -->
  {#if type === 'article'}
    <meta property="article:published_time" content={new Date().toISOString()} />
    <meta property="article:author" content="Vide Edit" />
    <meta property="article:section" content="Technology" />
    <meta property="article:tag" content={keywords} />
  {/if}
  
  <!-- Structured Data -->
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "{type === 'article' ? 'Article' : 'WebSite'}",
      "name": "{title}",
      "description": "{description}",
      "url": "{url}",
      "image": "{imageUrl}",
      "publisher": {
        "@type": "Organization",
        "name": "Vide Edit",
        "logo": {
          "@type": "ImageObject",
          "url": "{new URL('/favicon_io/android-chrome-512x512.png', url).href}"
        }
      }
    }
  </script>
</svelte:head> 