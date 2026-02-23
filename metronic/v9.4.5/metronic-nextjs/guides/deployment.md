---
title: "Deployment - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/deployment"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Deployment

Learn how to deploy your Metronic Next.js application to various hosting platforms.

# Deployment

This guide covers deploying your Metronic Next.js application to production environments.

## Building for Production

```text
# Navigate to your project directory
cd your-nextjs-project
 
# Install dependencies (if needed)
npm install
 
# Build for production
npm run build
```

This creates a .next directory with optimized files ready for deployment.

## Configuration

### Environment Variables

For production, create a .env.production file:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

Remember that only variables prefixed with NEXT_PUBLIC_ will be exposed to the browser.

### Base Path Configuration

When deploying your Next.js application behind a reverse proxy (like nginx) or to a subdirectory, you need to configure the basePath in your next.config.mjs file.

#### Understanding Base Path

The basePath tells Next.js that your application is served from a subdirectory rather than the root domain. For example:

- Root deployment: https://example.com/ → basePath: '' or basePath: '/'

- Subdirectory deployment: https://example.com/my-app/ → basePath: '/my-app'

#### Configuration Options

Option 1: Using Environment Variable (Recommended)

Set the NEXT_PUBLIC_BASE_PATH environment variable in your .env.production file:

```text
# For subdirectory deployment
NEXT_PUBLIC_BASE_PATH=/
```

Option 2: Hardcoded in Config

You can also hardcode the basePath directly in next.config.mjs:

```text
const nextConfig = {
  basePath: '/your-custom-path',
  assetPrefix: '/your-custom-path',
  output: 'standalone',
};
```

#### Important Notes

-

Path Format: The basePath must be a path string (e.g., /my-app), not a full URL. If your environment variable contains a full URL, you'll need to extract just the pathname.

-

Trailing Slash: Next.js handles trailing slashes automatically, so both /my-app and /my-app/ work correctly.

-

Asset Prefix: The assetPrefix should match your basePath to ensure static assets (CSS, JS, images) are loaded from the correct path.

-

Links and Navigation: When using basePath, Next.js automatically prefixes all internal links and routes. However, if you're using the toAbsoluteUrl helper function from lib/helpers.ts, it uses NEXT_PUBLIC_BASE_PATH for absolute URLs.

-

Development vs Production: You can use different base paths for development and production by setting different values in .env and .env.production files.

#### Example: Deploying Behind Nginx

If you're deploying behind an nginx reverse proxy:

```text
location /my-app {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

Then set in your .env.production:

```text
NEXT_PUBLIC_BASE_PATH=/my-app
```

#### Troubleshooting Base Path Issues

If you're experiencing issues with assets not loading or routes not working:

-

Check Environment Variable: Ensure NEXT_PUBLIC_BASE_PATH is set correctly in your production environment.

-

Rebuild After Changes: After changing basePath, you must rebuild your application:

```text
npm run build
```

-

Verify Asset Loading: Check your browser's Network tab to see if assets are being requested from the correct path.

-

Check Router Configuration: Ensure your reverse proxy (nginx, Apache, etc.) is configured to pass requests to the correct path.

## Deployment Options

### Vercel (Recommended)

Vercel provides the simplest deployment experience for Next.js applications:

- Push your code to a Git repository (GitHub, GitLab, BitBucket)

- Import your repository on vercel.com

- Vercel will automatically detect Next.js and use the optimal build settings

Alternatively, use the Vercel CLI:

```text
# Install Vercel CLI
npm install -g vercel
 
# Deploy
vercel
```

## Next.js-Specific Deployment Options

### Self-Hosted Static Export

For static site hosting (without server-side features):

- Add this to your next.config.mjs:

```text
export default {
  output: 'export',
}
```

- Build your application:

```text
npm run build
```

This generates a static out directory you can deploy to any static hosting service.

### Node.js Server

For server-side rendering with a Node.js server:

- Build your application:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```0

- Start the Node.js server:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```1

This starts a production server on port 3000 by default.

## Common Issues

### Image Optimization

When using Next.js Image Optimization with static export, configure the loader in next.config.mjs:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```2

Create a custom loader file:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```3

### API Routes

API routes don't work with static exports. You'll need a server-side deployment method or serverless functions if you're using API routes.

### Server Components

Server components require a server-side deployment method, such as Vercel, Node.js server, or Docker. They won't work with static exports.

## Testing Production Build Locally

To preview your production build before deployment:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```4

Visit http://localhost:3000 to preview your production build.

## Continuous Deployment

For automated deployments, configure CI/CD pipelines:

### GitHub Actions Example

Create a .github/workflows/deploy.yml file:

```text
NEXT_PUBLIC_APP_NAME=metronic-nextjs
NEXT_PUBLIC_API_URL=https://your-production-api.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```5

For more information on Next.js deployment, refer to the official documentation.

PreviousHooks

On This Page

- Deployment

- Building for Production
- Configuration
- Deployment Options
- Next.js-Specific Deployment Options
- Common Issues
- Testing Production Build Locally
- Continuous Deployment

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Deployment - Metronic NextJS
-
-
