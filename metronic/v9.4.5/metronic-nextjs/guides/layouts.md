---
title: "Layouts - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/layouts"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Layouts

Learn about the layout system in Metronic Next.js and how to use different layouts for various page types.

# Layouts

Metronic Next.js comes with multiple pre-built layouts to handle different page scenarios:

- Dashboard Layouts (Demo1-Demo10): Ten different layouts for authenticated dashboard pages

- Authentication Layouts: For login, registration, and other auth pages

- Root Layout: The base layout for the entire application

These layouts are organized in the App Router architecture and provide flexible options for creating different user experiences.

## Layout System in Next.js App Router

In Next.js App Router, layouts are defined using layout.tsx files that wrap the content of routes and their children:

```text
app/
├── layout.tsx           # Root layout (applies to all routes)
├── (auth)/
│   └── layout.tsx       # Auth layout (applies to all auth routes)
└── (protected)/
    ├── layout.tsx       # Protected layout (applies to all protected routes)
    └── account/
        └── layout.tsx   # Account layout (applies to all account routes)
```

Each layout receives its children through the children prop.

## Using Layouts

### Basic Layout Structure

A typical layout component includes a header, main content area, and footer:

```text
// A basic layout component
export function BasicLayout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        {/* Header content */}
      </header>
 
      <main className="main-content">
        {children}
      </main>
 
      <footer className="footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}
```

### Protected Layout Usage

To create a protected layout that checks for authentication:

```text
'use client';
 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
 
export default function ProtectedLayout({ children }) {
  const { status } = useSession();
  const router = useRouter();
 
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);
 
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
 
  return status === 'authenticated' ? children : null;
}
```

### Switching Between Demo Layouts

You can switch between different demo layouts using the SettingsProvider:

```text
'use client';
 
import { useSettings } from '@/providers/settings-provider';
 
function LayoutSwitcher() {
  const { setOption } = useSettings();
 
  // Change to Demo5 layout
  const switchToDemo5 = () => {
    setOption('layout', 'demo5');
  };
 
  return (
    <div>
      <button onClick={switchToDemo5}>Switch to Demo5</button>
      {/* Other layout options */}
    </div>
  );
}
```

## Available Demo Layouts

Metronic Next.js provides 10 different demo layouts, each with its own unique design:

- Demo1: Classic sidebar layout with a fixed sidebar and header

- Demo2: Horizontal navigation menu

- Demo3: Dark sidebar with light content

- Demo4: Mini sidebar with expandable navigation

- Demo5: Drawer sidebar that can be toggled

- Demo6: Centered content with minimal navigation

- Demo7: Two-column layout with left navigation

- Demo8: Card-based dashboard layout

- Demo9: Application-style layout with tabs

- Demo10: Modern layout with contextual sidebar

## Layout Features

### Layout Options

You can customize layout behavior using the SettingsProvider:

```text
'use client';
 
import { useSettings } from '@/providers/settings-provider';
 
function SidebarController() {
  const { getOption, storeOption } = useSettings();
 
  // Get current sidebar state
  const sidebarCollapsed = getOption('layouts.demo1.sidebarCollapse');
 
  // Toggle sidebar state
  const toggleSidebar = () => {
    storeOption('layouts.demo1.sidebarCollapse', !sidebarCollapsed);
  };
 
  return (
    <button onClick={toggleSidebar}>
      {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
    </button>
  );
}
```

### Responsive Layout Adjustments

Handle responsive layout changes based on screen size:

```text
'use client';
 
import { useEffect, useState } from 'react';
 
function ResponsiveLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
 
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
 
    // Initial check
    checkScreenSize();
 
    // Add listener for window resize
    window.addEventListener('resize', checkScreenSize);
 
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
 
  return (
    <div className={`layout ${isMobile ? 'mobile' : 'desktop'}`}>
      {!isMobile && <Sidebar />}
      <main>{children}</main>
    </div>
  );
}
```

## Creating Custom Layouts

To create a custom layout for your application:

- Create a layout component:

```text
// app/components/layouts/custom/layout.tsx
export function CustomLayout({ children }) {
  return (
    <div className="custom-layout">
      <header>My Custom Header</header>
      <main>{children}</main>
      <footer>My Custom Footer</footer>
    </div>
  );
}
```

- Use it in a route group layout:

```text
// app/(custom)/layout.tsx
import { CustomLayout } from '@/app/components/layouts/custom/layout';
 
export default function CustomSectionLayout({ children }) {
  return <CustomLayout>{children}</CustomLayout>;
}
```

## Nested Layouts

Next.js App Router supports nested layouts, where each child route can have its own layout that wraps around the parent layout:

```text
app/
├── (protected)/                # Uses Demo1Layout
│   └── account/                # Uses AccountLayout (wraps Demo1Layout)
│       └── settings/           # Uses SettingsLayout (wraps AccountLayout)
```

For more information about layouts in Next.js, refer to the official documentation.

PreviousAdding New PageNextRouting

On This Page

- Layouts

- Layout System in Next.js App Router
- Using Layouts
- Available Demo Layouts
- Layout Features
- Creating Custom Layouts
- Nested Layouts

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Layouts - Metronic NextJS
-
-
