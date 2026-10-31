import { curveY } from "./arch-geometry.js";
export function glassBounds(item, p, design) {
  const open = !["fixed", "solid"].includes(p.mode),
    gap = design.glassGap;
  const left = (p.edges?.left.width ?? (open ? item.sash : 0)) + gap;
  const right = (p.edges?.right.width ?? (open ? item.sash : 0)) + gap;
  const top = (p.edges?.top.width ?? (open ? item.sash : 0)) + gap;
  const bottom = (p.edges?.bottom.width ?? (open ? item.sash : 0)) + gap;
  return {
    left,
    top,
    width: p.width - left - right,
    height: p.height - top - bottom,
  };
}
export function ventErrors(item, p, design) {
  if (!p.vent) return [];
  const box = glassBounds(item, p, design),
    v = p.vent,
    r = v.diameter / 2,
    margin = 10;
  if (p.mode === "solid") return ["A fan opening needs glass."];
  if (
    v.x - r < margin ||
    v.y - r < margin ||
    v.x + r > box.width - margin ||
    v.y + r > box.height - margin
  )
    return [
      "Fan opening must fit inside the glass with at least 10 mm clearance.",
    ];
  if (p.curvedTop)
    for (let j = 0; j < 64; j++) {
      const a = (j * Math.PI) / 32,
        x = p.x + box.left + v.x + (r + margin) * Math.cos(a),
        y = p.y + box.top + v.y + (r + margin) * Math.sin(a);
      if (
        y <
        curveY(item.width, design.archRise, item.profile + design.glassGap, x)
      )
        return ["Fan opening intersects the curved glass edge."];
    }
  return [];
}
