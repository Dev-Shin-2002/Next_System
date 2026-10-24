# Design Specification: Admin & Portal Layouts Architecture

**Date:** 2026-10-24  
**Project:** System Manager (`system-manager`)  
**Design Theme:** Dark Tech Aesthetic (`/style-md`)  
**Status:** Approved for Implementation (v3 Finalized)  

---

## 1. Executive Summary & Design System Tokens

This specification defines the complete architectural design, component decomposition, state management, security boundaries, and responsive behaviors for two distinct layouts in the **System Manager** application:
1. **Admin Layout (`(admin)`)**: A high-density system management workspace featuring a 240px ↔ 64px collapsible sidebar, dynamic telemetry status header, breadcrumb navigation, and responsive mobile drawer for operators.
2. **Portal Layout (`(portal)`)**: A public-facing gateway and documentation portal featuring a sticky navigation bar, language switcher, public status indicator, and sticky footer.

### 1.1. Canonical Design Token Mapping
All layouts and components strictly enforce the **Dark Tech Aesthetic (/style-md)** semantic tokens defined in `src/theme/tokens.ts` and `src/theme/color.ts`:

| Semantic Role | CSS Variable / Token | Canonical Value | Usage & Visual Specs |
| :--- | :--- | :--- | :--- |
| **Base Canvas** | `var(--background)` | `#000000` | Deep black background for entire app |
| **Card Surface** | `var(--card)` | `#0a0a0a` | Container surface with 1px border `var(--border)` |
| **Border** | `var(--border)` | `rgba(255, 255, 255, 0.145)` | Universal subtle tech divider and container stroke |
| **Surface Active**| `var(--muted)` | `#1f1f1f` | Active navigation background, chip background |
| **Text Muted** | `var(--muted-foreground)` | `#999999` | Chip text, labels, secondary metadata |
| **Primary Accent**| `var(--color-primary)` | `#52a8ff` | Focus ring, active item left border, interactive accents |
| **Status Pass** | `var(--color-status-pass)` | `#62c073` | PASS: HEALTHY indicator dot |
| **Status Warn** | `var(--color-status-warn)` | `#f59e0b` | WARN: DEGRADED indicator with alert triangle icon |
| **Status Fail** | `var(--color-status-fail)` | `#ef4444` | FAIL: DOWN indicator with error icon |
| **Status Offline**| `var(--color-status-offline)`| `#9ca3af` | OFFLINE: UNREACHABLE indicator dot (contrast ratio > 4.5:1) |
| **Status Loading**| `var(--color-status-loading)`| `#52a8ff` | CONNECTING... indicator with pulse animation |
| **CTA Button** | `.btn-square` | `#FFFFFF` bg / `#121212` text | 0px border-radius, font-weight 600 |
| **Status Chip** | `.v-chip` | `#1f1f1f` bg / `#999999` text | 100px pill radius, 6px colored dot, uppercase mono |
| **Sidebar Width** | `--sidebar-width` / `--sidebar-width-collapsed` | `240px` / `64px` | Desktop sidebar canonical dimensions |

*Note on Status Chips*: In `.v-chip`, the label text consistently remains `var(--muted-foreground)` (`#999999`) across all states to preserve the Dark Tech monospace aesthetic; only the status dot and accompanying icon change color according to status.

---

## 2. Next.js Routing Architecture & Security Interception

### 2.1. Routing Tree
```text
e:\System_Manager\app\src\
├── middleware.ts                    # Edge middleware intercepting /admin/:path*
├── app/
│   ├── layout.tsx                   # Global RootLayout (HTML, body, Fonts, I18nProvider)
│   ├── globals.css                  # Global Tailwind v4 theme + CSS variables
│   │
│   ├── api/
│   │   └── public-status/
│   │       └── route.ts             # Public API returning operational health, version, mocked uptime
│   │
│   ├── (portal)/                    # Route Group: Public & Portal Pages
│   │   ├── layout.tsx               # Server Component wrapping children with <PortalLayout>
│   │   ├── page.tsx                 # Portal Landing Page (URL: /)
│   │   ├── docs/
│   │   │   └── page.tsx             # Documentation overview (URL: /docs)
│   │   └── status/
│   │       └── page.tsx             # Public operational status (URL: /status)
│   │
│   └── (admin)/                     # Route Group: Administrative Workspaces
│       ├── layout.tsx               # Server Component (reads cookies, wraps with AdminTelemetryProvider + AdminLayout)
│       └── admin/                   # Explicit sub-route segment (URL prefix: /admin)
│           ├── page.tsx             # Telemetry & System Dashboard (migrated from root)
│           ├── loading.tsx          # Monospace Dark Tech skeleton loader
│           ├── error.tsx            # Client Component ("use client") error boundary with reset
│           ├── not-found.tsx        # Admin-themed 404 page
│           └── [...slug]/
│               └── page.tsx         # Catch-all route calling notFound() for unmatched /admin/* URLs
```

> **Cleanup Notice**: The empty directory `src/app/layout/` must be deleted because its name causes confusion with `layout.tsx` and it is not a valid Route Group.

### 2.2. Middleware & Admin Route Interception (`src/middleware.ts`)
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/admin')) {
    // Structural placeholder check (NOT cryptographic authentication).
    // In production, real auth must verify token signature/expiry, and
    // Server Actions/route handlers under /admin must independently re-validate credentials.
    const sessionToken = request.cookies.get('sm_session')?.value;
    const authRequired = process.env.AUTH_REQUIRED === 'true'; // Server-side environment variable

    if (authRequired && !sessionToken) {
      // Note: /login is currently out of scope; redirection will 404 if AUTH_REQUIRED is enabled without /login.
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Can be expanded to ['/admin/:path*', '/api/admin/:path*'] when admin API endpoints are added.
  matcher: ['/admin/:path*'],
};
```

---

## 3. Component Architecture & Directory Structure

Layout components and state providers are cleanly decoupled:

```text
src/
├── providers/
│   └── AdminTelemetryProvider.tsx   # React Context + Polling Hook for system status & counters
├── components/
│   ├── common/
│   │   ├── LanguageSwitcher.tsx     # Reusable client language switcher (vi / en)
│   │   └── IconRegistry.tsx         # Centralized SVG registry for string icon keys
│   └── layout/
│       ├── admin/
│       │   ├── AdminLayout.tsx      # Client Component: single source of truth for layout state
│       │   ├── AdminSidebar.tsx     # Collapsible sidebar (desktop) & drawer (mobile z-50)
│       │   ├── AdminHeader.tsx      # Header with id="admin-header", hamburger, breadcrumbs, status chip, CTA
│       │   └── AdminBreadcrumb.tsx  # Dynamic path-to-label translator with fallback formatting
│       ├── portal/
│       │   ├── PortalLayout.tsx     # Shell: min-h-screen flex flex-col with sticky footer
│       │   ├── PortalNavbar.tsx     # Sticky top navigation with mobile collapsible menu
│       │   └── PortalFooter.tsx     # Public footer with operational status, version & copyright
│       └── index.ts                 # Barrel exports
├── config/
│   ├── admin-nav.ts                 # Admin navigation schema & grouped items
│   └── portal-nav.ts                # Portal navigation items
```

---

## 4. Behavior, State Management & Responsive Rules

### 4.1. Sidebar Collapse State & SSR Hydration Guard
1. **Cookie Preference (`sm_sidebar_state`)**:
   - Values: `"expanded"` | `"collapsed"`.
   - Written client-side via:
     ```javascript
     document.cookie = `sm_sidebar_state=${nextState}; path=/; max-age=31536000; SameSite=Lax`;
     ```
   - Intended strictly for UI layout preference (non-sensitive).
2. **Server Hand-off (`app/(admin)/layout.tsx`)**:
   - Uses `const cookieStore = await cookies();` (Next.js async cookies API).
   - Reads `cookieStore.get('sm_sidebar_state')?.value === 'collapsed'`.
   - Passes `initialCollapsed: boolean` prop down to `<AdminLayout>`.
   - *Architecture Note*: Using `await cookies()` opts `(admin)` routes into dynamic server rendering, which is desired and appropriate for real-time telemetry dashboards.
3. **Single Source of Truth (`AdminLayout.tsx`)**:
   - `AdminLayout` is a Client Component (`"use client"`) managing `isCollapsed` and `isMobileOpen`.
   - Renders the outer wrapper with:
     - `data-collapsed={isCollapsed}`
     - Style `--sidebar-current-width: ${isCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)'}`.
   - Main content viewport applies:
     ```tsx
     <main id="main-content" className="flex-1 ml-0 md:ml-[var(--sidebar-current-width)] transition-[margin] duration-200 ease-in-out p-6">
       {children}
     </main>
     ```
   - Collapse state is strictly applied on desktop (`md:` `>= 768px`). On mobile (`< md`), the margin is always `ml-0`.

### 4.2. Mobile Drawer (< md)
- On `< md`, the sidebar transforms into an off-canvas drawer:
  - Width: Fixed at `var(--sidebar-width)` (`240px`), regardless of desktop collapse cookie.
  - Layer: `z-50` with `-translate-x-full` when closed, `translate-x-0` when open.
  - Scrim: Backdrop element at `z-40` with `bg-black/80 backdrop-blur-sm`.
  - Accessible Focus Trap (React 19.3.0 Native `inert` support):
    - When `isMobileOpen === true`, apply `inert={isMobileOpen}` (boolean prop supported in React 19) to `#main-content` and `#admin-header`.
    - Auto-focuses first focusable element in drawer upon opening; returns focus to hamburger button upon closing.
  - Body scroll lock: Sets `document.body.style.overflow = 'hidden'` while open.
  - Dismissal: Auto-closes on route change (via `usePathname()`), `Escape` key press, or backdrop click.

### 4.3. Navigation Schema & Matching Rules (`src/config/admin-nav.ts`)
```typescript
export interface NavItem {
  id: string;
  labelKey: string;     // i18n translation key (e.g., 'nav.dashboard')
  href: string;         // Target URL (/admin, /admin/services,...)
  icon: string;         // Key mapped in IconRegistry ('dashboard', 'services', etc.)
  exact?: boolean;      // True for root '/admin'
  groupKey: string;     // 'nav.groups.monitoring' | 'nav.groups.observability' | 'nav.groups.system'
  badgeKey?: 'alertsCount' | 'activeTasks';
}
```
- **Active state matching**:
  - If `exact: true`: `pathname === item.href`.
  - Otherwise: `pathname === item.href || pathname.startsWith(item.href + '/')`.
  - Active items receive `aria-current="page"`, `border-l-2 border-[var(--color-primary)]`, and background `var(--muted)`.
- **Badges**:
  - Dynamically resolved from `AdminTelemetryContext`.
  - Format: Hidden when `0` or `undefined`; formats as `99+` if count exceeds 99.
- **Collapsed Sidebar Tooltips**:
  - When collapsed to `var(--sidebar-width-collapsed)`, labels are visually hidden and replaced by `aria-label={label}` plus a floating CSS tooltip (`left-full ml-2`) on hover/focus.

### 4.4. Dynamic Breadcrumbs (`AdminBreadcrumb.tsx`)
- Maps current URL segments against `admin-nav.ts` using `labelKey`.
- **Fallback Rule for Dynamic Segments (e.g., `/admin/services/[id]`)**:
  - If a segment does not exist in `admin-nav.ts`, transform the raw slug to uppercase with hyphens replaced by spaces (e.g. `cluster-alpha` → `CLUSTER ALPHA`).

---

## 5. Telemetry, Status & Data Sources

### 5.1. Status System & Color Semantics
Status chip uses semantic variables with explicit visual cues:
- **`pass` (Healthy)**: `var(--color-status-pass)` (`#62c073`), green dot, text `"PASS: HEALTHY"`.
- **`warn` (Degraded)**: `var(--color-status-warn)` (`#f59e0b`), alert triangle icon, text `"WARN: DEGRADED"`.
- **`fail` (Down / Critical)**: `var(--color-status-fail)` (`#ef4444`), error exclamation icon, text `"FAIL: DOWN"`.
- **`offline` (Unreachable)**: `var(--color-status-offline)` (`#9ca3af`), text `"OFFLINE: UNREACHABLE"`.
- **`loading`**: `var(--color-status-loading)` (`#52a8ff`), pulse animation, text `"CONNECTING..."`.

All status chips implement `role="status"` and `aria-live="polite"`.

### 5.2. Telemetry Scope & Security Isolation
- **Admin Scope (`src/providers/AdminTelemetryProvider.tsx`)**:
  - Polling interval: Configurable via `CONFIG.dashboard.refreshIntervalMs` (default 30,000ms).
  - Pauses polling when `document.visibilityState === 'hidden'`; immediately triggers a sync when returning to `visible`.
  - Failure Resilience: After 3 consecutive failed fetches, status automatically transitions to `offline`. The provider continues polling every 30s in the background; a single subsequent successful fetch will immediately recover status back to live telemetry.
  - Supplies `status`, `alertsCount`, and `activeTasks` across `AdminSidebar` and `AdminHeader`.
- **Portal Scope & Public Endpoint (`/api/public-status`)**:
  - Route handler with `export const revalidate = 30;` to prevent redundant invocations.
  - Returns sanitized JSON: `{ status: "operational", uptime: 99.98, version: "0.1.0", updatedAt: ISOString }` *(Note: uptime is mocked at 99.98 at this stage)*.
  - **Security Rule: Internal IP/Host (`127.0.0.1:8888`) is strictly prohibited on the public portal**.
  - `PortalFooter` and `/status` consume `/api/public-status`.

---

## 6. Accessibility & Keyboard Navigation (a11y)

1. **ARIA Compliance**:
   - `aria-current="page"` on active navigation links.
   - `aria-expanded={isOpen}` on mobile hamburger toggle and desktop collapse toggle.
   - `aria-label` on all icon-only buttons.
2. **Keyboard Focus**:
   - Focus ring using `var(--color-primary)` with `outline-offset-2`.
3. **Semantic Landmarks**:
   - Single `<h1>` per view, proper `<header id="admin-header">`, `<nav>`, `<aside>`, `<main id="main-content">`, `<footer>` tags.

---

## 7. Explicit Scope Boundaries

- **In Scope**:
  - `AdminLayout`, `PortalLayout` and all listed child components.
  - Route groups `app/(portal)` and `app/(admin)/admin` with error boundaries, loading skeletons, and 404 catch-alls.
  - Migration of telemetry dashboard to `app/(admin)/admin/page.tsx`.
  - Portal home, docs overview, and status page.
  - Public status API endpoint (`/api/public-status`).
  - Edge middleware placeholder (`src/middleware.ts`).
  - Navigation configs (`admin-nav.ts`, `portal-nav.ts`), icon registry, and shared `LanguageSwitcher`.
- **Out of Scope**:
  - Production OAuth/JWT authentication server implementation and real `/login` page UI.
  - Live WebSocket / SSE telemetry streaming backend (mocked polling provider used for layout UI).
  - Role-based database access control matrices.
