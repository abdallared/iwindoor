export const edgeNames = ["left", "right", "top", "bottom"];

// Front elevation projection: overlapping stiles share one visible strip.
// Physical sash sizes used by fabrication remain in getDesignGeometry.
export function slidingProjection(panels, front = "right") {
  const result = [],
    seen = new Set();
  for (const panel of panels) {
    if (!panel.groupId) {
      result.push(panel);
      continue;
    }
    if (seen.has(panel.groupId)) continue;
    seen.add(panel.groupId);
    const members = panels.filter((p) => p.groupId === panel.groupId);
    const start = members[0].x;
    const end = members.at(-1).x + members.at(-1).width;
    const overlaps = members
      .slice(0, -1)
      .map((p, i) =>
        front === "right"
          ? p.edges.right.width
          : members[i + 1].edges.left.width,
      );
    const width =
      (end - start + overlaps.reduce((a, b) => a + b, 0)) / members.length;
    let x = start;
    const projected = members.map((p, i) => {
      const q = { ...p, x, width, physicalWidth: p.width };
      x += width - (overlaps[i] || 0);
      return q;
    });
    result.push(...(front === "left" ? projected.reverse() : projected));
  }
  return result;
}
const uid = () => crypto.randomUUID();
export function slidingNode(count = 2, previous) {
  if (!Number.isInteger(count) || count < 2 || count > 16)
    throw new Error("Sliding sashes must be 2�16.");
  const n = {
    id: uid(),
    kind: "sliding",
    meetingWidth: 20,
    meetingJoint: "butt",
    outerWidth: 50,
    outerJoint: "mitre",
    railWidth: 50,
    railJoint: "mitre",
    overlap: 20,
    tracks: 2,
    ...previous,
  };
  n.children = Array.from(
    { length: count },
    (_, i) =>
      previous?.children?.[i] || {
        id: uid(),
        kind: "panel",
        mode: i % 2 ? "slide-right" : "slide-left",
        handle: {
          type: "flush",
          color: "silver",
          side: "auto",
          height: 0,
          extraCost: 0,
        },
      },
  );
  return n;
}
export function slidingEdges(group, index, panel) {
  const side = (outer) => ({
    width: outer ? group.outerWidth : group.meetingWidth,
    joint: outer ? group.outerJoint : group.meetingJoint,
  });
  const base = {
    left: side(index === 0),
    right: side(index === group.children.length - 1),
    top: { width: group.railWidth, joint: group.railJoint },
    bottom: { width: group.railWidth, joint: group.railJoint },
  };
  for (const edge of edgeNames)
    base[edge] = { ...base[edge], ...panel.edgeOverrides?.[edge] };
  return base;
}
export function slidingErrors(n) {
  const errors = [],
    finite = (x, a, b) =>
      typeof x === "number" && Number.isFinite(x) && x >= a && x <= b;
  for (const k of ["meetingWidth", "outerWidth", "railWidth"])
    if (!finite(n[k], 5, 200))
      errors.push("Sliding profile widths must be 5–200 mm.");
  for (const k of ["meetingJoint", "outerJoint", "railJoint"])
    if (!["mitre", "butt"].includes(n[k]))
      errors.push("Invalid sliding joint.");
  if (!finite(n.overlap, 0, 100))
    errors.push("Sliding overlap must be 0–100 mm.");
  if (!Number.isInteger(n.tracks) || !finite(n.tracks, 2, 6))
    errors.push("Sliding tracks must be 2–6.");
  if (
    !Array.isArray(n.children) ||
    n.children.length < 2 ||
    n.children.length > 16
  )
    errors.push("A sliding group needs 2–16 sashes.");
  else
    for (const p of n.children) {
      if (
        !p ||
        p.kind !== "panel" ||
        !["fixed", "slide-left", "slide-right"].includes(p.mode)
      )
        errors.push("Sliding sashes must be fixed or sliding panels.");
      if (p?.edgeOverrides !== undefined) {
        if (
          !p.edgeOverrides ||
          typeof p.edgeOverrides !== "object" ||
          Array.isArray(p.edgeOverrides)
        ) {
          errors.push("Invalid sash edge overrides.");
          continue;
        }
        for (const [key, e] of Object.entries(p.edgeOverrides))
          if (
            !edgeNames.includes(key) ||
            !e ||
            !finite(e.width, 5, 200) ||
            !["mitre", "butt"].includes(e.joint)
          )
            errors.push("Invalid sash edge profile.");
      }
    }
  return errors;
}
export function slidingCuts(p) {
  const e = p.edges,
    angle = (a, b) =>
      e[a].joint === "mitre" && e[b].joint === "mitre" ? 45 : 90;
  const tl = angle("top", "left"),
    tr = angle("top", "right"),
    bl = angle("bottom", "left"),
    br = angle("bottom", "right");
  const vertical = (side, a, b) => ({
    side,
    width: e[side].width,
    length: p.height,
    angleStart: a,
    angleEnd: b,
    type: (side === "left" ? p.sashIndex > 0 : p.sashIndex < p.sashCount - 1)
      ? "meeting"
      : "sash",
  });
  return [
    vertical("left", tl, bl),
    vertical("right", tr, br),
    {
      side: "top",
      width: e.top.width,
      length:
        p.width -
        (tl === 90 ? e.left.width : 0) -
        (tr === 90 ? e.right.width : 0),
      angleStart: tl,
      angleEnd: tr,
      type: "sash",
    },
    {
      side: "bottom",
      width: e.bottom.width,
      length:
        p.width -
        (bl === 90 ? e.left.width : 0) -
        (br === 90 ? e.right.width : 0),
      angleStart: bl,
      angleEnd: br,
      type: "sash",
    },
  ];
}
