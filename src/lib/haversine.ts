const EARTH_RADIUS_KM = 6371;
const MAX_DISTANCE_KM = 20000;

export function haversineDistanceKm(
  a: { LABEL_Y: number; LABEL_X: number },
  b: { LABEL_Y: number; LABEL_X: number },
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.LABEL_Y - a.LABEL_Y);
  const dLng = toRad(b.LABEL_X - a.LABEL_X);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.LABEL_Y)) * Math.cos(toRad(b.LABEL_Y)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function distanceToProximity(km: number): number {
  return Math.max(0, 1 - km / MAX_DISTANCE_KM);
}

export function proximityToColor(proximity: number): string {
  // 0 (far) = white, 0.5 = blue, 1 (close) = red
  let r: number, g: number, b: number;
  if (proximity < 0.5) {
    // white (255,255,255) → blue (0,0,255)
    const t = proximity / 0.5;
    r = Math.round(255 * (1 - t));
    g = Math.round(255 * (1 - t));
    b = 255;
  } else {
    // blue (0,0,255) → red (255,0,0)
    const t = (proximity - 0.5) / 0.5;
    r = Math.round(255 * t);
    g = 0;
    b = Math.round(255 * (1 - t));
  }
  return `rgb(${r}, ${g}, ${b})`;
}
