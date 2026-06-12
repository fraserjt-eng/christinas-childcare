// Browser-side image downscale for the /preview layer.
// A real phone photo is 2-5 MB. The demo store persists to localStorage, so
// raw photos would blow the quota in a few uploads. We draw the picked file
// onto a canvas capped at maxPx on the long edge and export a small JPEG data
// URL (~30-80 KB), which persists fine and survives reload. This mirrors what
// the real app does: resize before uploading to the child_photos bucket.

export async function fileToDataUrl(
  file: File,
  maxPx = 800,
  quality = 0.72,
): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = dataUrl;
    });

    const longEdge = Math.max(img.width, img.height);
    const scale = longEdge > maxPx ? maxPx / longEdge : 1;
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return null;
  }
}
