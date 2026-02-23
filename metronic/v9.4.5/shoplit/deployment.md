---
title: "Deployment - Shoplit"
url: "https://docs.keenthemes.com/shoplit/shoplit/deployment"
section: "shoplit"
---
Purchase

#### Getting Started

IntroductionInstallationPrismaSupabaseComponentsReferencesPricingFAQChangelog

#### Guides

RTLDeploymenti18nRoutingAuthentication

Getting Started

# Deployment

A guide to deploying your Shoplit project built with Next.js to production.

## Prerequisites

Before deploying, ensure you have:

- Node.js 18.x or later installed

- PostgreSQL database setup

- SMTP server for email functionality

- Storage service (DigitalOcean Spaces or AWS S3)

- Google OAuth credentials (optional)

## Environment Setup

Create a .env.production file with the following configurations:

```text
# Database Configuration
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require&connection_limit=2"
 
# Next Auth Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
 
# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
 
# SMTP Configuration
SMTP_HOST=your-smtp-host
SMTP_PORT=465
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM="Your App Name"
 
# Storage Configuration (DigitalOcean Spaces)
STORAGE_TYPE=digitalocean
STORAGE_ACCESS_KEY_ID=your-access-key
STORAGE_SECRET_ACCESS_KEY=your-secret-key
STORAGE_REGION=your-region
STORAGE_BUCKET=your-bucket
STORAGE_ENDPOINT=https://your-space.region.digitaloceanspaces.com
STORAGE_FORCE_PATH_STYLE=true
STORAGE_CDN_URL=https://your-space.region.cdn.digitaloceanspaces.com/your-bucket
 
# Alternative: AWS S3 Configuration
# STORAGE_TYPE=s3
# STORAGE_ACCESS_KEY_ID=your-aws-key
# STORAGE_SECRET_ACCESS_KEY=your-aws-secret
# STORAGE_REGION=your-aws-region
# STORAGE_BUCKET=your-aws-bucket
# STORAGE_CDN_URL=your-cloudfront-url
```

## Database Migration

Run database migrations in production:

```text
# Generate Prisma Client
npx prisma generate
 
# Run migrations
npx prisma migrate deploy
 
# Seed initial data (if needed)
npx prisma db seed
```

## Build Process

- Install dependencies:

```text
npm install --production
```

- Build the application:

```text
npm run build
```

- Start the production server:

```text
npm run start
```

## Deployment Options

### 1. Docker Deployment

Shoplit includes a Dockerfile for containerized deployment:

```text
FROM node:18-alpine AS base
 
# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
 
# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
 
# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
 
# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
 
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
 
CMD ["node", "server.js"]
```

### 2. Platform Deployments

#### Vercel

- Connect your GitHub repository

- Configure environment variables

- Deploy with:

```text
vercel --prod
```

#### DigitalOcean App Platform

- Create a new app

- Connect your repository

- Configure environment variables

- Set build command: npm run build

- Set run command: npm start

## Post-Deployment

### 1. SSL Configuration

Enable HTTPS using Let's Encrypt:

```text
# Using Certbot
certbot --nginx -d your-domain.com
```

### 2. Performance Monitoring

Monitor your application using:

-

Application Monitoring

- Response times

- Error rates

- Database performance

-

Server Monitoring

- CPU usage

- Memory usage

- Disk space

### 3. Security Checklist

- Enable HTTPS

- Configure CORS properly

- Set secure headers

- Enable rate limiting

- Configure CSP

- Set up firewall rules

## Scaling Considerations

### 1. Database Scaling

- Connection pooling with connection_limit

- Read replicas for heavy read operations

- Database indexing for performance

### 2. File Storage

- CDN configuration for static assets

- Image optimization settings

- Storage bucket policies

### 3. Caching Strategy

```text
// Example cache configuration
export const revalidate = 3600; // Revalidate every hour
 
// API route with cache headers
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

## Troubleshooting

Common deployment issues and solutions:

-

Database Connection Issues

- Check connection string format

- Verify network access

- Check connection limits

-

Build Failures

- Clear .next directory

- Verify Node.js version

- Check for missing dependencies

-

Runtime Errors

- Check environment variables

- Verify API endpoints

- Monitor error logs

## Maintenance

Regular maintenance tasks:

-

Updates

```text
# Update dependencies
npm update
 
# Check for security vulnerabilities
npm audit
```

-

Backups

```text
# Generate Prisma Client
npx prisma generate
 
# Run migrations
npx prisma migrate deploy
 
# Seed initial data (if needed)
npx prisma db seed
```0

-

Monitoring

```text
# Generate Prisma Client
npx prisma generate
 
# Run migrations
npx prisma migrate deploy
 
# Seed initial data (if needed)
npx prisma db seed
```1

PreviousRTLNexti18n

On This Page

- Prerequisites
- Environment Setup
- Database Migration
- Build Process
- Deployment Options

- 1. Docker Deployment
- 2. Platform Deployments

- Post-Deployment

- 1. SSL Configuration
- 2. Performance Monitoring
- 3. Security Checklist

- Scaling Considerations

- 1. Database Scaling
- 2. File Storage
- 3. Caching Strategy

- Troubleshooting
- Maintenance

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Deployment - Shoplit
-
-
