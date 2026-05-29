'use client';

// Downscale to a max long edge and re-encode as JPEG so uploads stay small
// even when a parent attaches a full-resolution phone photo. Falls back to the
// original file if the browser cannot use a canvas.
export async function compressImage(file: File, maxEdge = 1600, quality = 0.8): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    return await new Promise<Blob>((resolve) => {
      canvas.toBlob((b) => resolve(b ?? file), 'image/jpeg', quality);
    });
  } catch {
    return file;
  }
}
