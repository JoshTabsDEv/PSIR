# PSIR System - UI/UX Improvement Plan

## Current State Audit

### What We Have
- **Framework**: Next.js 16 + React 19 + TailwindCSS 4
- **Component Library**: Custom shadcn-inspired components (button, card, input, label, select, table, tabs, textarea, badge, dialog)
- **Brand Colors**: Philippine red (`#ce1126`), gold accent (`#d4af37`)
- **Fonts**: Outfit (primary), Work Sans (secondary)
- **Layout**: Fixed sidebar (64px) + sticky header (h-16) + main content area

### Key Issues Identified

1. **Color Inconsistencies**
   - Input focus rings use `blue-500` instead of brand red
   - Loading spinners use `blue-600` instead of brand color
   - Radio buttons use `text-blue-600` accent
   - No unified color token system via CSS variables for functional colors

2. **Missing shadcn Components**
   - No `form.tsx` wrapper (React Hook Form used directly without shadcn Form integration)
   - No `calendar.tsx` / `popover.tsx` (using native `<input type="date">`)
   - No `checkbox.tsx` or `radio-group.tsx` (using native `<input type="radio">`)
   - No `separator.tsx`, `skeleton.tsx`, `tooltip.tsx`, `dropdown-menu.tsx`
   - `Tabs` component installed but unused (custom stepper used instead)

3. **Responsive Gaps**
   - Reports table relies on horizontal scroll on mobile (no card view alternative)
   - No Footer component exists
   - View report page uses raw HTML `<table>` for prior records (not styled consistently)

4. **UX Gaps**
   - No skeleton loading states (just spinners)
   - No empty states with illustrations
   - No breadcrumb navigation
   - No tooltips for icon-only buttons
   - Delete confirmation is basic (no undo option)
   - No keyboard shortcuts for common actions

5. **Form UX Issues**
   - Native date inputs (no date picker with calendar)
   - Native radio buttons (no styled radio group)
   - No field-level validation feedback on blur
   - Section III radio groups feel repetitive and could be more compact

---

## Improvement Plan

### Phase 1: Design Token Consistency

**Goal**: Unify all colors under CSS custom properties so the entire app feels cohesive.

**Files to modify**:
- `app/globals.css`

**Changes**:
- Add CSS variables for all functional colors:
  ```
  --color-success: #16a34a
  --color-warning: #ea580c
  --color-danger: #dc2626
  --color-info: #2563eb
  --color-muted: #6b7280
  ```
- Add semantic variables for form elements:
  ```
  --ring-color: var(--brand-primary)
  --focus-ring: 0 0 0 2px var(--brand-primary)
  ```
- Update input/textarea/select focus styles to use `--brand-primary` instead of hardcoded `blue-500`

**Files to modify for focus ring consistency**:
- `components/ui/input.tsx` - update focus ring class
- `components/ui/textarea.tsx` - update focus ring class
- `components/ui/select.tsx` - update focus ring class

---

### Phase 2: Install Missing shadcn Components

**Goal**: Replace native HTML elements with polished shadcn components.

**Components to add**:
1. **`separator.tsx`** - Replace `border-t` dividers with semantic Separator
2. **`skeleton.tsx`** - Replace spinner-only loading with skeleton placeholders
3. **`tooltip.tsx`** - Add tooltips to icon-only buttons (export, edit, delete)
4. **`dropdown-menu.tsx`** - Group report actions (Edit, Export DOCX, Delete) into a dropdown
5. **`radio-group.tsx`** - Replace native radios in Section III and custodial status
6. **`breadcrumb.tsx`** - Add breadcrumb navigation to all inner pages

**Files to modify after adding components**:
- `components/psir/SectionIII_SocioEconomic.tsx` - use RadioGroup
- `components/psir/SectionII_CriminalHistory.tsx` - use RadioGroup for custodial status
- `app/dashboard/reports/[id]/page.tsx` - use DropdownMenu for actions, add Tooltip
- `app/dashboard/layout.tsx` - add Breadcrumb component
- All pages with loading states - add Skeleton loading

---

### Phase 3: Loading & Empty States

**Goal**: Replace generic spinners with contextual skeleton screens and meaningful empty states.

**Dashboard loading skeleton**:
- 4 skeleton cards (stats) in a grid
- Skeleton table rows (6-8 rows) for reports list

**Reports list empty state**:
- Illustration or icon
- "No reports found" heading
- "Create your first PSIR report" call-to-action button

**Search empty state**:
- "No results match your search" with suggestions

**Files to create**:
- `components/ui/skeleton.tsx`
- `components/dashboard/DashboardSkeleton.tsx`
- `components/dashboard/ReportsListSkeleton.tsx`
- `components/dashboard/EmptyState.tsx`

**Files to modify**:
- `app/dashboard/page.tsx` - use DashboardSkeleton
- `app/dashboard/reports/page.tsx` - use ReportsListSkeleton + EmptyState
- `app/dashboard/search/page.tsx` - use EmptyState

---

### Phase 4: Form UX Enhancements

**Goal**: Make forms feel more polished and reduce user friction.

**4a. Styled Radio Groups (Section III)**
- Replace native `<input type="radio">` with shadcn RadioGroup
- Use card-style radio options for Section III categories
- Each option gets a subtle border, hover effect, and checked state with brand color

**4b. Better Section Navigation**
- Keep current stepper but add:
  - Section completion indicators (checkmark when all required fields filled)
  - Clickable section pills on mobile (not just progress bar)

**4c. Field Validation UX**
- Add `onBlur` validation for required fields
- Show inline success checkmark when field is valid
- Animate error messages in/out

**Files to modify**:
- `components/psir/SectionIII_SocioEconomic.tsx` - RadioGroup integration
- `components/psir/SectionII_CriminalHistory.tsx` - RadioGroup for custodial status
- `components/psir/FormNavigation.tsx` - completion indicators
- `components/psir/PSIRForm.tsx` - validation mode changes

---

### Phase 5: View Report Page Polish

**Goal**: Make the read-only report view look professional and print-ready.

**Changes**:
- Replace raw HTML `<table>` for prior records with styled shadcn Table
- Add section dividers with roman numeral badges (matching form sections)
- Add print stylesheet for clean printing
- Group action buttons in a dropdown menu with tooltip labels
- Add "Last updated X ago" relative timestamp

**Files to modify**:
- `app/dashboard/reports/[id]/page.tsx` - full view page overhaul
- `app/globals.css` - add `@media print` styles

---

### Phase 6: Dashboard Polish

**Goal**: Make the dashboard feel like a modern admin panel.

**Changes**:
- Stats cards: add subtle hover animation (scale + shadow)
- Stats cards: add trend indicator (arrow up/down with percentage)
- Reports table: add row hover highlight
- Reports table: show status as colored dot + text (not just badge)
- Quick actions: add keyboard shortcut hints (e.g., "N" for new report)
- Add a "Welcome back" greeting with current date

**Files to modify**:
- `components/dashboard/StatsCards.tsx` - hover effects, trends
- `components/dashboard/ReportsList.tsx` - row hover, status dots
- `app/dashboard/page.tsx` - welcome greeting, layout tweaks

---

### Phase 7: Responsive Improvements

**Goal**: Make mobile experience first-class.

**Changes**:
- Reports table: add card view toggle for mobile (list of cards instead of table)
- Form bottom actions: stack buttons vertically on small screens with full width
- Sidebar: add swipe-to-close gesture area
- View report: stack action buttons vertically on mobile

**Files to modify**:
- `components/dashboard/ReportsList.tsx` - card view variant
- `components/psir/PSIRForm.tsx` - mobile button layout
- `components/layout/Sidebar.tsx` - swipe gesture
- `app/dashboard/reports/[id]/page.tsx` - mobile actions

---

### Phase 8: Micro-interactions & Polish

**Goal**: Add subtle animations that make the app feel alive.

**Changes**:
- Page transitions: fade-in on route change
- Card hover: subtle shadow elevation
- Button press: scale down effect
- Toast notifications: already using Sonner (good), ensure consistent positioning
- Form section transition: smooth slide or fade when navigating between sections
- Auto-save indicator: pulse animation when saving

**Implementation approach**:
- Use TailwindCSS `transition` and `animate` utilities
- Add custom keyframes in `globals.css` for unique animations
- Keep animations under 200ms for responsiveness feel

**Files to modify**:
- `app/globals.css` - custom keyframes
- `components/ui/card.tsx` - hover transition class
- `components/ui/button.tsx` - active scale
- `components/psir/PSIRForm.tsx` - section transition wrapper

---

## Priority Order

| Priority | Phase | Impact | Effort |
|----------|-------|--------|--------|
| 1 | Phase 1: Design Tokens | High | Low |
| 2 | Phase 3: Loading States | High | Medium |
| 3 | Phase 4a: Radio Groups | Medium | Medium |
| 4 | Phase 5: View Page | High | Medium |
| 5 | Phase 6: Dashboard | Medium | Low |
| 6 | Phase 2: New Components | Medium | Medium |
| 7 | Phase 8: Micro-interactions | Low | Low |
| 8 | Phase 7: Responsive | Medium | High |

---

## Best Practices from shadcn/ui Ecosystem

### Patterns to Follow
1. **Composition over configuration** - shadcn components are composable primitives, not monolithic widgets. Combine Card + Badge + Button to build report cards rather than creating a single `<ReportCard>` mega-component.

2. **Consistent spacing scale** - Use Tailwind's spacing scale consistently: `gap-2` for tight groups, `gap-4` for related items, `gap-6` for section separation, `gap-8` for major sections.

3. **Color through semantics** - Use `destructive`, `outline`, `ghost`, `secondary` button variants instead of custom color classes. Extend variants if needed rather than adding inline styles.

4. **Accessible by default** - All shadcn components include ARIA attributes. When adding custom interactive elements, ensure `role`, `aria-label`, and keyboard navigation are present.

5. **Dark mode readiness** - Even if not implementing dark mode now, use CSS variables for all colors so a dark theme can be added by swapping variable values.

### Common shadcn Patterns for Admin Dashboards
- **Data tables** with sorting, filtering, and column visibility (using `@tanstack/react-table`)
- **Command palette** (Cmd+K) for quick navigation and search
- **Sheet/drawer** for mobile-friendly side panels
- **Sonner toasts** for action feedback (already implemented)
- **Skeleton loading** that matches the exact layout being loaded

### Typography Best Practices
- Keep heading hierarchy strict: one `h1` per page, `h2` for sections, `h3` for subsections
- Use `tracking-tight` on headings for a modern feel
- Body text at `text-sm` (14px) for density, `text-base` (16px) for readability
- Muted text at `text-muted-foreground` for secondary information
