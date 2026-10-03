/** Shrink a local photo to a JPEG data URL so localStorage stays usable. */
export async function compressImage(file: File, max = 720, quality = 0.72): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kon de foto niet verkleinen.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export type LocalPhoto = {
  url: string;
  alt: string;
};

export async function filesToPhotos(
  files: FileList | null,
  current: LocalPhoto[],
  alt: string,
  maxCount = 3,
): Promise<{ photos: LocalPhoto[]; error?: string }> {
  if (!files?.length) return { photos: current };
  const next = [...current];
  for (const file of Array.from(files)) {
    if (next.length >= maxCount) break;
    if (!file.type.startsWith("image/")) {
      return { photos: next, error: "Alleen foto’s, geen pdf’tjes." };
    }
    try {
      next.push({ url: await compressImage(file), alt });
    } catch {
      return {
        photos: next,
        error: "Die foto wilde niet meewerken. Probeer een kleinere jpg of png.",
      };
    }
  }
  return { photos: next };
}
