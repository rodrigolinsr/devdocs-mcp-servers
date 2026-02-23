---
title: "Providers - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/providers"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Providers

Understanding and using context providers in Metronic Next.js

# Providers

Metronic Next.js uses a collection of context providers to manage application state and functionality. This guide explains each provider, its purpose, and how to use it in your application.

## Provider Architecture

Providers are organized in a nested structure in the root layout, giving all components access to their contexts:

```text
// app/layout.tsx
import { AuthProvider } from '@/providers/auth-provider';
import { I18nProvider } from '@/providers/i18n-provider';
import { QueryProvider } from '@/providers/query-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { TooltipsProvider } from '@/providers/tooltips-provider';
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full" suppressHydrationWarning>
      <body>
        <QueryProvider>
          <AuthProvider>
            <SettingsProvider>
              <ThemeProvider>
                <I18nProvider>
                  <TooltipsProvider>
                    {children}
                    <Toaster />
                  </TooltipsProvider>
                </I18nProvider>
              </ThemeProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

## Core Providers

### Query Provider

Provides TanStack Query functionality for data fetching and caching.

Usage:

```text
'use client';
 
import { useQuery } from '@tanstack/react-query';
 
function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(res => res.json())
  });
 
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading user</div>;
 
  return <div><h1>{data.name}</h1><p>{data.email}</p></div>;
}
```

### Auth Provider

Wraps NextAuth.js SessionProvider to handle authentication state.

Usage:

```text
'use client';
 
import { useSession, signIn, signOut } from 'next-auth/react';
 
function LoginButton() {
  const { data: session } = useSession();
 
  if (session) {
    return <button onClick={() => signOut()}>Sign out</button>;
  }
  return <button onClick={() => signIn()}>Sign in</button>;
}
```

### Settings Provider

Manages application settings with localStorage persistence.

Usage:

```text
'use client';
 
import { useSettings } from '@/providers/settings-provider';
 
function LayoutSettings() {
  const { getOption, storeOption } = useSettings();
 
  // Get a setting
  const sidebarCollapsed = getOption('layouts.demo1.sidebarCollapse');
 
  // Update a setting (and save to localStorage)
  function toggleSidebar() {
    storeOption('layouts.demo1.sidebarCollapse', !sidebarCollapsed);
  }
 
  return <button onClick={toggleSidebar}>
    {sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
  </button>;
}
```

### Theme Provider

Manages dark/light mode using next-themes.

Usage:

```text
'use client';
 
import { useTheme } from 'next-themes';
 
function ThemeToggle() {
  const { theme, setTheme } = useTheme();
 
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  );
}
```

### I18n Provider

Manages internationalization and RTL support.

Usage:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
import { I18N_LANGUAGES } from '@/i18n/config';
 
function LanguageSelector() {
  const { languageCode, changeLanguage } = useLanguage();
 
  return (
    <select
      value={languageCode}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {I18N_LANGUAGES.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Tooltips Provider

Provides tooltip functionality for the application.

Usage:

```text
'use client';
 
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
 
function ButtonWithTooltip() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button>Hover me</button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Tooltip content</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

## Creating Custom Hooks

For components that need access to multiple contexts, combine the hooks in a custom hook:

```text
'use client';
 
import { useSettings } from '@/providers/settings-provider';
import { useLanguage } from '@/providers/i18n-provider';
import { useTheme } from 'next-themes';
 
// Custom hook combining multiple contexts
export function useAppContext() {
  const settings = useSettings();
  const language = useLanguage();
  const theme = useTheme();
 
  return { settings, language, theme };
}
 
// Usage
function MyComponent() {
  const { settings, language, theme } = useAppContext();
 
  return (
    <div>
      <p>Current theme: {theme.theme}</p>
      <p>Current language: {language.languageCode}</p>
      <p>Layout: {settings.getOption('layout')}</p>
    </div>
  );
}
```

## Provider-Specific Documentation

For more detailed information about each provider, refer to these guides:

- Authentication - Using the Auth Provider

- Internationalization - Using the I18n Provider

- Dark Mode - Using the Theme Provider

- RTL Support - RTL features with I18n Provider

PreviousRoutingNextAuthentication

On This Page

- Providers

- Provider Architecture
- Core Providers
- Creating Custom Hooks
- Provider-Specific Documentation

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Providers - Metronic NextJS
-
-
