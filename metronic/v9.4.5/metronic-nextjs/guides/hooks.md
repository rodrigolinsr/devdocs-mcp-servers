---
title: "Hooks - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/hooks"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Hooks

Learn about the custom React hooks available in Metronic Next.js.

# Hooks

Metronic Next.js includes a collection of custom React hooks to simplify common UI patterns and functionality. These hooks are located in the hooks directory and can be imported as needed in your components.

## Available Hooks

Hook

Purpose

useViewport

Monitor viewport dimensions

useMobile

Detect mobile viewport

useScrollPosition

Monitor scroll position

useBodyClass

Add/remove body classes

useCopyToClipboard

Clipboard functionality

useMenu

Navigation menu state

useSliderInput

Slider with inputs

useMounted

Component mount detection

useRecaptchaV2

Google reCAPTCHA v2 integration

## Viewport Hooks

### useViewport

Monitor the viewport dimensions with automatic updates on window resize.

```text
'use client';
 
import { useViewport } from '@/hooks/use-viewport';
 
function ResponsiveComponent() {
  const [height, width] = useViewport();
 
  return (
    <div>
      <h3>Viewport Dimensions</h3>
      <p>Width: {width}px</p>
      <p>Height: {height}px</p>
    </div>
  );
}
```

### useMobile

Detect if the current viewport is considered mobile based on a breakpoint.

```text
'use client';
 
import { useMobile } from '@/hooks/use-mobile';
 
function ResponsiveLayout() {
  const isMobile = useMobile();
 
  return (
    <div>
      {isMobile ? (
        <div>Mobile Navigation</div>
      ) : (
        <div className="flex">
          <div className="sidebar">Sidebar</div>
          <div className="content">Content</div>
        </div>
      )}
    </div>
  );
}
```

## Document and Element Hooks

### useScrollPosition

Monitor scroll position with throttling to improve performance.

```text
'use client';
 
import { useScrollPosition } from '@/hooks/use-scroll-position';
 
function ScrollIndicator() {
  const scrollY = useScrollPosition();
  const scrollPercentage = Math.min(
    (scrollY / (document.body.scrollHeight - window.innerHeight)) * 100,
    100
  );
 
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div
        className="h-full bg-primary"
        style={{ width: `${scrollPercentage}%` }}
      />
    </div>
  );
}
```

### useBodyClass

Add or remove a CSS class from the document body element, useful for global styling states.

```text
'use client';
 
import { useBodyClass } from '@/hooks/use-body-class';
import { useState } from 'react';
 
function DarkModeToggle() {
  const [isDarkMode, setIsDarkMode] = useState(false);
 
  // Add or remove dark-mode class from body
  useBodyClass(isDarkMode ? 'dark-mode' : '');
 
  return (
    <button onClick={() => setIsDarkMode(!isDarkMode)}>
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

## UI Utility Hooks

### useCopyToClipboard

Provide clipboard copy functionality with success state management.

```text
'use client';
 
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
 
function CopyableText({ text }: { text: string }) {
  const { isCopied, copyToClipboard } = useCopyToClipboard({
    timeout: 2000 // Reset after 2 seconds
  });
 
  return (
    <div className="flex items-center">
      <code>{text}</code>
      <button onClick={() => copyToClipboard(text)}>
        {isCopied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
```

### useMenu

Manage menu state for dropdown or nested menu components.

```text
'use client';
 
import { useMenu } from '@/hooks/use-menu';
 
function NavigationMenu() {
  const { isActive, toggle, close } = useMenu();
 
  // Example menu items
  const menuItems = [
    { title: 'Dashboard', path: '/dashboard' },
    {
      title: 'Users',
      path: '/users',
      children: [
        { title: 'User List', path: '/users/list' },
        { title: 'User Profile', path: '/users/profile' }
      ]
    }
  ];
 
  return (
    <ul>
      {menuItems.map((item) => (
        <li key={item.path}>
          <a
            className={isActive(item.path) ? 'active' : ''}
            onClick={() => toggle(item.path)}
          >
            {item.title}
          </a>
 
          {item.children && isActive(item.path) && (
            <ul>
              {item.children.map((child) => (
                <li key={child.path}>
                  <a
                    className={isActive(child.path) ? 'active' : ''}
                    onClick={() => close()}
                  >
                    {child.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
```

### useSliderInput

Manage dual input sliders with synchronized text inputs.

```text
'use client';
 
import { useSliderInput } from '@/hooks/use-slider-input';
 
function PriceRangeFilter() {
  const {
    sliderValues,
    inputValues,
    handleSliderChange,
    handleInputChange,
    validateAndUpdateValue
  } = useSliderInput({
    minValue: 0,
    maxValue: 1000,
    initialValue: [100, 500]
  });
 
  return (
    <div>
      <input
        type="range"
        min={0}
        max={1000}
        value={sliderValues[0]}
        onChange={(e) => handleSliderChange([parseInt(e.target.value), sliderValues[1]])}
      />
 
      <div className="flex gap-4">
        <input
          type="number"
          value={inputValues[0]}
          onChange={(e) => handleInputChange(e, 0)}
          onBlur={(e) => validateAndUpdateValue(parseInt(e.target.value), 0)}
        />
        <input
          type="number"
          value={inputValues[1]}
          onChange={(e) => handleInputChange(e, 1)}
          onBlur={(e) => validateAndUpdateValue(parseInt(e.target.value), 1)}
        />
      </div>
 
      <p>Selected Range: ${sliderValues[0]} - ${sliderValues[1]}</p>
    </div>
  );
}
```

### useMounted

Check if a component has mounted, useful for avoiding hydration issues with SSR.

```text
'use client';
 
import { useMounted } from '@/hooks/use-mounted';
import { useTheme } from 'next-themes';
 
function ThemeAwareComponent() {
  const mounted = useMounted();
  const { theme } = useTheme();
 
  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div>Loading...</div>;
  }
 
  return (
    <div>
      <h3>Theme Information</h3>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

### useRecaptchaV2

Integrate Google reCAPTCHA v2 in your forms.

```text
'use client';
 
import { useRecaptchaV2 } from '@/hooks/use-recaptcha-v2';
 
function ContactForm() {
  const { recaptchaRef, executeRecaptcha, resetRecaptcha } = useRecaptchaV2();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
 
    try {
      // Execute reCAPTCHA and get token
      const token = await executeRecaptcha();
 
      // Submit form data with token
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: e.target.name.value,
          email: e.target.email.value,
          message: e.target.message.value,
          recaptchaToken: token
        })
      });
 
      if (response.ok) {
        // Reset form and reCAPTCHA
        e.target.reset();
        resetRecaptcha();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
 
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Your email" required />
      <textarea name="message" placeholder="Your message" required />
 
      {/* Recaptcha container */}
      <div ref={recaptchaRef} />
 
      <button type="submit">Send Message</button>
    </form>
  );
}
```

PreviousDark ModeNextDeployment

On This Page

- Hooks

- Available Hooks
- Viewport Hooks
- Document and Element Hooks
- UI Utility Hooks

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Hooks - Metronic NextJS
-
-
