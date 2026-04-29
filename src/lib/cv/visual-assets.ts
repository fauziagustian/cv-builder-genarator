export type DocumentKind = "cv" | "cover-letter";

export type StoredVisualAsset = {
  dataUrl: string;
  fileName: string;
  mimeType: "image/jpeg" | "image/png";
  width: number;
  height: number;
};

export type VisualAssetKind = "profilePhoto" | "signature";

export type CvVisualAssets = {
  profilePhoto: StoredVisualAsset | null;
  signature: StoredVisualAsset | null;
};

export function createEmptyVisualAssets(): CvVisualAssets {
  return {
    profilePhoto: null,
    signature: null,
  };
}

export function fitWithinBox(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
) {
  if (width <= 0 || height <= 0) {
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

export function resolveDocxImageType(
  mimeType: StoredVisualAsset["mimeType"]
): "jpg" | "png" {
  return mimeType === "image/png" ? "png" : "jpg";
}

function isStoredVisualAsset(value: unknown): value is StoredVisualAsset {
  if (!value || typeof value !== "object") {
    return false;
  }

  const asset = value as Partial<StoredVisualAsset>;

  return (
    typeof asset.dataUrl === "string" &&
    /^data:image\/(png|jpeg);base64,/i.test(asset.dataUrl) &&
    typeof asset.fileName === "string" &&
    (asset.mimeType === "image/png" || asset.mimeType === "image/jpeg") &&
    typeof asset.width === "number" &&
    asset.width > 0 &&
    typeof asset.height === "number" &&
    asset.height > 0
  );
}

export function hydrateVisualAssets(
  value?: Partial<CvVisualAssets> | null
): CvVisualAssets {
  return {
    profilePhoto: isStoredVisualAsset(value?.profilePhoto)
      ? value.profilePhoto
      : null,
    signature: isStoredVisualAsset(value?.signature) ? value.signature : null,
  };
}

export function estimateAssetSize(asset: StoredVisualAsset | null) {
  if (!asset) {
    return 0;
  }

  const base64 = asset.dataUrl.split(",")[1] || "";
  return Math.round((base64.length * 3) / 4);
}
