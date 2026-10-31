# iWinDoor evidence and coverage

Inspected on 24 October 2026.

## Local evidence

- `reverse_eng_iwindoor/iwindoor Demo-En.rar`: RAR archive, 53,273,280 bytes.
- `reverse_eng_iwindoor/iwindoor Demo-En/iwindoor demo/iwindoor demo.exe`: Windows PE executable, 10,879,473 bytes. Static strings identify InstallShield, `iWinDoorDemo.msi`, `iWinDoorDemo`, and a .NET 4 Client prerequisite.
- `ISSetupPrerequisites/DotNet4Client/dotNetFx40_Client_x86_x64.exe`: prerequisite installer, 43,000,680 bytes.
- No existing website/source repository was present in the initial directory.
- No plain embedded MSI/ZIP/CAB signature was found by static scanning. The local extraction command was blocked by the lean-ctx shell allowlist, and the MCP read/shell tools timed out. The working CLI path was used for development. No installer was executed and no guard configuration was changed.

These facts identify the package; they do **not** establish a complete inventory of the installed desktop application.

## Public evidence

The publisher's [iWindoor introduction video](https://www.youtube.com/watch?v=69Bu-9Q8OqE) describes drawing/configuration, calculation, pricing and reports. The original publisher site was unavailable through the research tool.

The [archived mobile listing](https://iwindoor.andro.io/) describes the opening patterns, panel subdivision, profile/glass calculations, PDF output and language options used to inform this simplified implementation. It is secondary evidence about the mobile edition, not proof of the desktop demo's complete behavior.

## Coverage matrix

| Workflow                                               | Website status              | Scope / remaining uncertainty                                                                                 |
| ------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Window and door configuration                          | Implemented                 | Rectangular equal-cell grids, 1–6 rows/columns; no curved/custom polygons or independent unequal subdivisions |
| Fixed, turn, tilt, tilt-turn                           | Implemented                 | Per-panel SVG and generic sash/hardware quantities                                                            |
| Sliding windows and doors                              | Implemented                 | Per-panel direction; set 2/3/4 columns for common layouts; proprietary track-specific deductions not modeled  |
| Horizontal/vertical panels                             | Implemented                 | Equal grid with solid or glazed panels                                                                        |
| PVC/UPVC/aluminium                                     | Implemented                 | Editable generic linear profile rates; no vendor catalog database                                             |
| Profile lengths and glass areas                        | Implemented                 | Generic documented geometry; requires supplier validation for fabrication                                     |
| Solid infill and hardware                              | Implemented                 | Editable infill rate per m² and hardware set rate per opening                                                 |
| Project estimates                                      | Implemented                 | Quantity, allowance, labor, markup, discount and tax; no exchange conversion                                  |
| Project/customer management                            | Implemented                 | Local browser storage; no server accounts or collaboration                                                    |
| PDF reports                                            | Implemented via print       | Quotation, BOM and cutting view can be saved as PDF in the browser dialog                                     |
| Other exports                                          | Implemented                 | Own JSON backups, report CSV and SVG drawing                                                                  |
| Mobile-to-desktop iWinDoor transfer                    | Not implemented             | Proprietary file format has not been inspected; own JSON is not compatible                                    |
| Seven listed languages                                 | Implemented                 | Main interface: EN, AR, TR, RU, FR, FA, ES; low-level validation diagnostics remain English                   |
| Cutting estimate                                       | Implemented extension       | Best-fit decreasing with stock/kerf and separated components; not verified against iWinDoor's optimizer       |
| Automatic software update                              | Web deployment workflow     | Updates require deploying a new website build; no updater/service worker                                      |
| Desktop profile catalogs / production machinery output | Unverified, not implemented | No claim that the demo contains any particular catalog or CNC workflow                                        |
| Complete desktop feature parity                        | Not established             | Requires an accessible installed demo, documentation, or a screen-by-screen walkthrough                       |

The website uses original UI and implementation code. It does not reuse the installer binaries, extracted proprietary code, license mechanisms, logos or manufacturer data.

## Customization update — 24 October 2026

The original matrix above records the initial release. The following entries supersede its original rectangular/equal-grid restrictions:

- Unequal nested horizontal/vertical divisions, adjustable by percentage or clear millimeters, up to 48 panels and six split levels.
- Two independent face layouts meeting at a 90° corner, with separate widths and a plan inset; shared material/finish/profile settings. Connector/cover/installation deductions remain excluded.
- Fixed circular-segment arched heads; curved profile lengths priced separately and excluded from straight bar optimization; curved glass bounding size and segment area reported.
- Balcony, mixed fixed/sliding, and fixed-head/sliding presets.
- Per-panel lever, locking lever, pull bar, recessed pull or no handle; finish/side/height/upgrade price.
- Independent frame and sash mitre/butt construction, 45°/90° cut metadata, per-piece allowances, glass clearances and locally saved named profile-system settings including face widths.
- BOM/CSV include fabrication angles, face/part identity, handle specification and curved parts. Cutting separates stock by material, finish, component, system name and profile face width.

New customization controls currently have Arabic and English labels; other interface languages use English for these additions. Read CUSTOMIZATION.md for limitations. No 95% coverage claim is made without a representative production-design dataset and supplier verification.
