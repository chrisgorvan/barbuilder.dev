import type { IconShape, IconFillState } from "./types.js";

// Render a single icon shape as SVG path
export function renderIcon(
  x: number,
  y: number,
  size: number,
  shape: IconShape,
  fillState: IconFillState,
  color: string,
): string {
  switch (shape) {
    case "star":
      return renderStar(x, y, size, fillState, color);
    case "circle":
      return renderCircle(x, y, size, fillState, color);
    case "heart":
      return renderHeart(x, y, size, fillState, color);
    case "8bit-heart":
      return render8BitHeart(x, y, size, fillState, color);
    default:
      return renderStar(x, y, size, fillState, color);
  }
}

/**
 * Transform Bootstrap Icon path from 16x16 viewBox to our coordinate space
 * @param path - SVG path string from Bootstrap Icons
 * @param x - Center X coordinate
 * @param y - Center Y coordinate
 * @param size - Icon radius/size (8px default)
 * @returns Transformed path string
 */
function transformPath(
  path: string,
  x: number,
  y: number,
  size: number,
): string {
  // Bootstrap Icons use 16x16 viewBox, centered at (8, 8)
  // We want to scale and translate to our coordinate space
  // Scale: size*2 / 16 (e.g., 8*2=16, so scale = 1.0 for default size)
  const scale = (size * 2) / 16;
  const offsetX = x - size; // Top-left X
  const offsetY = y - size; // Top-left Y

  // Use SVG transform attribute
  return `transform="translate(${offsetX.toFixed(2)},${offsetY.toFixed(2)}) scale(${scale.toFixed(3)})"`;
}

/**
 * Wrap path with group and color
 */
function wrapPath(pathData: string, transform: string, color: string): string {
  return `<g ${transform}><path d="${pathData}" fill="${color}"/></g>`;
}

/**
 * Create clip-path for half-filled icons (left 50%)
 */
function createHalfClipPath(x: number, y: number, size: number): string {
  const clipId = `half-clip-${x.toFixed(0)}-${y.toFixed(0)}`;
  const left = x - size;
  const top = y - size;
  const width = size; // Only left half
  const height = size * 2;

  return `<defs><clipPath id="${clipId}"><rect x="${left.toFixed(2)}" y="${top.toFixed(2)}" width="${width.toFixed(2)}" height="${height.toFixed(2)}"/></clipPath></defs>`;
}

function renderStar(
  x: number,
  y: number,
  size: number,
  fillState: IconFillState,
  color: string,
): string {
  const transform = transformPath("", x, y, size);

  if (fillState === "filled") {
    // star-fill.svg
    const path =
      "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z";
    return wrapPath(path, transform, color);
  } else if (fillState === "half") {
    // star-half.svg
    const path =
      "M5.354 5.119 7.538.792A.52.52 0 0 1 8 .5c.183 0 .366.097.465.292l2.184 4.327 4.898.696A.54.54 0 0 1 16 6.32a.55.55 0 0 1-.17.445l-3.523 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256a.5.5 0 0 1-.146.05c-.342.06-.668-.254-.6-.642l.83-4.73L.173 6.765a.55.55 0 0 1-.172-.403.6.6 0 0 1 .085-.302.51.51 0 0 1 .37-.245zM8 12.027a.5.5 0 0 1 .232.056l3.686 1.894-.694-3.957a.56.56 0 0 1 .162-.505l2.907-2.77-4.052-.576a.53.53 0 0 1-.393-.288L8.001 2.223 8 2.226z";
    return wrapPath(path, transform, color);
  } else {
    // star.svg (unfilled)
    const path =
      "M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.56.56 0 0 0-.163-.505L1.71 6.745l4.052-.576a.53.53 0 0 0 .393-.288L8 2.223l1.847 3.658a.53.53 0 0 0 .393.288l4.052.575-2.906 2.77a.56.56 0 0 0-.163.506l.694 3.957-3.686-1.894a.5.5 0 0 0-.461 0z";
    return wrapPath(path, transform, color);
  }
}

function renderHeart(
  x: number,
  y: number,
  size: number,
  fillState: IconFillState,
  color: string,
): string {
  const transform = transformPath("", x, y, size);

  if (fillState === "filled") {
    // heart-fill.svg
    const path =
      "M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314";
    return wrapPath(path, transform, color);
  } else if (fillState === "half") {
    // heart-half.svg
    const path =
      "M8 2.748v11.047c3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15";
    return wrapPath(path, transform, color);
  } else {
    // heart.svg (unfilled)
    const path =
      "m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15";
    return wrapPath(path, transform, color);
  }
}

function renderCircle(
  x: number,
  y: number,
  size: number,
  fillState: IconFillState,
  color: string,
): string {
  const transform = transformPath("", x, y, size);

  if (fillState === "filled") {
    // circle-fill.svg
    const path = "M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0";
    return wrapPath(path, transform, color);
  } else if (fillState === "half") {
    // circle-half.svg
    const path = "M8 15A7 7 0 1 0 8 1zm0 1A8 8 0 1 1 8 0a8 8 0 0 1 0 16";
    return wrapPath(path, transform, color);
  } else {
    // circle.svg (unfilled)
    const path =
      "M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16";
    return wrapPath(path, transform, color);
  }
}

function render8BitHeart(
  x: number,
  y: number,
  size: number,
  fillState: IconFillState,
  color: string,
): string {
  // The 8-bit heart pixel art spans x:2-13, y:2-11 (11 wide, 9 tall) within
  // the 16x16 coordinate space. Scale up so the visual width matches standard
  // 16x16 icons (like the regular heart).
  const contentWidth = 11;
  const contentCenterX = 7.5; // (2+13)/2
  const contentCenterY = 6.5; // (2+11)/2
  const scale = (size * 2) / contentWidth;
  const offsetX = x - contentCenterX * scale;
  const offsetY = y - contentCenterY * scale;
  const transform = `transform="translate(${offsetX.toFixed(2)},${offsetY.toFixed(2)}) scale(${scale.toFixed(3)})"`;

  // Black outline path (pixel art border). Both top bumps are 3 cells wide
  // and the silhouette is symmetric across x=7.
  const outlinePath =
    "M4,2 h2 v1 h2 v-1 h3 v1 h1 v1 h1 v2 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-2 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-2 h1 v-1 h1 v-1 z";

  // Colored fill path — inset by 1 pixel from the outline silhouette on all
  // sides, so the black border reads as a uniform 1-pixel ring around the
  // coloured interior (including the gap below the top bumps).
  const fillPath =
    "M3,3 h3 v1 h2 v-1 h3 v1 h1 v2 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-2 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-2 h1 v-1 z";

  if (fillState === "filled") {
    return (
      wrapPath(outlinePath, transform, "#000000") +
      wrapPath(fillPath, transform, color)
    );
  } else if (fillState === "half") {
    const clipId = `half-clip-${x.toFixed(0)}-${y.toFixed(0)}`;
    const clipPathDef = createHalfClipPath(x, y, size);
    return (
      clipPathDef +
      wrapPath(outlinePath, transform, "#000000") +
      `<g ${transform} clip-path="url(#${clipId})"><path d="${fillPath}" fill="${color}"/></g>`
    );
  } else {
    return wrapPath(outlinePath, transform, "#000000");
  }
}
