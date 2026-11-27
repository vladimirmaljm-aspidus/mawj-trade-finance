# Task 6-a — CBI restyle: CardsTab, PaymentsTab, FxTab, ProfileTab, SpendingLimitsModal

Agent: restyle-agent (Z.ai Code)
Date: 2026-06-01
Scope: ONLY the 5 files below (no other file touched).

## Files changed

1. `src/components/mbanking/tabs/PaymentsTab.tsx`
2. `src/components/mbanking/tabs/CardsTab.tsx`
3. `src/components/mbanking/tabs/FxTab.tsx`
4. `src/components/mbanking/tabs/ProfileTab.tsx`
5. `src/components/mbanking/SpendingLimitsModal.tsx`

## What was done (authentic CBI 2017 flat design)

All 5 screens converted from the old "modern fintech" style (rounded-[1.5rem],
glassmorphism, slate/emerald palette, font-black) to the authentic CBI language:
flat #F7F7F7/#F3E5DC backgrounds, white 4px-radius cards with #D9D9D9 hairline
borders (`cbi-card`), navy #000F32, magenta #82134C ribbons/notices, maroon
#7A1F3D lucide icons (strokeWidth 1.6-1.8), pink #E8306E underlined inputs,
blue-gradient `CbiButton` (uppercase), labels 12px #7F7F7F / values 13px #222222,
income green #217A3B, warning #82134C.

### PaymentsTab
- Real CBI transfer menu: `.cbi-cream` body with 6 white 58px cards (maroon
  HexagonIcon + label + › chevron): Transfer Within Own Account / Transfer Within
  CBI / Pay CBI Credit Card / Transfer Within UAE / International Transfer /
  Donation Services. Each sets the underlying method (LOCAL/SEPA/SWIFT) and
  opens the form.
- Form restyled as white cbi-card with pink-underlined inputs (right-aligned
  bold values), `CbiButton` NEXT (step 1) -> CONFIRM TRANSFER (step 2) with
  navy `CbiBackBar` "Step N of 2" indicator. Review step uses `CbiRow` rows.
- Compliance-blocked state: magenta-ribbon flat notice card + hexagon Lock +
  amount-held row + `CbiButton` VIEW COMPLIANCE CASE.
- Success: flat white card with green bordered check square + `CbiButton` DONE.
- All preserved: `sendTransfer` API call, toasts, `useNav` (setTab/openSubPage),
  beneficiary quick-fill (recipient/iban/method), FREE (VIP) fee, balance display.

### CardsTab
- Physical card: `premium-navy-card` navy gradient, rounded-[10px] max, white
  `CbiLogo` (wordmarkColor #fff) top-left, flat gold chip, white mono card
  number, flat frozen overlay (no blur).
- Virtual card: flat white cbi-card row with HexagonIcon + CreditCard.
- Controls: flat white list, hairline #E5E5E5 separators, maroon lucide icons,
  blue-on toggle switches, › chevrons for actionable rows.
- RevealCardModal: flat white sharp modal, magenta 48px header strip, hexagon
  ScanFace verifying state, label/value detail rows (mono PIN/CVV), green
  verified note. All state/handlers/toasts preserved.

### SpendingLimitsModal
- Flat white sharp-cornered centered modal, magenta header strip with title +
  card label + white X close, flat progress bars (blue #1565C0 / magenta
  #82134C when >80%), pink-underlined right-aligned limit inputs, `CbiButton`
  SAVE LIMITS. `save` toast + onClose preserved; min/step/onChange logic intact.

### FxTab
- Rate pair + converter + cross-rate table as white cbi-cards; converter inputs
  with #E8306E underline; swap is a flat square button; `CbiButton` CONVERT
  (same trade-executed toast). Removed the indigo sparkline SVG (forbidden
  indigo). CurrencyPicker: flat modal with magenta header, hairline rows,
  pink selected-row highlight + maroon Check (replaced flag emojis with plain
  ISO codes — "no emojis" mandate; data.ts untouched).
- All rate math, swap/pick logic, Max button, live fxRates from store preserved.

### ProfileTab
- "Manage My Account": flat navy #000F32 security-score card, white profile card
  with hexagon initials, then `CbiAccordionCard` sections with magenta ribbons:
  Company Profile / Authorized Signatory / Preferences & Security (with
  ListRows + › chevrons for company-details, taxes, security, support subpages
  and the biometric toggle). Sign out: flat maroon outline uppercase button.
  Removed the dead `export { Lock }` re-export (verified nothing imports it).
  BANK legal footer preserved.

## Type errors found & fixed
- `SpendingLimitsModal.tsx`: initially imported `CbiButton` from `"../cbi"`
  (wrong level — the file lives next to cbi.tsx, not in tabs/). Fixed to
  `"./cbi"`; tsc clean afterward.
- Remaining `bunx tsc --noEmit` errors are PRE-EXISTING in files outside my
  scope (TransactionItem.tsx lines 38-39, lib/mawj/webauthn.ts,
  lib/mbanking/useHasHydrated.ts, skills/image-edit script) — left untouched
  per instructions.
- `bun run lint` passes clean.

## Functionality adaptations (visual restructure, logic preserved)
- PaymentsTab: added `view` ("menu"|"form") and `step` (1|2) state so the tab
  mirrors the real app's menu -> form -> review flow. The original single-shot
  submit still calls `sendTransfer` only on the CONFIRM step (NEXT only advances
  step, gated by native `required` validation). On transfer failure it returns
  to step 1 with the toast (fields stay filled). Success "Done" additionally
  resets view/step before `setTab("home")`.
- The SEPA/SWIFT/LOCAL segmented control was replaced by the 6-item CBI menu
  (menu items + saved beneficiaries still set all three methods).
- FxTab: dropped decorative sparkline + flag emoji glyphs (presentation only).

## Verification
- `bunx tsc --noEmit` — clean for all 5 files.
- `bun run lint` — clean.
- Dev server (port 3000) recompiled successfully, `GET / 200`, no errors in
  dev.log after the import fix.
