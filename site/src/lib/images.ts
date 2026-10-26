const UPLOAD = "/image/upload/";

const TRANSFORM_TOKEN =
  /^(?:c_(?:limit|fill|fit|scale|crop|pad|thumb)|f_auto|q_auto(?::[\w]+)?|q_\d+|g_(?:auto|face|center|faces)|w_\d+|h_\d+|dpr_\d+(?:\.\d+)?|fl_[\w]+|ar_[\d.:]+)$/;

function isTransformSegment(segment: string): boolean {
  if (!segment || /^v\d+$/.test(segment)) return false;
  const tokens = segment.split(",");
  return tokens.length > 0 && tokens.every((token) => TRANSFORM_TOKEN.test(token));
}

/** Drop a leading Cloudinary transform chain. Version segments and public ids stay. */
function stripTransforms(tail: string): string {
  const parts = tail.split("/");
  let index = 0;
  while (index < parts.length && isTransformSegment(parts[index])) index += 1;
  return parts.slice(index).join("/");
}

/** Delivery URL for a Cloudinary image. Local paths are returned unchanged. */
export function cloudinaryUrl(src: string, width: number): string {
  const at = src.indexOf(UPLOAD);
  if (at < 0) return src;
  const widthPx = Math.max(16, Math.round(width));
  const head = src.slice(0, at + UPLOAD.length);
  const tail = stripTransforms(src.slice(at + UPLOAD.length));
  return `${head}c_limit,w_${widthPx}/f_auto/q_auto/${tail}`;
}

/** srcset for a Cloudinary image. Undefined for files we already host. */
export function cloudinarySrcSet(src: string, widths: number[]): string | undefined {
  if (!src.includes(UPLOAD)) return undefined;
  return widths.map((width) => `${cloudinaryUrl(src, width)} ${Math.round(width)}w`).join(", ");
}
