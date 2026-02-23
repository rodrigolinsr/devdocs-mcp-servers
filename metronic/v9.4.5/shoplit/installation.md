---
title: "Installation - Shoplit"
url: "https://docs.keenthemes.com/shoplit/shoplit/installation"
section: "shoplit"
---
Purchase

#### Getting Started

IntroductionInstallationPrismaSupabaseComponentsReferencesPricingFAQChangelog

#### Guides

RTLDeploymenti18nRoutingAuthentication

Getting Started

# Installation

Get started with Shoplit quickly by following this guide.

# Installation

This guide will help you set up Shoplit for development.

## Requirements

Before installing Shoplit, ensure you have:

- Node.js: Version 18.x or higher

- npm: Version 9.x or higher (comes with Node.js)

- Prisma: Version 6.x or higher

- PostgreSQL: Version 15 or higher (setup guide)

- Git: Latest version

## Database Setup

Database setup is required to use CRUDs.

Check out our Prisma or Supabase setup guides for more information.

## Installation Steps

### Clone the Repository

```text
git clone https://github.com/keenthemes/shoplit.git
cd shoplit
```

### Install Dependencies

Install project dependencies using npm:

```text
npm install --force
```

Note: The --force flag is used to forcefully reinstall the packages, even if they are already installed.

Note: We use React 19, which may show peer dependency warnings. These can be safely ignored.

### Environment Setup

- Create a .env.local file:

```text
cp .env.example .env.local
```

- Configure required environment variables:
You can get the database credentials from the Database Setup guide above.

```text
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shoplit"
 
# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
 
# OAuth (Optional)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
 
# Storage
STORAGE_TYPE="digitalocean"  # or "s3"
STORAGE_ACCESS_KEY_ID="your-access-key"
STORAGE_SECRET_ACCESS_KEY="your-secret-key"
STORAGE_REGION="your-region"
STORAGE_BUCKET="your-bucket"
```

### Development Server

Start the development server with Turbopack:

```text
npm run dev
```

Your application will be available at http://localhost:3000

### Additional Commands

- Format Code:

```text
npm run format
```

- Lint Code:

```text
npm run lint
```

- Production Build:

```text
npm run build
```

- Start Production Server:

```text
npm run start
```

PreviousIntroductionNextPrisma

On This Page

- Installation

- Requirements
- Database Setup
- Installation Steps

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Installation - Shoplit
-
-
