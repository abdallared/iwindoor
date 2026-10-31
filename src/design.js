import { glassBounds, ventErrors } from "./vent.js";
import { archHead, curveY, curvedPane } from "./arch-geometry.js";
import {
  slidingNode,
  slidingEdges,
  slidingErrors,
  slidingCuts,
} from "./sliding.js";
const modes = [
  "fixed",
  "left",
  "right",
  "tilt",
  "awning",
  "tilt-turn",
  "slide-left",
  "slide-right",
  "solid",
];
const uid = () =>
  globalThis.crypto?.randomUUID?.() ||
  `node-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const obj = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
const number = (x, a, b) =>
  typeof x === "number" && Number.isFinite(x) && x >= a && x <= b;
const defaultHandle = () => ({
  type: "lever",
  color: "silver",
  side: "auto",
  height: 0,
  extraCost: 0,
});
const leaf = (mode = "fixed") => ({
  id: uid(),
  kind: "panel",
  mode,
  handle: {
    ...defaultHandle(),
    type: mode.startsWith("slide") ? "flush" : "lever",
  },
});
const split = (axis, ratio, a, b) => ({
  id: uid(),
  kind: "split",
  axis,
  ratio,
  children: [a, b],
});
const defaults = () => ({
  version: 2,
  shape: "rectangle",
  archRise: 300,
  returnWidth: 900,
  frameJoint: "mitre",
  sashJoint: "mitre",
  systemName: "Generic",
  frameAllowance: 0,
  sashAllowance: 0,
  glassGap: 0,
});

export function getDesign(item) {
  if (item.design) {
    const d = structuredClone(item.design);
    if (d.shape === "arched")
      for (const side of ["Left", "Right"])
        if (d["archSide" + side] > 0 && !d["arch" + side + "Layout"]) {
          const stored = JSON.stringify(d);
          let sideId = "arch-side-" + side.toLowerCase();
          while (stored.includes(JSON.stringify(sideId))) sideId += "-new";
          d["arch" + side + "Layout"] = {
            ...leaf("fixed"),
            id: sideId,
          };
        }
    return d;
  }
  // Balanced binary tree preserves equal clear cells and the original row-major modes.
  function grid(col, row, cols, rows) {
    if (rows > 1) {
      const n = Math.floor(rows / 2),
        clear =
          (item.height - 2 * item.profile - (item.rows - 1) * item.profile) /
          item.rows;
      return {
        ...split(
          "horizontal",
          (n * clear + (n - 1) * item.profile) /
            (rows * clear + (rows - 2) * item.profile),
          grid(col, row, cols, n),
          grid(col, row + n, cols, rows - n),
        ),
        id: `grid-h-${col}-${row}-${cols}-${rows}`,
      };
    }
    if (cols > 1) {
      const n = Math.floor(cols / 2),
        clear =
          (item.width - 2 * item.profile - (item.cols - 1) * item.profile) /
          item.cols;
      return {
        ...split(
          "vertical",
          (n * clear + (n - 1) * item.profile) /
            (cols * clear + (cols - 2) * item.profile),
          grid(col, row, n, rows),
          grid(col + n, row, cols - n, rows),
        ),
        id: `grid-v-${col}-${row}-${cols}-${rows}`,
      };
    }
    const panel = leaf(item.panels[row * item.cols + col] || "fixed");
    panel.id = `legacy-${row}-${col}`;
    return panel;
  }
  return { ...defaults(), layouts: [grid(0, 0, item.cols, item.rows)] };
}

function segment(width, rise) {
  const radius = (width * width) / (8 * rise) + rise / 2;
  const angle = 2 * Math.asin(Math.min(1, width / (2 * radius)));
  return {
    radius,
    arcLength: radius * angle,
    area: (radius * radius * (angle - Math.sin(angle))) / 2,
  };
}

export function getDesignGeometry(item) {
  const d = getDesign(item),
    faces = [],
    panels = [],
    groups = [];
  const count = d.shape === "corner" ? 2 : 1;
  for (let index = 0; index < count; index++) {
    const width = index === 1 ? d.returnWidth : item.width,
      height = item.height,
      rise = d.shape === "arched" ? d.archRise : 0;
    let arch = null;
    if (rise > 0) {
      const outer = segment(width, rise),
        inset = item.profile + d.glassGap;
      const glassRadius = outer.radius - inset;
      // Segment lies above its chord at y=rise-inset; apex is inset from the outer top.
      const effectiveRise = Math.max(0, rise - 2 * inset);
      const actualWidth =
        2 *
        Math.sqrt(
          Math.max(
            0,
            glassRadius * glassRadius -
              (outer.radius - rise + inset) * (outer.radius - rise + inset),
          ),
        );
      const actual =
        actualWidth > 0 && effectiveRise > 0
          ? segment(actualWidth, effectiveRise)
          : { area: 0 };
      arch = {
        rise,
        radius: outer.radius,
        arcLength: outer.arcLength,
        glassArea: actual.area / 1e6,
        glassWidth: actualWidth,
        glassRise: effectiveRise,
      };
    }
    if (arch) {
      Object.assign(
        arch,
        archHead(
          width,
          rise,
          item.profile,
          d.glassGap,
          d.archOffset || 0,
          d.archHeadCount || 1,
          d.archHeadRatio ?? 0.5,
          d.archSideLeft || 0,
          d.archSideRight || 0,
        ),
      );
      arch.glassArea = arch.panes.reduce((sum, p) => sum + p.area, 0);
      arch.glassWidth = Math.max(...arch.panes.map((p) => p.width));
      arch.glassRise = Math.max(...arch.panes.map((p) => p.height));
    }
    const bodyTop = arch ? arch.bottom : 0;
    const face = {
      index,
      width,
      height,
      bodyHeight: height - bodyTop,
      panels: [],
      dividers: [],
      arch,
    };
    function walk(node, x, y, w, h, depth = 0) {
      if (depth > 6) throw new RangeError("Design exceeds maximum depth.");
      if (node.kind === "sliding") {
        const count = node.children.length,
          sashWidth = (w + (count - 1) * node.overlap) / count;
        groups.push({
          id: node.id,
          face: index,
          x,
          y,
          width: w,
          height: h,
          count,
          ...Object.fromEntries(
            [
              "meetingWidth",
              "meetingJoint",
              "outerWidth",
              "outerJoint",
              "railWidth",
              "railJoint",
              "overlap",
              "tracks",
            ].map((k) => [k, node[k]]),
          ),
        });
        node.children.forEach((child, j) => {
          const p = {
            id: child.id,
            index: panels.length,
            face: index,
            mode: child.mode,
            handle: { ...child.handle },
            vent: child.vent || null,
            x: x + j * (sashWidth - node.overlap),
            y,
            width: sashWidth,
            height: h,
            groupId: node.id,
            sashIndex: j,
            sashCount: count,
            edges: slidingEdges(node, j, child),
            edgeOverrides: child.edgeOverrides || {},
            tracks: node.tracks,
            track: j % node.tracks,
          };
          face.panels.push(p);
          panels.push(p);
        });
        return;
      }
      if (node.kind === "panel") {
        const p = {
          id: node.id,
          index: panels.length,
          face: index,
          mode: node.mode,
          handle: { ...node.handle },
          vent: node.vent || null,
          x,
          y,
          width: w,
          height: h,
        };
        face.panels.push(p);
        panels.push(p);
        return;
      }
      const vertical = node.axis === "vertical",
        available = (vertical ? w : h) - item.profile,
        a = available * node.ratio;
      face.dividers.push({
        ...(vertical
          ? { x: x + a, y, width: item.profile, height: h }
          : { x, y: y + a, width: w, height: item.profile }),
        id: node.id,
        axis: node.axis,
        available,
        firstSize: a,
        secondSize: available - a,
      });
      walk(
        node.children[0],
        x,
        y,
        vertical ? a : w,
        vertical ? h : a,
        depth + 1,
      );
      walk(
        node.children[1],
        vertical ? x + a + item.profile : x,
        vertical ? y : y + a + item.profile,
        vertical ? available - a : w,
        vertical ? h : available - a,
        depth + 1,
      );
    }
    if (arch)
      for (const side of ["Left", "Right"]) {
        const size = d["archSide" + side] || 0;
        if (!size) continue;
        const dividerX = side === "Left" ? size : width - size;
        const px = side === "Left" ? item.profile : dividerX + item.profile / 2;
        walk(
          d["arch" + side + "Layout"],
          px,
          item.profile,
          size - item.profile * 1.5,
          height - 2 * item.profile,
        );
        face.dividers.push({
          id: "arch-side-divider-" + side,
          axis: "vertical",
          x: dividerX - item.profile / 2,
          y: item.profile,
          width: item.profile,
          height: height - 2 * item.profile,
        });
      }
    walk(
      d.layouts[index],
      arch ? arch.bodyLeft : item.profile,
      bodyTop + item.profile,
      arch ? arch.bodyRight - arch.bodyLeft : width - 2 * item.profile,
      height - bodyTop - 2 * item.profile,
    );
    if (arch) {
      for (const p of face.panels) {
        const inset = item.profile + d.glassGap;
        p.curvedTop =
          p.y <
          Math.max(
            curveY(width, rise, item.profile, p.x),
            curveY(width, rise, item.profile, p.x + p.width),
          ) -
            0.01;
        if (p.curvedTop)
          p.curvedGlass = curvedPane(
            width,
            rise,
            inset,
            p.x + d.glassGap,
            p.x + p.width - d.glassGap,
            p.y + d.glassGap,
            p.y + p.height - d.glassGap,
          );
      }
    }
    faces.push(face);
  }
  return { faces, panels, groups };
}

export function validateDesign(item) {
  const d = item?.design;
  if (!obj(d)) return ["Design must be an object."];
  const errors = [];
  if (
    d.cornerView !== undefined &&
    !["perspective", "elevation"].includes(d.cornerView)
  )
    errors.push("Invalid corner view.");
  if (d.cornerSide !== undefined && !["left", "right"].includes(d.cornerSide))
    errors.push("Invalid corner side.");
  if (
    d.slidingFront !== undefined &&
    !["left", "right"].includes(d.slidingFront)
  )
    errors.push("Invalid sliding front side.");
  if (d.archOffset !== undefined && !number(d.archOffset, -2000, 3000))
    errors.push("Invalid arch transom offset.");
  if (
    d.archHeadCount !== undefined &&
    (!Number.isInteger(d.archHeadCount) || !number(d.archHeadCount, 1, 4))
  )
    errors.push("Arch head needs 1–4 panes.");
  if (d.archHeadRatio !== undefined && !number(d.archHeadRatio, 0.1, 0.9))
    errors.push("Invalid arch head ratio.");
  for (const side of ["Left", "Right"]) {
    const size = d["archSide" + side];
    if (
      size !== undefined &&
      (!number(size, 0, 5000) || (size > 0 && size <= item.profile * 1.5 + 20))
    )
      errors.push("Side fixed panel is too narrow for its profiles.");
  }
  if (
    d.shape === "arched" &&
    (d.archSideLeft || 0) + (d.archSideRight || 0) + 2 * item.profile >=
      item.width
  )
    errors.push("Side panels leave no centre opening.");
  if (d.version !== 2) errors.push("Unsupported design version.");
  if (!["rectangle", "arched", "corner"].includes(d.shape))
    errors.push("Unknown design shape.");
  for (const key of ["frameJoint", "sashJoint"])
    if (!["mitre", "butt"].includes(d[key])) errors.push(`Invalid ${key}.`);
  if (typeof d.systemName !== "string" || d.systemName.length > 100)
    errors.push("System name must be text up to 100 characters.");
  for (const key of ["frameAllowance", "sashAllowance"])
    if (!number(d[key], -20, 100))
      errors.push(`${key} must be between -20 and 100 mm.`);
  if (!number(d.glassGap, 0, 30))
    errors.push("Glass gap must be between 0 and 30 mm.");
  if (!number(d.archRise, 50, 3000))
    errors.push("Arch rise must be between 50 and 3000 mm.");
  if (!number(d.returnWidth, 200, 6000))
    errors.push("Return width must be between 200 and 6000 mm.");
  if (
    d.shape === "arched" &&
    (d.archRise > item.width / 2 ||
      d.archRise + 2 * item.profile >= item.height)
  )
    errors.push(
      "Arch rise must not exceed half the width and must leave a rectangular body.",
    );
  if (
    !Array.isArray(d.layouts) ||
    d.layouts.length !== (d.shape === "corner" ? 2 : 1)
  )
    errors.push("Layouts must match the number of faces.");
  const ids = new Set();
  let leaves = 0;
  function walk(n, depth) {
    if (!obj(n)) {
      errors.push("Invalid panel node.");
      return;
    }
    if (depth > 6) {
      errors.push("Maximum layout depth is 6.");
      return;
    }
    if (typeof n.id !== "string" || !n.id || n.id.length > 200 || ids.has(n.id))
      errors.push("Panel and split IDs must be unique nonempty text.");
    ids.add(n.id);
    if (n.kind === "panel") {
      leaves++;
      if (!modes.includes(n.mode)) errors.push("Unknown panel opening mode.");
      if (
        n.vent !== undefined &&
        n.vent !== null &&
        (!obj(n.vent) ||
          !number(n.vent.diameter, 30, 800) ||
          !number(n.vent.x, 0, 6000) ||
          !number(n.vent.y, 0, 6000))
      )
        errors.push("Invalid circular fan opening.");
      const h = n.handle;
      if (
        !obj(h) ||
        !["lever", "lockable", "pull", "flush", "catch", "none"].includes(
          h.type,
        ) ||
        !["silver", "black", "white", "gold"].includes(h.color) ||
        !["auto", "left", "right", "top", "bottom"].includes(h.side) ||
        !number(h.height, 0, 6000) ||
        !number(h.extraCost, 0, 1e6)
      )
        errors.push("Invalid panel handle.");
    } else if (n.kind === "sliding") {
      errors.push(...slidingErrors(n));
      if (Array.isArray(n.children) && n.children.length <= 16)
        n.children.forEach((c) => walk(c, depth + 1));
    } else if (n.kind === "split") {
      if (
        !["vertical", "horizontal"].includes(n.axis) ||
        !number(n.ratio, 0.1, 0.9)
      )
        errors.push("Split needs an axis and ratio between 0.1 and 0.9.");
      if (!Array.isArray(n.children) || n.children.length !== 2)
        errors.push("Split must contain exactly two children.");
      else n.children.forEach((c) => walk(c, depth + 1));
    } else errors.push("Unknown layout node kind.");
  }
  if (Array.isArray(d.layouts) && d.layouts.length <= 2)
    d.layouts.forEach((n) => walk(n, 0));
  if (d.shape === "arched")
    for (const side of ["Left", "Right"])
      if (d["archSide" + side] > 0)
        walk(
          d["arch" + side + "Layout"] || getDesign(item)["arch" + side + "Layout"],
          0,
        );
  if (leaves > 48) errors.push("Maximum total panel count is 48.");
  if (!errors.length) {
    const g = getDesignGeometry(item);
    for (const group of g.groups) {
      if (group.overlap >= group.width)
        errors.push("Sliding overlap must be smaller than the section width.");
    }
    for (const face of g.faces)
      if (
        face.arch &&
        (face.arch.panes.some((p) => p.area <= 0) ||
          face.arch.dividers.some((v) => v.bottom - v.y <= item.profile))
      )
        errors.push("Arch head divisions leave no usable glass area.");
    for (const p of g.panels) {
      errors.push(...ventErrors(item, p, d));
      if (p.curvedTop && (p.groupId || !["fixed", "solid"].includes(p.mode)))
        errors.push(
          "Keep the section intersecting the arch fixed; split a rectangular section below for opening sashes.",
        );
      if (p.curvedGlass?.area <= 0)
        errors.push("Curved section has no glass area.");
      const opening = p.mode !== "fixed" && p.mode !== "solid",
        deduction = 2 * d.glassGap + (opening ? 2 * item.sash : 0);
      if (p.groupId) {
        if (
          p.width <=
            p.edges.left.width + p.edges.right.width + 2 * d.glassGap ||
          p.height <=
            p.edges.top.width + p.edges.bottom.width + 2 * d.glassGap ||
          slidingCuts(p).some((c) => c.length + d.sashAllowance <= 0)
        )
          errors.push(
            "Sliding sash is too narrow for its profiles. Increase width or reduce the sash count.",
          );
      }
      if (!p.groupId && (p.width <= deduction || p.height <= deduction))
        errors.push("A panel has no usable glazing/infill area.");
      if (p.handle.height > p.height)
        errors.push("Handle height exceeds panel height.");
      if (
        opening &&
        !p.groupId &&
        (p.width - 2 * item.sash + d.sashAllowance <= 0 ||
          p.height + d.sashAllowance <= 0)
      )
        errors.push("Sash allowances leave invalid cut lengths.");
    }
    for (const face of g.faces)
      if (face.arch && face.arch.glassArea <= 0)
        errors.push("Arch is too shallow for the frame and glass clearance.");
  }
  return [...new Set(errors)];
}

function edit(item, fn) {
  const d = getDesign(item);
  function walk(n) {
    const replacement = fn(n);
    if (replacement) return replacement;
    if (n.kind === "split" || n.kind === "sliding")
      n.children = n.children.map(walk);
    return n;
  }
  d.layouts = d.layouts.map(walk);
  if (d.shape === "arched")
    for (const side of ["Left", "Right"])
      if (d["archSide" + side] > 0)
        d["arch" + side + "Layout"] = walk(d["arch" + side + "Layout"]);
  const errors = validateDesign({ ...item, design: d });
  if (errors.length) throw new RangeError(errors.join(" "));
  return d;
}

export function setMeetingPreset(item, id, style) {
  if (!["thin", "thick"].includes(style))
    throw new RangeError("Unknown profile style");
  return edit(item, (n) => {
    if (n.id !== id || n.kind !== "sliding") return null;
    n.meetingWidth = style === "thin" ? 20 : 50;
    n.meetingJoint = style === "thin" ? "butt" : "mitre";
    n.railJoint = "mitre";
    n.children.forEach((p, index) => {
      if (!p.edgeOverrides) return;
      if (index > 0) delete p.edgeOverrides.left;
      if (index < n.children.length - 1) delete p.edgeOverrides.right;
      for (const side of ["top", "bottom"])
        if (p.edgeOverrides[side]) p.edgeOverrides[side].joint = "mitre";
    });
    return n;
  });
}

export function setSashJoint(item, joint) {
  const d = edit(item, (n) => {
    if (n.kind !== "sliding") return null;
    n.outerJoint = joint;
    n.railJoint = "mitre";
    n.children.forEach((p, index) => {
      if (!p.edgeOverrides) return;
      for (const side of ["top", "bottom"])
        if (p.edgeOverrides[side]) p.edgeOverrides[side].joint = "mitre";
      if (index === 0 && p.edgeOverrides.left)
        p.edgeOverrides.left.joint = joint;
      if (index === n.children.length - 1 && p.edgeOverrides.right)
        p.edgeOverrides.right.joint = joint;
    });
    return n;
  });
  d.sashJoint = joint;
  return d;
}

export function mirrorDesign(item) {
  const d = getDesign(item);
  const originalPanels = getDesignGeometry(item).panels;
  const flip = (v) =>
    ({
      left: "right",
      right: "left",
      "slide-left": "slide-right",
      "slide-right": "slide-left",
    })[v] || v;
  function reflect(n) {
    if (n.kind === "panel") {
      if (n.vent) {
        const p = originalPanels.find((p) => p.id === n.id);
        n.vent.x = glassBounds(item, p, d).width - n.vent.x;
      }
      n.mode = flip(n.mode);
      n.handle.side = flip(n.handle.side);
      if (n.edgeOverrides) {
        const { left, right, ...rest } = n.edgeOverrides;
        n.edgeOverrides = {
          ...rest,
          ...(left ? { right: left } : {}),
          ...(right ? { left: right } : {}),
        };
      }
    } else {
      n.children.forEach(reflect);
      if (n.kind === "sliding" || n.axis === "vertical") n.children.reverse();
      if (n.kind === "split" && n.axis === "vertical")
        n.ratio = Number((1 - n.ratio).toFixed(12));
    }
  }
  d.layouts.forEach(reflect);
  if (d.shape === "arched" && (d.archSideLeft || d.archSideRight)) {
    for (const side of ["Left", "Right"])
      if (d["archSide" + side] > 0) reflect(d["arch" + side + "Layout"]);
    [d.archSideLeft, d.archSideRight] = [
      d.archSideRight || 0,
      d.archSideLeft || 0,
    ];
    [d.archLeftLayout, d.archRightLayout] = [
      d.archRightLayout,
      d.archLeftLayout,
    ];
  }
  if (d.archHeadRatio !== undefined)
    d.archHeadRatio = Number((1 - d.archHeadRatio).toFixed(12));
  if (d.shape === "corner")
    d.cornerSide = d.cornerSide === "right" ? "left" : "right";
  const errors = validateDesign({ ...item, design: d });
  if (errors.length) throw new RangeError(errors.join(" "));
  return d;
}
export function splitPanel(item, id, axis, ratio = 0.5) {
  return edit(item, (n) =>
    n.id === id && n.kind === "panel"
      ? split(axis, ratio, { ...n, id: uid() }, leaf("fixed"))
      : null,
  );
}
export function mergePanel(item, id) {
  return edit(item, (n) =>
    n.kind === "split" &&
    n.children.some((c) => c.id === id && c.kind === "panel")
      ? structuredClone(n.children.find((c) => c.id === id))
      : null,
  );
}
export function updatePanel(item, id, patch) {
  return edit(item, (n) =>
    n.id === id && n.kind === "panel"
      ? {
          ...n,
          ...patch,
          id: n.id,
          kind: "panel",
          handle: { ...n.handle, ...patch.handle },
        }
      : null,
  );
}
export function updateSplit(item, id, ratio) {
  return edit(item, (n) =>
    n.id === id && n.kind === "split" ? { ...n, ratio } : null,
  );
}
export function listSplits(item) {
  const out = [],
    g = getDesignGeometry(item);
  const d = getDesign(item),
    roots = d.layouts.map((n, face) => ({ n, face }));
  if (d.shape === "arched")
    for (const side of ["Left", "Right"])
      if (d["archSide" + side] > 0)
        roots.push({ n: d["arch" + side + "Layout"], face: 0 });
  roots.forEach(({ n, face }) => {
    function walk(x) {
      if (x.kind === "split") {
        const geo = g.faces[face].dividers.find((d) => d.id === x.id);
        out.push({
          id: x.id,
          face,
          axis: x.axis,
          ratio: x.ratio,
          available: geo.available,
          firstSize: geo.firstSize,
          secondSize: geo.secondSize,
        });
        x.children.forEach(walk);
      }
    }
    walk(n);
  });
  return out;
}
export function createDesignTemplate(key) {
  const d = defaults();
  let width = 1200,
    height = 1400;
  if (key === "arched-sides") {
    width = 1800;
    height = 1800;
    d.shape = "arched";
    d.archRise = 400;
    d.archSideLeft = 300;
    d.archSideRight = 300;
    d.layouts = [slidingNode(2)];
  } else if (key === "custom") {
    d.layouts = [leaf("fixed")];
  } else if (key.startsWith("sliding")) {
    const count = Number(key.split("-")[1]) || 2;
    width = Math.max(1200, count * 600);
    d.layouts = [slidingNode(count)];
  } else if (key === "corner-mixed") {
    d.shape = "corner";
    d.returnWidth = 1800;
    d.layouts = [leaf("fixed"), slidingNode(2)];
    width = 1200;
  } else if (key === "balcony") {
    width = 1800;
    height = 2200;
    const door = leaf("right");
    door.handle.type = "lockable";
    door.handle.height = 1050;
    d.layouts = [
      split(
        "vertical",
        0.55,
        door,
        split("horizontal", 0.65, leaf("fixed"), leaf("solid")),
      ),
    ];
  } else if (key === "arched") {
    width = 1400;
    height = 1800;
    d.shape = "arched";
    d.layouts = [split("horizontal", 0.25, leaf("fixed"), slidingNode(2))];
  } else if (key === "fanlight") {
    height = 1800;
    d.layouts = [split("horizontal", 0.25, leaf("fixed"), slidingNode(2))];
  } else {
    width = 2200;
    d.layouts = [split("vertical", 0.3, leaf("fixed"), slidingNode(2))];
  }
  return { width, height, design: d };
}

export function setSlidingGroup(item, panelId, count = 2) {
  return edit(item, (n) =>
    n.id === panelId && n.kind === "panel" ? slidingNode(count) : null,
  );
}
export function updateSlidingGroup(item, id, key, value) {
  return edit(item, (n) =>
    n.id === id && n.kind === "sliding"
      ? key === "count"
        ? slidingNode(value, n)
        : { ...n, [key]: value }
      : null,
  );
}
export function removeSlidingGroup(item, id) {
  return edit(item, (n) =>
    n.id === id && n.kind === "sliding" ? leaf("fixed") : null,
  );
}

export function splitPanelCount(item, id, axis, count = 3) {
  if (![2, 3].includes(count) || !["vertical", "horizontal"].includes(axis))
    throw new RangeError("Invalid subdivision.");
  const panel = getDesignGeometry(item).panels.find((p) => p.id === id);
  if (!panel || panel.groupId)
    throw new RangeError("Select an independent section to split.");
  if (panel.vent)
    throw new RangeError(
      "Remove the fan opening before subdividing its glass.",
    );
  return edit(item, (n) => {
    if (n.id !== id || n.kind !== "panel") return null;
    const length = axis === "vertical" ? panel.width : panel.height;
    const clear = (length - (count - 1) * item.profile) / count;
    function build(remaining, size, first) {
      const child = first ? { ...n, id: uid() } : leaf("fixed");
      return remaining === 1
        ? child
        : split(
            axis,
            clear / (size - item.profile),
            child,
            build(remaining - 1, size - clear - item.profile, false),
          );
    }
    return build(count, length, true);
  });
}
