<!-- @format -->

# PRD — FZA Scientific Website

**Document status:** Updated for Nuxt 4 Migration (v2.0)  
**Brand:** FZA Scientific  
**Product type:** B2B company profile and scientific product catalog  
**Primary conversion:** Product inquiry / Request a Quotation (RFQ)  
**Initial release:** Informational B2B website; no online checkout or consumer cart  
**Architecture:** Nuxt 4 (Vue 3, TypeScript, Tailwind CSS, Motion for Vue, SSG)  
**Visual Direction:** Bold Turquoise + Medium Parallax

---

## 1. Product Overview

FZA Scientific requires a modern, high-precision B2B digital presence to introduce the company, showcase its scientific product offerings, and provide friction-free channels for institutional buyers and researchers to request quotations and contact the sales team.

The website serves exclusively B2B audiences, including:

- Diagnostic laboratories and medical clinics
- Hospitals and health networks
- University, academic, and government research institutions
- Industrial biopharma and chemical R&D facilities
- Regional scientific distributors and supply houses

_(Note: These represent target buyer categories, not unverified claims of current client relationships.)_

The website combines:

- A credible, authoritative corporate profile.
- A browsable, searchable scientific product catalog.
- Transparent technical specifications with strict data integrity.
- Contextual B2B quotation and inquiry pathways.
- Bold visual identity (Scientific Turquoise & Deep Navy) with purposeful medium-parallax interactions.
- High-performance, accessible, and responsive user experience powered by Nuxt 4 Static Site Generation (SSG).

---

## 2. Goals

1. **Establish a Distinctive Scientific Presence:** Differentiate FZA Scientific with a bold, authoritative scientific identity (Turquoise `#08AEB3`, Deep Navy `#123B5D`, Soft Ivory `#F7F7F2`, Warm Amber `#F2A23A`).
2. **Effortless Discovery:** Enable B2B buyers to locate specific reagents, standards, and equipment lines quickly through structured categorization and instant search.
3. **Information Clarity & Integrity:** Present technical specifications, packaging sizes, and document links without cognitive overload or fabricated claims.
4. **B2B Inquiry Conversion:** Drive qualified commercial leads by providing contextual, prefilled "Request a Quote" pathways on every product page.
5. **High Performance & Maintainability:** Leverage Nuxt 4 SSG and a strongly typed local data layer for sub-second page loads, SEO excellence, and effortless catalog maintenance.

---

## 3. Non-Goals (Strict Initial Boundaries)

The initial release strictly excludes:

- Consumer shopping cart mechanics.
- Online checkout, payment gateways, or credit card processing.
- Customer accounts, user registration, or login portals.
- Dynamic inventory/stock-level simulations.
- Automated ERP, CRM, or external supply chain integrations.
- Administrative CMS dashboards or direct database connections (catalog is managed via typed data files).
- Fabricated accreditations, certifications (ISO/GMP/FDA), CAS numbers, chemical purities, or partnership logos without verified proof.

---

## 4. Target Audience & Buyer Needs

### 4.1 Primary: B2B Procurement & Laboratory Specialists

- **Roles:** Laboratory managers, procurement officers, diagnostic specialists, academic principal investigators, and supply coordinators.
- **Key Needs:**
  - Rapidly identify product availability, grades, and packaging configurations.
  - Review verified technical data sheets (SDS, TDS, COA) where available.
  - Request formal quotations with custom volume/purity requirements.
  - Verify official company contact channels (work email, direct WhatsApp, registered address).

### 4.2 Secondary: General Scientific Researchers & Evaluators

- **Roles:** Students, research assistants, and institutional evaluators assessing reagent compatibility.
- **Key Needs:**
  - Clear, accessible descriptions without assumed jargon.
  - Direct pathways to pass product specifications to procurement teams.

---

## 5. Working Product Categories

The initial catalog structure comprises exactly four confirmed working categories:

1. **New Standard Reagent**
2. **Standard Reagent**
3. **Reagents**
4. **Esight** _(Marked with explicit internal placeholder: exact classification, whether instrument, product line, or consumable, to be verified by business owner prior to public deployment)_

_(Rule: Category names, spellings, and hierarchies must remain intact. Do not introduce new categories without official business authorization.)_

---

## 6. Sitemap & Page Specifications

### 6.1 Home (`/`)

- **Purpose:** Establish brand authority, communicate core scientific competencies, and direct visitors into the catalog or inquiry channels.
- **Key Sections:**
  - **Global Header:** Minimal navigation, brand mark, and prominent "Request a Quote" CTA button.
  - **Hero Section:** Bold editorial headline, concise scientific value proposition, dual CTAs ("Explore Catalog", "Request a Quote"), accompanied by a refined visual with subtle medium-parallax movement.
  - **Category Showcase:** Distinctive visual entrance into the 4 working categories.
  - **Featured Products:** Selected verified products with high-precision specifications and quotation triggers.
  - **Company Overview:** Restrained editorial introduction to FZA Scientific's commitment to quality and service.
  - **Quality & Sourcing Standards:** Verified claims only; clearly marked placeholders for pending accreditations.
  - **Direct Inquiry CTA:** Full-width engagement banner driving quote submissions.
  - **Global Footer:** Verified corporate address, official email, telephone, WhatsApp link, and legal navigation.

### 6.2 Products / Catalog (`/products`)

- **Purpose:** Provide an exhaustive, browsable catalog of all available reagents and products.
- **Key Features:**
  - Category filter pills (All, New Standard Reagent, Standard Reagent, Reagents, Esight) with reactive state.
  - Debounced client-side keyword search (by product name, SKU, or category).
  - Responsive product card grid featuring consistent aspect ratios, verified specifications, and direct quotation links.
  - Clean empty state with an invitation to submit a custom inquiry if a product is not listed.

### 6.3 Product Detail (`/products/[slug]`)

- **Purpose:** Present detailed specifications for a specific product and provide a frictionless quotation trigger.
- **Content Fields (Displayed only when verified):**
  - Product Name and SKU/Code.
  - Category breadcrumb navigation.
  - High-resolution product imagery (or high-fidelity placeholder graphic).
  - Short description and comprehensive technical overview.
  - Specifications table (CAS Number, Formula, Grade, Pack Sizes, Purity) — unverified attributes display `[PLACEHOLDER: Pending Verification]`.
  - Downloadable documentation links (SDS, Technical Data Sheet) where files exist.
  - Primary CTA: **"Request a Quote"** (opens modal prefilled with product identity).
  - Secondary CTA: Direct WhatsApp inquiry link with pre-composed message.

### 6.4 About (`/about`)

- **Purpose:** Detail the background, mission, and operational standards of FZA Scientific.
- **Content Sections:**
  - Corporate mission, vision, and operational philosophy.
  - Industries and institutions served (diagnostic, healthcare, research, academic).
  - Commitment to analytical precision, supply continuity, and customer service.
  - Verification notice regarding certifications and distribution agreements.

### 6.5 Contact & Request a Quote (`/contact`)

- **Purpose:** Facilitate direct commercial communication and capture structured RFQ inquiries.
- **Features:**
  - Direct contact coordinates: verified sales email, telephone, WhatsApp, business hours, and facility address.
  - Structured B2B Inquiry Form:
    - Full Name (required)
    - Company / Institution Name (required)
    - Work Email (required)
    - Phone / WhatsApp (optional)
    - Product of Interest (prefilled or selectable)
    - Estimated Quantity / Requirement (optional)
    - Project Details / Message (required)
    - Anti-spam honeypot protection
  - Form validation with reactive inline error states and confirmed submission messaging.

---

## 7. Functional Requirements

### 7.1 Must Have (Launch Requirements)

- Full static site pre-rendering (Nuxt 4 SSG) across all routes (`/`, `/about`, `/products`, `/products/[slug]`, `/contact`).
- Fully responsive layout spanning mobile (320px+), tablet (768px+), desktop (1024px+), and ultrawide displays.
- Strict data integrity: Zero fabricated chemicals, prices, or regulatory claims.
- Reactive client-side search and category filtering in the catalog.
- Contextual RFQ modal trigger on product detail pages prefilling product name and SKU.
- Nitro server-side inquiry endpoint (`/api/inquiries`) with payload validation and spam suppression.
- Accessible focus indicators, keyboard navigability, and WCAG AA contrast compliance.
- Support for `prefers-reduced-motion` across all parallax and reveal animations.

### 7.2 Should Have (Refinements)

- Nuxt SEO meta-tag management (`useSeoMeta`) with dynamic OpenGraph images.
- Breadcrumb navigation schema on product detail views.
- WhatsApp deep-link generation with pre-populated inquiry text.
- Micro-interactions (hover zoom on imagery, smooth tab switches, subtle header blur on scroll).

### 7.3 Future / Phase 2 (Out of Scope for Initial Release)

- Headless CMS integration (Strapi, Contentful, or Nuxt Content) for non-technical catalog edits.
- Supabase/PostgreSQL database with authentication.
- Multi-language localization (English / Indonesian).
- CRM webhook pipeline (HubSpot / Salesforce integration).

---

## 8. Data Integrity & Verification Standard

1. **Zero Fabrication:** Under no circumstance will imaginary product specifications, batch numbers, chemical properties, customer testimonials, or partner logos be invented.
2. **Explicit Placeholders:** Any required UI element lacking verified company data must be styled with the standard tag:  
   `[PLACEHOLDER — REPLACE BEFORE LAUNCH]`
3. **Catalog Data File:** All product records reside in a strongly-typed TypeScript structure (`data/products.ts`) using explicit verification booleans (`isVerified: boolean`).

---

## 9. Success Metrics

Following analytics implementation and launch:

- Sub-1.5s First Contentful Paint (FCP) and 95+ Lighthouse performance scores.
- Zero client-side console errors or hydration mismatches.
- High conversion rate from Product Detail views to RFQ modal submissions.
- Positive user feedback regarding catalog discoverability and clarity.

---

## 10. Acceptance Criteria

The Nuxt 4 migration is complete and ready for stakeholder review when:

1. The project runs cleanly on Nuxt 4, Vue 3, TypeScript, and Tailwind CSS in the separate folder `fza-scientific-nuxt`.
2. All 5 primary pages are fully functional, responsive, and pre-rendered.
3. The visual direction faithfully implements **Bold Turquoise + Medium Parallax** without over-animation.
4. The catalog accurately reflects the 4 working categories without consumer cart/checkout features.
5. All specifications adhere to the Zero-Fabrication Standard.
6. The inquiry form validates inputs and provides truthful submission confirmations.
