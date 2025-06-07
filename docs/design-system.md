# PS Olympics Design System

## Overview

This design system provides a unified, Olympic-inspired visual language for the PS Olympics application. It ensures consistency, accessibility, and responsive design across all components and pages.

## 1. Color Palette

### Primary Color

- Dark Navy (#002654) - Main brand color, used for primary elements and navigation

### Secondary Colors (Medal-inspired)

- Gold (#FFD700) - Used for first place, featured content
- Silver (#C0C0C0) - Used for second place, secondary content
- Bronze (#CD7F32) - Used for third place, tertiary content

### Accent Colors

- White (#FFFFFF) - Primary background, text on dark backgrounds
- Light Gray (#F5F5F5) - Secondary background, subtle highlights

## 2. Typography

### Headings

- Font: Montserrat Bold
- Usage: Section titles, page headers
- Sizes:
  - h1: 2.5rem (40px)
  - h2: 2rem (32px)
  - h3: 1.5rem (24px)
  - h4: 1.25rem (20px)

### Body Text

- Font: Open Sans or Roboto
- Usage: Main content, descriptions, navigation
- Sizes:
  - Regular: 1rem (16px)
  - Small: 0.875rem (14px)

### Numeric Content

- Font: Monospace (for tables and statistics)
- Usage: Medal counts, scores, statistics

## 3. Components

### Buttons

```css
Primary Button:
- Background: Dark Navy (#002654)
- Text: White (#FFFFFF)
- Hover: Slightly darker navy

Secondary Button:
- Background: White (#FFFFFF)
- Border: Dark Navy (#002654)
- Text: Dark Navy (#002654)
```

### Inputs

```css
- Border: Light gray (#CCCCCC)
- Focus: Navy outline
- Background: White (#FFFFFF)
- Padding: 0.75rem (12px)
```

### Icons & Imagery

- Sport Icons: 40×40px SVG
- Medal Icons: Flat design, matching medal colors
- Team Logos: Circular or square containers

## 4. Layout System

### Navigation

- Sticky navbar with main navigation items
- Mobile: Hamburger menu with slide-out navigation
- Desktop: Horizontal navigation with dropdown menus

### Grid System

- 12-column grid
- Gutters: 1rem (16px)
- Margins:
  - Desktop: 5% on each side
  - Mobile: 1rem (16px)

### Footer

- Event dates
- Sponsor logos section
- Contact information
- Social media links

## 5. Responsive Design

### Breakpoints

```css
Desktop: ≥1024px
Tablet: ≥768px and <1024px
Mobile: <768px
```

### Mobile Adaptations

- Tables convert to cards
- Navigation becomes hamburger menu
- Grid columns adjust for smaller screens
- Font sizes scale down proportionally

## Implementation Steps

### Phase 1: Core Updates

1. Configure color palette in Tailwind
2. Import and setup typography
3. Create base utility classes

### Phase 2: Component Library

1. Update button and input styles
2. Create icon components
3. Build medal-specific components

### Phase 3: Layout Implementation

1. Enhance navigation system
2. Implement responsive grid
3. Create footer component

### Phase 4: Responsive Design

1. Add breakpoint-specific styles
2. Implement mobile navigation
3. Create responsive utilities

### Phase 5: Documentation

1. Component usage examples
2. Color and typography guidelines
3. Responsive design patterns
