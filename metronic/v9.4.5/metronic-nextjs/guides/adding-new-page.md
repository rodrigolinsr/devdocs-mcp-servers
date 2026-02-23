---
title: "Adding a New Page - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/adding-new-page"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Adding a New Page

Learn how to add a new page to your Metronic Next.js application.

This guide provides step-by-step instructions for adding a new page to the Metronic Next.js application using the App Router.

## Overview

Adding a new page to the application involves these key steps:

- Deciding where the page belongs

- Creating the page component

- Adding metadata and layout

- Linking to the page

- Testing the new page

## Step 1: Decide Where the Page Belongs

First, determine whether your page should be:

- Protected (requires authentication) → place in app/(protected)/

- Authentication-related → place in app/(auth)/

- Public → place directly in app/

## Step 2: Create the Page Component

For this example, let's create a new protected page for a reports section:

```text
// app/(protected)/reports/page.tsx
export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p>View and manage your reports</p>
 
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <ul className="space-y-2">
          <li>Monthly Sales Report</li>
          <li>User Activity Log</li>
          <li>Performance Metrics</li>
        </ul>
      </div>
    </div>
  );
}
```

For client-side interactivity, add the 'use client' directive:

```text
// app/(protected)/reports/analytics/page.tsx
'use client';
 
import { useState } from 'react';
 
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
 
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
 
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('week')}
        >
          Weekly
        </button>
        <button
          className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('month')}
        >
          Monthly
        </button>
      </div>
 
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{timeRange === 'week' ? 'Weekly' : 'Monthly'} Analytics</h2>
        <p>Analytics data will appear here</p>
      </div>
    </div>
  );
}
```

## Step 3: Add Metadata and Layout

### Page Metadata

Add metadata to your page for better SEO and title display:

```text
// app/(protected)/reports/page.tsx
import { Metadata } from 'next';
 
export const metadata: Metadata = {
  title: 'Reports | Metronic',
  description: 'View and manage your reports',
};
 
export default function ReportsPage() {
  // Component code...
}
```

### Layout (Optional)

If your section needs a specific layout, create a layout file:

```text
// app/(protected)/reports/layout.tsx
export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="reports-layout">
      <div className="mb-6">
        <nav className="flex space-x-4">
          <a href="/reports" className="text-primary font-medium">Overview</a>
          <a href="/reports/analytics" className="text-muted-foreground hover:text-foreground">Analytics</a>
          <a href="/reports/exports" className="text-muted-foreground hover:text-foreground">Exports</a>
        </nav>
      </div>
      <main>{children}</main>
    </div>
  );
}
```

## Step 4: Add Navigation Links

### Using Next.js Link Component

Update your navigation menu to include links to the new page:

```text
// app/components/layouts/demo1/components/sidebar.tsx
import Link from 'next/link';
import { BarChartIcon, FileTextIcon } from 'lucide-react';
 
export function Sidebar() {
  const menuItems = [
    { icon: BarChartIcon, path: '/', label: 'Dashboard' },
    { icon: FileTextIcon, path: '/reports', label: 'Reports' },
    // Other items...
  ];
 
  return (
    <aside className="sidebar">
      <nav className="space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center px-4 py-2 hover:bg-muted rounded-md"
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

## Step 5: Create Dynamic Routes (Optional)

For pages that need dynamic parameters:

```text
app/
└── (protected)/
    └── reports/
        └── [id]/
            └── page.tsx
```

```text
// app/(protected)/reports/[id]/page.tsx
export default function ReportDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Report Details</h1>
      <p>Viewing Report ID: {params.id}</p>
 
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Report Content</h2>
        <p>Report data will appear here</p>
      </div>
    </div>
  );
}
```

## Step 6: Create API Routes (Optional)

If your page needs a specific API endpoint:

```text
// app/api/reports/route.ts
import { NextResponse } from 'next/server';
 
export async function GET() {
  // In a real app, fetch from database
  const reports = [
    { id: '1', name: 'Monthly Sales' },
    { id: '2', name: 'User Activity' },
  ];
 
  return NextResponse.json({ reports });
}
```

## Step 7: Test Your New Page

- Start the development server:

```text
npm run dev
```

- Navigate to your new page:

- http://localhost:3000/reports

- http://localhost:3000/reports/analytics

- http://localhost:3000/reports/1 (dynamic route)

## Working with Protected Routes

The (protected) route group uses a layout with authentication checks:

```text
// app/(protected)/layout.tsx
'use client';
 
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
 
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

## Special Files

Next.js supports special files for common UI patterns:

### Loading State

```text
// app/(protected)/reports/analytics/page.tsx
'use client';
 
import { useState } from 'react';
 
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
 
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
 
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('week')}
        >
          Weekly
        </button>
        <button
          className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('month')}
        >
          Monthly
        </button>
      </div>
 
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{timeRange === 'week' ? 'Weekly' : 'Monthly'} Analytics</h2>
        <p>Analytics data will appear here</p>
      </div>
    </div>
  );
}
```0

### Error Handling

```text
// app/(protected)/reports/analytics/page.tsx
'use client';
 
import { useState } from 'react';
 
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
 
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
 
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('week')}
        >
          Weekly
        </button>
        <button
          className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('month')}
        >
          Monthly
        </button>
      </div>
 
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{timeRange === 'week' ? 'Weekly' : 'Monthly'} Analytics</h2>
        <p>Analytics data will appear here</p>
      </div>
    </div>
  );
}
```1

### Not Found

```text
// app/(protected)/reports/analytics/page.tsx
'use client';
 
import { useState } from 'react';
 
export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('week');
 
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
 
      <div className="flex space-x-2">
        <button
          className={`px-3 py-1 rounded ${timeRange === 'week' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('week')}
        >
          Weekly
        </button>
        <button
          className={`px-3 py-1 rounded ${timeRange === 'month' ? 'bg-primary text-white' : 'bg-muted'}`}
          onClick={() => setTimeRange('month')}
        >
          Monthly
        </button>
      </div>
 
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{timeRange === 'week' ? 'Weekly' : 'Monthly'} Analytics</h2>
        <p>Analytics data will appear here</p>
      </div>
    </div>
  );
}
```2

## Best Practices

-

Follow the App Router Structure:

- Page components go in page.tsx files

- Layouts go in layout.tsx files

- Shared components go in app/components/

-

Use Server vs. Client Components Appropriately:

- Keep most components as Server Components (no 'use client' directive)

- Only use 'use client' when you need:

- React hooks

- Event listeners

- Browser-only APIs

- Client-side state

-

Organize Routes Logically:

- Use route groups (folders with parentheses) to organize routes

- Keep related pages together

- Use nested layouts for shared UI elements

-

Use Metadata API:

- Add page metadata for better SEO

- Use dynamic metadata for data-dependent pages

-

Handle Loading and Error States:

- Create loading.tsx files for loading states

- Create error.tsx files for error handling

- Use not-found.tsx for 404 pages

## Troubleshooting

### Page Not Found

- Check that your file is named page.tsx

- Ensure the path in the browser matches your folder structure

- Check for typos in folder or file names

### Component Not Rendering

- Check browser console for errors

- If using client components, ensure 'use client' is at the top

- Verify imports are correct

### Layout Issues

- Ensure the page is in the correct folder structure

- Check that the layout component is correctly defined

- Verify the component hierarchy makes sense

PreviousCustom AuthNextLayouts

On This Page

- Overview
- Step 1: Decide Where the Page Belongs
- Step 2: Create the Page Component
- Step 3: Add Metadata and Layout

- Page Metadata
- Layout (Optional)

- Step 4: Add Navigation Links

- Using Next.js Link Component

- Step 5: Create Dynamic Routes (Optional)
- Step 6: Create API Routes (Optional)
- Step 7: Test Your New Page
- Working with Protected Routes
- Special Files

- Loading State
- Error Handling
- Not Found

- Best Practices
- Troubleshooting

- Page Not Found
- Component Not Rendering
- Layout Issues

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Adding a New Page - Metronic NextJS
-
-
