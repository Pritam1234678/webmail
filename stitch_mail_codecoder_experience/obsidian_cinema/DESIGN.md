---
name: Obsidian Cinema
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#393939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#20201f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353535'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c8c6c5'
  primary: '#c8c6c5'
  on-primary: '#313030'
  primary-container: '#121212'
  on-primary-container: '#7e7d7d'
  inverse-primary: '#5f5e5e'
  secondary: '#e9c349'
  on-secondary: '#3c2f00'
  secondary-container: '#af8d11'
  on-secondary-container: '#342800'
  tertiary: '#c6c7c4'
  on-tertiary: '#2f312f'
  tertiary-container: '#111312'
  on-tertiary-container: '#7d7e7c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#ffe088'
  secondary-fixed-dim: '#e9c349'
  on-secondary-fixed: '#241a00'
  on-secondary-fixed-variant: '#574500'
  tertiary-fixed: '#e2e3e0'
  tertiary-fixed-dim: '#c6c7c4'
  on-tertiary-fixed: '#1a1c1a'
  on-tertiary-fixed-variant: '#454745'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353535'
typography:
  hero-display:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.12em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  margin-safe: 40px
  gutter: 24px
  desktop-max-width: 1440px
---

## Brand & Style
The design system is engineered for an elite tier of communication. It targets high-output professionals who view their inbox as a private sanctuary of focus and refinement. The brand personality is **composed, authoritative, and cinematic**, drawing inspiration from high-end horology and boutique editorial publishing.

The design style is a hybrid of **Minimalism** and **Cinematic Depth**. It rejects the ephemeral trends of "bubbly" SaaS interfaces in favor of architectural rigor and timeless elegance. The UI should evoke the emotional response of entering a quiet, dimly lit gallery—a space where focus is a luxury and clarity is paramount. Every interaction must feel intentional, utilizing atmospheric gradients and physical motion physics to create a sense of tactile premium quality.

## Colors
The palette is rooted in a "Dark Luxury" spectrum. The base of the interface is **Matte Obsidian** (#0A0A0A), providing a bottomless depth that allows content to emerge.

- **Primary Stack:** Warm graphite blacks (#121212) and deep charcoals (#1A1A1A) are used for layering and surface differentiation.
- **Accents:** **Champagne Gold** (#D4AF37) is used sparingly for high-value interactions and notifications. **Soft Ivory** (#F4F4F1) serves as the primary text color, providing a softer, more organic contrast than pure white.
- **Backgrounds:** Implement subtle radial gradients of deep midnight blue or charcoal to simulate cinematic lighting hitting a physical surface. Avoid flat, solid hex fills; instead, use 1% grain textures over layered dark tones.

## Typography
Typography is the core of this design system’s editorial identity. We employ a high-contrast pairing that mirrors luxury magazine layouts.

- **Headlines:** Uses **Playfair Display**. It should be treated as a decorative element. In "Hero" moments, use oversized, intentional cinematic scales with tight tracking.
- **Body:** Uses **Hanken Grotesk**. This sans-serif provides a contemporary, sharp contrast to the serif headings. It is set with generous letter spacing to enhance legibility and evoke a sense of "breathing room" within the UI.
- **Labels:** Small metadata and labels should always use uppercase **Hanken Grotesk** with high letter spacing (0.1em+) to maintain an architectural, structured feel.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy within a fluid container. We prioritize wide margins and "negative space as a feature."

- **Desktop:** A 12-column grid with a maximum content width of 1440px. The sidebar is treated as a fixed "monolith" (280px), while the reading pane uses generous internal padding (64px) to simulate a printed page.
- **Mobile:** Transition to a single-column view where margins are reduced to 24px, but vertical spacing between items remains high (32px+) to prevent a cluttered appearance.
- **Rhythm:** All spacing must be a multiple of 8px. Use exaggerated vertical spacing (80px, 120px) between major sections to emphasize the editorial narrative of the interface.

## Elevation & Depth
Elevation is achieved through **Tonal Layering** and **Atmospheric Shadows**, rather than traditional drop shadows.

- **Surface Tiers:** The base layer is #0A0A0A. Secondary surfaces (cards, sidebars) use #121212. Interactive elements (hover states) lift to #1A1A1A.
- **Shadows:** Use "Warm Luxury Shadows"—deep, ultra-diffused, and slightly tinted with a hint of gold or umber (e.g., `rgba(0, 0, 0, 0.8)` with a 40px blur).
- **Glassmorphism:** Use sparingly for floating overlays. Use a high blur (30px) and a low opacity (5%) Ivory tint to simulate frosted obsidian glass.
- **Gradients:** Apply very subtle top-to-bottom linear gradients on surfaces (e.g., #1A1A1A to #121212) to create a "beveled" or "lit" physical appearance.

## Shapes
The shape language is **geometric and structured**. We avoid the overly rounded "pill" shapes common in consumer apps.

- **Primary Elements:** Use a **Soft** (0.25rem) radius. This provides just enough softening to feel premium without losing the professional, architectural edge.
- **Large Containers:** Cards and email view containers should use `rounded-lg` (0.5rem).
- **Buttons:** Sharp or subtly rounded (4px). Never use full-circle/pill buttons for primary actions, as they diminish the editorial authority of the design system.

## Components
Consistent styling of components is vital to maintaining the cinematic tone:

- **Buttons:** Primary buttons are Solid Ivory text on a Matte Graphite background with a 1px Brushed Silver border. On hover, the border glows slightly with a Champagne Gold tint.
- **Input Fields:** Minimalist under-line inputs or very subtle dark-filled containers. Focus states should be indicated by a soft Ivory glow on the border, never a thick blue ring.
- **Lists:** Email threads are separated by thin, low-contrast 1px dividers (#222). Hovering an item should trigger a subtle "lift" using a tonal background change.
- **Cards:** Used sparingly for "Hero" content. Should feature a 1px border that is only slightly lighter than the background, creating a "ghost" outline.
- **Chips/Labels:** Use the `label-caps` typography style. Backgrounds should be dark with Champagne Gold text.
- **Motion:** All transitions (opening an email, switching folders) should use a custom "Physical" cubic-bezier (0.2, 0.0, 0.0, 1.0) to simulate the weight and inertia of high-end machinery.