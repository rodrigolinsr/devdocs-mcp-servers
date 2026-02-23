---
title: "Prisma - Shoplit"
url: "https://docs.keenthemes.com/shoplit/shoplit/prisma"
section: "shoplit"
---
Purchase

#### Getting Started

IntroductionInstallationPrismaSupabaseComponentsReferencesPricingFAQChangelog

#### Guides

RTLDeploymenti18nRoutingAuthentication

Getting Started

# Prisma

This guide demonstrates how to setup a free PostgreSQL database using Prisma.

## Setup Database

The Prisma console allows you to manage your Prisma projects and databases through a web interface.
This guide will walk you through the registration process and how to use the console.

### Sign Up for a Prisma Account

- Visit Prisma.

- Click on the "Get started for free" button.

- You can sign up using your email address or through a third-party service like GitHub or Google.

- Follow the prompts to complete the registration process.

### Create a New Project

- Once logged in, you will be redirected to Prisma Console.

- Click on "Create New Project."

- Enter a project name.

- Click on "Get Started" button for Prisma Postgres.

- Click "Create project" button.

### Obtain Your Connection String

A connection string is a string that your application uses to connect to a database. It contains information such as the database type, host, port, username, password, and database name. In the context of Prisma, the connection string is used to connect your Prisma Client to your database.

- In the left sidebar, click on the "Database" menu.

- Navigate to the "Setup" tab.

- Select the "Existing Project" option.

- Click on the "Generate Database Credentials" button.

- Copy the generated connection string.

- Open your project's .env file and add the connection string there.

```text
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=your_api_key"
```

Here's a breakdown of the Prisma connection string:

```text
DATABASE_URL="prisma+postgres://username:password@host:port/database?api_key=your_api_key"
```

- prisma+postgres: Specifies the database type and the protocol Prisma uses to connect.

- username: The username for your database.

- password: The password for your database.

- host: The host address where your database is running.

- port: The port number on which your database is listening.

- database: The name of your database.

- api_key: An optional parameter for additional authentication or configuration.

### Deploy Your Model to the Database

After setting up your Prisma project and obtaining your connection string, the next step is to deploy your Prisma schema to your database. This will create the necessary tables and relationships based on your schema.

- Open your terminal.

- Navigate to your project directory.

- Run the following command to deploy your schema:

```text
npx prisma db push
```

This command will read your prisma/schema.prisma file and apply the changes to your database.

### Generate Prisma Client

Once your schema is deployed, you need to generate the Prisma Client. The Prisma Client is an auto-generated and type-safe query builder that you will use to interact with your database.

- In your terminal, run the following command:

```text
npx prisma generate
```

This command will generate the Prisma Client based on your schema and save it in the node_modules/@prisma/client directory.

PreviousInstallationNextSupabase

On This Page

- Setup Database

- Sign Up for a Prisma Account
- Create a New Project
- Obtain Your Connection String
- Deploy Your Model to the Database
- Generate Prisma Client

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Prisma - Shoplit
-
-
