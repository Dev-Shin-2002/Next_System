# Design Specification: Admin & Portal Layouts Architecture

**Date:** 2026-10-24  
**Project:** System Manager (`system-manager`)  
**Design Theme:** Dark Tech Aesthetic (`/style-md`)  
**Status:** Approved for Implementation  

---

## 1. Executive Summary & Goals

This specification defines the architectural design, component decomposition, state management, and behavioral interactions for two dedicated layouts in the **System Manager** application:
1. **Admin Layout (`(admin)`)**: A high-density system management workspace featuring a 240px/64px collapsible sidebar, dynamic telemetry status header, breadcrumb navigation, and responsive drawer for system operators.
2. **Portal Layout (`(portal)`)**: A public-facing gateway and documentation portal featuring a sticky navigation bar, brand highlights, language switcher, public status indicator, and sticky footer.

All components strictly comply with the **Dark Tech Aesthetic (/style-md)** tokens defined in `src/theme/tokens.ts` and `src/theme/color.ts`:
- **Brutalist vs Pill Contrast**: `0px` border-radius for buttons (`btn-square`) vs `100px` for status chips (`v-chip`).
- **Surface**: Pure `#000000` base, `#0a0a0a` cards with 1px border `rgba(255, 255, 255, 0.145)`.
- **Accents**: Tech blue (`#52a8ff`), healthy green (`#62c073`), warning amber/gray (`#f59e0b` / `#999999`), and fail red (`#ef4444`).

---

## 2. Next.js Routing Architecture

To eliminate routing collisions on `/` while preserving clean URL segments, route groups are combined with an explicit `/admin` subsegment:

```text
e:\System_Manager\app\src\
├── app/
│   ├── layout.tsx                   # Global RootLayout (HTML, body, Fonts, I18nProvider)
│   ├── globals.css                  # Global Tailwind v4 theme + CSS variables
│   │
│   ├── (portal)/                    # Route Group: Public & Portal Pages
│   │   ├── layout.tsx               # Server Component wrapping children with <PortalLayout>
│   │   ├── page.tsx                 # Portal Landing Page (URL: /)
│   │   ├── docs/                    # Documentation overview (URL: /docs)
│   │   └── status/                  # Public operational status (URL: /status)
│   │
│   └── (admin)/                     # Route Group: Administrative Workspaces
│       ├── layout.tsx               # Server Component (reads cookies, wraps with AdminTelemetryProvider + AdminLayout)
│       └── admin/                   # Explicit sub-route segment (URL prefix: /admin)
│           ├── page.tsx             # Telemetry & System Dashboard (moved from previous root page)
│           ├── loading.tsx          # Monospace Dark Tech skeleton loader
│           ├── error.tsx            # Error boundary with reset trigger
│           └── not-found.tsx        # 404 handler for admin segments
```

> **Cleanup Notice**: The empty folder `src/app/layout` is deleted to prevent Next.js static segment conflicts.

---

## 3. Component Architecture & Directory Structure

Layout components are modularized into atomic units under `src/components/layout/`:

```text
src/
├── components/
│   ├── common/
│   │   ├── LanguageSwitcher.tsx     # Reusable client language switcher (vi / en)
│   │   └── IconRegistry.tsx         # Centralized SVG registry for string icon keys
│   └── layout/
│       ├── admin/
│       │   ├── AdminLayout.tsx      # Client Component: single source of truth for layout state
│       │   ├── AdminSidebar.tsx     # 240px ↔ 64px collapsible sidebar & mobile drawer (z-50)
│       │   ├── AdminHeader.tsx      # Sticky top bar with breadcrumb, telemetry chip, quick CTA
│       │   ├── AdminBreadcrumb.tsx  # Dynamic path-to-label translator
│       │   └── AdminTelemetryContext.tsx # Admin telemetry state (status, alertsCount, activeTasks)
│       ├── portal/
│       │   ├── PortalLayout.tsx     # Shell: min-h-screen flex flex-col with sticky footer
│       │   ├── PortalNavbar.tsx     # Sticky top navigation with mobile hamburger drawer
│       │   └── PortalFooter.tsx     # Public footer with operational status & copyright
│       └── index.ts                 # Barrel exports
├── config/
│   ├── admin-nav.ts                 # Admin navigation schema & grouped items
│   └── portal-nav.ts                # Portal navigation items
```

---

## 4. Behavior, State Management & Responsive Rules

### 4.1. Sidebar Collapse State & SSR Hydration Guard
1. **Cookie Preference (`sm_sidebar_state`)**:
   - Possible values: `"expanded"` | `"collapsed"`.
   - Written client-side via:
     ```javascript
     document.cookie = `sm_sidebar_state=${nextState}; path=/; max-age=31536000; SameSite=Lax`;
     ```
   - Purpose: User preference only; no security implications.
2. **Server Hand-off (`app/(admin)/layout.tsx`)**:
   - Uses `const cookieStore = await cookies();` (Next.js async cookies API).
   - Reads `cookieStore.get('sm_sidebar_state')?.value === 'collapsed'`.
   - Passes `initialCollapsed: boolean` prop to `<AdminLayout>`.
   - *Architecture Note*: Acknowledged trade-off that `await cookies()` opts `(admin)` routes into dynamic rendering on the server, which aligns with real-time administration dashboard requirements.
3. **Single Source of Truth (`AdminLayout.tsx`)**:
   - `AdminLayout` is a Client Component managing the active state `isCollapsed`.
   - Renders the outer wrapper with:
     - `data-collapsed={isCollapsed}`
     - CSS variable style `--sidebar-current-width: ${isCollapsed ? '64px' : '240px'}`.
   - Main content viewport uses:
     ```tsx
     <main className="flex-1 ml-0 md:ml-[var(--sidebar-current-width)] transition-[margin] duration-200 ease-in-out p-6">
       {children}
     </main>
     ```
   - Collapse state is strictly applied on screens `md:` (`>= 768px`). On screens `< md`, main margin is always `ml-0`.

### 4.2. Mobile Drawer (< md)
- On screens `< md`, the sidebar transforms into an off-canvas slide-out drawer:
  - Width: Fixed at `240px` (regardless of collapse state).
  - Layer: `z-50` with transform `-translate-x-full` when closed, `translate-x-0` when open.
  - Scrim: Backdrop element at `z-40` with `bg-black/80 backdrop-blur-sm`.
  - UX guards:
    - Auto-closes upon route change (listening to `usePathname()`).
    - Focus trap enabled while open; returns focus to hamburger button on close.
    - Body scroll lock applied (`document.body.style.overflow = 'hidden'`) when open.
    - Closes on `Escape` key press or backdrop tap.

### 4.3. Navigation Schema & Matching Rules (`src/config/admin-nav.ts`)
```typescript
export interface NavItem {
  id: string;
  labelKey: string;     // i18n translation key (e.g., 'nav.dashboard')
  href: string;         // Target URL
  icon: string;         // Key mapping to IconRegistry
  exact?: boolean;      // True for root '/admin' to avoid matching all sub-paths
  groupKey: string;     // 'nav.groups.monitoring' | 'nav.groups.observability' | 'nav.groups.system'
  badgeKey?: 'alertsCount' | 'activeTasks';
}
```
- **Active state matching**:
  - If `exact: true`: `pathname === item.href`
  - Otherwise: `pathname === item.href || pathname.startsWith(item.href + '/')`
  - Active items receive `aria-current="page"`, left indicator bar `border-l-2 border-[#52a8ff]`, and active background `#1f1f1f`.
- **Badges**:
  - Displays dynamic count from `AdminTelemetryContext`.
  - Format: Hidden when `0` or `undefined`, renders `99+` if value exceeds 99.
- **Collapsed Sidebar Tooltips**:
  - When collapsed to `64px`, item text is visually hidden and replaced by `aria-label={label}` plus a floating CSS tooltip displaying the label on hover/focus.

---

## 5. Telemetry, Status & Data Sources

### 5.1. Status System & Color Semantics
To maintain high contrast and accessibility without ambiguity:
- **`pass` (Healthy)**: Color `#62c073`, dot indicator, text `"PASS: HEALTHY"`.
- **`warn` (Degraded / High Load)**: Color `#f59e0b` (Amber warning) or `#999999` with alert triangle icon, text `"WARN: DEGRADED"`.
- **`fail` (Down / Critical)**: Color `#ef4444` (Red error) with error icon, text `"FAIL: DOWN"`.
- **`offline` (Unreachable)**: Color `#6b7280`, text `"OFFLINE: UNREACHABLE"`.
- **`loading`**: Color `#52a8ff` with pulse animation, text `"CONNECTING..."`.

All status chips implement `role="status"` and `aria-live="polite"`.

### 5.2. Telemetry Scope & Security Isolation
- **Admin Scope (`AdminTelemetryContext`)**:
  - Polling interval: Configured by `CONFIG.dashboard.refreshIntervalMs` (default 30,000ms).
  - Supplies `status`, `cpuUsage`, `ramUsage`, `alertsCount`, and `activeTasks` across `AdminSidebar` and `AdminHeader`.
- **Portal Scope (Public Isolation)**:
  - **No internal host or port (`127.0.0.1:8888`) is exposed on the public portal**.
  - Public portal displays only general system health ("All Systems Operational", uptime statistics, copyright, and version `v0.1.0`).

---

## 6. Accessibility & Keyboard Navigation (a11y)

1. **ARIA Attributes**:
   - `aria-current="page"` on current navigation route.
   - `aria-expanded={isOpen}` on all drawer toggles and sidebar collapse triggers.
   - `aria-label` on icon-only buttons (theme toggle, collapse toggle, mobile menu button).
2. **Focus Visibility**:
   - Visible focus ring utilizing `--color-primary` (`#52a8ff`) with `outline-offset-2`.
3. **Semantic Hierarchy**:
   - Single `<h1>` per view, semantic `<header>`, `<nav>`, `<aside>`, `<main>`, `<footer>` landmarks.

---

## 7. Explicit Scope Boundaries

- **In Scope**:
  - Full implementation of `AdminLayout` and `PortalLayout` with all sub-components.
  - Setup of route groups `app/(portal)` and `app/(admin)/admin`.
  - Migration of existing telemetry dashboard to `app/(admin)/admin/page.tsx`.
  - Creation of Portal home page at `app/(portal)/page.tsx`.
  - Centralized navigation configs (`admin-nav.ts`, `portal-nav.ts`), icon registry, and shared `LanguageSwitcher`.
  - Error, loading, and not-found states for admin route group.
- **Out of Scope**:
  - Backend authentication providers (JWT/OAuth server); placeholder redirect mechanism is provided.
  - Real-time WebSocket or SSE server daemons (mocked polling telemetry provider provided).
  - Database persistence of user role permission matrices.
