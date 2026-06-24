"use client";

// Downscale + re-encode an image to a small WebP data URL entirely in the browser,
// so we never upload the original (often multi-MB) file. Used for club logos.
export async function compressImageToWebpDataUrl(
  file: File,
  maxSize = 400,
  quality = 0.82
): Promise<string> {
  const image = await loadImage(file);
  const { width, height } = fitWithin(image.naturalWidth, image.naturalHeight, maxSize);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context is not available.");

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/webp", quality);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Bild konnte nicht gelesen werden."));
    };
    image.src = objectUrl;
  });
}

function fitWithin(width: number, height: number, maxSize: number) {
  if (width <= maxSize && height <= maxSize) return { width, height };
  const scale = Math.min(maxSize / width, maxSize / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}
