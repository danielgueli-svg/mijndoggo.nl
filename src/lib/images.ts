export function unsplashSrc(
  id: string,
  width = 900,
  height = 720,
): string {
  const photo = id.startsWith("photo-") ? id : `photo-${id}`;
  return `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}

export function breedImageSrc(
  image: { unsplashId: string },
  width = 900,
  height = 720,
): string {
  return unsplashSrc(image.unsplashId, width, height);
}

export function unsplashSrcSet(id: string, heightRatio = 0.8): string {
  const widths = [400, 640, 900, 1280];
  return widths
    .map((w) => `${unsplashSrc(id, w, Math.round(w * heightRatio))} ${w}w`)
    .join(", ");
}
