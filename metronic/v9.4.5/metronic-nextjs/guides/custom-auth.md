---
title: "Custom Auth - Metronic NextJS"
url: "https://docs.keenthemes.com/metronic-nextjs/metronic-nextjs/guides/custom-auth"
section: "metronic-nextjs"
---
PurchasePreview

#### Getting Started

IntroductionInstallationStarter KitsPrismaSupabaseComponentsReferencesChangelog - v9.4.4PricingFAQ

#### Guides

Custom AuthAdding New PageLayoutsRoutingProvidersAuthenticationInternationalizationRTLDark ModeHooksDeployment

Getting Started

# Custom Auth

Learn how to remove default auth dependencies.

This guide helps you quickly remove the default auth dependencies and start your own auth implementation.

## Overview

This guide will help you:

- Remove Supabase and Prisma auth dependencies

- Remove NextAuth backend logic

- Keep all existing UI screens (login, signup, etc.)

- Set up a working mock auth system

- Maintain protected routes and layouts

- Keep everything functional for your custom implementation

## Steps to Remove Auth Dependencies

### Remove Auth Dependencies

#### Update package.json

Remove the following auth-related dependencies from your package.json:

```text
// Remove these from dependencies:
"@auth/core": "^0.39.1",
"@auth/prisma-adapter": "^2.9.1",
"@next-auth/prisma-adapter": "^1.0.7",
"next-auth": "^4.24.11",
"bcrypt": "^6.0.0",
"nodemailer": "^7.0.3",
 
// Remove these from devDependencies:
"@prisma/client": "^6.9.0",
"@types/bcrypt": "^5.0.2",
"@types/nodemailer": "^6.4.17",
"prisma": "^6.9.0",
```

#### Remove Prisma scripts

Remove the following from your package.json:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```

#### Install dependencies

Run the following command to update your dependencies:

```text
npm install
```

### Remove Prisma Files and Configuration

#### Delete Prisma directory

```text
rm -rf prisma/
```

#### Remove Prisma client

Delete the Prisma client file:

```text
rm -f lib/prisma.ts
```

### Remove NextAuth API Routes

#### Delete NextAuth API directory

```text
rm -rf app/api/auth/
```

#### Remove other auth API routes

```text
rm -rf app/api/user-management/
```

### Remove User Management Module

#### Delete user management pages

Remove the complex user management pages that depend on the database:

```text
rm -rf app/(protected)/user-management/
```

This removes:

- User listing and management pages

- Role and permission management

- User profile editing with complex fields

- User deletion and restoration features

- Account management with database integration

#### Update menu configuration (Optional)

If you want to remove user-management menu items, edit config/menu.config.tsx and remove or comment out the "User Management" sections:

```text
// Remove or comment out this section:
/*
{
  title: 'User Management',
  icon: ShieldUser,
  children: [
    {
      title: 'Users',
      path: '/user-management/users',
    },
    {
      title: 'Roles',
      path: '/user-management/roles',
    },
    // ... other user management menu items
  ],
},
*/
```

Note: The menu references won't break the app - they'll just show as 404 pages if clicked.

### Update Auth Provider

#### Create a simple auth context

Replace the content of providers/auth-provider.tsx:

```text
'use client';
 
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}
 
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  // Keep these for compatibility with existing UI
  data: { user: User | null } | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}
 
const AuthContext = createContext<AuthContextType | undefined>(undefined);
 
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
 
  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
 
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
 
    // Mock authentication - replace with your API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
 
    if (email === 'demo@kt.com' && password === 'demo123') {
      const mockUser: User = {
        id: '1',
        email: 'demo@kt.com',
        name: 'Demo User',
        avatar: '/media/avatars/300-2.png'
      };
 
      setUser(mockUser);
      localStorage.setItem('auth-user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
 
    setIsLoading(false);
    return false;
  };
 
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-user');
  };
 
  // Compatibility properties for existing UI components
  const data = user ? { user } : null;
  const status = isLoading ? 'loading' : user ? 'authenticated' : 'unauthenticated';
 
  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      data,
      status
    }}>
      {children}
    </AuthContext.Provider>
  );
}
 
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
 
// For compatibility with NextAuth useSession hook
export function useSession() {
  const { data, status } = useAuth();
  return { data, status };
}
 
// Mock signIn function for compatibility
export async function signIn(provider: string, options?: Record<string, unknown>) {
  // Suppress unused parameter warning
  void options;
 
  if (provider === 'credentials') {
    // This will be handled by your login form
    return { error: null };
  }
  if (provider === 'google') {
    // Mock Google sign in - replace with your implementation
    console.log('Google sign in clicked - implement your Google auth here');
    return { error: null };
  }
  return { error: 'Provider not supported' };
}
 
// Mock signOut function for compatibility
export function signOut() {
  // For compatibility, we'll handle logout through the context directly
  const authUser = localStorage.getItem('auth-user');
  if (authUser) {
    localStorage.removeItem('auth-user');
    window.location.reload(); // Force a reload to update the auth state
  }
}
```

### Update Protected Layout

#### Update the protected layout

Replace the content of app/(protected)/layout.tsx:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```0

### Update Sign In Page

#### Update only the auth logic in signin page

Replace the onSubmit function in app/(auth)/signin/page.tsx:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```1

And add the import at the top:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```2

### Update User Model

#### Create simplified user model

Replace the content of app/models/user.ts (or create it if it doesn't exist):

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```3

This removes complex user properties like:

- role, roleId, roleName - Complex role system

- status, permissions - User status and permission management

- createdAt, updatedAt, lastSignInAt - Database timestamps

- emailVerifiedAt, isTrashed, isProtected - Database-specific fields

### Remove Services (Optional)

#### Remove auth-related services

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```4

These services were used for:

- Email notifications (password reset, verification)

- System logging and audit trails

### Clean Up Environment Variables

#### Remove auth-related environment variables

Remove or comment out these variables from your .env.local:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```5

### Test Your Implementation

#### Start the development server

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```6

#### Test the mock login

- Navigate to /signin

- Use the demo credentials:

- Email: demo@kt.com

- Password: demo123

- Verify you can access protected routes

- Test the logout functionality

- All other auth pages should still display correctly

### Connect to Your Backend (When Ready)

#### Update the login function

In providers/auth-provider.tsx, replace the mock login with your API call:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```7

#### Add token management

For JWT tokens, update the auth provider:

```text
// Remove this entire section:
"prisma": {
  "seed": "node prisma/seed.js",
  "setup": "node prisma/setup.js"
},
```8

## Demo Credentials

For testing the mock authentication:

- Email: demo@kt.com

- Password: demo123

## Summary

This guide removes only the backend auth dependencies while keeping all your existing UI screens intact. The key changes are:

- Removed Prisma and NextAuth dependencies

- Removed database and API routes

- Created a compatible auth provider

- Kept all existing auth pages (signin, signup, etc.)

- Minimal changes to existing components

- Mock auth system for immediate testing

- Clear path to connect your own backend

Your existing auth UI screens will continue to work exactly as before, but now they're ready to connect to your custom backend implementation!

PreviousFAQNextAdding New Page

On This Page

- Overview
- Steps to Remove Auth Dependencies

- Remove Auth Dependencies
- Remove Prisma Files and Configuration
- Remove NextAuth API Routes
- Remove User Management Module
- Update Auth Provider
- Update Protected Layout
- Update Sign In Page
- Update User Model
- Remove Services (Optional)
- Clean Up Environment Variables
- Test Your Implementation
- Connect to Your Backend (When Ready)

- Demo Credentials
- Summary

©2026 Keenthemes. All rights reserved.

A Project by Keenthemes

Custom Auth - Metronic NextJS
-
-
