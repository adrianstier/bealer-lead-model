# Agency Growth Platform — Design System v3.0

> A comprehensive design system for building consistent, accessible, and professional insurance agency software.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Design Tokens](#design-tokens)
3. [Typography System](#typography-system)
4. [Color System](#color-system)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Data Visualization](#data-visualization)
8. [Motion & Animation](#motion--animation)
9. [Accessibility Standards](#accessibility-standards)
10. [Responsive Design](#responsive-design)
11. [Implementation Patterns](#implementation-patterns)
12. [Anti-Patterns](#anti-patterns)
13. [Audit Checklist](#audit-checklist)

---

## Design Principles

### 1. Clarity Over Complexity
Every element serves a purpose. Remove visual noise. Prioritize information hierarchy. Users should understand the interface within seconds.

### 2. Professional Trust
Insurance requires confidence. The aesthetic should be clean, modern, and stable—not trendy or experimental. Every pixel should reinforce credibility.

### 3. Data-First Design
Complex data must be digestible. Use progressive disclosure: summary first, details on demand. Every metric needs context (comparisons, trends, goals).

### 4. Universal Accessibility
WCAG AA minimum. Keyboard-first navigation. Screen reader compatibility. No information conveyed by color alone.

### 5. Performance as UX
Fast interfaces feel professional. Optimize for perceived performance with skeleton states, optimistic updates, and lazy loading.

---

## Design Tokens

### Core Token Structure

```javascript
// tailwind.config.js - Design Token Reference
const tokens = {
  colors: {
    // Brand Colors
    primary: {
      50:  '#eff6ff',   // Subtle backgrounds, selected states
      100: '#dbeafe',   // Hover backgrounds, borders
      200: '#bfdbfe',   // Focus rings, light accents
      300: '#93c5fd',   // Decorative elements
      400: '#60a5fa',   // Icons on dark backgrounds
      500: '#3b82f6',   // Interactive elements, links
      600: '#2563eb',   // Primary buttons, CTAs
      700: '#1d4ed8',   // Hover states for primary buttons
      800: '#1e40af',   // Active/pressed states
      900: '#1e3a8a',   // Text on light backgrounds
    },
    
    // Semantic Colors
    success: {
      50:  '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',   // Success indicators
      600: '#16a34a',   // Success buttons/CTAs
      700: '#15803d',   // Hover states
    },
    warning: {
      50:  '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',   // Warning indicators
      600: '#d97706',   // Warning buttons
      700: '#b45309',   // Hover states
    },
    danger: {
      50:  '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',   // Error/danger indicators
      600: '#dc2626',   // Danger buttons
      700: '#b91c1c',   // Hover states
    },
    
    // Neutral Palette
    gray: {
      50:  '#f9fafb',   // Page backgrounds, subtle fills
      100: '#f3f4f6',   // Card backgrounds, disabled fills
      200: '#e5e7eb',   // Borders, dividers
      300: '#d1d5db',   // Input borders, disabled borders
      400: '#9ca3af',   // Placeholder text, disabled icons
      500: '#6b7280',   // Disabled text only (4.5:1 contrast)
      600: '#4b5563',   // Muted text, captions (7:1 contrast)
      700: '#374151',   // Body text (9:1 contrast)
      800: '#1f2937',   // Emphasized body text
      900: '#111827',   // Headings, high-emphasis text (18:1)
    },
  },
  
  // Spacing Scale (base: 4px)
  spacing: {
    px: '1px',
    0:   '0',
    0.5: '0.125rem',  // 2px
    1:   '0.25rem',   // 4px
    1.5: '0.375rem',  // 6px
    2:   '0.5rem',    // 8px
    2.5: '0.625rem',  // 10px
    3:   '0.75rem',   // 12px
    4:   '1rem',      // 16px
    5:   '1.25rem',   // 20px
    6:   '1.5rem',    // 24px
    8:   '2rem',      // 32px
    10:  '2.5rem',    // 40px
    12:  '3rem',      // 48px
    16:  '4rem',      // 64px
    20:  '5rem',      // 80px
    24:  '6rem',      // 96px
  },
  
  // Border Radius
  borderRadius: {
    none: '0',
    sm:   '0.25rem',   // 4px - Chips, tags
    DEFAULT: '0.375rem', // 6px - Inputs, small buttons
    md:   '0.5rem',    // 8px - Cards, modals
    lg:   '0.75rem',   // 12px - Large cards, panels
    xl:   '1rem',      // 16px - Feature cards
    '2xl': '1.5rem',   // 24px - Hero sections
    full: '9999px',    // Pills, avatars
  },
  
  // Box Shadows
  boxShadow: {
    sm:   '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md:   '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg:   '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl:   '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },
  
  // Transitions
  transition: {
    duration: {
      fast:   '150ms',  // Micro-interactions (hover, focus)
      normal: '200ms',  // Component state changes
      slow:   '300ms',  // Page transitions, modals
      slower: '500ms',  // Loading states, skeletons
    },
    timing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',      // Standard easing
      in:      'cubic-bezier(0.4, 0, 1, 1)',        // Accelerate
      out:     'cubic-bezier(0, 0, 0.2, 1)',        // Decelerate
      bounce:  'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Playful
    },
  },
  
  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky:   1020,
    modal:    1050,
    popover:  1060,
    tooltip:  1070,
    toast:    1080,
  },
};
```

---

## Typography System

### Font Stack

```css
/* Primary font - UI and body text */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;

/* Monospace - Code, numbers in tables */
font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `display-xl` | 48px (3rem) | 800 | 1.1 | -0.025em | Hero headlines |
| `display` | 36px (2.25rem) | 700 | 1.15 | -0.02em | Page titles |
| `h1` | 30px (1.875rem) | 700 | 1.2 | -0.015em | Section headers |
| `h2` | 24px (1.5rem) | 700 | 1.25 | -0.01em | Card headers |
| `h3` | 20px (1.25rem) | 600 | 1.3 | 0 | Subsections |
| `h4` | 18px (1.125rem) | 600 | 1.4 | 0 | List headers |
| `body-lg` | 16px (1rem) | 400 | 1.6 | 0 | Large body text |
| `body` | 14px (0.875rem) | 400 | 1.5 | 0 | Default body |
| `body-sm` | 13px (0.8125rem) | 400 | 1.5 | 0 | Compact UI |
| `caption` | 12px (0.75rem) | 500 | 1.4 | 0.01em | Labels, helpers |
| `overline` | 11px (0.6875rem) | 600 | 1.4 | 0.05em | Category labels |

### Tailwind Typography Classes

```html
<!-- Headings -->
<h1 class="text-3xl font-bold text-gray-900 tracking-tight">Page Title</h1>
<h2 class="text-2xl font-bold text-gray-900">Section Header</h2>
<h3 class="text-xl font-semibold text-gray-900">Subsection</h3>
<h4 class="text-lg font-semibold text-gray-900">Card Title</h4>

<!-- Body Text -->
<p class="text-base text-gray-700 leading-relaxed">Large body text</p>
<p class="text-sm text-gray-700">Default body text</p>
<p class="text-sm text-gray-600">Muted/secondary text</p>

<!-- Utility Text -->
<span class="text-xs font-medium text-gray-600 uppercase tracking-wide">Overline</span>
<span class="text-xs text-gray-600">Caption or helper text</span>
```

### Text Color Usage

| Context | Color | Tailwind Class | Contrast Ratio |
|---------|-------|----------------|----------------|
| Headings | gray-900 | `text-gray-900` | 18:1 |
| Body text | gray-700 | `text-gray-700` | 9:1 |
| Secondary text | gray-600 | `text-gray-600` | 7:1 |
| Disabled text | gray-500 | `text-gray-500` | 4.5:1 |
| Placeholder | gray-400 | `text-gray-400` | 3:1 (decorative only) |
| Links | primary-600 | `text-primary-600` | 4.5:1+ |
| Error text | danger-600 | `text-danger-600` | 4.5:1+ |
| Success text | success-700 | `text-success-700` | 4.5:1+ |

**Critical Rule:** Never use `text-gray-400` or `text-gray-500` for meaningful text. Minimum is `text-gray-600` for readable content.

---

## Color System

### Brand Color Application

```
Primary Blue (#2563eb / primary-600)
├── Primary CTAs and buttons
├── Active navigation states
├── Links and interactive text
├── Focus rings
├── Progress indicators
└── Selected/checked states

Primary Light (#eff6ff to #dbeafe / primary-50 to primary-100)
├── Selected row backgrounds
├── Hover states on light surfaces
├── Info alert backgrounds
└── Badge backgrounds
```

### Semantic Color Usage

```
Success Green
├── Positive trends (▲ +12%)
├── Completion states
├── Valid form inputs
├── Success toast/alerts
└── "Active" status badges

Warning Amber
├── Attention-needed states
├── Pending/in-progress
├── Low stock warnings
├── Expiring items
└── Caution messages

Danger Red
├── Negative trends (▼ -8%)
├── Error states
├── Delete/destructive actions
├── Invalid form inputs
└── Critical alerts
```

### Background Hierarchy

```
Layer 0 (Page): white or gray-50
Layer 1 (Cards): white with shadow-sm
Layer 2 (Elevated): white with shadow-md
Layer 3 (Modal): white with shadow-xl + overlay
```

### State Colors

```css
/* Interactive element states */
.element-default    { @apply bg-white border-gray-300; }
.element-hover      { @apply bg-gray-50 border-gray-400; }
.element-focus      { @apply ring-2 ring-primary-500 ring-offset-2; }
.element-active     { @apply bg-primary-50 border-primary-500; }
.element-disabled   { @apply bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed; }
.element-error      { @apply border-danger-500 ring-danger-500; }
```

---

## Spacing & Layout

### Spacing Conventions

| Context | Spacing | Tailwind |
|---------|---------|----------|
| Inline elements (icon + text) | 8px | `gap-2` |
| Form field groups | 16px | `space-y-4` |
| Card internal padding | 24px | `p-6` |
| Between cards/sections | 24-32px | `gap-6` or `gap-8` |
| Page section spacing | 48-64px | `py-12` or `py-16` |
| Page horizontal padding | 16-24px | `px-4 sm:px-6` |

### Layout Patterns

```html
<!-- Page Container -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <!-- Content -->
</div>

<!-- Page Header -->
<div class="mb-8">
  <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Page Title</h1>
  <p class="mt-2 text-sm text-gray-600">Page description goes here.</p>
</div>

<!-- Card Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <!-- Cards -->
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  <!-- Stat cards -->
</div>

<!-- Two-Column Layout -->
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div class="lg:col-span-2"><!-- Main content --></div>
  <div><!-- Sidebar --></div>
</div>

<!-- Form Layout -->
<form class="space-y-6 max-w-xl">
  <!-- Form fields -->
</form>
```

### Container Widths

| Container | Max Width | Use Case |
|-----------|-----------|----------|
| `max-w-sm` | 384px | Modals, narrow forms |
| `max-w-md` | 448px | Auth forms, dialogs |
| `max-w-lg` | 512px | Settings forms |
| `max-w-xl` | 576px | Content forms |
| `max-w-2xl` | 672px | Article content |
| `max-w-4xl` | 896px | Wide content areas |
| `max-w-6xl` | 1152px | Dashboards |
| `max-w-7xl` | 1280px | Full page layouts |

---

## Component Library

### Buttons

#### Button Hierarchy

```html
<!-- Primary: Main action, one per section -->
<button class="inline-flex items-center justify-center gap-2 px-6 py-3 
               bg-primary-600 hover:bg-primary-700 active:bg-primary-800
               text-white font-medium rounded-lg
               shadow-sm hover:shadow
               transition-all duration-150
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600">
  <PlusIcon class="w-5 h-5" />
  Create Policy
</button>

<!-- Secondary: Alternative actions -->
<button class="inline-flex items-center justify-center gap-2 px-6 py-3
               bg-white hover:bg-gray-50 active:bg-gray-100
               text-gray-700 font-medium rounded-lg
               border border-gray-300 hover:border-gray-400
               shadow-sm
               transition-all duration-150
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed">
  Cancel
</button>

<!-- Tertiary/Ghost: Subtle actions -->
<button class="inline-flex items-center justify-center gap-2 px-4 py-2
               text-gray-600 hover:text-gray-900 hover:bg-gray-100
               font-medium rounded-lg
               transition-all duration-150
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
  Learn More
</button>

<!-- Danger: Destructive actions -->
<button class="inline-flex items-center justify-center gap-2 px-6 py-3
               bg-danger-600 hover:bg-danger-700 active:bg-danger-800
               text-white font-medium rounded-lg
               shadow-sm
               transition-all duration-150
               focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2">
  <TrashIcon class="w-5 h-5" />
  Delete
</button>

<!-- Icon Only Button -->
<button class="inline-flex items-center justify-center p-2
               text-gray-500 hover:text-gray-700 hover:bg-gray-100
               rounded-lg
               transition-all duration-150
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        aria-label="Close">
  <XIcon class="w-5 h-5" />
</button>
```

#### Button Sizes

```html
<!-- Small: Compact UI, tables -->
<button class="px-3 py-1.5 text-sm rounded-md">Small</button>

<!-- Medium (Default): Standard actions -->
<button class="px-4 py-2 text-sm rounded-lg">Medium</button>

<!-- Large: Primary CTAs, hero sections -->
<button class="px-6 py-3 text-base rounded-lg">Large</button>

<!-- Extra Large: Landing pages -->
<button class="px-8 py-4 text-lg rounded-xl">Extra Large</button>
```

### Cards

```html
<!-- Standard Card -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div class="px-6 py-4 border-b border-gray-200">
    <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
  </div>
  <div class="p-6">
    <!-- Card content -->
  </div>
</div>

<!-- Interactive Card -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden
            hover:shadow-md hover:border-gray-300
            transition-all duration-200
            cursor-pointer group">
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
      Click Me
    </h3>
  </div>
</div>

<!-- Stat Card -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-600">Total Revenue</span>
    <div class="p-2 bg-primary-50 rounded-lg">
      <DollarSignIcon class="w-5 h-5 text-primary-600" />
    </div>
  </div>
  <div class="mt-4">
    <span class="text-3xl font-bold text-gray-900">$124,584</span>
  </div>
  <div class="mt-2 flex items-center gap-1 text-sm">
    <ArrowUpIcon class="w-4 h-4 text-success-600" />
    <span class="font-medium text-success-600">12.5%</span>
    <span class="text-gray-600">vs last month</span>
  </div>
</div>

<!-- Feature Card with Icon -->
<div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
  <div class="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4">
    <ChartIcon class="w-6 h-6 text-primary-600" />
  </div>
  <h3 class="text-lg font-semibold text-gray-900 mb-2">Feature Title</h3>
  <p class="text-sm text-gray-600 leading-relaxed">
    Description of the feature goes here with enough detail to be helpful.
  </p>
</div>
```

### Form Elements

```html
<!-- Text Input -->
<div class="space-y-1.5">
  <label for="email" class="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    id="email"
    class="block w-full px-4 py-2.5
           bg-white border border-gray-300 rounded-lg
           text-gray-900 placeholder-gray-400
           shadow-sm
           transition-all duration-150
           hover:border-gray-400
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    placeholder="you@example.com"
  />
  <p class="text-xs text-gray-600">We'll never share your email.</p>
</div>

<!-- Input with Error -->
<div class="space-y-1.5">
  <label for="email-error" class="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input
    type="email"
    id="email-error"
    class="block w-full px-4 py-2.5
           bg-white border border-danger-500 rounded-lg
           text-gray-900
           shadow-sm
           focus:outline-none focus:ring-2 focus:ring-danger-500"
    aria-describedby="email-error-text"
  />
  <p id="email-error-text" class="text-xs text-danger-600 flex items-center gap-1">
    <AlertCircleIcon class="w-3.5 h-3.5" />
    Please enter a valid email address.
  </p>
</div>

<!-- Select Dropdown -->
<div class="space-y-1.5">
  <label for="state" class="block text-sm font-medium text-gray-700">
    State
  </label>
  <select
    id="state"
    class="block w-full px-4 py-2.5
           bg-white border border-gray-300 rounded-lg
           text-gray-900
           shadow-sm
           transition-all duration-150
           hover:border-gray-400
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
  >
    <option value="">Select a state</option>
    <option value="CA">California</option>
    <option value="NY">New York</option>
  </select>
</div>

<!-- Textarea -->
<div class="space-y-1.5">
  <label for="notes" class="block text-sm font-medium text-gray-700">
    Notes
  </label>
  <textarea
    id="notes"
    rows="4"
    class="block w-full px-4 py-2.5
           bg-white border border-gray-300 rounded-lg
           text-gray-900 placeholder-gray-400
           shadow-sm resize-none
           transition-all duration-150
           hover:border-gray-400
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    placeholder="Add any additional notes..."
  ></textarea>
</div>

<!-- Checkbox -->
<div class="flex items-start gap-3">
  <input
    type="checkbox"
    id="terms"
    class="mt-0.5 h-4 w-4
           border-gray-300 rounded
           text-primary-600
           focus:ring-primary-500 focus:ring-offset-0"
  />
  <label for="terms" class="text-sm text-gray-700">
    I agree to the <a href="#" class="text-primary-600 hover:text-primary-700 underline">terms and conditions</a>
  </label>
</div>

<!-- Radio Group -->
<fieldset class="space-y-3">
  <legend class="text-sm font-medium text-gray-700">Notification Preference</legend>
  <div class="flex items-center gap-3">
    <input type="radio" id="email-opt" name="notification" 
           class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" />
    <label for="email-opt" class="text-sm text-gray-700">Email</label>
  </div>
  <div class="flex items-center gap-3">
    <input type="radio" id="sms-opt" name="notification"
           class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500" />
    <label for="sms-opt" class="text-sm text-gray-700">SMS</label>
  </div>
</fieldset>

<!-- Toggle Switch -->
<div class="flex items-center justify-between">
  <span class="text-sm font-medium text-gray-700">Enable notifications</span>
  <button
    type="button"
    role="switch"
    aria-checked="false"
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full
           border-2 border-transparent
           bg-gray-200
           transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
           aria-checked:bg-primary-600"
  >
    <span class="pointer-events-none relative inline-block h-5 w-5 rounded-full
                 bg-white shadow ring-0
                 transition duration-200
                 translate-x-0 aria-checked:translate-x-5">
    </span>
  </button>
</div>
```

### Tables

```html
<div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <table class="min-w-full divide-y divide-gray-200">
    <thead class="bg-gray-50">
      <tr>
        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Name
        </th>
        <th scope="col" class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Status
        </th>
        <th scope="col" class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Amount
        </th>
        <th scope="col" class="relative px-6 py-3">
          <span class="sr-only">Actions</span>
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200">
      <tr class="hover:bg-gray-50 transition-colors">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          John Smith
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
            Active
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right font-mono">
          $1,250.00
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
          <button class="text-primary-600 hover:text-primary-700 font-medium">
            Edit
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Badges & Status Indicators

```html
<!-- Status Badges -->
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
  Active
</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-700">
  Pending
</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-danger-100 text-danger-700">
  Expired
</span>
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
  Draft
</span>

<!-- With Icons -->
<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-700">
  <CheckCircleIcon class="w-3.5 h-3.5" />
  Completed
</span>

<!-- Count Badge -->
<span class="inline-flex items-center justify-center px-2 py-0.5 min-w-[20px] rounded-full text-xs font-medium bg-primary-600 text-white">
  5
</span>
```

### Alerts & Notifications

```html
<!-- Info Alert -->
<div class="rounded-lg bg-primary-50 border border-primary-200 p-4" role="alert">
  <div class="flex gap-3">
    <InfoIcon class="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
    <div>
      <h3 class="text-sm font-medium text-primary-800">New feature available</h3>
      <p class="mt-1 text-sm text-primary-700">
        Check out our new analytics dashboard for better insights.
      </p>
    </div>
  </div>
</div>

<!-- Success Alert -->
<div class="rounded-lg bg-success-50 border border-success-200 p-4" role="alert">
  <div class="flex gap-3">
    <CheckCircleIcon class="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
    <div>
      <h3 class="text-sm font-medium text-success-800">Successfully saved</h3>
      <p class="mt-1 text-sm text-success-700">
        Your changes have been saved successfully.
      </p>
    </div>
  </div>
</div>

<!-- Warning Alert -->
<div class="rounded-lg bg-warning-50 border border-warning-200 p-4" role="alert">
  <div class="flex gap-3">
    <AlertTriangleIcon class="w-5 h-5 text-warning-600 shrink-0 mt-0.5" />
    <div>
      <h3 class="text-sm font-medium text-warning-800">Action required</h3>
      <p class="mt-1 text-sm text-warning-700">
        Your subscription expires in 5 days.
      </p>
    </div>
  </div>
</div>

<!-- Error Alert -->
<div class="rounded-lg bg-danger-50 border border-danger-200 p-4" role="alert">
  <div class="flex gap-3">
    <XCircleIcon class="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />
    <div>
      <h3 class="text-sm font-medium text-danger-800">Error occurred</h3>
      <p class="mt-1 text-sm text-danger-700">
        Unable to process your request. Please try again.
      </p>
    </div>
  </div>
</div>
```

### Modals

```html
<!-- Modal Backdrop -->
<div class="fixed inset-0 z-50 overflow-y-auto">
  <!-- Overlay -->
  <div class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"></div>
  
  <!-- Modal Container -->
  <div class="flex min-h-full items-center justify-center p-4">
    <!-- Modal Content -->
    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Modal Title</h2>
        <button class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close modal">
          <XIcon class="w-5 h-5" />
        </button>
      </div>
      
      <!-- Body -->
      <div class="px-6 py-4">
        <p class="text-sm text-gray-600">Modal content goes here.</p>
      </div>
      
      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
        <button class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors">
          Confirm
        </button>
      </div>
    </div>
  </div>
</div>
```

### Empty States

```html
<div class="flex flex-col items-center justify-center py-12 px-4 text-center">
  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
    <InboxIcon class="w-8 h-8 text-gray-400" />
  </div>
  <h3 class="text-lg font-semibold text-gray-900 mb-2">No policies found</h3>
  <p class="text-sm text-gray-600 max-w-sm mb-6">
    Get started by creating your first policy or adjusting your filters.
  </p>
  <button class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors">
    <PlusIcon class="w-5 h-5" />
    Create Policy
  </button>
</div>
```

### Loading States

```html
<!-- Spinner -->
<div class="flex items-center justify-center">
  <svg class="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
</div>

<!-- Skeleton Card -->
<div class="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
  <div class="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div class="h-4 bg-gray-200 rounded w-2/3"></div>
</div>

<!-- Skeleton Table Row -->
<tr class="animate-pulse">
  <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
  <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-16"></div></td>
  <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-20"></div></td>
</tr>

<!-- Button Loading State -->
<button disabled class="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg opacity-75 cursor-not-allowed">
  <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
  Saving...
</button>
```

---

## Data Visualization

### Chart Color Palette

```javascript
const chartColors = {
  primary: '#2563eb',    // Main data series
  secondary: '#8b5cf6',  // Second series
  tertiary: '#06b6d4',   // Third series
  success: '#16a34a',    // Positive values
  danger: '#dc2626',     // Negative values
  warning: '#d97706',    // Attention values
  neutral: '#6b7280',    // Reference lines
  grid: '#e5e7eb',       // Grid lines
  background: '#f9fafb', // Chart background
};

// Categorical palette (up to 8 series)
const categoricalPalette = [
  '#2563eb', // Blue
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#6366f1', // Indigo
];
```

### Recharts Configuration

```jsx
// Standard Line/Area Chart
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>
    <defs>
      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
    <XAxis 
      dataKey="month" 
      axisLine={false}
      tickLine={false}
      tick={{ fill: '#6b7280', fontSize: 12 }}
      dy={10}
    />
    <YAxis 
      axisLine={false}
      tickLine={false}
      tick={{ fill: '#6b7280', fontSize: 12 }}
      dx={-10}
      tickFormatter={(value) => `$${value.toLocaleString()}`}
    />
    <Tooltip
      contentStyle={{
        backgroundColor: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        padding: '12px 16px',
      }}
      labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
      itemStyle={{ color: '#374151', fontSize: '14px' }}
      formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
    />
    <Area 
      type="monotone" 
      dataKey="revenue" 
      stroke="#2563eb" 
      strokeWidth={2}
      fill="url(#colorRevenue)" 
    />
  </AreaChart>
</ResponsiveContainer>

// Bar Chart
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data} barGap={8}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
    <XAxis 
      dataKey="name" 
      axisLine={false}
      tickLine={false}
      tick={{ fill: '#6b7280', fontSize: 12 }}
    />
    <YAxis 
      axisLine={false}
      tickLine={false}
      tick={{ fill: '#6b7280', fontSize: 12 }}
    />
    <Tooltip ... />
    <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

### Metric Display Guidelines

```html
<!-- Metric with Context -->
<div class="space-y-1">
  <div class="flex items-baseline gap-2">
    <span class="text-3xl font-bold text-gray-900">$124,584</span>
    <span class="flex items-center gap-0.5 text-sm font-medium text-success-600">
      <ArrowUpIcon class="w-4 h-4" />
      12.5%
    </span>
  </div>
  <p class="text-sm text-gray-600">vs $110,740 last month</p>
</div>

<!-- Progress Metric -->
<div class="space-y-2">
  <div class="flex items-center justify-between text-sm">
    <span class="font-medium text-gray-700">Monthly Goal</span>
    <span class="text-gray-600">47 / 50 policies</span>
  </div>
  <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
    <div class="h-full bg-primary-600 rounded-full transition-all duration-500" style="width: 94%"></div>
  </div>
  <p class="text-xs text-gray-600">3 more policies to reach goal</p>
</div>
```

---

## Motion & Animation

### Framer Motion Patterns

```jsx
// Page Entrance
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
  Page Content
</motion.div>

// Staggered List
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

<motion.ul variants={containerVariants} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={itemVariants}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// Card Hover
<motion.div
  whileHover={{ y: -4, transition: { duration: 0.2 } }}
  className="card"
>
  Card Content
</motion.div>

// Button Press
<motion.button
  whileTap={{ scale: 0.98 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.15 }}
  className="btn-primary"
>
  Click Me
</motion.button>

// Modal Animation
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};
```

### CSS Transitions

```css
/* Standard transitions */
.transition-fast    { transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1); }
.transition-normal  { transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1); }
.transition-slow    { transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1); }

/* Color transitions */
.transition-colors  { transition: color, background-color, border-color 150ms; }

/* Transform transitions */
.transition-transform { transition: transform 200ms cubic-bezier(0.4, 0, 0.2, 1); }
```

### Reduced Motion

```jsx
// Always respect user preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animationProps = prefersReducedMotion 
  ? {} 
  : { whileHover: { y: -4 }, transition: { duration: 0.2 } };

<motion.div {...animationProps}>Content</motion.div>

// CSS approach
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility Standards

### WCAG AA Compliance Checklist

#### Color & Contrast
- [ ] Text contrast ratio ≥ 4.5:1 (body text)
- [ ] Large text contrast ratio ≥ 3:1 (18px+ or 14px bold)
- [ ] UI component contrast ratio ≥ 3:1
- [ ] No information conveyed by color alone
- [ ] Focus indicators clearly visible

#### Keyboard Navigation
- [ ] All interactive elements focusable via Tab
- [ ] Logical focus order (top-to-bottom, left-to-right)
- [ ] Focus trapped within modals
- [ ] Escape key closes modals/dropdowns
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate within components

#### Screen Readers
- [ ] All images have alt text
- [ ] Icon-only buttons have aria-label
- [ ] Form inputs have associated labels
- [ ] Error messages linked via aria-describedby
- [ ] Dynamic content uses aria-live regions
- [ ] Proper heading hierarchy (h1 → h2 → h3)

### ARIA Patterns

```html
<!-- Icon Button -->
<button aria-label="Delete item" class="...">
  <TrashIcon class="w-5 h-5" />
</button>

<!-- Form Field with Error -->
<div>
  <label for="email">Email</label>
  <input 
    type="email" 
    id="email" 
    aria-describedby="email-error"
    aria-invalid="true" 
  />
  <p id="email-error" role="alert">Please enter a valid email</p>
</div>

<!-- Live Region for Updates -->
<div 
  role="status" 
  aria-live="polite" 
  aria-atomic="true"
  class="sr-only"
>
  3 items added to cart
</div>

<!-- Modal Dialog -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="modal-title"
>
  <h2 id="modal-title">Confirm Action</h2>
  ...
</div>

<!-- Tab Panel -->
<div role="tablist" aria-label="Account settings">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    Profile
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    Security
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  Profile content
</div>
```

### Focus Management

```jsx
// Focus trap for modals
import { useRef, useEffect } from 'react';

function Modal({ isOpen, onClose, children }) {
  const firstFocusableRef = useRef();
  const lastFocusableRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      firstFocusableRef.current?.focus();
    }
  }, [isOpen]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusableRef.current) {
        e.preventDefault();
        lastFocusableRef.current?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusableRef.current) {
        e.preventDefault();
        firstFocusableRef.current?.focus();
      }
    }
  };
  
  return (
    <div role="dialog" aria-modal="true" onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
```

---

## Responsive Design

### Breakpoint Strategy

```
Mobile First Approach:
────────────────────────────────────────────────────────────────────────

│ 0px      │ 640px    │ 768px    │ 1024px   │ 1280px   │ 1536px   │
│ default  │ sm:      │ md:      │ lg:      │ xl:      │ 2xl:     │
│ Mobile   │ Mobile   │ Tablet   │ Desktop  │ Large    │ Extra    │
│          │ landscape│          │          │ desktop  │ large    │

```

### Responsive Patterns

```html
<!-- Navigation: Stack on mobile, horizontal on desktop -->
<nav class="flex flex-col md:flex-row md:items-center md:gap-6">
  <a href="#" class="py-2 md:py-0">Dashboard</a>
  <a href="#" class="py-2 md:py-0">Policies</a>
  <a href="#" class="py-2 md:py-0">Clients</a>
</nav>

<!-- Grid: 1 → 2 → 3 → 4 columns -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  <div>Card</div>
</div>

<!-- Sidebar Layout -->
<div class="flex flex-col lg:flex-row">
  <aside class="w-full lg:w-64 lg:shrink-0">Sidebar</aside>
  <main class="flex-1 min-w-0">Content</main>
</div>

<!-- Hide/Show by breakpoint -->
<button class="lg:hidden">Mobile Menu</button>
<nav class="hidden lg:flex">Desktop Nav</nav>

<!-- Responsive Typography -->
<h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">Title</h1>

<!-- Responsive Padding -->
<section class="px-4 py-8 md:px-6 md:py-12 lg:px-8 lg:py-16">
  Content
</section>
```

### Mobile Considerations

```css
/* Minimum touch target size: 44x44px */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Prevent zoom on input focus (16px minimum) */
input, select, textarea {
  font-size: 16px;
}

/* Safe area padding for notched devices */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## Implementation Patterns

### Component File Structure

```
components/
├── ui/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   ├── Card/
│   ├── Input/
│   └── index.ts
├── features/
│   ├── Dashboard/
│   ├── Policies/
│   └── Clients/
└── layouts/
    ├── AppLayout.tsx
    ├── AuthLayout.tsx
    └── index.ts
```

### Component Template

```tsx
import { forwardRef, type ComponentPropsWithRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-sm focus:ring-primary-500',
        secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 border border-gray-300 hover:border-gray-400 shadow-sm focus:ring-primary-500',
        ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 focus:ring-primary-500',
        danger: 'bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white shadow-sm focus:ring-danger-500',
      },
      size: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ComponentPropsWithRef<'button'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

// Format percentage
export function formatPercent(value: number, decimals = 1): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`;
}

// Format date
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format,
  }).format(d);
}
```

---

## Anti-Patterns

### Colors — Don't Do This

```html
<!-- ❌ WRONG: Low contrast text -->
<p class="text-gray-400">Important information</p>
<p class="text-gray-500">Also important</p>

<!-- ✅ CORRECT: Adequate contrast -->
<p class="text-gray-700">Important information</p>
<p class="text-gray-600">Secondary information</p>
```

### Buttons — Don't Do This

```html
<!-- ❌ WRONG: Div as button, no accessibility -->
<div class="btn" onclick="save()">Save</div>

<!-- ✅ CORRECT: Semantic button with proper attributes -->
<button type="button" class="btn-primary" onClick={save}>Save</button>
```

### Forms — Don't Do This

```html
<!-- ❌ WRONG: No label, vague placeholder -->
<input type="text" placeholder="Enter here" />

<!-- ✅ CORRECT: Proper label, helpful placeholder -->
<label for="name" class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
<input type="text" id="name" placeholder="John Smith" class="..." />
```

### Icons — Don't Do This

```html
<!-- ❌ WRONG: Icon-only button without label -->
<button><XIcon /></button>

<!-- ✅ CORRECT: Accessible icon button -->
<button aria-label="Close modal"><XIcon class="w-5 h-5" /></button>
```

### Loading States — Don't Do This

```html
<!-- ❌ WRONG: No feedback during loading -->
<button onClick={submit}>Submit</button>

<!-- ✅ CORRECT: Visual feedback + disabled state -->
<button onClick={submit} disabled={isLoading}>
  {isLoading ? (
    <>
      <Spinner class="w-4 h-4" />
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### Error Messages — Don't Do This

```html
<!-- ❌ WRONG: Vague, unhelpful error -->
<p class="text-red-500">Error occurred</p>

<!-- ✅ CORRECT: Specific, actionable error -->
<p class="text-danger-600 flex items-center gap-1">
  <AlertCircleIcon class="w-4 h-4" />
  Email format is invalid. Please use: name@example.com
</p>
```

---

## Audit Checklist

### Per-Component Checklist

- [ ] **Contrast**: All text meets WCAG AA (4.5:1 body, 3:1 large)
- [ ] **Keyboard**: Focusable via Tab, activatable via Enter/Space
- [ ] **Screen Reader**: ARIA labels on icon buttons, proper roles
- [ ] **Responsive**: Tested at 320px, 768px, 1024px, 1440px
- [ ] **Loading**: Skeleton/spinner states implemented
- [ ] **Error**: Error states styled and announced
- [ ] **Empty**: Empty state with helpful CTA
- [ ] **Motion**: Respects prefers-reduced-motion
- [ ] **Touch**: 44px minimum touch targets on mobile

### Per-Page Checklist

- [ ] **Heading Hierarchy**: Single h1, logical h2→h3 structure
- [ ] **Focus Order**: Tab through page in logical order
- [ ] **Skip Link**: Skip to main content link present
- [ ] **Page Title**: Unique, descriptive document title
- [ ] **Loading**: Page-level loading state
- [ ] **Error Boundary**: Graceful error handling
- [ ] **Meta Tags**: Proper viewport, description

### Full Site Checklist

- [ ] **Consistent Navigation**: Same nav across all pages
- [ ] **Consistent Styling**: Design tokens used everywhere
- [ ] **Icon Consistency**: Same icon family throughout (Lucide)
- [ ] **Animation Consistency**: Same timing/easing everywhere
- [ ] **Error Consistency**: Same error pattern everywhere
- [ ] **Loading Consistency**: Same skeleton pattern everywhere
- [ ] **Responsive Consistency**: Same breakpoint behavior

---

## Quick Reference Card

### Most-Used Classes

```
Text Colors:      text-gray-900 (heading), text-gray-700 (body), text-gray-600 (muted)
Background:       bg-white, bg-gray-50, bg-primary-50
Borders:          border border-gray-200, rounded-lg, rounded-xl
Shadows:          shadow-sm, shadow-md
Spacing:          p-4, p-6, gap-4, gap-6, space-y-4
Buttons:          px-4 py-2 or px-6 py-3
Focus:            focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
```

### Color Quick Reference

```
Primary Action:   bg-primary-600 text-white
Secondary Action: bg-white text-gray-700 border-gray-300
Success:          bg-success-100 text-success-700
Warning:          bg-warning-100 text-warning-700
Danger:           bg-danger-100 text-danger-700
```

---

**Version:** 3.0
**Last Updated:** 2025
**Framework:** React + Tailwind CSS + Framer Motion
