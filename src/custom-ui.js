import { finishNames } from "./finishes.js";
import { getDesign, getDesignGeometry, listSplits } from "./design.js";
import { escapeHtml as esc } from "./drawing.js";
import { customPhrases } from "./custom-en.js";
export const customText = (lang, key) =>
  customPhrases[key]?.[lang === "ar" ? 1 : 0];
export function customInspector(i, c) {
  const {
    t,
    input,
    select,
    btn,
    icon,
    selectedPanel,
    tab,
    modes,
    modeIcon,
    presets,
  } = c;
  const d = getDesign(i),
    g = getDesignGeometry(i),
    p = g.panels[Math.min(selectedPanel, g.panels.length - 1)];
  const field = (label, key, val, opts = {}) =>
    input(label, key, val, { scope: "design", ...opts });
  const choice = (label, key, val, values, scope = "design") =>
    select(
      label,
      key,
      val,
      values.map((v) => [v, t(v)]),
      scope,
    );
  const heading = (n, title) =>
    `<div class="section-title"><span>${n}</span><h3>${t(title)}</h3></div>`;
  const selected = `<div class="selected-panel-label">${t("face")} ${p.face + 1} · ${t("panel")} ${p.index + 1} · ${Math.round(p.width)} × ${Math.round(p.height)} mm</div>`;
  const panelSelector = select(
    "panelSelection",
    "selected",
    String(p.index),
    g.panels.map((x) => [
      String(x.index),
      `${t("face")} ${x.face + 1} / ${t("panel")} ${x.index + 1} · ${t(x.mode)}`,
    ]),
    "selection",
  );
  const group = g.groups.find((v) => v.id === p.groupId);
  const slidingUI = group
    ? `<div class="sliding-settings"><h3>${t("slidingAssembly")}</h3>${input("sashCount", "count", group.count, { scope: "sliding", type: "number", min: 2, max: 16 })}<div class="quick-controls"><button type="button" class="button" data-action="sash-remove" ${group.count <= 2 ? "disabled" : ""}>− ${t("removeSash")}</button><button type="button" class="button" data-action="sash-add" ${group.count >= 16 ? "disabled" : ""}>+ ${t("addSash")}</button></div><h4>${t("meetingStyle")}</h4><div class="quick-controls">${btn("meeting-thin", t("thin90"))}${btn("meeting-thick", t("thick45"))}</div><p class="custom-note">${t("meetingPresetHint")}</p><div class="field-grid">${["meeting", "outer", "rail"].map((v) => input(v + "Width", v + "Width", group[v + "Width"], { scope: "sliding", type: "number", min: 5, max: 200, unit: "mm" }) + choice(v + "Joint", v + "Joint", group[v + "Joint"], ["butt", "mitre"], "sliding")).join("")}${input("overlap", "overlap", group.overlap, { scope: "sliding", type: "number", min: 0, max: 100, unit: "mm" })}${input("tracks", "tracks", group.tracks, { scope: "sliding", type: "number", min: 2, max: 6 })}</div><p class="custom-note">${t("slidingHint")}</p><details class="sash-edge-details" ${c.expandedEdges ? "open" : ""}><summary>${t("sashEdges")}</summary>${["left", "right", "top", "bottom"].map((e) => `<div class="field-grid">${input("edge" + e, e + ".width", p.edges[e].width, { scope: "edge", type: "number", min: 5, max: 200, unit: "mm" })}${choice("cutAngle", e + ".joint", p.edges[e].joint, ["butt", "mitre"], "edge")}</div>`).join("")}${btn("reset-edges", t("resetEdges"))}</details>${btn("remove-sliding", t("removeSliding"))}</div>`
    : btn("add-sliding", t("addSliding"));
  const frontControls = g.groups.length
    ? `<div class="front-controls"><h4>${t("frontSash")}</h4><div class="quick-controls">${["right", "left"].map((side) => `<button type="button" class="button ${(d.slidingFront || "right") === side ? "primary" : ""}" aria-pressed="${(d.slidingFront || "right") === side}" data-action="front-${side}">${t("window" + side)}</button>`).join("")}</div><p class="custom-note">${t("frontHint")}</p></div>`
    : "";
  const ventUI = `<div class="inspector-section"><h3>${t("fanOpening")}</h3>${selected}${p.mode === "solid" ? `<p class="custom-note">${t("fanGlassOnly")}</p>` : p.vent ? `${input("fanDiameter", "diameter", p.vent.diameter, { scope: "vent", type: "number", min: 30, max: 800, unit: "mm" })}<div class="field-grid">${input("fanX", "x", p.vent.x, { scope: "vent", type: "number", min: 0, max: 6000, unit: "mm" })}${input("fanY", "y", p.vent.y, { scope: "vent", type: "number", min: 0, max: 6000, unit: "mm" })}</div>${btn("vent-remove", t("removeFan"))}` : btn("vent-add", t("addFan"))}<p class="custom-note">${t("fanHint")}</p></div>`;
  let body = "";
  if (tab === "hardware") {
    const open = !["fixed", "solid"].includes(p.mode);
    body = `<div class="inspector-section">${panelSelector}${selected}${
      !open
        ? `<p class="custom-note">${t("fixedNoHandle")}</p>`
        : `${choice("handleType", "type", p.handle.type, ["lever", "lockable", "pull", "flush", "catch", "none"], "handle")}${choice("handleColor", "color", p.handle.color, ["silver", "black", "white", "gold"], "handle")}${select(
            "handleSide",
            "side",
            p.handle.side,
            [
              ["auto", t("auto")],
              ...(p.handle.type !== "catch"
                ? [
                    ["left", t("sideLeft")],
                    ["right", t("sideRight")],
                  ]
                : []),
              ...(p.handle.type === "catch"
                ? [
                    ["top", t("edgeTop")],
                    ["bottom", t("edgeBottom")],
                  ]
                : []),
            ],
            "handle",
          )}${p.handle.type === "catch" ? `<p class="custom-note">${t("catchPositionHint")}</p>` : `${input("handleHeight", "height", p.handle.height, { scope: "handle", type: "number", min: 0, max: Math.floor(p.height), unit: "mm" })}<p class="custom-note">${t("handleHeightHint")}</p>`}${input("handleExtra", "extraCost", p.handle.extraCost, { scope: "handle", type: "number", min: 0, max: 1000000, step: 0.01 })}<p class="custom-note">${t("handleCostHint")}</p>`
    }</div>`;
  } else if (tab === "fabrication") {
    body = `<div class="inspector-section">${heading("01", "fabricationTab")}${field("systemName", "systemName", d.systemName)}${select("loadPreset", "preset", "", [["", t("choosePreset")], ...presets.map((v, n) => [String(n), v.systemName])], "preset")}${choice("frameJoint", "frameJoint", d.frameJoint, ["mitre", "butt"])}${choice("sashJoint", "sashJoint", d.sashJoint, ["mitre", "butt"])}<p class="custom-note">${t("fabricationNote")}</p><div class="joint-reference"><span>45°<svg viewBox="0 0 100 60"><path d="M5 55V5h90v15H20v35Z"/><path d="m5 5 15 15"/></svg></span><span>90°<svg viewBox="0 0 100 60"><path d="M5 55V5h15v50M20 5h75v15H20"/></svg></span></div>${field("frameAllowance", "frameAllowance", d.frameAllowance, { type: "number", min: -20, max: 100, step: 0.1, unit: "mm" })}${field("sashAllowance", "sashAllowance", d.sashAllowance, { type: "number", min: -20, max: 100, step: 0.1, unit: "mm" })}${field("glassGap", "glassGap", d.glassGap, { type: "number", min: 0, max: 30, step: 0.1, unit: "mm" })}${btn("save-system", t("savePreset"), "check", "full-width")}<p class="custom-note">${t("supplierNote")}</p>${heading("02", "advanced")}<div class="field-grid">${input("profile", "profile", i.profile, { type: "number", min: 10, max: 200, unit: "mm" })}${input("sash", "sash", i.sash, { type: "number", min: 10, max: 200, unit: "mm" })}</div></div>`;
  } else {
    body = `<div class="inspector-section">${input("itemName", "name", i.name)}${btn("mirror-design", t("mirrorWindow"))}<p class="custom-note">${t("mirrorHint")}</p>${choice("overallShape", "shape", d.shape, ["rectangle", "arched", "corner"])}<div class="field-grid">${input("width", "width", i.width, { type: "number", min: 200, max: 6000, unit: "mm" })}${input("height", "height", i.height, { type: "number", min: 200, max: 6000, unit: "mm" })}</div>${
      d.shape === "corner"
        ? field("returnWidth", "returnWidth", d.returnWidth, {
            type: "number",
            min: 200,
            max: 6000,
            unit: "mm",
          }) +
          choice("cornerView", "cornerView", d.cornerView || "perspective", [
            "perspective",
            "elevation",
          ]) +
          select(
            "cornerSide",
            "cornerSide",
            d.cornerSide || "left",
            [
              ["left", t("sideLeft")],
              ["right", t("sideRight")],
            ],
            "design",
          )
        : ""
    }${d.shape === "arched" ? field("archRise", "archRise", d.archRise, { type: "number", min: 50, max: Math.min(3000, i.width / 2), unit: "mm" }) + field("archSideLeft", "archSideLeft", d.archSideLeft || 0, { type: "number", min: 0, max: 5000, unit: "mm" }) + field("archSideRight", "archSideRight", d.archSideRight || 0, { type: "number", min: 0, max: 5000, unit: "mm" }) + `<p class="custom-note">${t("archSidesHint")}</p>` + field("archOffset", "archOffset", d.archOffset || 0, { type: "number", min: -2000, max: 3000, unit: "mm" }) + `<p class="custom-note">${t("archOffsetHint")}</p>` + field("archHeadCount", "archHeadCount", d.archHeadCount || 1, { type: "number", min: 1, max: 4 }) + ((d.archHeadCount || 1) === 2 ? field("archHeadRatio", "archHeadRatio", d.archHeadRatio ?? 0.5, { type: "number", min: 0.1, max: 0.9, step: 0.05 }) : "") : ""}${input("quantity", "quantity", i.quantity, { type: "number", min: 1, max: 100, unit: t("units") })}${
      !i.design
        ? `<div class="field-grid">${select(
            "columns",
            "cols",
            i.cols,
            [1, 2, 3, 4, 5, 6].map((v) => [v, String(v)]),
          )}${select(
            "rows",
            "rows",
            i.rows,
            [1, 2, 3, 4, 5, 6].map((v) => [v, String(v)]),
          )}</div>`
        : ""
    }${d.shape === "corner" ? `<p class="custom-note">${t("cornerNote")}</p>` : d.shape === "arched" ? `<p class="custom-note">${t("archNote")}</p>` : ""}</div><div class="inspector-section">${heading("02", "freeDivisions")}${panelSelector}${selected}${slidingUI}${!group ? `<div class="split-actions">${btn("split-vertical", t("splitVertical"))}${btn("split-horizontal", t("splitHorizontal"))}${btn("divide3-vertical", t("splitThreeVertical"))}${btn("divide3-horizontal", t("splitThreeHorizontal"))}${btn("merge-panel", t("mergePanel"))}</div>` : ""}<p class="custom-note">${t("splitHint")}</p><div class="opening-grid">${(group ? ["fixed", "slide-left", "slide-right"] : modes).map((m) => `<button class="opening-option ${p.mode === m ? "active" : ""}" data-action="mode" data-mode="${m}" aria-pressed="${p.mode === m}" title="${t(m)}">${modeIcon(m)}<span>${t(m)}</span></button>`).join("")}</div>${
      listSplits(i).length
        ? `<details class="division-details" ${c.expandedDivisions ? "open" : ""}><summary>${t("dividerSettings")} (${listSplits(i).length})</summary>${listSplits(
            i,
          )
            .map(
              (s, n) =>
                `<label class="field"><span>${t("face")} ${s.face + 1} · ${n + 1}. ${t(s.axis)} — ${t("firstShare")}</span><input data-scope="split" data-key="${esc(s.id)}" type="number" min="10" max="90" step="any" value="${Number((s.ratio * 100).toFixed(2))}" aria-label="${esc(t("ratio"))} ${n + 1}"/></label><label class="field"><span>${t("firstSectionMM")}</span><input data-scope="split-mm" data-key="${esc(s.id)}" type="number" min="${s.available * 0.1}" max="${s.available * 0.9}" step="any" value="${Number(s.firstSize.toFixed(2))}" aria-label="${esc(t("firstSectionMM"))} ${n + 1}"/><small>${t("remainingSection")}: ${s.secondSize.toFixed(1)} mm</small></label>`,
            )
            .join("")}</details>`
        : ""
    }</div><div class="inspector-section">${heading("03", "material")}${select(
      "material",
      "material",
      i.material,
      ["UPVC", "PVC", "Aluminium"].map((v) => [v, v]),
    )}${select(
      "glazing",
      "glass",
      i.glass,
      ["single", "double", "triple"].map((v) => [v, t(v)]),
    )}${choice("finish", "finish", i.finish, finishNames, "item")}</div>`;
  }
  return `<aside class="inspector custom-inspector"><div class="inspector-title"><h2>${t("customization")}</h2>${icon("sliders")}</div><div class="inspector-tabs" role="tablist">${["design", "hardware", "fabrication"].map((k) => `<button role="tab" aria-selected="${tab === k}" data-action="inspector-${k}" class="${tab === k ? "active" : ""}">${t(k === "hardware" ? "hardwareTab" : k === "fabrication" ? "fabricationTab" : "designTab")}</button>`).join("")}</div>${frontControls}${body}${tab === "design" ? ventUI : ""}</aside>`;
}
export function designNotes(i, t) {
  const d = i.design;
  if (!d) return "";
  return `<div class="design-notes"><strong>${t("openDesign")}</strong><span>${t(d.shape)} · ${t("frameJoint")}: ${t(d.frameJoint)} · ${t("sashJoint")}: ${t(d.sashJoint)}</span>${d.shape === "corner" ? `<p>${t("connectorExcluded")}</p>` : d.shape === "arched" ? `<p>${t("curvedExclude")}</p>` : ""}</div>`;
}
export function manufacturingDetails(i, result, t) {
  if (!i.design) return "";
  const d = getDesign(i),
    g = getDesignGeometry(i);
  return `<section class="manufacturing-details"><h4>${t("manufacturingReport")} · ${esc(d.systemName)}</h4><p>${t("frameJoint")}: ${t(d.frameJoint)} / ${t("sashJoint")}: ${t(d.sashJoint)} / ${t("glassGap")}: ${d.glassGap} mm</p><div class="table-scroll"><table><thead><tr><th>${t("face")}</th><th>${t("type")}</th><th>${t("part")}</th><th>${t("profile")} mm</th><th>${t("length")} mm</th><th>${t("cutAngle")}</th><th>${t("quantity")}</th></tr></thead><tbody>${result.cuts.map((c) => `<tr><td>${c.face + 1}</td><td>${t(c.type === "sash" ? "sashType" : c.type)}</td><td>${esc(c.part)}</td><td>${c.profileFace}</td><td>${c.length.toFixed(1)}</td><td>${c.angleStart ?? "—"}° / ${c.angleEnd ?? "—"}°</td><td>${c.quantity}</td></tr>`).join("")}</tbody></table></div>${result.curvedParts?.length ? `<h4>${t("curvedParts")}</h4>${result.curvedParts.map((c) => `<p>${t("face")} ${c.face + 1} · ${t("arcLength")}: ${c.length.toFixed(1)} mm × ${c.quantity}</p>`).join("")}<p>${t("curvedExclude")}</p>` : ""}${result.glassPieces
    .filter((c) => c.shape === "arched")
    .map(
      (c) =>
        `<p>${t("curvedGlass")}: ${c.width.toFixed(1)} × ${c.height.toFixed(1)} mm · ${c.area.toFixed(3)} m² × ${c.quantity}</p>`,
    )
    .join("")}${result.glassPieces
    .filter((p) => p.vent)
    .map(
      (p) =>
        `<p>${t("fanOpening")} · ${t("panel")} ${p.panel}: Ø ${p.vent.diameter} mm · X ${p.vent.x} / Y ${p.vent.y} mm × ${p.quantity}</p>`,
    )
    .join(
      "",
    )}${result.glassPieces.some((p) => p.vent) ? `<p>${t("fanHint")}</p>` : ""}<h4>${t("handleSchedule")}</h4><div class="glass-pieces">${g.panels
    .filter((p) => !["fixed", "solid"].includes(p.mode))
    .map(
      (p) =>
        `<span>${t("face")} ${p.face + 1} / ${t("panel")} ${p.index + 1}: ${t(p.handle.type)} · ${t(p.handle.color)} · ${p.handle.height ? p.handle.height + " mm" : t("auto")} · +${p.handle.type === "none" ? 0 : p.handle.extraCost} × ${i.quantity}</span>`,
    )
    .join(
      "",
    )}</div><p>${t("cutReference")}</p>${d.shape === "corner" ? `<p>${t("connectorExcluded")}</p>` : ""}</section>`;
}
