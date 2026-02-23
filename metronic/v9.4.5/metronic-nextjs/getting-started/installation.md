---
title: "Installation - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/getting-started/installation"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Installation

Get started with Metronic Next.js by following this installation guide.

This guide will help you set up Metronic Next.js for development.

## Requirements

Before installing Metronic Next.js, ensure you have:

- Node.js: Version 18.x or higher

- npm: Version 9.x or higher (comes with Node.js)

- Supabase Account: Required for authentication and database functionality

## Installation Steps

### Install Dependencies

Install project dependencies using npm:

```text
npm install --force
```

Note: This project requires React 19 and other modern dependencies.

### Environment Setup

- Create a .env file in the root directory:

```text
cp .env.example .env
```

- Configure the required environment variables:

```text
# Prisma Config #
# Connect to Supabase via connection pooling.
DATABASE_URL="postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
 
# Direct connection to the database. Used for migrations.
DIRECT_URL="postgresql://postgres.your-project:your-password@aws-0-region.pooler.supabase.com:5432/postgres"
 
# Next Auth Config #
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXTAUTH_URL=http://localhost:3000/
NEXTAUTH_SECRET=your-nextauth-secret-key
GOOGLE_CLIENT_ID=your_google_oauth2_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth2_secret_key
 
# Storage Configuration (AWS S3 or DigitalOcean Spaces)
STORAGE_TYPE=digitalocean
 
STORAGE_ACCESS_KEY_ID=your_accent_key_id
STORAGE_SECRET_ACCESS_KEY=your_access_key
STORAGE_REGION=your_region
STORAGE_BUCKET=your_bucket_name
STORAGE_ENDPOINT=your_endpoint
STORAGE_FORCE_PATH_STYLE=true
STORAGE_CDN_URL=your_cdn_url
 
# SMTP Credentials
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_SECURE=false
SMTP_USER=no-reply@domain.com
SMTP_PASS=your_smtp_pass
 
# Base Path (Optional - for subdirectory deployments)
# Set this if deploying to a subdirectory like /my-app
# NEXT_PUBLIC_BASE_PATH=/my-app
```

Note: The basePath configuration in next.config.mjs uses NEXT_PUBLIC_BASE_PATH environment variable. If you're deploying to a subdirectory (e.g., behind a reverse proxy), you'll need to set this. For more details, see the Deployment Guide.

### Database Setup

This project uses Prisma ORM to interact with the database. Set up your database with:

```text
# Generate Prisma client
npx prisma generate
 
# Run migrations (if needed)
npx prisma migrate dev
```

### Start the Development Server

Run the development server:

```text
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

### Build for Production

When you're ready to deploy, build the application:

```text
npm run build
```

The built files will be in the .next directory and can be deployed to any Next.js compatible hosting service.

## Project Structure

The Metronic Next.js project follows a well-organized structure based on the App Router:

```text
app/                    # Next.js App Router directory
├── (auth)/             # Authentication routes (signin, signup, etc.)
├── (protected)/        # Protected routes requiring authentication
│   ├── account/        # Account settings pages
│   ├── page.tsx        # Dashboard page (default protected route)
│   └── layout.tsx      # Layout for protected routes
├── api/                # API routes
│   ├── auth/           # Authentication API endpoints
│   └── [...]/          # Other API endpoints
├── components/         # Shared UI components
│   ├── layouts/        # Multiple demo layouts (Demo1-Demo10)
│   └── ui/             # Base UI components
├── models/             # Data models and interfaces
└── layout.tsx          # Root layout component

components/             # Global UI components
config/                 # Configuration files
css/                    # Global CSS styles
hooks/                  # Custom React hooks
i18n/                   # Internationalization files
lib/                    # Utility libraries
prisma/                 # Prisma schema and migrations
providers/              # React context providers
├── auth-provider.tsx   # Authentication provider
├── i18n-provider.tsx   # Internationalization provider
├── query-provider.tsx  # TanStack Query provider
├── settings-provider.tsx # App settings provider
├── theme-provider.tsx  # Dark/light theme provider
└── tooltips-provider.tsx # Tooltips provider
public/                 # Static assets (images, fonts, etc.)
services/               # API service functions
types/                  # TypeScript type definitions
```

## Next Steps

After installation, you might want to:

- Explore the Adding a New Page guide

- Learn about the Authentication system

- Understand the App Router structure

- Check out the Internationalization features

- Experiment with different Layouts

## Troubleshooting

### Common Issues

- Port Already in Use

If port 3000 is already in use, Next.js will automatically try to use the next available port. Check your terminal for the correct URL.

- Missing Dependencies

If you encounter errors about missing dependencies, try:

```text
npm install --force
```

- Database Connection Issues

If you're having trouble connecting to your Supabase database, verify your DATABASE_URL and DIRECT_URL in the .env file. Make sure your Supabase project has the right permissions set.

- Authentication Problems

For authentication issues, check that your NEXTAUTH_SECRET and OAuth provider credentials are correctly set in the .env file.

- Build Errors

If you encounter build errors, ensure you're using the correct Node.js version (18+) and try clearing the node_modules directory:

```text
rm -rf node_modules .next
npm install --force
```

For additional help, don't hesitate to contact us on our forum devs.keenthemes.com.

PreviousIntroductionNextStarter Kits

On This Page

- Requirements
- Installation Steps

- Environment Setup
- Database Setup
- Start the Development Server
- Build for Production

- Project Structure
- Next Steps
- Troubleshooting

- Common Issues

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Installation - Metronic NextJS
-
-
