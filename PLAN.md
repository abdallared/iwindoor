# Frame Workshop implementation plan

Build a local-first website inspired by the supplied iWinDoor demo. Preserve original installer files. No claim of complete desktop parity without inspecting the installed application.

1. Evidence: inspect installer metadata and public feature descriptions; record known and unverified behavior.
2. Domain model: projects with customer details, dated reference, items and editable pricing. Items have dimensions (mm), quantity, material, finish, glazing, regular panel grid and per-panel opening style.
3. UI: responsive project workspace, SVG design editor, templates, materials/rates, bill of materials, cutting estimate, quote/print, JSON backup/restore, CSV and SVG exports, local persistence, undo/redo.
4. Calculation: documented generic profile/glass deductions, quantity-aware pricing, waste, labor, margin, discount and tax. Manufacturing dimensions require supplier validation.
5. Verification: domain tests plus browser interaction checks for creation, editing, persistence, exports and responsive layout.

Architecture: Vite + browser ES modules, no backend/account required. Browser data is local to this browser; backups are explicit JSON files. English/Arabic interface initially; other original languages tracked in coverage.

Shared model contract:

- Item: id, name, width, height, quantity, material ('UPVC'|'PVC'|'Aluminium'), finish ('white'|'anthracite'|'oak'), glass ('double'|'single'|'triple'), cols, rows, panels (array: 'fixed'|'left'|'right'|'tilt'|'tilt-turn'|'slide-left'|'slide-right'|'solid'), profile (mm), sash (mm).
- Project: id, name, customer, email, reference, date, notes, items, settings.
- Settings: currency, rates {UPVC,PVC,Aluminium} (per m), glassRates {single,double,triple} (per m²), hardware (per opening), labor (per item), waste (percent), markup (percent), discount (percent), tax (percent), stockLength (mm), kerf (mm).
- Core exports: defaultSettings(), createItem(template='casement'), createProject(), validateItem(item), calculateItem(item,settings), calculateProject(project), optimizeCuts(cuts,stockLength,kerf), validateProject(project).
- calculateItem returns {area,glassArea,profileLength,openingCount,cuts:[{type,length,quantity,material}],glassPieces:[{width,height,quantity}],baseCost,unitPrice,totalPrice,warnings}.
- calculateProject returns {items:[per-item result],quantity,area,glassArea,profileLength,subtotal,discount,tax,total,baseCost}.
- validateItem/project return array of human-readable errors, do not throw. optimizeCuts returns {bars:[{type,material,cuts:[length],used,remainder}],unfit:[cut],wastePercent}.
