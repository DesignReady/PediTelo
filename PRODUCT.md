# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Existing codebase: Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS v4 (CSS `@theme`), TypeScript. Deployed on Netlify; Postgres (Supabase) via Prisma. Mobile-first, must also work properly on desktop.

## Users
Primary: adults in Argentina (AMBA) looking for a "hotel de alojamiento" (short-stay hotel) right now, often late at night or at dawn, in the car, phone in hand, in a hurry and low on battery. They have been driving from hotel to hotel hoping for vacancy. Many want discretion; some are embarrassed or hiding the booking, which is why an anonymous booking path exists.
Secondary: hotel owners/staff who manage rooms, prices and reservations in an admin panel (one authenticated account per hotel). Tertiary: the site owner (superadmin), who creates hotel accounts by hand and hands credentials to clients.

## Product Purpose
PediTelo shows real-time vacancy of short-stay hotels and lets people book a 1h / 3h / 5h turn instantly, per room category, instead of driving around. Success: someone opens it, sees which hotels have rooms free right now and at what price, and books in seconds.

## Positioning
Live per-room availability across many hotels plus instant booking by turn (1/3/5h), with a loyalty reward (every 10 reservations = 1 free room) and an anonymous booking option. A directory or a hotel's own site cannot show this.

## Operating Context
Used on a phone at night, one-handed, mixed connectivity. Hotels toggle rooms open/occupied individually (alarm-style switches) and the customer view reflects it within seconds (polling). Closed or full hotels still appear in search, greyed out with a red "Cerrado" / "Lleno" tag. Maps and Google Maps / Waze deep links for directions.

## Capabilities and Constraints
- Home search with filters: open-now toggle, barrio, price range slider, amenities dropdown (customers pick only from a predefined list), name search in the header.
- Hotel detail: categories, rooms free, turns with prices, rules, amenities, reviews, map links.
- Booking: Google login (history, loyalty progress, vouchers) or anonymous (name + phone typed in, no loyalty). Payment via Mercado Pago per hotel is planned and not built.
- Reviews are posted with a random anonymous pseudonym ("Zorro Curioso" style).
- Profile page: reservation history, loyalty progress, voucher cards.
- Admin: per-hotel panel (rooms, prices, photos, descriptions, amenities, rules, reservations). Superadmin panel creates hotel accounts.
- Spanish (es-AR) UI copy, voseo ("Reservá", "Iniciá sesión"). Prices in ARS. Timezone America/Argentina/Buenos_Aires.
- Must stay fast and light on mid-range phones with poor signal.

## Brand Commitments
Name: PediTelo. Colors are pink and white; that palette stays (user-pinned). No explicit or vulgar imagery. Must not look corporate or cold. Must not look cheap.

## Evidence on Hand
Demo data only: 8 invented hotels, no real photos, no real customers or testimonials yet. Hotel photos are uploaded per category by hotels; absence of a photo must be handled gracefully. Do not fabricate reviews, customer counts, or claims.

## Product Principles
1. Availability and price are the product; nothing decorative may bury them.
2. Speed and clarity first: the booking path stays short, thumb-reachable, one primary action per screen.
3. Discretion is a feature: tone is confident and calm, never explicit.
4. Honest states: closed, full, loading, offline and error are designed states, not afterthoughts.
5. Personality over template: it should feel like its own brand, not a generic SaaS or booking clone.

## Accessibility & Inclusion
Readable contrast on dark rooms and bright sun alike (4.5:1 body text), touch targets 44px+, visible focus, respect `prefers-reduced-motion`. Spanish only.
