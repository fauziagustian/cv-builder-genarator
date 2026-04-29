import type {
  StoredVisualAsset,
  VisualAssetKind,
} from "@/lib/cv/visual-assets";

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal membaca file gambar."));
    };

    reader.onerror = () => {
      reject(new Error("Gagal membaca file gambar."));
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar tidak bisa diproses."));
    image.src = dataUrl;
  });
}

function fitDimensions(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export async function prepareVisualAsset(
  file: File,
  kind: VisualAssetKind
): Promise<StoredVisualAsset> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const isSignature = kind === "signature";
  const outputMimeType = isSignature ? "image/png" : "image/jpeg";
  const maxWidth = isSignature ? 900 : 640;
  const maxHeight = isSignature ? 280 : 640;
  const dimensions = fitDimensions(
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    maxWidth,
    maxHeight
  );
  const canvas = document.createElement("canvas");

  canvas.width = dimensions.width;
  canvas.height = dimensions.height;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Browser tidak mendukung canvas untuk memproses gambar.");
  }

  if (!isSignature) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const optimizedDataUrl = isSignature
    ? canvas.toDataURL(outputMimeType)
    : canvas.toDataURL(outputMimeType, 0.86);

  return {
    dataUrl: optimizedDataUrl,
    fileName: file.name,
    mimeType: outputMimeType,
    width: canvas.width,
    height: canvas.height,
  };
}
