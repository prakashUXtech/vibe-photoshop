# Deployment Guide

This document outlines the deployment process for the Vibe Photoshop application using Netlify for hosting and Firebase for backend services.

## Prerequisites

Before deploying, ensure you have:

1. Completed the Firebase setup (see [Firebase Setup Guide](./FIREBASE_SETUP.md))
2. A Netlify account
3. Built your SvelteKit application: `npm run build`
4. Installed the Netlify CLI (optional): `npm install -g netlify-cli`

## Quick Deployment

For the simplest deployment path:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
   - Node version: 18 (or your preferred version)

## Step-by-Step Deployment Process

### 1. Prepare Environment Variables

Create a `.env` file in the root of your project with the necessary environment variables:

```
# Firebase Configuration
PUBLIC_FIREBASE_API_KEY=your_api_key
PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=your_project_id
PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
PUBLIC_FIREBASE_APP_ID=your_app_id
PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Other Configuration
PUBLIC_GEMINI_API_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
```

Add these environment variables to your Netlify project settings under "Site settings" > "Environment variables".

### 2. Configure SvelteKit for Static Adapter

Update your `svelte.config.js`:

```javascript
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html'
    })
  }
};

export default config;
```

### 3. Add Netlify Configuration

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[functions]
  directory = "netlify/functions"
```

### 4. Configure CORS and Security Headers

Add security headers in your `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self' https://apis.google.com https://*.googleapis.com https://*.firebaseapp.com; img-src 'self' data: blob: https://*.googleapis.com https://*.firebaseapp.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com; style-src 'self' 'unsafe-inline';"
```

### 5. Deploy to Netlify

#### Option 1: Deploy via GitHub

1. Push your code to GitHub
2. Log in to Netlify
3. Click "New site from Git"
4. Choose your repository
5. Configure build settings
6. Deploy

#### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize your site
netlify init

# Deploy
netlify deploy --prod
```

### 6. Set up Continuous Deployment

Netlify automatically sets up continuous deployment when you connect your GitHub repository. For custom configurations:

1. Go to Site settings > Build & deploy
2. Configure build settings:
   - Repository: Your GitHub repo
   - Branch: main (or your preferred branch)
   - Build command: `npm run build`
   - Publish directory: `build`

### 7. Configure Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Add your custom domain
3. Configure DNS settings
4. Enable HTTPS (automatic with Netlify)

## Performance Optimization

1. **Enable Asset Optimization**:
   - Go to Site settings > Build & deploy > Post processing
   - Enable asset optimization
   - Configure bundling and minification

2. **Configure Caching**:
   Add cache headers in `netlify.toml`:

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"
```

## Multiple Environments

For multiple environments (development/staging/production):

1. Create separate sites in Netlify
2. Configure branch deploys:
   - Production: main branch
   - Staging: staging branch
   - Development: dev branch

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Netlify dashboard
   - Verify environment variables are set
   - Ensure dependencies are properly installed

2. **Routing Issues**:
   - Check redirects in `netlify.toml`
   - Verify SvelteKit adapter configuration
   - Review client-side routing setup

3. **Environment Variables**:
   - Verify variables are set in Netlify dashboard
   - Check variable naming (must match .env)
   - Ensure variables are properly accessed in code

4. **CORS Issues**:
   - Review security headers
   - Check Firebase configuration
   - Verify API endpoints are properly configured

### Deployment Rollback

To rollback to a previous deployment:

1. Go to Deploys in Netlify dashboard
2. Find the working deployment
3. Click "Publish deploy"

## Monitoring and Analytics

1. **Netlify Analytics**:
   - Enable in site settings
   - Monitor traffic and performance
   - Track 404s and redirects

2. **Firebase Analytics**:
   - Configure in Firebase console
   - Track user interactions
   - Monitor performance

## Security Considerations

1. **Environment Variables**:
   - Never commit sensitive values
   - Use Netlify environment variables
   - Encrypt sensitive data

2. **Firebase Security**:
   - Maintain Firebase security rules
   - Configure authentication properly
   - Monitor usage and costs

3. **API Security**:
   - Protect API endpoints
   - Implement rate limiting
   - Use proper CORS configuration

## Deployment Checklist

Before deploying:
- [ ] Build succeeds locally
- [ ] Environment variables configured
- [ ] Firebase configuration complete
- [ ] Security headers set
- [ ] Redirects configured
- [ ] Custom domain setup (if needed)
- [ ] SSL/HTTPS enabled
- [ ] Performance optimization enabled
- [ ] Analytics configured
- [ ] Error tracking setup
- [ ] Backup strategy in place 