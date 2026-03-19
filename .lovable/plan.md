
# FinTrack AI — Base Design System & Layout

## Overview
Set up the foundational design system and persistent sidebar layout for a dark-themed personal finance tracker dashboard.

## Steps

### 1. Design System Setup
- Update `index.css` with dark theme CSS variables matching the provided design tokens
- Import Google Fonts: DM Serif Display, DM Mono, Outfit
- Add global antialiased font smoothing and utility classes for the three font families

### 2. Sidebar Component
- Fixed 256px sidebar with dark surface background (`#181c27`)
- **Logo area**: Dollar sign icon in lime green square + "FinTrack" (DM Serif Display) + "AI Edition" subtitle (DM Mono, lime)
- **Navigation**: Dashboard, Transactions, Reports, Settings with Lucide icons — active item gets lime green bg with dark text, inactive items show muted text with hover effects
- **Telegram status card**: Dark card at bottom with amber pulsing dot, "Not connected" label, "Connect Sync" button in blue
- **User profile**: Avatar initials circle + email + "Pro Plan" label at very bottom

### 3. Main Content Shell
- Content area offset by sidebar width (`ml-64`)
- Sticky header with page title (DM Serif Display) and date range pill
- Scrollable content area with max-width container
- Dark background (`#0f1117`)

### 4. App Router Integration
- Wrap routes in the new layout with SidebarProvider
- Dashboard as the default index route with placeholder content
- Route highlighting in sidebar based on current path

### 5. Placeholder Dashboard Page
- Simple heading + empty state cards to demonstrate the design tokens, typography, and layout working together
