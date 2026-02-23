---
title: "Dark Mode - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/dark-mode"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Dark Mode

Implement and customize dark mode in Metronic Next.js using next-themes

# Dark Mode

Metronic Next.js includes built-in dark mode support powered by next-themes. This guide explains how to use and customize the dark mode functionality in your application.

## Overview

The dark mode system is built around these key components:

- ThemeProvider: Provides theme state and switching functions

- next-themes: Powers the theme management under the hood

- Tailwind CSS: Uses class-based dark mode styling

- Theme Toggle: UI component for switching between light and dark modes

## Setup

The ThemeProvider from next-themes is already configured in the project at providers/theme-provider.tsx:

```text
// providers/theme-provider.tsx
'use client';
 
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
 
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
```

This provider is included in the root layout at app/layout.tsx:

```text
// app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider';
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Using Dark Mode

### Accessing Theme State

To access or change the theme in any component, use the useTheme hook:

```text
'use client';
 
import { useTheme } from 'next-themes';
 
export function ThemeInfo() {
  const { theme, setTheme } = useTheme();
 
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

### Creating a Theme Toggle

Create a theme toggle component that handles hydration correctly:

```text
'use client';
 
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
 
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
 
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
 
  if (!mounted) {
    return null;
  }
 
  return (
    <div className="flex gap-2">
      <button
        className={`p-2 rounded-md ${theme === 'light' ? 'bg-muted' : ''}`}
        onClick={() => setTheme('light')}
        aria-label="Light mode"
      >
        <Sun className="h-5 w-5" />
      </button>
      <button
        className={`p-2 rounded-md ${theme === 'dark' ? 'bg-muted' : ''}`}
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
      >
        <Moon className="h-5 w-5" />
      </button>
      <button
        className={`p-2 rounded-md ${theme === 'system' ? 'bg-muted' : ''}`}
        onClick={() => setTheme('system')}
        aria-label="System preference"
      >
        <Monitor className="h-5 w-5" />
      </button>
    </div>
  );
}
```

### Detecting Theme for Conditional Logic

Use resolvedTheme to get the actual theme after system preferences are applied:

```text
'use client';
 
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
 
export function ThemeBasedFeature() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
 
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
 
  if (!mounted) {
    return null;
  }
 
  const isDark = resolvedTheme === 'dark';
 
  return (
    <div>
      {isDark ? (
        <p>Dark mode content</p>
      ) : (
        <p>Light mode content</p>
      )}
    </div>
  );
}
```

## Styling for Dark Mode

With Tailwind CSS, add dark mode styles using the dark: prefix:

```text
// This works in both server and client components
export function Card({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2">{content}</p>
    </div>
  );
}
```

## Forcing Theme for Components

For UI elements that should always use a specific theme, create a wrapper component:

```text
// components/always-light-theme.tsx
'use client';
 
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';
 
export function AlwaysLightTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider forcedTheme="light" attribute="class">
      {children}
    </ThemeProvider>
  );
}
```

Usage:

```text
// Must be used in a client component or in a client component boundary
'use client';
 
import { AlwaysLightTheme } from '@/components/always-light-theme';
 
export function ThemeDemo() {
  return (
    <div>
      <h1>Normal themed content</h1>
 
      <AlwaysLightTheme>
        <div className="p-4 bg-white text-black rounded-md shadow">
          This content is always light mode, regardless of the site theme
        </div>
      </AlwaysLightTheme>
    </div>
  );
}
```

## Theme with Server Components

When working with server components, remember that:

- You cannot use useTheme() directly in server components

- Dark mode classes from Tailwind CSS (dark:class-name) work in both server and client components

- For dynamic theme behavior, you need a client component boundary

Example of a proper pattern:

```text
// app/theme-example/page.tsx
import { ServerThemeContent } from './server-content';
import { ClientThemeToggle } from './client-toggle';
 
// This is a server component
export default function ThemePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold dark:text-white mb-4">
        Theme Example Page
      </h1>
 
      {/* This content uses dark mode classes but doesn't need theme state */}
      <ServerThemeContent />
 
      {/* Client component boundary for theme toggling */}
      <ClientThemeToggle />
    </div>
  );
}
```

```text
// app/theme-example/server-content.tsx
// This is a server component that uses dark mode classes
export function ServerThemeContent() {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md mb-4">
      <p className="text-gray-800 dark:text-gray-200">
        This component is rendered on the server, but still responds to theme
        changes thanks to Tailwind's dark mode classes.
      </p>
    </div>
  );
}
```

```text
// app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider';
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```0

For more information about next-themes, refer to the official documentation.

PreviousRTLNextHooks

On This Page

- Dark Mode

- Overview
- Setup
- Using Dark Mode
- Styling for Dark Mode
- Forcing Theme for Components
- Theme with Server Components

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Dark Mode - Metronic NextJS
-
-
