---
title: "Starter Kits - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/getting-started/starter-kits"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Starter Kits

Available layouts and pages in Metronic Next.js starter kits.

This guide shows the available layouts and pages in the Metronic Next.js starter kit.

## What are Starter Kits?

Starter Kits in Metronic are ready-to-use, simple versions that give developers a good starting point. They are the simplified version of Metronic with only the most important parts.

### Key Features

- Simple Setup - Only basic files and important tools are included, making your app faster and smaller

- Clean Start - Removes example content and complicated features to provide a clean starting point for your own work

- Ready to Use - Made for real websites and apps with good settings and simple setup

- Easy to Change - Designed as a starting point that lets developers add features step by step as needed

- Made for Developers - Helps developers focus on what they need without extra stuff they don't need

## Available Layouts

The Next.js starter kit includes 14 different demo layouts.

## Project Structure

```text
app/                    # Next.js App Router
├── (layouts)/          # Layout-specific routes
│   ├── layout-1/       # Layout 1 pages
│   ├── layout-2/       # Layout 2 pages
│   └── ...             # Other layouts
├── (auth)/             # Authentication routes
├── (protected)/        # Protected routes
├── api/                # API routes
└── layout.tsx          # Root layout
 
components/             # UI Components
├── layouts/            # Demo layouts (1-14)
│   ├── layout-1/       # Layout 1 components
│   ├── layout-2/       # Layout 2 components
│   └── ...             # Other layouts
└── ui/                 # Base UI components
```

## Layouts & Pages

### Available Layouts

Each layout is located in components/layouts/.

### Layout Components

Each layout includes these components:

```text
components/layouts/layout-1/
├── components/
│   ├── header.tsx           # Main header
│   ├── sidebar.tsx          # Sidebar navigation
│   ├── sidebar-menu.tsx     # Menu items
│   ├── sidebar-header.tsx   # Sidebar header
│   ├── toolbar.tsx          # Page toolbar
│   ├── breadcrumb.tsx       # Breadcrumb navigation
│   ├── mega-menu.tsx        # Mega menu
│   ├── mega-menu-mobile.tsx # Mobile menu
│   ├── footer.tsx           # Footer
│   ├── main.tsx             # Main content area
│   └── context.tsx          # Layout context
├── shared/                  # Shared components
└── index.tsx                # Layout entry point
```

### Page Structure

Pages are organized by layout in app/(layouts)/:

```text
app/(layouts)/
├── layout-1/           # Layout 1 pages
│   ├── page.tsx        # Dashboard page
│   └── layout.tsx      # Layout wrapper
├── layout-2/           # Layout 2 pages
│   ├── page.tsx        # Dashboard page
│   └── layout.tsx      # Layout wrapper
└── ...                 # Other layouts (3-14)
```

Each layout includes:

- page.tsx - Main dashboard page with toolbar and content

- layout.tsx - Layout wrapper that applies the specific demo layout

### Switching Layouts

To switch between layouts, modify the layout component in app/(protected)/layout.tsx:

```text
<Demo5Layout>
  {children}
</Demo5Layout>
```

## Customization

### Adding New Pages

- Create a new page component in the appropriate layout folder

- Add the route to the Next.js routing structure

- Update the navigation menu if needed

### Modifying Layouts

Each layout component can be customized:

- Modify the sidebar navigation

- Change the header design

- Update the footer content

- Customize the color scheme

PreviousInstallationNextPrisma

On This Page

- What are Starter Kits?

- Key Features

- Available Layouts
- Project Structure
- Layouts & Pages

- Available Layouts
- Layout Components
- Page Structure
- Switching Layouts

- Customization

- Adding New Pages
- Modifying Layouts

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Starter Kits - Metronic NextJS
-
-
