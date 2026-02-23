---
title: "RTL Support - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/rtl"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# RTL Support

Implement and use Right-to-Left (RTL) text direction in Metronic Next.js

# RTL Support

Metronic Next.js includes built-in support for Right-to-Left (RTL) languages like Arabic and Hebrew. This guide explains how to use and configure RTL features in your application.

## Overview

The RTL support system consists of these key components:

- I18nProvider: Sets document direction based on language preference

- RadixDirectionProvider: Propagates direction context to UI components

- Language Configuration: Defines direction for each supported language

- CSS Logical Properties: Used for direction-aware styling

## How RTL Works

When a user selects an RTL language like Arabic, several changes occur automatically:

- The dir attribute on the HTML document is set to rtl

- Radix UI components adjust their alignment and direction

- Tailwind's logical properties (start/end instead of left/right) respond accordingly

- Text alignment and flow direction are reversed

## Configuring Languages

To add RTL language support, define it in the language configuration:

```text
// In your code that uses language configuration
const languages = [
  {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    // Other properties...
  },
  {
    code: 'ar',
    name: 'Arabic',
    direction: 'rtl',
    // Other properties...
  }
];
```

## Switching to RTL Languages

Use the language selector component to switch between RTL and LTR languages:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
 
function LanguageSwitcher() {
  const { languageCode, changeLanguage } = useLanguage();
 
  return (
    <div>
      <button onClick={() => changeLanguage('en')}>
        English (LTR)
      </button>
      <button onClick={() => changeLanguage('ar')}>
        Arabic (RTL)
      </button>
    </div>
  );
}
```

## RTL-Aware Components

### Using Logical Properties

Instead of using left and right, use start and end in your styles:

```text
// ❌ Not RTL-aware
<div className="pl-4 ml-2 border-l">Content</div>
 
// ✅ RTL-aware
<div className="ps-4 ms-2 border-s">Content</div>
```

Tailwind CSS supports logical properties with these prefixes:

- ps- / pe- (padding-start/end)

- ms- / me- (margin-start/end)

- start- / end- (positioning)

- border-s / border-e (border-start/end)

- rounded-s / rounded-e (border-radius-start/end)

### Checking Current Direction

You can check the current language direction in client components:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
 
function DirectionAwareComponent() {
  const { language } = useLanguage();
  const isRTL = language.direction === 'rtl';
 
  return (
    <div>
      {isRTL ? (
        <span>RTL content</span>
      ) : (
        <span>LTR content</span>
      )}
    </div>
  );
}
```

## Common RTL Use Cases

### Mirroring Icons and Images

Some icons and images need to be mirrored in RTL mode:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
import { ArrowLeft, ArrowRight } from 'lucide-react';
 
function DirectionalButton() {
  const { language } = useLanguage();
  const isRTL = language.direction === 'rtl';
 
  return (
    <button>
      {isRTL ? <ArrowLeft /> : <ArrowRight />}
      Next
    </button>
  );
}
```

### Direction-Specific Styling

For more complex styling needs, use conditional classes based on direction:

```text
'use client';
 
import { useLanguage } from '@/providers/i18n-provider';
import { cn } from '@/lib/utils';
 
function SidebarComponent() {
  const { language } = useLanguage();
  const isRTL = language.direction === 'rtl';
 
  return (
    <div className={cn(
      "border p-4",
      isRTL ? "mr-auto" : "ml-auto"
    )}>
      Sidebar content
    </div>
  );
}
```

## Tables and Data Display

For tables and data displays, use text-start and text-end:

```text
function DataTable({ columns }) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.id} className="text-start">
              {column.name}
            </th>
          ))}
        </tr>
      </thead>
      {/* Table body */}
    </table>
  );
}
```

For more information about RTL support in Radix UI, refer to the Radix UI Direction Provider documentation.

PreviousInternationalizationNextDark Mode

On This Page

- RTL Support

- Overview
- How RTL Works
- Configuring Languages
- Switching to RTL Languages
- RTL-Aware Components
- Common RTL Use Cases
- Tables and Data Display

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

RTL Support - Metronic NextJS
-
-
