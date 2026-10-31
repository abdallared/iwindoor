import { glassBounds } from "./vent.js";
import { curvedPane } from "./arch-geometry.js";
import { slidingProjection } from "./sliding.js";
import { getDesign, getDesignGeometry } from "./design.js";
import { finishColors as colors } from "./finishes.js";
export const escapeHtml = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function joints(x, y, w, h, f, joint) {
  return joint === "butt"
    ? `M${x + f},${y}V${y + h}M${x + w - f},${y}V${y + h}`
    : `M${x},${y}l${f},${f}M${x + w},${y}l${-f},${f}M${x},${y + h}l${f},${-f}M${x + w},${y + h}l${-f},${-f}`;
}
function handleSymbol(p, x, y, w, h, s, k) {
  const spec = p.handle;
  if (["fixed", "solid"].includes(p.mode) || spec.type === "none") return "";
  const side =
    spec.side === "auto" ? (p.mode === "right" ? "left" : "right") : spec.side;
  const hx = side === "left" ? x + s * 0.5 : x + w - s * 0.5,
    hy = spec.height ? y + h - spec.height * k : y + h / 2;
  const color = {
    silver: "#8d9b9f",
    black: "#252d30",
    white: "#fafafa",
    gold: "#b39447",
  }[spec.color];
  if (spec.type === "catch") {
    const placement = ["top", "bottom"].includes(spec.side)
      ? spec.side
      : p.mode === "awning"
        ? "bottom"
        : "top";
    const cx = x + w / 2,
      cy = placement === "top" ? y + s / 2 : y + h - s / 2;
    const size = Math.max(4, Math.min(10, 35 * k));
    return `<g class="handle-symbol" data-handle="catch" data-placement="${placement}" fill="${color}" stroke="#52645e" stroke-width=".8"><rect x="${cx - size * 0.55}" y="${cy - size * 0.4}" width="${size * 1.1}" height="${size * 0.8}" rx="2"/><path d="M${cx - size},${cy}Q${cx},${cy - size * 0.7} ${cx + size},${cy}Q${cx},${cy + size * 0.7} ${cx - size},${cy}Z"/><circle cx="${cx}" cy="${cy}" r="1.5" fill="#52645e"/></g>`;
  }
  const length = Math.max(9, Math.min(h * 0.2, 100 * k)),
    dir = side === "left" ? 1 : -1;
  let shape = "";
  if (spec.type === "pull")
    shape = `<path d="M${hx},${hy - length}h${dir * 4}v${length * 2}h${-dir * 4}" fill="none" stroke="${color}" stroke-width="4"/><circle cx="${hx}" cy="${hy - length}" r="2"/><circle cx="${hx}" cy="${hy + length}" r="2"/>`;
  else if (spec.type === "flush")
    shape = `<rect x="${hx - 3}" y="${hy - length / 2}" width="6" height="${length}" rx="3" fill="${color}"/><rect x="${hx - 1.3}" y="${hy - length / 3}" width="2.6" height="${length * 0.66}" rx="1.3" fill="#303e3d"/>`;
  else
    shape = `<rect x="${hx - 2.5}" y="${hy - 6}" width="5" height="14" rx="2" fill="${color}"/><path d="M${hx},${hy}h${dir * length * 0.7}" stroke="${color}" stroke-width="4" stroke-linecap="round"/>${spec.type === "lockable" ? `<circle cx="${hx}" cy="${hy + 5}" r="1" fill="#263733"/>` : ""}`;
  return `<g class="handle-symbol" data-handle="${spec.type}" fill="${color}" stroke="#52645e" stroke-width=".5">${shape}</g>`;
}
export function drawing(
  item,
  {
    selected = -1,
    interactive = false,
    dimensions = true,
    id = "drawing",
  } = {},
) {
  id = String(id).replace(/[^a-zA-Z0-9_-]/g, "");
  const design = getDesign(item),
    geometry = getDesignGeometry(item),
    corner = geometry.faces.length === 2;
  const W = corner ? 1100 : 900,
    H = corner ? 760 : 650,
    gap = corner ? 130 : 0,
    totalWidth = geometry.faces.reduce((s, f) => s + f.width, 0) + gap;
  const perspective = corner && design.cornerView !== "elevation";
  const ordered =
    design.cornerSide === "right"
      ? [...geometry.faces].reverse()
      : geometry.faces;
  const a = 0.866,
    b = 0.5;
  const k = perspective
      ? Math.min(
          880 / (a * (item.width + design.returnWidth)),
          500 / (item.height + b * Math.max(item.width, design.returnWidth)),
        )
      : Math.min(
          (corner ? 880 : 650) / totalWidth,
          (corner ? 430 : 450) / item.height,
        ),
    height = item.height * k;
  let ox = (W - totalWidth * k) / 2;
  const oy = (corner ? 85 : 100) + (450 - height) / 2;
  const color = colors[item.finish],
    stroke = ["anthracite", "black", "brown"].includes(item.finish)
      ? "#273b3a"
      : "#8c9e97",
    f = item.profile * k,
    s = item.sash * k;
  let body = "";
  const leftWidth = ordered[0].width * k;
  const seamX =
    (W - a * (ordered[0].width + ordered[1]?.width || 0) * k) / 2 +
    a * leftWidth;
  for (const face of ordered) {
    const isLeft = face === ordered[0];
    const transform = perspective
      ? isLeft
        ? `matrix(${a},${-b},0,1,${seamX - a * leftWidth},${85 + b * leftWidth})`
        : `matrix(${a},${b},0,1,${seamX},85)`
      : "";
    const x = perspective ? 0 : ox,
      y = perspective ? 0 : oy,
      w = face.width * k,
      h = face.height * k,
      rise = face.arch?.rise * k || 0;
    const outline = face.arch
      ? `M${x},${y + rise} A${face.arch.radius * k},${face.arch.radius * k} 0 0 1 ${x + w},${y + rise} V${y + h}H${x}Z`
      : `M${x},${y}H${x + w}V${y + h}H${x}Z`;
    body += `<g data-face-elevation="${face.index}" transform="${transform}"><path d="${outline}" fill="${color}" stroke="${stroke}" stroke-width="1.5" filter="url(#${id}-shadow)"/>`;
    const polygonPath = (points) =>
      points
        .map((p, j) => `${j ? "L" : "M"}${x + p[0] * k},${y + p[1] * k}`)
        .join("") + "Z";
    if (face.arch) {
      for (const pane of face.arch.panes)
        body += `<path class="arched-glass" d="${polygonPath(pane.points)}" fill="url(#${id}-glass)" stroke="${stroke}"/>`;
      const inner = curvedPane(
        face.width,
        face.arch.rise,
        item.profile,
        item.profile,
        face.width - item.profile,
        0,
        face.height - item.profile,
      );
      body += `<defs><clipPath id="${id}-arch-body-${face.index}"><path d="${polygonPath(inner.points)}"/></clipPath></defs><g clip-path="url(#${id}-arch-body-${face.index})">`;
    } else
      body += `<path class="frame-joints" data-joint="${design.frameJoint}" d="${joints(x, y, w, h, f, design.frameJoint)}" fill="none" stroke="${stroke}"/>`;
    for (const p of slidingProjection(
      face.panels,
      design.slidingFront || "right",
    )) {
      const px = x + p.x * k,
        py = y + p.y * k,
        pw = p.width * k,
        ph = p.height * k,
        open = !["fixed", "solid"].includes(p.mode),
        inset = open ? s : 0;
      const le = p.groupId ? p.edges.left.width * k : inset,
        re = p.groupId ? p.edges.right.width * k : inset,
        te = p.groupId ? p.edges.top.width * k : inset,
        be = p.groupId ? p.edges.bottom.width * k : inset;
      const gx = px + le,
        gy = py + te,
        gw = pw - le - re,
        gh = ph - te - be,
        mx = gx + gw / 2,
        my = gy + gh / 2;
      let lines = "";
      if (["left", "tilt-turn"].includes(p.mode))
        lines += `M${gx},${gy}L${gx + gw},${my}L${gx},${gy + gh}`;
      if (p.mode === "right")
        lines += `M${gx + gw},${gy}L${gx},${my}L${gx + gw},${gy + gh}`;
      if (p.mode.startsWith("slide")) {
        const d = p.mode === "slide-left" ? -1 : 1;
        lines += `M${mx - d * gw * 0.25},${my}H${mx + d * gw * 0.25}m${-d * 8},-6l${d * 8},6l${-d * 8},6`;
      }
      body += `<g class="drawing-panel" ${interactive ? `data-panel="${p.index}" data-panel-id="${escapeHtml(p.id)}" data-face="${p.face}" tabindex="0" role="button" aria-label="Face ${p.face + 1}, panel ${p.index + 1}: ${escapeHtml(p.mode)}" aria-pressed="${selected === p.index}"` : ""}><rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${color}" stroke="${stroke}"/>${p.curvedGlass ? `<path class="curved-panel-glass" d="${polygonPath(p.curvedGlass.points)}" fill="${p.mode === "solid" ? color : `url(#${id}-glass)`}" stroke="${stroke}"/>` : `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="${p.mode === "solid" ? color : `url(#${id}-glass)`}" stroke="${stroke}"/>`}`;
      if (p.groupId) {
        const e = p.edges,
          mitre = (u, v) => e[u].joint === "mitre" && e[v].joint === "mitre";
        const tl = mitre("top", "left"),
          tr = mitre("top", "right"),
          bl = mitre("bottom", "left"),
          br = mitre("bottom", "right");
        body += `<path class="sliding-joints" d="M${tl ? px : px + le},${py}L${px + le},${py + te}M${tr ? px + pw : px + pw - re},${py}L${px + pw - re},${py + te}M${bl ? px : px + le},${py + ph}L${px + le},${py + ph - be}M${br ? px + pw : px + pw - re},${py + ph}L${px + pw - re},${py + ph - be}" fill="none" stroke="${stroke}"/>`;
      }
      if (open && !p.groupId)
        body += `<path class="sash-joints" data-joint="${design.sashJoint}" d="${joints(px, py, pw, ph, s, design.sashJoint)}" fill="none" stroke="${stroke}" stroke-width=".8"/>`;
      if (p.mode !== "solid")
        body += `<path d="M${gx + gw * 0.15},${gy + gh * 0.5}l${gw * 0.35},${-gh * 0.35}M${gx + gw * 0.3},${gy + gh * 0.7}l${gw * 0.35},${-gh * 0.35}" stroke="#fff" stroke-width="2" opacity=".5"/>`;
      body += `<path d="${lines}" stroke="#5c807d" stroke-width="1.4" fill="none"/>`;
      if (p.mode === "awning")
        body += `<path d="M${gx},${gy}L${mx},${gy + gh}L${gx + gw},${gy}" stroke="#5c807d" stroke-width="1.2" stroke-dasharray="6 4" fill="none"/>`;
      if (["tilt", "tilt-turn"].includes(p.mode))
        body += `<path d="M${gx},${gy + gh}L${mx},${gy}L${gx + gw},${gy + gh}" stroke="#5c807d" stroke-width="1.2" stroke-dasharray="6 4" fill="none"/>`;
      body += handleSymbol(
        p,
        px,
        py,
        pw,
        ph,
        p.groupId ? Math.min(le, re) : s,
        k,
      );
      if (p.vent) {
        const physical = { ...p, width: p.physicalWidth ?? p.width },
          box = glassBounds(item, physical, design);
        const cx = px + (box.left + p.vent.x) * k,
          cy = py + (box.top + p.vent.y) * k,
          r = (p.vent.diameter * k) / 2;
        body += `<g class="fan-opening" data-diameter="${p.vent.diameter}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="#f6faf8" stroke="#688078" stroke-width="1.5"/><circle cx="${cx}" cy="${cy}" r="${r * 0.82}" fill="none" stroke="#9cad9f"/>${[0, 120, 240].map((a) => `<path d="M${cx},${cy}Q${cx - r * 0.9},${cy - r * 0.8} ${cx},${cy - r * 0.7}Q${cx + r * 0.3},${cy - r * 0.3} ${cx},${cy}Z" transform="rotate(${a} ${cx} ${cy})" fill="#9fb6ae"/>`).join("")}<circle cx="${cx}" cy="${cy}" r="${r * 0.13}" fill="#547569"/></g>`;
      }
      if (interactive && selected === p.index)
        body += `<rect x="${px + 1.5}" y="${py + 1.5}" width="${Math.max(0, pw - 3)}" height="${Math.max(0, ph - 3)}" fill="#166b5610" stroke="#29745d" stroke-width="2" stroke-dasharray="6 4"/>`;
      if (dimensions && interactive && pw > 75 && ph > 75)
        body += `<text x="${px + pw / 2}" y="${py + ph - 10}" text-anchor="middle" fill="#71867b" font-size="10" pointer-events="none">${Math.round(p.physicalWidth ?? p.width)} × ${Math.round(p.height)}</text>`;
      body += "</g>";
    }
    if (face.arch) body += "</g>";
    if (dimensions)
      body += `<g stroke="#7a928a" stroke-width="1" fill="none"><path d="M${x},${y - 12}V${y - 42}M${x + w},${y - 12}V${y - 42}M${x},${y - 32}H${x + w}M${x - 4},${y - 36}l8,8M${x + w - 4},${y - 36}l8,8"/><path d="M${x + w + 10},${y}H${x + w + 40}M${x + w + 10},${y + h}H${x + w + 40}M${x + w + 30},${y}V${y + h}"/></g><g fill="#536a62" font-family="Arial,sans-serif" font-size="14"><text x="${x + w / 2}" y="${y - 43}" text-anchor="middle">${face.width} mm</text><text transform="translate(${x + w + 48} ${y + h / 2}) rotate(90)" text-anchor="middle">${face.height} mm</text>${corner ? `<text x="${x + w / 2}" y="${y + h + 25}" text-anchor="middle">${face.index + 1}</text>` : ""}</g>`;
    body += "</g>";
    ox += (face.width + gap) * k;
  }
  if (corner && dimensions && !perspective)
    body += `<g class="corner-plan" transform="translate(455 632)"><path d="M0 60V0H150" stroke="#436e5a" stroke-width="9" fill="none"/><path d="M22 0V22H0" stroke="#71977b" stroke-width="1.5" fill="none"/><text x="30" y="35" font-family="Arial" font-size="17" fill="#436e5a">90°</text><text x="-22" y="38" font-size="13" fill="#69816c">1</text><text x="80" y="-15" font-size="13" fill="#69816c">2</text><circle cx="0" cy="0" r="7" fill="#b7cda3" stroke="#436e5a"/></g>`;
  if (perspective && dimensions)
    body += `<text x="${seamX}" y="${85 + height + 34}" text-anchor="middle" fill="#436e5a" font-size="18">90°</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="${interactive ? "group" : "img"}" aria-label="${escapeHtml(item.name)} ${corner ? "90 degree corner" : ""}"><defs><linearGradient id="${id}-glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d5e8e5"/><stop offset=".58" stop-color="#edf3ef"/><stop offset="1" stop-color="#c7ded9"/></linearGradient><filter id="${id}-shadow"><feDropShadow dx="0" dy="7" stdDeviation="7" flood-color="#203d32" flood-opacity=".12"/></filter></defs>${body}</svg>`;
}
