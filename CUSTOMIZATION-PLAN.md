# Advanced customization

User confirmed L means two faces meeting at 90°, not a flat L-shaped outline. Build nested panel divisions, unequal proportions, independently configured corner faces, arched fixed head, balcony templates, handle choices, and separate frame/sash join and cut settings. Preserve all version-1 projects/backups.

## Shared contract

Optional `item.design` activates v2. New module `src/design.js` owns normalization, geometry, validation and immutable tree operations. Existing `cols/rows/panels` remain valid legacy data; when design exists, geometry/modes come from design. Existing validateItem should check legacy scalar fields but use design geometry for panels.

Design object:
`{version:2, shape:'rectangle'|'arched'|'corner', archRise:300, returnWidth:900, frameJoint:'mitre'|'butt', sashJoint:'mitre'|'butt', systemName:'Generic', frameAllowance:0, sashAllowance:0, glassGap:0, layouts:[node,node]}`.
Each face uses its own layout. Only corner uses second face. All faces share material, finish, height and profile dimensions. Corner is exactly 90° and separate frames; connector requirements shown as unpriced/unspecified until supplier inputs.
Node leaf: `{id,kind:'panel',mode:'fixed'|existing opening modes,handle:{type:'lever'|'lockable'|'pull'|'flush'|'none',color:'silver'|'black'|'white'|'gold',side:'auto'|'left'|'right',height:0,extraCost:0}}`. Height 0=automatic; positive mm measured from panel bottom. Node split: `{id,kind:'split',axis:'vertical'|'horizontal',ratio:0.5,children:[node,node]}`. Vertical means left/right; horizontal means top/bottom. Ratios .1-.9, max depth 6 / max total 48 leaves across visible faces.

Exports `getDesign(item)` returns complete design (migrates legacy grid into binary splits), `getDesignGeometry(item)` returns `{faces,panels}`. Each face `{index,width,height,bodyHeight,panels,dividers,arch:null|{rise,radius,arcLength,glassArea,glassWidth,glassRise}}`. Each panel `{id,index,face,mode,handle,x,y,width,height}` in mm in face-local coordinates. Each divider `{x,y,width,height}` in mm. Arch is a FIXED curved top light above rectangular body, not an arched operable sash. Face layout clear body x=profile; y=profile for rectangular, y=rise+profile for arch; clear body bottom=height-profile. Arch curved material quantities are estimates and must never go into straight bar optimization.

Exports `validateDesign(item)` returns errors (validate nested objects/finite numbers/depth/ids/visible geometry). `splitPanel(item,id,axis,ratio)` returns new design; `mergePanel(item,id)` returns new design by replacing parent split with selected panel; `updatePanel(item,id,patch)` returns new design; `updateSplit(item,splitId,ratio)` returns new design; `listSplits(item)` returns [{id,face,axis,ratio}]. `createDesignTemplate(key)` returns partial item suitable to merge into createItem defaults for keys 'corner-mixed','balcony','arched','fanlight','mixed'.

Calculation integration preserves existing scalar outputs. Adds cuts metadata `angleStart,angleEnd,face,part` (45/45 mitre, 90/90 butt; butt crosspieces subtract 2 face widths). Allowances mm added per cut; glassGap deducted each side. Non-straight curved frame reported as `curvedParts:[{face,length,quantity,description}]`, included in profile cost but excluded from straight cuts. Each glass/infill piece carries face/panel/shape metadata. `warnings` explicitly mentions curved estimate and corner connector not included. Handles `extraCost` included per opening and quantity. `calculateProject` aggregates warnings. Cutting bars retain `pieces` cut metadata in addition to existing numeric cuts array.

Drawing agent owns src/drawing.js only: render legacy and v2 via geometry helper, corner face elevation side-by-side + plan inset showing 90°; arched outline cap and realistic different handle symbols; mitre versus butt joint lines; split dimensions. Preserve data-panel numeric index for selection, can additionally add data-panel-id and data-face. Export signature remains drawing(item, options). No changes to core/main needed from drawing agent.

Root owns UI controls, translation integration, templates, export/BOM cut-angle columns, browser tests and docs. Domain agent owns design.js/core.js and node tests. No promises of '95% coverage' until measured with real shop designs/profile catalogs.
