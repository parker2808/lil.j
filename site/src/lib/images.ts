const UPLOAD = "/image/upload/";
const CLOUD_BASE = "https://res.cloudinary.com/oiounrmh/image/upload/";

/** A stored public id (`lilj/care/01_…`) or an existing delivery URL. Local files stay local. */
function toDeliveryUrl(src: string): string | null {
  if (src.includes(UPLOAD)) return src;
  if (src.startsWith("lilj/")) return `${CLOUD_BASE}${src}`;
  return null;
}

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
  const resolved = toDeliveryUrl(src);
  if (!resolved) return src;
  const at = resolved.indexOf(UPLOAD);
  const widthPx = Math.max(16, Math.round(width));
  const head = resolved.slice(0, at + UPLOAD.length);
  const tail = stripTransforms(resolved.slice(at + UPLOAD.length));
  return `${head}c_limit,w_${widthPx}/f_auto/q_auto/${tail}`;
}

/** srcset for a Cloudinary image. Undefined for files we already host. */
export function cloudinarySrcSet(src: string, widths: number[]): string | undefined {
  if (!toDeliveryUrl(src)) return undefined;
  return widths.map((width) => `${cloudinaryUrl(src, width)} ${Math.round(width)}w`).join(", ");
}
