---
title: "RTL Support - Shoplit"
url: "https://docs.keenthemes.com/shoplit/shoplit/rtl"
section: "shoplit"
---
Purchase

#### Getting Started

IntroductionInstallationPrismaSupabaseComponentsReferencesPricingFAQChangelog

#### Guides

RTLDeploymenti18nRoutingAuthentication

Getting Started

# RTL Support

Learn how to enable and configure Right-to-Left (RTL) support in Shoplit

# RTL Support

Shoplit comes with built-in support for Right-to-Left (RTL) languages like Arabic. This guide will walk you through how to enable and configure RTL support in your application.

## Configuration

### 1. Language Configuration

RTL support is automatically enabled when you use RTL languages. The project uses Next.js i18n for internationalization. RTL languages are configured in next-i18next.config.js:

```text
module.exports = {
  i18n: {
    locales: ['en', 'ar'], // 'ar' is for Arabic, add more RTL locales as needed
    defaultLocale: 'en',
  },
};
```

### 2. Enabling RTL Mode

To enable RTL mode for a specific page or component, you need to set the dir attribute on the HTML element. This can be done in two ways:

#### Option 1: Page-level RTL

```text
// In your page component
export default function Page() {
  return (
    <div dir="rtl">
      {/* Your page content */}
    </div>
  );
}
```

#### Option 2: App-wide RTL

For app-wide RTL support, modify your root layout:

```text
// app/layout.tsx
export default function RootLayout({
  children,
  params: { locale }
}) {
  const isRTL = locale === 'ar'; // Add other RTL locales as needed
 
  return (
    <html dir={isRTL ? 'rtl' : 'ltr'}>
      <body>{children}</body>
    </html>
  );
}
```

## Styling with RTL

### CSS Logical Properties

Shoplit uses CSS logical properties for better RTL support. Instead of using left/right properties, use:

- margin-inline-start instead of margin-left

- margin-inline-end instead of margin-right

- padding-inline-start instead of padding-left

- padding-inline-end instead of padding-right

- border-inline-start instead of border-left

- border-inline-end instead of border-right

### Tailwind CSS Support

When using Tailwind CSS classes, use logical property utilities:

```text
<!-- Instead of: -->
<div class="ml-4 pl-2">
 
<!-- Use: -->
<div class="ms-4 ps-2">
```

Common RTL-aware Tailwind classes:

- ms-* - margin-inline-start

- me-* - margin-inline-end

- ps-* - padding-inline-start

- pe-* - padding-inline-end

## Best Practices

### Text Alignment

- Use text-start and text-end instead of text-left and text-right

- These will automatically flip in RTL mode

### Icons and Images

- Some icons may need to be flipped in RTL mode

- Use CSS transform when needed:

```text
[dir="rtl"] .icon {
  transform: scaleX(-1);
}
```

### Component Layout

- Use CSS Flexbox and Grid for layouts

- They automatically adjust for RTL

### Testing

- Always test your application in both LTR and RTL modes

- Pay special attention to:

- Navigation menus

- Forms and input fields

- Tables and data displays

- Modals and popups

- Animations and transitions

## Troubleshooting

If you encounter any RTL-related issues:

- Verify the dir attribute is properly set

- Check if you're using logical properties consistently

- Inspect element styles using browser dev tools

- Ensure all third-party components support RTL

- Test with different RTL languages and browsers

PreviousChangelogNextDeployment

On This Page

- RTL Support

- Configuration
- Styling with RTL
- Best Practices
- Troubleshooting

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

RTL Support - Shoplit
-
-
