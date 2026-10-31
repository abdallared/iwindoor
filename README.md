# Frame Workshop

A working, local-first website for designing and estimating windows and doors, inspired by the iWinDoor demo supplied in `reverse_eng_iwindoor/`.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev -- --port 5173
```

Open http://127.0.0.1:5173. For a production build, run `npm run build`; deploy the generated `dist/` folder to a static web host. `npm run preview` serves that build locally.

## Advanced customization

See [the Arabic customization guide](CUSTOMIZATION.md) for the new nested unequal divisions, 90-degree two-face corner assemblies, fixed arched heads, balcony/mixed templates, handle options, independent frame/sash 45/90-degree joints, editable clearances/allowances and saved profile-system presets. The new controls are Arabic/English; the original seven-language interface remains available. Use the **Design / Handles / Fabrication** tabs in the item inspector.

## Features

- Multiple projects with customer details, dates, reference, notes, local saving and JSON backup/restore.
- Casement, sliding, entrance door, picture, tilt-and-turn, three-panel and transom templates.
- SVG elevation drawing with dimensions; individual panel selection; fixed, left/right turn, tilt, tilt-and-turn, left/right slide and solid infill.
- Editable dimensions, quantity, 1–6 rows and columns, frame/divider face and sash face.
- PVC, UPVC and aluminium; three finishes; single/double/triple glazing.
- Profile lengths, glass and solid infill dimensions/areas, hardware quantities, editable supplier rates and labor.
- Material allowance, markup, discount, tax and currency selection.
- Quotations, bill of materials and material/profile/finish-separated cutting estimates with stock length, kerf and oversize-piece warnings.
- Print / Save PDF through the browser print dialog, CSV reports and SVG drawings.
- Undo/redo, seven interface languages (English, Arabic, Turkish, Russian, French, Persian, Spanish), RTL and mobile layout.

## Important scope

This is an independent simplified implementation, **not a verified full reverse engineering of desktop iWinDoor**. The supplied files are an InstallShield demo installer, its .NET prerequisite and an archive; application internals were not extracted or executed. See [FEATURE-COVERAGE.md](FEATURE-COVERAGE.md) for evidence and gaps.

Prices start with sample rates. Replace them before quoting. Geometry and cutting are planning estimates, not certified manufacturing instructions. Catalog-specific deductions, reinforcement, welding, glazing bead, tolerances, minimum sash sizes and machining rules are not modeled.

Data stays in the current browser on the current origin. There are no accounts, server database, cloud sync or shared links. Export JSON backups before clearing browser storage, changing devices or moving to another host. The JSON format is specific to Frame Workshop and is not an iWinDoor file format. No installer, application assets or proprietary source code is served by the website.

## Calculation model

All drawing inputs are millimeters. Profile quantities are meters; areas are square meters. Legacy projects retain their original equal-grid calculations. Advanced designs use recursive binary divisions with clear dimensions specified by ratio or millimeters. The original rectangular grid uses equal-sized cells:

```
cell width  = (width  - 2 × frame face - (columns - 1) × divider face) / columns
cell height = (height - 2 × frame face - (rows    - 1) × divider face) / rows
```

Frame and divider use the same visible face width. Opening panels deduct two sash faces from each cell dimension. Fixed/solid panels use the clear cell dimensions. Quantity multiplies all physical quantities exactly once.

```
base cost = (profiles + glazing + solid infill) × (1 + allowance %) + hardware + labor
item total = base cost × (1 + markup %)
discount = item subtotal × discount %
tax = (item subtotal - discount) × tax %
quote total = item subtotal - discount + tax
```

Cutting uses best-fit decreasing (a heuristic, not a proof of minimum stock). Stock is separated by material, finish and component type. A kerf is reserved after every piece. Pieces longer than available stock are listed as unfit. The cutting screen limits work to 100,000 pieces; large projects should be split into batches. Currency selection changes the label only, not exchange rates. Finishes do not have separate price multipliers.

## Verification

```sh
npm test
npm run build
# With the dev server running and Google Chrome installed:
node tools/browser-check.mjs
```

Domain tests cover known geometry, quantity scaling, solid infill, discount/tax, invalid imports, cutting conservation, kerf, oversize stock and finish separation. Browser checks cover editing, validation, undo/redo, reports, print, JSON/CSV/SVG downloads, reloading, imports, all seven languages, RTL, mobile overflow, hostile extra rate keys and oversized cutting requests.

Test captures and downloads are written to `screenshots/`. New customization checks: `node tools/custom-browser-check.mjs`.

Source structure: `src/core.js` calculations/validation; `src/drawing.js` SVG; `src/main.js` UI/state; `src/en.js` and `src/i18n.js` translations; `src/style.css` and `src/refinements.css` layout. No API keys are required. Google Fonts are optional; local font fallbacks work if unavailable.
