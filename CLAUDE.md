# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A demo web app for a clinic's X-ray workflow, centred on tuberculosis (TB) patients: register exam → clinic helper completes patient data → radiologist drafts and finalizes report → staff generate a QR code → patient opens the finalized report via the QR URL. **`PLAN.md` is the product spec** (pages, roles, business rules, acceptance criteria). Mock/fictional data only; no real PACS/DICOM/auth.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build (also the typecheck gate; there is no separate `tsc` script)
- `npm run lint` — ESLint 9 flat config (`eslint.config.mjs`, Next core-web-vitals + TypeScript)

There is no test framework configured.

## Stack specifics (differ from common defaults)

- **Next.js 16.4 / React 19.3** with `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`. Per AGENTS.md, check `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`) before using Next APIs — e.g. layouts already use the global `LayoutProps<"/">` type helper.
- **Tailwind v4** with no `tailwind.config` file; theme tokens live in `src/app/globals.css` (`@theme inline` + CSS variables, `.dark` class variant). CSS is processed through a Turbopack loader rule (`@tailwindcss/turbopack`), not PostCSS.
- **shadcn (`base-nova` style) built on Base UI (`@base-ui/react`), not Radix.** Components in `src/components/ui/` wrap Base UI primitives — use Base UI's API (e.g. `render` prop rather than Radix's `asChild`). Add new primitives with `npx shadcn add <name>`; aliases are in `components.json`.
- `cn` comes from the `cn` npm package (re-exported by `src/lib/utils.ts`), not a local clsx + tailwind-merge helper.
- Path alias `@/*` → `src/*`. Icons: `lucide-react`. Toasts: `sonner`. Theming: `next-themes`.

## Architecture

- **Data**: `src/lib/db.ts` keeps everything in one JSON document, seeded from `src/lib/seed.ts` (10 TB-focused exams) on first read. All writes go through `mutate()`, which serializes them only within one process. Where the document lives is decided in `src/lib/storage.ts`:
  - **Upstash Redis** (REST API via `fetch`, no SDK) when `KV_REST_API_URL`/`KV_REST_API_TOKEN` or `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are set. Required for a working Vercel deploy.
  - Otherwise a **local file**: `.data/db.json` (gitignored). On Vercel without Redis it falls back to `/tmp`, which loads but resets and differs between instances; the project folder there is read-only.
  - To reseed, use "Reset demo data" on the login page, or delete `.data/db.json`.
- **Mutations**: all in `src/app/actions.ts` (server actions). Each one re-checks the role with `authorize()` and enforces the business rules itself; UI disabling is only cosmetic. They end with `revalidatePath("/", "layout")`.
- **Demo auth**: the `xray_role` cookie (`admin` | `radiologist`) set by `login()`. `src/proxy.ts` redirects staff routes without it; pages call `requireSession(...roles)` from `src/lib/session.ts`. Patients have no session; `/result/[token]` is public by token.
- **Routes**: staff pages live in `src/app/(staff)/` (sidebar shell). `/records/*` = clinic helper (radiologists can view), `/worklist/*` = radiologist report editor, `/qr-codes` + `/records/[id]/qr` = QR release. `/patient` and `/result/[token]` are the patient-facing pages with their own styling.
- **Shared rules**: `src/lib/exam-rules.ts` (`missingFields`, `qrEligibility`) is pure and used on both server and client.
- **Cache Components gotchas**: every staff route folder has a `loading.tsx` (re-exporting `StaffPageSkeleton`); without it, the dev "instant navigation" check flags the uncached file reads. Keep cookie reads in the shared layout inside `<Suspense>`. Don't render components that call `Math.random()` (e.g. shadcn `SidebarMenuSkeleton`) during prerender; the build fails.
- **Localization**: the clinic is D Prime Specialist Clinic and Diagnostic Centre in Myanmar. Patient QR codes use error-correction level "H" with the logo `public/brand/moh-logo.jpg` in the centre (`QR_LOGO_RATIO`, tested to decode up to 0.32). Demo people use Burmese names (no family names, so greet people by full name), phone numbers use the +95 format, and timestamps display in `Asia/Yangon` (MMT) via `src/lib/format.ts`. Use `todayInClinic()` instead of `new Date().toISOString().slice(0, 10)` for calendar dates.
- Demo X-ray images in `public/xrays/` are stylized SVGs; uploads are stored inline as data URLs (server action body limit raised to 3 MB in `next.config.ts`).

## Business rules to preserve (from PLAN.md §7)

- Exam IDs (`XR-YYYY-NNNN`) are unique. Each exam keeps its **own copy** of patient details, so editing one exam never changes another.
- Patient result page shows **only finalized** reports; drafts are never exposed.
- Finalized reports can't be overwritten. Corrections go through `amendReport`, which moves the old version into `report.revisions` along with the reason. Clinic helpers can never edit findings or impressions. Exam type, date and image lock once a report is finalized.
- QR codes encode an **opaque random token** (`/result/<token>`), never patient details. Regenerating a code revokes the old link.
- QR generation requires a finalized report and complete release fields (`RELEASE_FIELDS`).
