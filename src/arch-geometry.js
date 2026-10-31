export function curveY(width, rise, inset, x) {
  const radius = (width * width) / (8 * rise) + rise / 2;
  return (
    radius -
    Math.sqrt(Math.max(0, (radius - inset) ** 2 - (x - width / 2) ** 2))
  );
}
// Sample only the curved boundary; areas are estimates for supplier templates.
export function curvedPane(width, rise, inset, left, right, top, bottom) {
  const radius = (width * width) / (8 * rise) + rise / 2;
  const half = Math.sqrt(
    Math.max(0, (radius - inset) ** 2 - Math.max(0, radius - bottom) ** 2),
  );
  left = Math.max(left, width / 2 - half);
  right = Math.min(right, width / 2 + half);
  if (right <= left || bottom <= top)
    return { points: [], area: 0, width: 0, height: 0 };
  const points = [];
  for (let j = 0; j <= 128; j++) {
    const x = left + ((right - left) * j) / 128;
    points.push([
      x,
      Math.min(bottom, Math.max(top, curveY(width, rise, inset, x))),
    ]);
  }
  points.push([right, bottom], [left, bottom]);
  let area = 0;
  points.forEach((p, j) => {
    const q = points[(j + 1) % points.length];
    area += p[0] * q[1] - q[0] * p[1];
  });
  return {
    points,
    area: Math.abs(area) / 2 / 1e6,
    width: right - left,
    height: bottom - Math.min(...points.map((p) => p[1])),
  };
}
export function archHead(
  width,
  rise,
  profile,
  gap,
  offset = 0,
  count = 1,
  ratio = 0.5,
  sideLeft = 0,
  sideRight = 0,
) {
  const bottom = rise + offset,
    inset = profile + gap;
  const bounds =
    count === 2
      ? [
          sideLeft,
          sideLeft + (width - sideLeft - sideRight) * ratio,
          width - sideRight,
        ]
      : Array.from(
          { length: count + 1 },
          (_, j) => sideLeft + (j * (width - sideLeft - sideRight)) / count,
        );
  const panes = bounds
    .slice(0, -1)
    .map((left, j) =>
      curvedPane(
        width,
        rise,
        inset,
        left + (j || sideLeft ? profile / 2 + gap : inset),
        bounds[j + 1] -
          (j < count - 1 || sideRight ? profile / 2 + gap : inset),
        inset,
        bottom - inset,
      ),
    );
  const dividers = bounds
    .slice(1, -1)
    .map((x) => ({ x, y: curveY(width, rise, profile, x), bottom }));
  return {
    bottom,
    panes,
    dividers,
    bodyLeft: sideLeft ? sideLeft + profile / 2 : profile,
    bodyRight: sideRight ? width - sideRight - profile / 2 : width - profile,
  };
}
