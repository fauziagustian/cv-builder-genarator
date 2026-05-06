type DraftWithName<T> = T & {
  id: string;
  draftName?: string;
  starterName?: string;
};

export const ACTIVE_DRAFT_STORAGE_KEY = "cv-docx-generator-draft-v1";
export const NAMED_DRAFTS_STORAGE_KEY = "cv-docx-generator-named-drafts-v1";
export const CUSTOM_STARTERS_STORAGE_KEY =
  "cv-docx-generator-custom-starters-v1";

export type NamedDraftSummary = {
  id: string;
  draftName: string;
  savedAt: string;
};

export type NamedStarterSummary = {
  id: string;
  starterName: string;
  savedAt: string;
};

function slugifyDraftName(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "draft"
  );
}

function sortBySavedAtDescending<T extends { savedAt?: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftTime = left.savedAt ? new Date(left.savedAt).getTime() : 0;
    const rightTime = right.savedAt ? new Date(right.savedAt).getTime() : 0;
    return rightTime - leftTime;
  });
}

function readNamedMap<T>(storage: Storage, storageKey: string) {
  const raw = storage.getItem(storageKey);

  if (!raw) {
    return {} as Record<string, DraftWithName<T>>;
  }

  const parsed = JSON.parse(raw) as Record<string, DraftWithName<T>>;
  return parsed && typeof parsed === "object" ? parsed : {};
}

export function listNamedDrafts<T>(storage: Storage): NamedDraftSummary[] {
  const map = readNamedMap<T>(storage, NAMED_DRAFTS_STORAGE_KEY);

  return sortBySavedAtDescending(
    Object.values(map).map((entry) => ({
      id: entry.id,
      draftName: entry.draftName || "Untitled Draft",
      savedAt: (entry as { savedAt?: string }).savedAt || "",
    }))
  );
}

export function saveNamedDraft<T extends { savedAt: string }>(
  storage: Storage,
  draftName: string,
  snapshot: T
) {
  const normalizedName = draftName.trim() || "Untitled Draft";
  const id = slugifyDraftName(normalizedName);
  const map = readNamedMap<T>(storage, NAMED_DRAFTS_STORAGE_KEY);
  const entry: DraftWithName<T> = {
    ...snapshot,
    id,
    draftName: normalizedName,
  };

  map[id] = entry;
  storage.setItem(NAMED_DRAFTS_STORAGE_KEY, JSON.stringify(map));
  return entry;
}

export function loadNamedDraft<T>(storage: Storage, id: string) {
  const map = readNamedMap<T>(storage, NAMED_DRAFTS_STORAGE_KEY);
  return map[id] || null;
}

export function deleteNamedDraft<T>(storage: Storage, id: string) {
  const map = readNamedMap<T>(storage, NAMED_DRAFTS_STORAGE_KEY);
  if (!map[id]) {
    return false;
  }

  delete map[id];
  storage.setItem(NAMED_DRAFTS_STORAGE_KEY, JSON.stringify(map));
  return true;
}

export function listNamedStarters<T>(storage: Storage): NamedStarterSummary[] {
  const map = readNamedMap<T>(storage, CUSTOM_STARTERS_STORAGE_KEY);

  return sortBySavedAtDescending(
    Object.values(map).map((entry) => ({
      id: entry.id,
      starterName: entry.starterName || "Untitled Starter",
      savedAt: (entry as { savedAt?: string }).savedAt || "",
    }))
  );
}

export function saveNamedStarter<T extends { savedAt: string }>(
  storage: Storage,
  starterName: string,
  snapshot: T
) {
  const normalizedName = starterName.trim() || "Untitled Starter";
  const id = slugifyDraftName(normalizedName);
  const map = readNamedMap<T>(storage, CUSTOM_STARTERS_STORAGE_KEY);
  const entry: DraftWithName<T> = {
    ...snapshot,
    id,
    starterName: normalizedName,
  };

  map[id] = entry;
  storage.setItem(CUSTOM_STARTERS_STORAGE_KEY, JSON.stringify(map));
  return entry;
}

export function loadNamedStarter<T>(storage: Storage, id: string) {
  const map = readNamedMap<T>(storage, CUSTOM_STARTERS_STORAGE_KEY);
  return map[id] || null;
}

export function deleteNamedStarter<T>(storage: Storage, id: string) {
  const map = readNamedMap<T>(storage, CUSTOM_STARTERS_STORAGE_KEY);
  if (!map[id]) {
    return false;
  }

  delete map[id];
  storage.setItem(CUSTOM_STARTERS_STORAGE_KEY, JSON.stringify(map));
  return true;
}
