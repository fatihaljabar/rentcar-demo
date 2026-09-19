# NusaRide

**Repository description:** A polished car rental and fleet operations demo with customer booking, admin CRUD, live availability, document generation, and responsive bilingual UI.

NusaRide is a frontend demo for Indonesian car, Hiace, Elf, and bus rentals. It combines a customer booking journey with an internal workspace for bookings, fleet, operations, documents, payments, and reporting.

> This is a frontend demo. It does not include a backend, real payments, live GPS, or production authentication.

## Features

### Customer website

- Responsive desktop and mobile hero experiences
- Search by pickup city, dates, time, route, passenger count, and service type
- Self-drive, chauffeur, and airport-transfer flows
- Fleet filters, vehicle details, availability checks, and multi-unit booking
- Daily rental, out-of-town, and airport-transfer package tabs
- Booking summary, simulated deposit, and PDF download
- Indonesian and English language switcher
- Light and dark themes

### Admin workspace

- Dashboard for bookings, revenue, profit, and fleet status
- CRUD for vendors, fleet, units, drivers, customers, organizations, payments, pricing, and maintenance
- Booking, corporate request, unit assignment, and availability workflows
- Calendar, operations, map, quotation, invoice, and report views
- Structured PDF exports for documents and reports

## Tech stack

- React 19 and TypeScript
- Vite 7
- React Router
- Tailwind CSS v4
- Framer Motion
- jsPDF

## Getting started

### Requirements

- Node.js 20+
- npm 10+

### Development

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

### Production build

```bash
npm run build
npm run preview
```

The build output is written to `dist/`.

## Demo routes and credentials

| Area | Route |
| --- | --- |
| Customer website | `/` |
| Fleet catalogue | `/armada` |
| Rental packages | `/paket` |
| Corporate rental | `/corporate` |
| Admin login | `/admin/login` |

| Credential | Value |
| --- | --- |
| Email | `admin@nusaride.id` |
| Username | `admin` |
| Password | `admin123` |

The credentials are simulated and must not be used in production.

## Data behaviour

Data is stored in browser `localStorage`; the admin session uses `sessionStorage`.

- **Reset demo data** restores the original dataset.
- Availability is calculated per unit.
- Booking dates are inclusive.
- Reservations and maintenance make a unit unavailable.
- Cancelling a booking releases its units.
- Payments, WhatsApp, GPS, and documents are simulated.

## PDF exports

Invoices, quotations, booking reports, dashboard reports, data exports, and operational reports use a structured NusaRide layout with a branded header, data tables, totals where applicable, and page footer.

## Deploying to Vercel

The repository includes `vercel.json` for Vite builds and React Router fallback.

1. Push the repository to GitHub.
2. Import it at [Vercel](https://vercel.com/new).
3. Keep the detected configuration:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy.

The rewrite configuration makes direct visits and refreshes work on nested routes such as `/armada`, `/paket`, and `/admin/booking`.

## Manual QA checklist

1. Search and filter fleet, then switch fleet categories.
2. Make a multi-vehicle booking and verify the seat-capacity feedback.
3. Complete an inquiry and find it in the admin workspace.
4. Create a booking with a simulated deposit and verify payment plus unit reservation.
5. Create a quotation or invoice, preview it, then download the PDF.
6. Export a dashboard, data table, or report PDF.
7. Test both languages, both themes, mobile navigation, and refresh on a nested route.

## Limitations

- No backend API, database, or multi-user synchronization
- No real authentication, payment, GPS, WhatsApp delivery, or document signing
- Contact information and transactions are demo data

## Project structure

```text
src/
  components/       Shared customer and admin UI
  pages/            Public, booking, and admin pages
  lib/pdf.ts        Browser PDF generation
  data.ts           Demo dataset and booking calculations
  store.tsx         Application state and browser persistence
public/images/      Vehicle and hero imagery
vercel.json         Vercel build and SPA fallback configuration
```
