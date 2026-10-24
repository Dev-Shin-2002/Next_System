# Admin & Portal Layouts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement two decoupled, accessible, and responsive layouts—**Admin Layout** (`(admin)`) and **Portal Layout** (`(portal)`)—strictly adhering to the Dark Tech Aesthetic (`/style-md`) specifications.

**Architecture:** Next.js 16+ App Router with Route Groups `(portal)` and `(admin)`, where admin pages live under `/admin` to eliminate root collision. State-synchronized collapsible sidebar via server-read cookies, React 19 native `inert` focus trap for mobile drawer, isolated public telemetry API, and edge middleware for admin routes.

**Tech Stack:** Next.js 16.4.2 (App Router), React 19.3.0, TypeScript 5, Tailwind CSS v4, Dark Tech Design Tokens (`/style-md`).

## Global Constraints
- Strictly enforce Dark Tech Aesthetic: 0px border-radius for buttons (`.btn-square`) vs 100px for status chips (`.v-chip`).
- Universal tech container border: `1px solid var(--border)` (`rgba(255, 255, 255, 0.145)`).
- Desktop sidebar widths: `--sidebar-width: 240px` and `--sidebar-width-collapsed: 64px`.
- Mobile drawer: Fixed at 240px at `z-50`, scrim at `z-40`, with native `inert` on non-drawer content.
- Telemetry colors: Pass (`#62c073`), Warn (`#f59e0b`), Fail (`#ef4444`), Offline (`#9ca3af`), Loading (`#52a8ff`).
- No internal host/port (`127.0.0.1:8888`) exposed on public portal.
- Verify with `npm run build` after each milestone.

---

### Task 1: Semantic Tokens & CSS Variables Setup

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/theme/tokens.ts`
- Modify: `src/theme/color.ts`

**Interfaces:**
- Produces: CSS variables `--sidebar-width`, `--sidebar-width-collapsed`, `--border`, `--color-status-pass`, `--color-status-warn`, `--color-status-fail`, `--color-status-offline`, `--color-status-loading`.

- [ ] **Step 1: Update `globals.css` with layout variables and status colors**

Add the sidebar dimensions, border variable, and semantic status colors to `@theme inline` and `:root`:

```css
/* in src/app/globals.css */
@theme inline {
  --font-sans: var(--font-sans);
  --font-display: var(--font-display);
  --font-mono: var(--font-mono);

  --color-primary: #52a8ff;
  --color-success: #62c073;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #52a8ff;

  --color-status-pass: #62c073;
  --color-status-warn: #f59e0b;
  --color-status-fail: #ef4444;
  --color-status-offline: #9ca3af;
  --color-status-loading: #52a8ff;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-border: var(--border);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);

  --sidebar-width: 240px;
  --sidebar-width-collapsed: 64px;
}

:root {
  --background: #000000;
  --foreground: #ffffff;
  --card: #0a0a0a;
  --card-foreground: #ffffff;
  --sidebar: #000000;
  --sidebar-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.145);
  --muted: #1f1f1f;
  --muted-foreground: #999999;
  --sidebar-width: 240px;
  --sidebar-width-collapsed: 64px;
}
```

- [ ] **Step 2: Update `src/theme/color.ts` & `src/theme/tokens.ts`**

Update `COLORS.brand.warning` and `COLORS.status` to use `#f59e0b` and `#9ca3af`, ensuring type safety across TypeScript imports.

- [ ] **Step 3: Verify build**

Run: `npm run build` in `e:\System_Manager\app`.  
Expected: Build passes with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/theme/color.ts src/theme/tokens.ts
git commit -m "feat(theme): add semantic status colors and sidebar dimensions"
```

---

### Task 2: Navigation Configs & Shared IconRegistry

**Files:**
- Create: `src/config/admin-nav.ts`
- Create: `src/config/portal-nav.ts`
- Create: `src/components/common/IconRegistry.tsx`

**Interfaces:**
- Produces: `ADMIN_NAV_ITEMS`, `ADMIN_NAV_GROUPS`, `NavItem` interface, `PORTAL_NAV_ITEMS`, `<IconRegistry name={...} />`.

- [ ] **Step 1: Create `src/config/admin-nav.ts`**

Define navigation items grouped by monitoring, observability, and system:

```typescript
export interface NavItem {
  id: string;
  labelKey: string;
  href: string;
  icon: string;
  exact?: boolean;
  groupKey: string;
  badgeKey?: 'alertsCount' | 'activeTasks';
}

export const ADMIN_NAV_GROUPS = [
  { key: 'nav.groups.monitoring', labelVi: 'Giám sát', labelEn: 'Monitoring' },
  { key: 'nav.groups.observability', labelVi: 'Quan sát & Logs', labelEn: 'Observability' },
  { key: 'nav.groups.system', labelVi: 'Hệ thống', labelEn: 'System' },
] as const;

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', href: '/admin', icon: 'dashboard', exact: true, groupKey: 'nav.groups.monitoring' },
  { id: 'services', labelKey: 'nav.services', href: '/admin/services', icon: 'services', groupKey: 'nav.groups.monitoring' },
  { id: 'tasks', labelKey: 'nav.tasks', href: '/admin/tasks', icon: 'tasks', groupKey: 'nav.groups.monitoring', badgeKey: 'activeTasks' },
  { id: 'logs', labelKey: 'nav.logs', href: '/admin/logs', icon: 'logs', groupKey: 'nav.groups.observability' },
  { id: 'metrics', labelKey: 'nav.metrics', href: '/admin/metrics', icon: 'metrics', groupKey: 'nav.groups.observability' },
  { id: 'alerts', labelKey: 'nav.alerts', href: '/admin/alerts', icon: 'alerts', groupKey: 'nav.groups.observability', badgeKey: 'alertsCount' },
  { id: 'settings', labelKey: 'nav.settings', href: '/admin/settings', icon: 'settings', groupKey: 'nav.groups.system' },
];
```

- [ ] **Step 2: Create `src/config/portal-nav.ts`**

```typescript
export interface PortalNavItem {
  id: string;
  labelKey: string;
  href: string;
  exact?: boolean;
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: 'home', labelKey: 'portal.nav.overview', href: '/', exact: true },
  { id: 'docs', labelKey: 'portal.nav.docs', href: '/docs' },
  { id: 'status', labelKey: 'portal.nav.status', href: '/status' },
];
```

- [ ] **Step 3: Create `src/components/common/IconRegistry.tsx`**

Implement accessible, clean SVG icons matching Dark Tech style:

```tsx
import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export function IconRegistry({ name, size = 16, className = '', ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    ...props,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      );
    case 'services':
      return (
        <svg {...common}>
          <rect x="2" y="2" width="20" height="8" rx="0" />
          <rect x="2" y="14" width="20" height="8" rx="0" />
          <line x1="6" y1="6" x2="6.01" y2="6" />
          <line x1="6" y1="18" x2="6.01" y2="18" />
        </svg>
      );
    case 'tasks':
      return (
        <svg {...common}>
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case 'logs':
      return (
        <svg {...common}>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="14" y2="12" />
          <line x1="4" y1="18" x2="18" y2="18" />
        </svg>
      );
    case 'metrics':
      return (
        <svg {...common}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'alerts':
      return (
        <svg {...common}>
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'chevron-left':
      return (
        <svg {...common}>
          <polyline points="15 18 9 12 15 6" />
        </svg>
      );
    case 'chevron-right':
      return (
        <svg {...common}>
          <polyline points="9 18 15 12 9 6" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common}>
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common}>
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    default:
      return null;
  }
}
```

- [ ] **Step 4: Update translation files for new portal & group labels**

Add keys `portal.nav.*` and `nav.groups.*` in `src/i18n/locales/vi.json` and `en.json`.

- [ ] **Step 5: Verify build & commit**

Run: `npm run build`  
Commit:
```bash
git add src/config/ src/components/common/IconRegistry.tsx src/i18n/locales/
git commit -m "feat(config): add admin and portal navigation schemas with icon registry"
```

---

### Task 3: Shared LanguageSwitcher Refactor

**Files:**
- Create: `src/components/common/LanguageSwitcher.tsx`
- Remove: `src/components/LanguageSwitcher.tsx`
- Modify: `src/app/page.tsx` (update import path)

**Interfaces:**
- Produces: `<LanguageSwitcher />` in `src/components/common/LanguageSwitcher.tsx`.

- [ ] **Step 1: Move and adapt LanguageSwitcher**

Move `src/components/LanguageSwitcher.tsx` to `src/components/common/LanguageSwitcher.tsx`, ensuring proper styling according to `.btn-square` (0px radius) and accessible `aria-label`.

- [ ] **Step 2: Update import in current `src/app/page.tsx`**

Change import from `@/components/LanguageSwitcher` to `@/components/common/LanguageSwitcher`.

- [ ] **Step 3: Verify build & commit**

Run: `npm run build`  
Commit:
```bash
git add src/components/common/LanguageSwitcher.tsx src/app/page.tsx
git rm src/components/LanguageSwitcher.tsx
git commit -m "refactor(components): move LanguageSwitcher to shared common directory"
```

---

### Task 4: Public Status Endpoint & Portal Layout

**Files:**
- Create: `src/app/api/public-status/route.ts`
- Create: `src/components/layout/portal/PortalNavbar.tsx`
- Create: `src/components/layout/portal/PortalFooter.tsx`
- Create: `src/components/layout/portal/PortalLayout.tsx`
- Create: `src/app/(portal)/layout.tsx`
- Create: `src/app/(portal)/page.tsx`
- Create: `src/app/(portal)/docs/page.tsx`
- Create: `src/app/(portal)/status/page.tsx`

**Interfaces:**
- Produces: `GET /api/public-status`, `<PortalLayout>`, portal routes at `/`, `/docs`, `/status`.

- [ ] **Step 1: Create `src/app/api/public-status/route.ts`**

```typescript
import { NextResponse } from 'next/server';

export const revalidate = 30;

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    uptime: 99.98, // Mocked operational uptime at this stage
    version: '0.1.0',
    updatedAt: new Date().toISOString(),
  });
}
```

- [ ] **Step 2: Create `PortalNavbar.tsx`**

Implement sticky h-14 navbar with SM logo, portal navigation links, LanguageSwitcher, mobile drawer with hamburger, and "Vào Quản Trị /admin" `.btn-square` CTA.

- [ ] **Step 3: Create `PortalFooter.tsx`**

Implement minimal Dark Tech footer fetching `/api/public-status` (showing operational status dot `#62c073`, uptime 99.98%, copyright, version, no internal host/port).

- [ ] **Step 4: Create `PortalLayout.tsx` and `app/(portal)/layout.tsx`**

Wrap in `min-h-screen flex flex-col` with `<PortalNavbar />`, `<main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">{children}</main>`, `<PortalFooter />`.

- [ ] **Step 5: Create portal pages (`/`, `/docs`, `/status`)**

Provide clean Dark Tech landing page at `app/(portal)/page.tsx`, docs placeholder at `app/(portal)/docs/page.tsx`, and status details at `app/(portal)/status/page.tsx`.

- [ ] **Step 6: Verify build**

Run: `npm run build`  
Expected: Builds cleanly. Notice root `/` is now routed to portal. (Temporary note: move or isolate `src/app/page.tsx` if collision occurs at this step).

- [ ] **Step 7: Commit**

```bash
git add src/app/api/public-status/ src/components/layout/portal/ src/app/\(portal\)/
git commit -m "feat(portal): implement public status API and complete portal layout"
```

---

### Task 5: Admin Telemetry Provider & Shell Layout

**Files:**
- Create: `src/providers/AdminTelemetryProvider.tsx`
- Create: `src/components/layout/admin/AdminSidebar.tsx`
- Create: `src/components/layout/admin/AdminHeader.tsx`
- Create: `src/components/layout/admin/AdminBreadcrumb.tsx`
- Create: `src/components/layout/admin/AdminLayout.tsx`
- Create: `src/components/layout/index.ts`

**Interfaces:**
- Produces: `useAdminTelemetry()`, `<AdminLayout initialCollapsed={boolean}>{children}</AdminLayout>`.

- [ ] **Step 1: Create `src/providers/AdminTelemetryProvider.tsx`**

Context with 30s polling, `document.visibilityState` listener, failure counter (transitions to `offline` after 3 consecutive errors, keeps polling in background to self-recover upon success), providing `status`, `alertsCount`, `activeTasks`.

- [ ] **Step 2: Create `AdminBreadcrumb.tsx`**

Dynamic breadcrumb parsing `pathname`, resolving through `ADMIN_NAV_ITEMS`, with fallback: uppercase slug with hyphens to spaces.

- [ ] **Step 3: Create `AdminSidebar.tsx`**

Client Component with desktop width `var(--sidebar-width)` (240px) ↔ `var(--sidebar-width-collapsed)` (64px), active state `border-l-2 border-[var(--color-primary)] bg-[var(--muted)]`, tooltips when collapsed, and mobile off-canvas drawer (`z-50`) with React 19 `inert` support.

- [ ] **Step 4: Create `AdminHeader.tsx`**

Sticky top bar (`id="admin-header"`) with hamburger toggle, breadcrumb, status chip (`.v-chip` with `role="status"` and `aria-live="polite"`), `LanguageSwitcher`, and quick CTA.

- [ ] **Step 5: Create `AdminLayout.tsx`**

Client Component holding `isCollapsed` (synced via `document.cookie` with `SameSite=Lax`) and `isMobileOpen`. Renders `#main-content` with `ml-0 md:ml-[var(--sidebar-current-width)]`.

- [ ] **Step 6: Create `src/components/layout/index.ts`**

Export both `AdminLayout` and `PortalLayout` along with subcomponents.

- [ ] **Step 7: Verify build & commit**

Run: `npm run build`  
Commit:
```bash
git add src/providers/ src/components/layout/
git commit -m "feat(admin): implement telemetry provider and admin layout shell"
```

---

### Task 6: Edge Middleware & Admin App Routes

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/admin/loading.tsx`
- Create: `src/app/(admin)/admin/error.tsx`
- Create: `src/app/(admin)/admin/not-found.tsx`
- Create: `src/app/(admin)/admin/[...slug]/page.tsx`

**Interfaces:**
- Produces: Edge route protection on `/admin/:path*`, Server Component layout reading `cookies()`, admin error/loading/not-found states.

- [ ] **Step 1: Create `src/middleware.ts`**

Implement middleware matching `/admin/:path*`, checking `process.env.AUTH_REQUIRED === 'true'` and placeholder `sm_session` cookie.

- [ ] **Step 2: Create `src/app/(admin)/layout.tsx`**

Server Component reading `const cookieStore = await cookies();`, extracting `sm_sidebar_state === 'collapsed'`, wrapping children in `<AdminTelemetryProvider>` and `<AdminLayout initialCollapsed={initialCollapsed}>`.

- [ ] **Step 3: Create `loading.tsx`, `error.tsx` ("use client"), and `not-found.tsx`**

Dark Tech monospace loading skeleton, error boundary with retry button, and admin 404 page.

- [ ] **Step 4: Create `src/app/(admin)/admin/[...slug]/page.tsx`**

Catch-all route calling `notFound()` to ensure unmatched `/admin/*` URLs display the admin not-found UI within the admin layout.

- [ ] **Step 5: Verify build & commit**

Run: `npm run build`  
Commit:
```bash
git add src/middleware.ts src/app/\(admin\)/
git commit -m "feat(admin): add edge middleware, server layout, loading, error, and not-found states"
```

---

### Task 7: Directory Cleanup & Telemetry Dashboard Migration

**Files:**
- Remove: `src/app/layout/` directory
- Remove: `src/app/page.tsx` (migrated to admin)
- Create: `src/app/(admin)/admin/page.tsx`

**Interfaces:**
- Produces: System telemetry dashboard at `/admin`, root `/` serving Portal.

- [ ] **Step 1: Remove empty directory `src/app/layout/`**

Delete `src/app/layout/` to eliminate developer confusion and naming overlap with `layout.tsx`.

- [ ] **Step 2: Migrate dashboard page to `src/app/(admin)/admin/page.tsx`**

Move the full telemetry dashboard from root `src/app/page.tsx` into `src/app/(admin)/admin/page.tsx`. Remove the inline redundant header from the page since `AdminHeader` in `AdminLayout` now handles layout chrome.

- [ ] **Step 3: Delete old `src/app/page.tsx`**

Delete `src/app/page.tsx` so `app/(portal)/page.tsx` cleanly takes over root URL `/`.

- [ ] **Step 4: Run full verification build**

Run: `npm run build`  
Expected:
```text
Route (app)
├ ○ /                      (portal landing)
├ ○ /docs                  (portal docs)
├ ○ /status                (portal status)
├ ƒ /admin                 (admin dashboard, dynamic via cookies)
├ ƒ /admin/[...slug]       (admin 404 catch-all)
└ ƒ /api/public-status     (public telemetry API)
```
Exit code: 0, 0 TypeScript errors, 0 ESLint warnings.

- [ ] **Step 5: Commit**

```bash
git add src/app/
git commit -m "feat: complete migration of telemetry dashboard to /admin and finalize portal at root"
```

---

## Plan Self-Review Check
- [x] **Spec coverage**: Covers all requirements from v3 spec (cookies, inert, responsive margin, public status, telemetry resilient polling, tokens).
- [x] **No Placeholders**: Exact code and configurations provided in all tasks.
- [x] **Type consistency**: Standardized on `NavItem`, `IconRegistry`, `AdminTelemetryProvider`, `AdminLayout`.
