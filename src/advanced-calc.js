import { curveY, curvedPane } from "./arch-geometry.js";
import { slidingCuts } from "./sliding.js";
import { getDesign, getDesignGeometry } from "./design.js";

// Geometry is an estimating model, not a manufacturer's machining schedule.
export function calculateDesignItem(item, settings) {
  const d = getDesign(item),
    g = getDesignGeometry(item),
    cuts = [],
    glassPieces = [],
    infillPieces = [],
    curvedParts = [];
  let openingCount = 0,
    handleExtra = 0,
    area = 0;
  const add = (type, length, quantity, face, part, joint = "butt") => {
    const allowance =
      type === "frame"
        ? d.frameAllowance
        : type === "sash"
          ? d.sashAllowance
          : 0;
    cuts.push({
      type,
      length: length + allowance,
      nominalLength: length,
      allowance,
      quantity: quantity * item.quantity,
      material: item.material,
      finish: item.finish,
      face,
      part,
      angleStart: joint === "mitre" ? 45 : 90,
      angleEnd: joint === "mitre" ? 45 : 90,
      system: d.systemName,
      profileFace: type === "sash" ? item.sash : item.profile,
    });
  };
  for (const face of g.faces) {
    const f = item.profile,
      w = face.width,
      h = face.height;
    if (face.arch) {
      // Cap has its own curved rail and a straight spring-line transom.
      add("frame", h - face.arch.rise, 2, face.index, "jamb", "butt");
      add(
        "frame",
        d.frameJoint === "butt" ? w - 2 * f : w,
        1,
        face.index,
        "bottom",
        d.frameJoint,
      );
      const transomSpan = curvedPane(
        w,
        face.arch.rise,
        f,
        face.arch.bodyLeft,
        face.arch.bodyRight,
        0,
        face.arch.bottom,
      ).width;
      add("divider", transomSpan, 1, face.index, "arch transom");
      for (const div of face.arch.dividers)
        add("divider", div.bottom - div.y, 1, face.index, "arch head mullion");
      curvedParts.push({
        face: face.index,
        length: face.arch.arcLength + d.frameAllowance,
        quantity: item.quantity,
        description: "curved head",
        material: item.material,
        finish: item.finish,
      });
      const theta = 2 * Math.asin(w / (2 * face.arch.radius));
      area +=
        ((w * (h - face.arch.rise) +
          (face.arch.radius ** 2 * (theta - Math.sin(theta))) / 2) *
          item.quantity) /
        1e6;
      face.arch.panes.forEach((pane, index) =>
        glassPieces.push({
          width: pane.width,
          height: pane.height,
          area: pane.area,
          quantity: item.quantity,
          face: face.index,
          panel: `arch ${index + 1}`,
          shape: "arched",
        }),
      );
    } else {
      add("frame", h, 2, face.index, "jamb", d.frameJoint);
      add(
        "frame",
        d.frameJoint === "butt" ? w - 2 * f : w,
        2,
        face.index,
        "rail",
        d.frameJoint,
      );
      area += (w * h * item.quantity) / 1e6;
    }
    for (const div of face.dividers)
      add(
        "divider",
        div.width === f
          ? div.height -
              (face.arch
                ? Math.max(
                    0,
                    curveY(w, face.arch.rise, f, div.x + f / 2) - div.y,
                  )
                : 0)
          : div.width,
        1,
        face.index,
        div.width === f ? "mullion" : "transom",
      );
    for (const p of face.panels) {
      const opening = !["fixed", "solid"].includes(p.mode);
      if (opening) {
        openingCount += item.quantity;
        handleExtra +=
          (p.handle.type === "none" ? 0 : p.handle.extraCost) * item.quantity;
      }
      if (p.groupId) {
        for (const edge of slidingCuts(p))
          cuts.push({
            type: edge.type,
            length: edge.length + d.sashAllowance,
            nominalLength: edge.length,
            allowance: d.sashAllowance,
            quantity: item.quantity,
            material: item.material,
            finish: item.finish,
            face: face.index,
            part: `panel ${p.index + 1} ${edge.side}`,
            angleStart: edge.angleStart,
            angleEnd: edge.angleEnd,
            system: d.systemName,
            profileFace: edge.width,
          });
      } else if (opening) {
        add(
          "sash",
          p.height,
          2,
          face.index,
          `panel ${p.index + 1} jamb`,
          d.sashJoint,
        );
        add(
          "sash",
          d.sashJoint === "butt" ? p.width - 2 * item.sash : p.width,
          2,
          face.index,
          `panel ${p.index + 1} rail`,
          d.sashJoint,
        );
      }
      const width =
          p.width -
          (p.groupId
            ? p.edges.left.width + p.edges.right.width
            : opening
              ? 2 * item.sash
              : 0) -
          2 * d.glassGap,
        height =
          p.height -
          (p.groupId
            ? p.edges.top.width + p.edges.bottom.width
            : opening
              ? 2 * item.sash
              : 0) -
          2 * d.glassGap;
      (p.mode === "solid" ? infillPieces : glassPieces).push({
        width: p.curvedGlass?.width ?? width,
        height: p.curvedGlass?.height ?? height,
        area: p.curvedGlass?.area ?? (width * height) / 1e6,
        quantity: item.quantity,
        face: face.index,
        panel: p.index + 1,
        shape: p.curvedGlass ? "arched" : "rectangle",
        ...(p.vent ? { vent: { ...p.vent } } : {}),
      });
    }
  }
  const glassArea = glassPieces.reduce((s, p) => s + p.area * p.quantity, 0),
    infillArea = infillPieces.reduce((s, p) => s + p.area * p.quantity, 0);
  const profileLength = [...cuts, ...curvedParts].reduce(
    (s, c) => s + (c.length * c.quantity) / 1000,
    0,
  );
  const baseCost =
    (profileLength * settings.rates[item.material] +
      glassArea * settings.glassRates[item.glass] +
      infillArea * settings.infillRate) *
      (1 + settings.waste / 100) +
    openingCount * settings.hardware +
    handleExtra +
    item.quantity * settings.labor;
  const totalPrice = baseCost * (1 + settings.markup / 100);
  const warnings = [
    "Supplier confirmation required for profile deductions and machining.",
  ];
  if (d.shape === "corner")
    warnings.push("Corner connector and covers are not priced.");
  if (d.shape === "arched")
    warnings.push(
      "Curved profiles are approximate developed lengths; curved glass requires a supplier template. Curves are excluded from straight stock cutting.",
    );
  return {
    area,
    glassArea,
    infillArea,
    profileLength,
    openingCount,
    handleExtra,
    cuts,
    curvedParts,
    glassPieces,
    infillPieces,
    baseCost,
    unitPrice: totalPrice / item.quantity,
    totalPrice,
    warnings,
  };
}
