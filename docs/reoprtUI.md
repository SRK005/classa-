# Classwise KIRO – Material 3 UI/UX Plan

Path: `app/assessment-question-bank/results/view/classwisekiro/page.tsx`

## Overview
- Purpose: Class-wise analytics (avg score, pass rate, student count, score ranges) for tests created by the current user.
- Data source: Firestore collections `test`, `testResults`, and referenced `classId` docs; filtered by `createdBy == users/{uid}`.
- Current key UI blocks:
  - Sidebar, Header
  - Summary KPI cards (overall avg, classes count, total students, pass rate)
  - Charts: Bar (avg vs pass rate), Pie (performance distribution)
  - Class cards grid with metrics and CTA to details: `/assessment-question-bank/results/view/class-details/[className]`
  - Actions: Download PDF, Export Excel, View Analytics
  - States: Loading spinner, Empty state

## Goals
- Deliver a clean, accessible, responsive Material 3 experience with a soft, subtle elevation finish.
- Maintain visual hierarchy for quick scanning and comparison across classes.
- Keep components modular and reusable for future analytics pages.

## Users & Primary Tasks
- Teachers/Test creators:
  - Scan overall performance across classes
  - Identify at-risk classes
  - Drill into a class details page
  - Export/share reports

## Information Architecture
1. App Shell: `Sidebar` + page `Header`.
2. Summary. Four KPIs in a 1–4 responsive grid.
3. Visual insights:
   - Bar chart: Avg score vs Pass rate per class
   - Pie/Donut: performance distribution (Excellent/Good/At-Risk)
4. Class cards grid with key metrics and CTA.
5. Page-level actions: Download/Export/Analytics.

## Material 3 Design System
- Color roles (Light theme first; enable Dark later):
  - Primary: blue 600–700 (charts + CTAs), `#2563eb` → `#1d4ed8`
  - Secondary/Tertiary accents: indigo, emerald
  - Surface: `surface`, `surface-container`, `surface-container-low`
  - Outline: soft borders for cards/tooltips
- Elevation (soft shadow finish):
  - E1 (subtle surfaces like chips, small cards): `shadow-sm`
  - E2 (standard cards, tooltips): `shadow`
  - E3 (prominent cards, dialogs): `shadow-md`
  - E4 (primary callouts/CTAs): `shadow-lg`
- Shape/Radius:
  - Small: 8px (`rounded-lg`)
  - Medium: 12–16px (`rounded-xl`)
  - Large: 20–24px (`rounded-2xl`/`rounded-3xl`) for feature cards
- State layers:
  - Hover: elevated by one level; slight scale (1.01–1.02 max)
  - Focus: visible outline + elevation retention

### Tailwind mapping (approximate)
- Surfaces: `bg-white` on `surface`, use `bg-slate-50` backgrounds for page.
- Borders: `border`, `border-slate-200/70` for subtle outlines.
- Elevation: `shadow-sm | shadow | shadow-md | shadow-lg` with balanced blur/spread.
- Corners: `rounded-xl` for default cards; `rounded-2xl/3xl` for class cards.

## Components Spec

### 1) Header
- Title: "Class Performance Dashboard"
- Subtitle: concise description.
- Optional future filters (top-right): date range, subject/class selector.

### 2) KPI Summary Cards
- 4 cards, equal height, responsive grid.
- Content:
  - Overall Average (%)
  - Classes Count
  - Total Students
  - Overall Pass Rate (%)
- Visual design:
  - Surface: `surface-container` → `bg-white`, `rounded-xl`, `shadow`
  - Icon: top-right or left; muted tint of role color
  - Numbers: bold, large
  - Subtext: role/label
- Accessibility: each card has aria-label with metric name and value.

### 3) Charts
- Bar Chart (Avg vs Pass Rate):
  - Bars: Primary (avg) and Success (pass rate)
  - Gridlines: very light (`#f1f5f9`)
  - Axis: small labels, strong enough contrast
  - Tooltip: elevated surface E2, rounded corners, shadow
- Pie/Donut (Performance Distribution):
  - InnerRadius for donut readability
  - Legend as contextual info blocks below
- Color palette:
  - Avg: `#3b82f6` (blue-500)
  - Pass rate: `#10b981` (emerald-500)
  - Excellent: `#22c55e`, Good: `#06b6d4`, At-Risk: `#ef4444`

### 4) Class Cards Grid
- Card anatomy:
  - Header: class avatar/icon + class name + student count
  - Metrics: Avg %, Pass rate %, Highest/Lowest
  - Mini trend line (lowest→avg→highest)
  - Progress bar for avg performance
  - CTA: View Full Details (navigates to class details page)
- Design:
  - Container: `rounded-3xl`, `shadow-lg` (E4 on hover), subtle gradient or tonal fill
  - Internal sections separated by spacing and soft borders
  - CTA: primary filled button, ripple-like state layer on hover/focus

### 5) Page Actions
- Download PDF, Export to Excel, View Analytics
- Style as filled buttons with role colors, medium radius, E2 elevation
- Future: disabled/loading states when exporting

## States
- Loading: Replace spinner with skeletons for cards, charts, and class items (`animate-pulse`).
- Empty: white card with icon, helpful text, and primary action (e.g., "Create test").
- Error: non-blocking inline alert bar; retry affordance.

## Responsiveness
- Breakpoints:
  - <640px: single column; charts 240–280px height; sticky actions bottom if needed
  - 640–1024px: 2 columns where space allows
  - >1280px: 3–4 columns for cards; charts 300–360px height
- Ensure tooltips and legends wrap well; avoid overflow.

## Accessibility
- Contrast AA min for text and UI elements
- Focus-visible on buttons/links/cards
- ARIA:
  - `aria-busy` on loading container
  - Cards: `aria-labelledby` linking names to values
  - Charts: provide accessible summaries (e.g., hidden text with key insights)

## Performance & Data
- Firestore read strategy:
  - Already batching `testResults` with `in` queries (limit 30); if >30 tests, paginate batches
  - Cache class names by id (already present) and memoize where possible
- Prevent over-render:
  - Use `useMemo` for computed arrays (chartData, performanceDistribution)
  - Guard against setState after unmount
- Consider server-side prefetch (future) if data scale grows.

## Theming Tokens (proposed)
```css
:root {
  /* Colors */
  --color-primary: #2563eb; /* blue-600 */
  --color-primary-variant: #1d4ed8; /* blue-700 */
  --color-success: #10b981; /* emerald-500 */
  --color-surface: #ffffff;
  --color-surface-variant: #f8fafc; /* slate-50 */
  --color-outline: #e2e8f0; /* slate-200 */

  /* Shape */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  /* Elevation (soft) */
  --elev-1: 0 1px 2px rgba(0,0,0,0.05);
  --elev-2: 0 1px 3px rgba(0,0,0,0.08);
  --elev-3: 0 4px 6px rgba(0,0,0,0.10);
  --elev-4: 0 10px 15px rgba(0,0,0,0.12);
}
```

## Analytics Events (suggested)
- event: `dashboard_view` (route)
- event: `class_card_click` with `className`
- event: `export_click` with `type` (pdf|excel)
- event: `view_analytics_click`

## Roadmap / Enhancements
- Filters: date range, subject, class
- Dark theme: use M3 tonal elevation and neutral palettes
- PDF/Excel: implement and wire to buttons
- Chart legends: keyboard navigable
- Drill-down: unify details page visual language with this plan

## Open Questions
- What is the pass threshold (currently 35%) and is it customizable per test/class?
- Should we include median and standard deviation in KPIs?
- Do we need per-subject breakdown on this page or in details view only?

## Implementation Notes (for this codebase)
- Use existing Tailwind setup; map M3 concepts via utility classes and the tokens above.
- Replace the loading spinner with skeletons.
- Ensure button variants follow role colors and elevation rules.
- Keep `router.push` for the class details CTA (`/assessment-question-bank/results/view/class-details/[className]`).
- Make tooltips consistent with M3 surface/elevation and rounded corners.
