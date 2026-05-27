# 🎨 Design Tokens - POS Finance Premium Dark Mode

## Color Palette

### Primary Background
```
#090C12 - Main background (premium-bg)
#06080D - Darker background (premium-bg-dark)
```

### Cards & Surfaces
```
#171B23 - Primary card (premium-card)
#1E232D - Soft card (premium-card-soft)
#11151C - Dark card (premium-card-dark)
```

### Text Colors
```
#F1F3F7 - Primary text (premium-text)
#B7BBC5 - Secondary text (premium-text-secondary)
#7F8490 - Muted text (premium-text-muted)
```

### Semantic Colors
```
#42D97B - Income/Success (premium-income)
#F05C6B - Expense/Danger (premium-expense)
#5DA8FF - Savings/Info (premium-savings)
#F59E0B - Warning/Orange (premium-orange)
#B026FF - Accent/Purple (premium-purple)
#16E6F2 - Cyan/Info (premium-cyan)
#4ADE80 - Green/Success (premium-green)
#FF4D5E - Red/Error (premium-red)
```

### Navigation
```
#11151C - Nav background (premium-nav)
#2A2F39 - Nav active state (premium-nav-active)
#E9EDF5 - Button primary (premium-button)
#11151C - Button text (premium-button-text)
```

### Borders & Dividers
```
rgba(255,255,255,0.07) - Soft border (premium-border-soft)
rgba(255,255,255,0.12) - Medium border (premium-border-medium)
```

---

## Typography

### Font Family
```
Primary: Plus Jakarta Sans
Fallback: Inter, system-ui, sans-serif
```

### Font Weights
```
400 - Regular
700 - Bold
900 - Black (heavy use)
```

### Font Sizes & Usage
```
Text:
- 12px (0.75rem) - Labels, captions, small text
- 14px (0.875rem) - Body text, descriptions
- 16px (1rem) - Normal text
- 18px (1.125rem) - Subheadings

Headings:
- 20px (1.25rem) - Section titles
- 24px (1.5rem) - Page titles
- 28px (1.75rem) - Large titles
- 32px (2rem) - Extra large titles

Numbers:
- 24px (1.5rem) - Metric values
- 32px (2rem) - Large balance numbers
- 40px (2.5rem) - Extra large balance
```

### Letter Spacing
```
-0.01em - Default (tight)
0.02em - Labels (uppercase)
0.05em - Buttons (uppercase)
```

---

## Spacing System

### Padding
```
4px (0.25rem) - Minimal
8px (0.5rem) - Small
12px (0.75rem) - Medium-small
16px (1rem) - Medium
20px (1.25rem) - Large
24px (1.5rem) - Extra large
32px (2rem) - Huge
```

### Gaps
```
8px - Tight gap
12px - Small gap
16px - Medium gap
20px - Large gap
24px - Extra large gap
28px - Huge gap
```

### Margins
```
Same as padding system
```

---

## Border Radius

### Card Radius
```
20px - Small cards, buttons
24px - Normal cards (card-md)
28px - Large cards (card-lg)
32px - Main cards (card)
```

### Input Radius
```
20px - Standard input radius
```

### Button Radius
```
20px - Standard button radius
```

---

## Shadows

### Shadow System
```
0 10px 30px rgba(0,0,0,0.25) - Small shadow (premium-sm)
0 20px 50px rgba(0,0,0,0.35) - Medium shadow (premium)
0 25px 60px rgba(0,0,0,0.4) - Large shadow (premium-lg)
```

### Glow Effects
```
0 0 50px rgba(16,185,129,.18) - Emerald glow
0 0 60px rgba(139,92,246,0.15) - Violet glow
0 0 60px rgba(66,217,123,0.15) - Green glow
0 0 60px rgba(240,92,107,0.15) - Rose glow
0 0 60px rgba(93,168,255,0.15) - Blue glow
```

---

## Gradients

### Balance Card Gradient
```
linear-gradient(135deg, #0067A8 0%, #007F78 45%, #005B3F 75%, #071018 100%)
```

### Alternative Gradient
```
linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 50%, #1a2f3a 100%)
```

---

## Component Sizing

### Buttons
```
Height: 44px (min touch target)
Padding: 12px 24px
Font size: 14px (0.875rem)
Font weight: 900 (black)
```

### Inputs
```
Height: 44px (min touch target)
Padding: 12px 16px
Border radius: 20px
Font size: 15px (0.95rem)
```

### Cards
```
Padding: 20px (mobile), 24px (desktop)
Border radius: 24-32px
Min height: 100px (stat cards)
```

### Bottom Navigation
```
Height: 80px (5rem)
Item size: 64px (4rem)
Icon size: 24px
```

### Icons
```
Small: 12px
Medium: 18px
Large: 24px
Extra large: 32px
```

---

## Responsive Breakpoints

### Mobile First
```
< 768px - Mobile (full width)
768px - 1024px - Tablet (2 columns)
> 1024px - Desktop (3+ columns)
```

### Container Widths
```
Mobile: 100% - 24px padding
Tablet: 100% - 32px padding
Desktop: max-width 1480px, centered
```

---

## Opacity Values

### Background Opacity
```
0.4 - Very transparent
0.6 - Transparent
0.8 - Semi-transparent
0.9 - Mostly opaque
```

### Text Opacity
```
0.5 - Faded
0.6 - Secondary
0.7 - Tertiary
1.0 - Primary
```

---

## Animation & Transitions

### Duration
```
150ms - Quick interactions
300ms - Standard transitions
500ms - Longer animations
```

### Easing
```
ease - Default
ease-in - Accelerating
ease-out - Decelerating
ease-in-out - Smooth
```

---

## Accessibility

### Color Contrast
```
Primary text on background: 15:1+ (AAA)
Secondary text on background: 10:1+ (AA)
Interactive elements: 4.5:1+ (AA)
```

### Touch Targets
```
Minimum: 44x44px
Recommended: 48x48px
Spacing: 8px minimum between targets
```

### Font Sizes
```
Minimum: 12px (captions only)
Body: 14-16px
Headings: 20px+
```

---

## Usage Examples

### Card Component
```tsx
<Card variant="premium" className="p-6">
  {/* Content */}
</Card>
```

### Badge Component
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="warning">Warning</Badge>
```

### Button Component
```tsx
<button className="btn btn-primary">Primary</button>
<button className="btn btn-ghost">Ghost</button>
```

### Text Colors
```tsx
<p className="text-premium-text">Primary</p>
<p className="text-premium-text-secondary">Secondary</p>
<p className="text-premium-text-muted">Muted</p>
```

### Semantic Colors
```tsx
<p className="text-premium-income">Income</p>
<p className="text-premium-expense">Expense</p>
<p className="text-premium-savings">Savings</p>
```

---

## Dark Mode Considerations

### Contrast Ratios
- All text meets WCAG AA standards
- Primary text: 15:1 contrast ratio
- Secondary text: 10:1 contrast ratio

### Eye Comfort
- No pure white (#FFFFFF) on pure black
- Soft shadows for depth
- Subtle gradients for visual interest

### Readability
- Large font sizes for important data
- Clear hierarchy with size and weight
- Adequate line height (1.5-1.8)

---

## Implementation Notes

### Tailwind Configuration
All colors are defined in `tailwind.config.ts` under `theme.extend.colors`

### CSS Variables
Can be extended with CSS custom properties for dynamic theming

### Responsive Utilities
- `hide-mobile` - Hide on mobile
- `mobile-only` - Show only on mobile
- `desktop-only` - Show only on desktop

---

## Color Combinations

### Recommended Pairings
```
Text: premium-text on premium-card
Secondary: premium-text-secondary on premium-card-soft
Muted: premium-text-muted on premium-bg

Income: premium-income on premium-income/10 background
Expense: premium-expense on premium-expense/10 background
Savings: premium-savings on premium-savings/10 background
```

### Avoid
- Pure white text
- Pure black backgrounds
- High saturation colors
- Clashing complementary colors

---

Generated: May 27, 2026
