Wix App Spec — Post-Purchase Survey & Attribution (v1)

0) One-liner

“Know what really drove the sale.”
A no-friction post-purchase survey shown on the Wix Stores Thank-You page that ties responses to order value and pushes the chosen channel to analytics/pixels so marketers can rebalance ad spend with confidence.

⸻

1) Goals & Non-Goals

Goals (v1)
	•	Collect “How did you hear about us?” (HDYHAU) immediately after checkout.
	•	Persist responses with orderId, orderValue, currency, lineItems, and timestamp.
	•	Fire a custom analytics event (and optional server-side event) with {channel, orderValue, orderId}.
	•	Provide a dashboard with channel breakdown, revenue share, trends, and CSV export.
	•	Ship one-click install, freemium billing, and plan gating.

Non-Goals (v1)
	•	Multi-step research surveys, NPS, deep segmentation.
	•	Full MMM/attribution modeling.
	•	Complex audience rules per SKU/collection (slated for v1.2+).

⸻

2) Core User Stories
	•	Store owner: Install app → toggle “Show survey on Thank-You page” → default choices live.
	•	Customer: After purchase, see one-question survey with 6–10 choices + “Other”; submit once per order.
	•	Marketer: When “TikTok” is selected, analytics receive an event with {channel:"TikTok", orderValue: 79.00, currency:"EUR", orderId}.
	•	Analyst: Open dashboard → see Top Channels, Revenue Share, 30-day trend, Response Rate, filter by date → Export CSV.
	•	Admin: Select plan → features unlock instantly (no reintegration).

⸻

3) Feature Specification (v1)

3.1 Thank-You Page Survey
	•	Placement: Wix Stores Thank-You page via a Blocks/Widget component.
	•	UI: Single-select (radio) options + “Other (free-text)”.
	•	Behavior: One-click submit, auto-dismiss on success, idempotent per orderId.
	•	Customization: Editable title (“How did you hear about us?”), option labels, order of options.
	•	i18n: All strings pulled from settings; LTR default; language map per site locale.

3.2 Data Capture

Collection: pps_responses

Field	Type	Notes
id	uuid	Primary key
orderId	string	E-com order ID
orderNumber	string	Human-friendly
orderValue	number	Grand total (numeric)
currency	string	ISO 4217
channel	string/enum	One of configured options
otherText	string	Free-text if “Other”
lineItems	array	SKU, qty, price (summary)
createdAt	datetime	Server time
clientHints	object	ua/device/locale
consentFlags	object	booleans

Write path
	•	Frontend widget posts to backend function with {orderId, channel, otherText}.
	•	Backend reconciles orderValue/currency/orderNumber/lineItems from order APIs before save (prevents tampering).

3.3 Analytics / Pixel Uplift
	•	Browser event: After save, trigger a custom analytics event (e.g. trackEvent('HDYHAU', { channel, orderId, orderValue, currency })).
	•	Works with GA4/Meta/TikTok via site’s tag setup or GTM.
	•	(Pro/Enterprise) Server event: Optional HTTP Function endpoint to forward the same payload to e.g. Meta CAPI (hashing identifiers if available).
	•	Secrets (tokens, app IDs) stored in secure secrets manager.
	•	Tag awareness: If no analytics tags detected, show a Setup Hint card in dashboard.

3.4 Dashboard (Admin → App Page)

Cards
	•	Top Channels (pie): share of responses.
	•	Revenue Share (bar): sum(orderValue) by chosen channel.
	•	Trend (bar): last 30 days responses.
	•	Response Rate: responses ÷ orders where survey attempted.

Filters
	•	Date range (last 7/30/90 days, custom).
	•	Country (if provided by order).
	•	Device (derived from client hints).

Export
	•	CSV for filtered range.
Columns: createdAt, orderId, orderNumber, orderValue, currency, channel, otherText, skuList.

Plan Gating
	•	Free: 1 active survey, 100 responses/mo, dashboard totals, CSV (cap).
	•	Pro: Unlimited responses, advanced settings, server events, sampling rules.
	•	Growth: Segments & rules (SKU/amount), Sheets sync (v1.1), multi-survey rotation.

3.5 Admin Settings
	•	Choices Manager: Up to 12 options; reorder; per-locale labels. Suggested defaults:
Instagram, Facebook, TikTok, YouTube, Google Search, Google Ads, Influencer, Friend/Family, Blog/PR, Podcast, Email/SMS, Other
	•	Display Rules (v1): Show to all orders. (v1.1: first-time customer only, % sampling 10–100%.)
	•	Consent: Toggle to display a short consent line (link to site privacy); optional “append Contact Note in Wix CRM” with chosen channel.

3.6 Install & Billing
	•	One-click install from Wix App Market; app creates collections and default settings.
	•	Monetization: Plans defined in App Market; app reads current plan per instance and gates features accordingly.
	•	Upgrade/Downgrade: Immediate effect; dashboard banner confirms change.

⸻

4) Technical Design

4.1 Architecture Overview
	•	Wix Blocks App
	•	Site Widget (Thank-You page survey).
	•	Dashboard Page (charts, settings, exports).
	•	Backend Modules
	•	events/ecom.onOrderCreated → caches/enriches order meta for reconciliation.
	•	backend/responses.jsw → save/read ops; plan checks; idempotency guard per orderId.
	•	backend/export.jsw → CSV generation.
	•	backend/capi.jsw + http-functions.js → optional server-side forwarding.
	•	backend/plan.jsw → plan lookup & gating helpers.
	•	Data
	•	Collections: pps_responses, pps_settings.
	•	Indexes: createdAt, orderId, channel.
	•	Security
	•	Frontend writes call backend functions that validate instanceId and plan tier.
	•	Least privilege: Only backend mutates data; frontend never sets orderValue/currency.
	•	PII: Avoid storing email/phone; if needed for server events, hash in memory; do not persist.

4.2 Thank-You Page Integration
	•	Detect Thank-You context and obtain orderId/summary for the current session.
	•	Render widget in a reserved container; show skeleton until order data ready.
	•	Do not render if:
	•	No orderId available.
	•	Response already exists for this orderId (check via read-only endpoint).

4.3 Idempotency & Resilience
	•	Idempotent key: orderId. Backend rejects duplicates.
	•	Retries: Optimistic UI; if network error, retry save 2×.
	•	Fallback: Provide a hidden link to a hosted “record response” page that accepts orderId as a query param (for JS-blocked situations).

4.4 Performance
	•	Target <150ms widget boot after Thank-You content appears.
	•	Bundle size budget <60KB gzipped for the widget.
	•	Defer analytics event until save resolves; queue if tags aren’t loaded yet.

⸻

5) Competitive Fit (Why This Sells)
	•	Mirrors best-selling Shopify apps’ core value: HDYHAU capture, revenue-tied reporting, and analytics uplift.
	•	Category gap on Wix: no dedicated post-purchase attribution tool.
	•	Clear ROI: channel truth → smarter budget allocation → improved ROAS → high retention.

⸻

6) Pricing (Launch)

Plan	Monthly	Highlights
Free	$0	1 survey, 100 responses/mo, dashboard totals, CSV export (cap)
Pro	$29	Unlimited responses, sampling, first-time-only rule, server events (CAPI)
Growth	$79	SKU/amount-based segments, multi-survey rotation, Sheets sync (v1.1), channel-level revenue reporting


⸻

7) QA Checklist (v1)

Functional
	•	Survey renders only on Thank-You pages for Wix Stores sites.
	•	Duplicate protection per orderId.
	•	Backend reconciliation fills orderValue/currency from order APIs.
	•	Browser analytics event fires after successful save.
	•	CSV export equals dashboard aggregates for the same filter range.

Billing / Plans
	•	Plan read on each request; gates responses/export/features correctly.
	•	Upgrades/downgrades reflect instantly in UI and backend checks.

UX / Perf / A11y
	•	First paint <150ms after Thank-You render (on broadband).
	•	Keyboard navigation & focus states; ARIA labels on radios and submit.
	•	Localized labels render correctly per site locale.

Privacy
	•	No PII stored unless explicitly required and consented; server-side hashing for CAPI.
	•	Delete by contact/order purges related rows.

⸻

8) Build Plan (4 Weeks)

Week 1 — Foundations
	•	Blocks project scaffold; create pps_responses & pps_settings collections.
	•	Thank-You widget: default choices, load order context, submit → backend save.
	•	onOrderCreated enrichment & reconciliation path.

Week 2 — Dashboard & Events
	•	Dashboard charts (Top Channels, Revenue Share, Trend, Response Rate).
	•	Filters & CSV export.
	•	Browser trackEvent after save; debug panel for event payloads.

Week 3 — Pro Features
	•	HTTP Function for server-side forwarding (Meta CAPI pattern).
	•	Secrets UI for tokens/keys; plan gating middleware.
	•	CRM note toggle; i18n; accessibility pass.

Week 4 — Ship
	•	App Market billing wiring; pricing page and plan tests.
	•	App listing assets: screenshots, copy, setup guide.
	•	Beta run on 5–10 stores; fix and submit for review.

⸻

9) Future Roadmap (v1.1+)
	•	Targeting rules: first-time only, return customers different question, order value thresholds.
	•	Multi-question flows: conditional follow-ups (e.g., if “Influencer” → “Which creator?”).
	•	Integrations: Klaviyo (profile prop), GA4 custom dimensions, Google Sheets sync.
	•	Attribution layer: simple survey-weighted contribution to blended ROAS.

⸻

10) Deliverables (for dev kickoff)
	•	Blocks project with:
	•	widgets/thankyou-survey/ (UI + submit handler)
	•	pages/dashboard/ (charts, filters, settings)
	•	backend/responses.jsw, backend/export.jsw, backend/plan.jsw, backend/capi.jsw, backend/events.js
	•	Collections: pps_responses, pps_settings (with indexes).
	•	App listing copy, screenshots, privacy text, quickstart docs.

⸻

TL;DR

Launch a Thank-You page HDYHAU survey that writes clean order-tied data, triggers analytics uplift, and shows simple revenue-by-channel reporting. Ship with freemium and real value on day one; expand with targeting, multi-step flows, and integrations for Pro/Growth upsell.

⸻

## 📄 Marketing & Business Documents

For business development, partnerships, and investor relations, see our comprehensive marketing materials:

- **[🚀 UPSELLING_GUIDE.md](UPSELLING_GUIDE.md)** - Complete marketing pitch for clients and partners
- **[📋 EXECUTIVE_SUMMARY.md](EXECUTIVE_SUMMARY.md)** - Quick overview for busy executives  
- **[🎯 PRESENTATION_SLIDES.md](PRESENTATION_SLIDES.md)** - Slide deck for presentations and demos
- **[📊 MARKET_RESEARCH.md](MARKET_RESEARCH.md)** - Detailed market analysis and validation

These documents demonstrate why this plugin represents a **$100M+ market opportunity** with exceptional growth potential.
