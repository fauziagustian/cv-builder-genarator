"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  buildCoverLetterMarkdown,
  createInitialCoverLetterForm,
  type CommunicationLanguage,
  type CoverLetterForm,
} from "@/lib/cv/cover-letter";
import {
  ACTIVE_DRAFT_STORAGE_KEY,
  deleteNamedStarter,
  deleteNamedDraft,
  listNamedDrafts,
  listNamedStarters,
  loadNamedDraft,
  loadNamedStarter,
  saveNamedDraft,
  saveNamedStarter,
  type NamedDraftSummary,
  type NamedStarterSummary,
} from "@/lib/cv/drafts";
import {
  DOCX_TEMPLATE_OPTIONS,
  type DocxTemplate,
} from "@/lib/cv/docx-templates";
import {
  buildAtsMarkdown,
  buildMinimalMarkdown,
  buildProfessionalMarkdown,
  createEmptyAtsExperience,
  createEmptyEducation,
  createEmptyExperience,
  createInitialAtsCvForm,
  createInitialMarkdownCv,
  createInitialMinimalCvForm,
  createInitialProfessionalCvForm,
  getSampleProfileDefaults,
  SAMPLE_PROFILE_OPTIONS,
  type AtsCvForm,
  type AtsExperience,
  type CvEducation,
  type CvExperience,
  type CvInputMode,
  type MinimalCvForm,
  type ProfessionalCvForm,
  type ProfessionalSkills,
  type SampleProfileId,
} from "@/lib/cv/formats";
import {
  analyzeCvJobMatch,
  analyzeJobDescription,
  tailorAtsCvForm,
  tailorMarkdownContent,
  tailorMinimalCvForm,
  tailorProfessionalCvForm,
} from "@/lib/cv/tailor";
import { buildRecruiterMessage } from "@/lib/cv/recruiter-message";
import { prepareVisualAsset } from "@/lib/cv/visual-assets-client";
import {
  createEmptyVisualAssets,
  estimateAssetSize,
  hydrateVisualAssets,
  type CvVisualAssets,
  type DocumentKind,
  type StoredVisualAsset,
  type VisualAssetKind,
} from "@/lib/cv/visual-assets";

const INPUT_MODES: Array<{
  id: CvInputMode;
  label: string;
  title: string;
  description: string;
}> = [
  {
    id: "professional",
    label: "Full CV Form",
    title: "Professional CV",
    description:
      "Form lengkap untuk CV detail dengan section skill, experience, achievements, education, dan languages.",
  },
  {
    id: "ats",
    label: "ATS Form",
    title: "ATS / Targeted CV",
    description:
      "Form untuk CV yang lebih singkat dan tajam, cocok disesuaikan ke job description tertentu.",
  },
  {
    id: "minimal",
    label: "Minimal Form",
    title: "Minimal One-Page CV",
    description:
      "Form ringkas untuk resume singkat satu halaman dengan fokus ke poin paling penting.",
  },
  {
    id: "markdown",
    label: "Markdown",
    title: "Freeform Markdown",
    description:
      "Mode bebas untuk paste CV dalam Markdown atau plain text lalu langsung generate DOCX.",
  },
];

const DEFAULT_SAMPLE_PROFILE: SampleProfileId = "fullstack";
const DEFAULT_SAMPLE_META = getSampleProfileDefaults(DEFAULT_SAMPLE_PROFILE);

type DraftSnapshot = {
  savedAt: string;
  sampleProfile: SampleProfileId;
  activeStarterKind: "built-in" | "custom";
  activeCustomStarterId: string | null;
  activeCustomStarterName: string | null;
  fileName: string;
  inputMode: CvInputMode;
  selectedTemplate: DocxTemplate;
  communicationLanguage: CommunicationLanguage;
  visualAssets: CvVisualAssets;
  jobDescription: string;
  markdown: string;
  professionalForm: ProfessionalCvForm;
  atsForm: AtsCvForm;
  minimalForm: MinimalCvForm;
  coverLetterForm: CoverLetterForm;
};

type ImportedSnapshot = Partial<DraftSnapshot> & {
  draftName?: string;
};

type PreviewPanel = "cv" | "cover-letter" | "recruiter" | "insights";

type CustomStarterSnapshot = {
  savedAt: string;
  sampleProfile: SampleProfileId;
  fileName: string;
  draftName: string;
  markdown: string;
  professionalForm: ProfessionalCvForm;
  atsForm: AtsCvForm;
  minimalForm: MinimalCvForm;
};

function isSampleProfileId(value: string): value is SampleProfileId {
  return SAMPLE_PROFILE_OPTIONS.some((profile) => profile.id === value);
}

function formatSavedTime(value: string | null) {
  if (!value) {
    return "Belum ada draft tersimpan.";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Draft lokal tersedia.";
  }

  return `Tersimpan lokal: ${new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)}`;
}

function formatAssetBytes(bytes: number) {
  if (bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function describeVisualAsset(asset: StoredVisualAsset | null) {
  if (!asset) {
    return "Belum ada file.";
  }

  return `${asset.width}x${asset.height}px • ${formatAssetBytes(
    estimateAssetSize(asset)
  )}`;
}

function hydrateProfessionalForm(
  snapshot?: Partial<ProfessionalCvForm>,
  sampleProfile: SampleProfileId = DEFAULT_SAMPLE_PROFILE
): ProfessionalCvForm {
  const defaults = createInitialProfessionalCvForm(sampleProfile);

  if (!snapshot) {
    return defaults;
  }

  return {
    ...defaults,
    ...snapshot,
    skills: {
      ...defaults.skills,
      ...snapshot.skills,
    },
    experiences:
      Array.isArray(snapshot.experiences) && snapshot.experiences.length > 0
        ? snapshot.experiences.map((item) => ({
            ...createEmptyExperience(),
            ...item,
          }))
        : defaults.experiences,
    education:
      Array.isArray(snapshot.education) && snapshot.education.length > 0
        ? snapshot.education.map((item) => ({
            ...createEmptyEducation(),
            ...item,
          }))
        : defaults.education,
  };
}

function hydrateAtsForm(
  snapshot?: Partial<AtsCvForm>,
  sampleProfile: SampleProfileId = DEFAULT_SAMPLE_PROFILE
): AtsCvForm {
  const defaults = createInitialAtsCvForm(sampleProfile);

  if (!snapshot) {
    return defaults;
  }

  return {
    ...defaults,
    ...snapshot,
    experiences:
      Array.isArray(snapshot.experiences) && snapshot.experiences.length > 0
        ? snapshot.experiences.map((item) => ({
            ...createEmptyAtsExperience(),
            ...item,
          }))
        : defaults.experiences,
  };
}

function hydrateMinimalForm(
  snapshot?: Partial<MinimalCvForm>,
  sampleProfile: SampleProfileId = DEFAULT_SAMPLE_PROFILE
): MinimalCvForm {
  return {
    ...createInitialMinimalCvForm(sampleProfile),
    ...snapshot,
  };
}

function hydrateCoverLetterForm(
  snapshot?: Partial<CoverLetterForm>
): CoverLetterForm {
  return {
    ...createInitialCoverLetterForm(),
    ...snapshot,
  };
}

function Field({
  id,
  label,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-row">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function Area({
  id,
  label,
  value,
  placeholder,
  rows = 6,
  compact = false,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  compact?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="form-row">
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        rows={rows}
        className={`textarea ${compact ? "textarea-compact" : ""}`.trim()}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function CvDocxGenerator() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement | null>(null);
  const signatureInputRef = useRef<HTMLInputElement | null>(null);
  const [sampleProfile, setSampleProfile] =
    useState<SampleProfileId>(DEFAULT_SAMPLE_PROFILE);
  const [activeStarterKind, setActiveStarterKind] = useState<
    "built-in" | "custom"
  >("built-in");
  const [activeCustomStarterId, setActiveCustomStarterId] = useState<
    string | null
  >(null);
  const [activeCustomStarterName, setActiveCustomStarterName] = useState<
    string | null
  >(null);
  const [fileName, setFileName] = useState(DEFAULT_SAMPLE_META.fileName);
  const [draftName, setDraftName] = useState(DEFAULT_SAMPLE_META.draftName);
  const [customStarterName, setCustomStarterName] = useState(
    "my-custom-starter"
  );
  const [namedDrafts, setNamedDrafts] = useState<NamedDraftSummary[]>([]);
  const [customStarters, setCustomStarters] = useState<NamedStarterSummary[]>(
    []
  );
  const [inputMode, setInputMode] = useState<CvInputMode>("professional");
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocxTemplate>("classic");
  const [communicationLanguage, setCommunicationLanguage] =
    useState<CommunicationLanguage>("en");
  const [visualAssets, setVisualAssets] = useState<CvVisualAssets>(
    createEmptyVisualAssets
  );
  const [jobDescription, setJobDescription] = useState("");
  const [markdown, setMarkdown] = useState(() =>
    createInitialMarkdownCv(DEFAULT_SAMPLE_PROFILE)
  );
  const [professionalForm, setProfessionalForm] = useState<ProfessionalCvForm>(
    () => createInitialProfessionalCvForm(DEFAULT_SAMPLE_PROFILE)
  );
  const [atsForm, setAtsForm] = useState<AtsCvForm>(() =>
    createInitialAtsCvForm(DEFAULT_SAMPLE_PROFILE)
  );
  const [minimalForm, setMinimalForm] = useState<MinimalCvForm>(
    () => createInitialMinimalCvForm(DEFAULT_SAMPLE_PROFILE)
  );
  const [coverLetterForm, setCoverLetterForm] = useState<CoverLetterForm>(
    createInitialCoverLetterForm
  );
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activePreviewPanel, setActivePreviewPanel] =
    useState<PreviewPanel>("cv");

  const activeMode =
    INPUT_MODES.find((mode) => mode.id === inputMode) || INPUT_MODES[0];
  const activeSampleOption =
    SAMPLE_PROFILE_OPTIONS.find((profile) => profile.id === sampleProfile) ||
    SAMPLE_PROFILE_OPTIONS[0];
  const activeStarterLabel =
    activeStarterKind === "custom" && activeCustomStarterName
      ? activeCustomStarterName
      : activeSampleOption.title;
  const tailoring = analyzeJobDescription(jobDescription);

  const generatedMarkdown =
    inputMode === "professional"
      ? buildProfessionalMarkdown(professionalForm)
      : inputMode === "ats"
        ? buildAtsMarkdown(atsForm)
        : inputMode === "minimal"
          ? buildMinimalMarkdown(minimalForm)
          : markdown;
  const generatedCoverLetter = buildCoverLetterMarkdown({
    inputMode,
    professionalForm,
    atsForm,
    minimalForm,
    markdown,
    tailoring,
    coverLetterForm,
    language: communicationLanguage,
  });
  const recruiterMessage = buildRecruiterMessage({
    inputMode,
    professionalForm,
    atsForm,
    minimalForm,
    markdown,
    tailoring,
    coverLetterForm,
    language: communicationLanguage,
  });
  const matchAnalysis = analyzeCvJobMatch(generatedMarkdown, tailoring);

  const buildSnapshot = useCallback(
    (savedAt: string): DraftSnapshot => ({
      savedAt,
      sampleProfile,
      activeStarterKind,
      activeCustomStarterId,
      activeCustomStarterName,
      fileName,
      inputMode,
      selectedTemplate,
      communicationLanguage,
      visualAssets,
      jobDescription,
      markdown,
      professionalForm,
      atsForm,
      minimalForm,
      coverLetterForm,
    }),
    [
      atsForm,
      activeCustomStarterId,
      activeCustomStarterName,
      activeStarterKind,
      communicationLanguage,
      coverLetterForm,
      fileName,
      inputMode,
      jobDescription,
      markdown,
      minimalForm,
      professionalForm,
      sampleProfile,
      selectedTemplate,
      visualAssets,
    ]
  );

  const applySnapshot = useCallback((snapshot: ImportedSnapshot) => {
    const resolvedSampleProfile =
      typeof snapshot.sampleProfile === "string" &&
      isSampleProfileId(snapshot.sampleProfile)
        ? snapshot.sampleProfile
        : DEFAULT_SAMPLE_PROFILE;

    setSampleProfile(resolvedSampleProfile);
    setActiveStarterKind(
      snapshot.activeStarterKind === "custom" ? "custom" : "built-in"
    );
    setActiveCustomStarterId(snapshot.activeCustomStarterId || null);
    setActiveCustomStarterName(snapshot.activeCustomStarterName || null);

    if (typeof snapshot.fileName === "string") {
      setFileName(snapshot.fileName);
    }

    if (
      typeof snapshot.inputMode === "string" &&
      INPUT_MODES.some((mode) => mode.id === snapshot.inputMode)
    ) {
      setInputMode(snapshot.inputMode);
    }

    if (
      typeof snapshot.selectedTemplate === "string" &&
      DOCX_TEMPLATE_OPTIONS.some(
        (template) => template.id === snapshot.selectedTemplate
      )
    ) {
      setSelectedTemplate(snapshot.selectedTemplate);
    }

    if (
      typeof snapshot.communicationLanguage === "string" &&
      ["en", "id"].includes(snapshot.communicationLanguage)
    ) {
      setCommunicationLanguage(snapshot.communicationLanguage);
    }

    setVisualAssets(hydrateVisualAssets(snapshot.visualAssets));

    if (typeof snapshot.jobDescription === "string") {
      setJobDescription(snapshot.jobDescription);
    }

    if (typeof snapshot.markdown === "string") {
      setMarkdown(snapshot.markdown);
    } else {
      setMarkdown(createInitialMarkdownCv(resolvedSampleProfile));
    }

    setProfessionalForm(
      hydrateProfessionalForm(snapshot.professionalForm, resolvedSampleProfile)
    );
    setAtsForm(hydrateAtsForm(snapshot.atsForm, resolvedSampleProfile));
    setMinimalForm(
      hydrateMinimalForm(snapshot.minimalForm, resolvedSampleProfile)
    );
    setCoverLetterForm(hydrateCoverLetterForm(snapshot.coverLetterForm));

    if (typeof snapshot.draftName === "string" && snapshot.draftName.trim()) {
      setDraftName(snapshot.draftName.trim());
    }

    if (typeof snapshot.savedAt === "string") {
      setLastSavedAt(snapshot.savedAt);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY);
        setNamedDrafts(listNamedDrafts<DraftSnapshot>(window.localStorage));
        setCustomStarters(
          listNamedStarters<CustomStarterSnapshot>(window.localStorage)
        );

        if (!raw) {
          setIsDraftReady(true);
          return;
        }

        const snapshot = JSON.parse(raw) as Partial<DraftSnapshot>;
        applySnapshot(snapshot);
        setHasSavedDraft(true);
      } catch {
        setError(
          "Draft lokal ada tetapi gagal dibaca. Kamu bisa lanjut edit dari template."
        );
      } finally {
        setIsDraftReady(true);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [applySnapshot]);

  useEffect(() => {
    if (!isDraftReady || typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();
        const snapshot = buildSnapshot(savedAt);

        window.localStorage.setItem(
          ACTIVE_DRAFT_STORAGE_KEY,
          JSON.stringify(snapshot)
        );
        setHasSavedDraft(true);
        setLastSavedAt(savedAt);
      } catch {
        setError(
          "Auto-save draft gagal disimpan. Coba kecilkan ukuran gambar atau hapus asset visual yang tidak diperlukan."
        );
      }
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [buildSnapshot, isDraftReady]);

  function updateProfessionalField<K extends keyof ProfessionalCvForm>(
    field: K,
    value: ProfessionalCvForm[K]
  ) {
    setProfessionalForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateProfessionalSkill<K extends keyof ProfessionalSkills>(
    field: K,
    value: ProfessionalSkills[K]
  ) {
    setProfessionalForm((current) => ({
      ...current,
      skills: {
        ...current.skills,
        [field]: value,
      },
    }));
  }

  function updateProfessionalExperience(
    index: number,
    field: keyof CvExperience,
    value: string
  ) {
    setProfessionalForm((current) => ({
      ...current,
      experiences: current.experiences.map((experience, currentIndex) =>
        currentIndex === index
          ? {
              ...experience,
              [field]: value,
            }
          : experience
      ),
    }));
  }

  function updateProfessionalEducation(
    index: number,
    field: keyof CvEducation,
    value: string
  ) {
    setProfessionalForm((current) => ({
      ...current,
      education: current.education.map((education, currentIndex) =>
        currentIndex === index
          ? {
              ...education,
              [field]: value,
            }
          : education
      ),
    }));
  }

  function updateAtsField<K extends keyof AtsCvForm>(
    field: K,
    value: AtsCvForm[K]
  ) {
    setAtsForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateAtsExperience(
    index: number,
    field: keyof AtsExperience,
    value: string
  ) {
    setAtsForm((current) => ({
      ...current,
      experiences: current.experiences.map((experience, currentIndex) =>
        currentIndex === index
          ? {
              ...experience,
              [field]: value,
            }
          : experience
      ),
    }));
  }

  function updateMinimalField<K extends keyof MinimalCvForm>(
    field: K,
    value: MinimalCvForm[K]
  ) {
    setMinimalForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateCoverLetterField<K extends keyof CoverLetterForm>(
    field: K,
    value: CoverLetterForm[K]
  ) {
    setCoverLetterForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function buildCustomStarterSnapshot(savedAt: string): CustomStarterSnapshot {
    return {
      savedAt,
      sampleProfile,
      fileName,
      draftName,
      markdown,
      professionalForm,
      atsForm,
      minimalForm,
    };
  }

  function applyCustomStarterSnapshot(
    snapshot: Partial<CustomStarterSnapshot>,
    starterId?: string | null,
    starterName?: string | null
  ) {
    const resolvedSampleProfile =
      typeof snapshot.sampleProfile === "string" &&
      isSampleProfileId(snapshot.sampleProfile)
        ? snapshot.sampleProfile
        : DEFAULT_SAMPLE_PROFILE;
    const defaults = getSampleProfileDefaults(resolvedSampleProfile);

    setSampleProfile(resolvedSampleProfile);
    setActiveStarterKind("custom");
    setActiveCustomStarterId(starterId || null);
    setActiveCustomStarterName(starterName || null);
    setProfessionalForm(
      hydrateProfessionalForm(snapshot.professionalForm, resolvedSampleProfile)
    );
    setAtsForm(hydrateAtsForm(snapshot.atsForm, resolvedSampleProfile));
    setMinimalForm(
      hydrateMinimalForm(snapshot.minimalForm, resolvedSampleProfile)
    );
    setMarkdown(
      typeof snapshot.markdown === "string"
        ? snapshot.markdown
        : createInitialMarkdownCv(resolvedSampleProfile)
    );
    setFileName(snapshot.fileName?.trim() || defaults.fileName);
    setDraftName(snapshot.draftName?.trim() || defaults.draftName);
    if (starterName?.trim()) {
      setCustomStarterName(starterName.trim());
    }
  }

  function loadSelectedSampleProfile() {
    const defaults = getSampleProfileDefaults(sampleProfile);

    setActiveStarterKind("built-in");
    setActiveCustomStarterId(null);
    setActiveCustomStarterName(null);
    setProfessionalForm(createInitialProfessionalCvForm(sampleProfile));
    setAtsForm(createInitialAtsCvForm(sampleProfile));
    setMinimalForm(createInitialMinimalCvForm(sampleProfile));
    setMarkdown(createInitialMarkdownCv(sampleProfile));
    setFileName(defaults.fileName);
    setDraftName(defaults.draftName);
    setStatus(
      `Starter profile ${activeSampleOption.title} berhasil dimuat ke semua builder.`
    );
    setError(null);
  }

  function saveCustomStarterNow() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedAt = new Date().toISOString();
      const snapshot = buildCustomStarterSnapshot(savedAt);
      const entry = saveNamedStarter(
        window.localStorage,
        customStarterName,
        snapshot
      );

      setCustomStarterName(entry.starterName || customStarterName);
      setCustomStarters(
        listNamedStarters<CustomStarterSnapshot>(window.localStorage)
      );
      setActiveStarterKind("custom");
      setActiveCustomStarterId(entry.id);
      setActiveCustomStarterName(entry.starterName || customStarterName);
      setStatus(`Custom starter "${entry.starterName}" berhasil disimpan.`);
      setError(null);
    } catch {
      setError(
        "Custom starter gagal disimpan. Coba kecilkan ukuran gambar atau hapus asset visual yang tidak diperlukan."
      );
      setStatus(null);
    }
  }

  function loadCustomStarterById(id: string) {
    if (typeof window === "undefined") {
      return;
    }

    const snapshot = loadNamedStarter<CustomStarterSnapshot>(
      window.localStorage,
      id
    );

    if (!snapshot) {
      setError("Custom starter tidak ditemukan.");
      setStatus(null);
      return;
    }

    applyCustomStarterSnapshot(snapshot, id, snapshot.starterName || null);
    setStatus(`Custom starter "${snapshot.starterName}" berhasil dimuat.`);
    setError(null);
  }

  function deleteCustomStarterById(id: string) {
    if (typeof window === "undefined") {
      return;
    }

    const deleted = deleteNamedStarter<CustomStarterSnapshot>(
      window.localStorage,
      id
    );

    if (!deleted) {
      setError("Custom starter tidak ditemukan.");
      setStatus(null);
      return;
    }

    setCustomStarters(
      listNamedStarters<CustomStarterSnapshot>(window.localStorage)
    );

    if (activeStarterKind === "custom" && activeCustomStarterId === id) {
      setActiveStarterKind("built-in");
      setActiveCustomStarterId(null);
      setActiveCustomStarterName(null);
    }

    setStatus("Custom starter berhasil dihapus.");
    setError(null);
  }

  function resetCurrentMode() {
    if (
      activeStarterKind === "custom" &&
      activeCustomStarterId &&
      typeof window !== "undefined"
    ) {
      const snapshot = loadNamedStarter<CustomStarterSnapshot>(
        window.localStorage,
        activeCustomStarterId
      );

      if (snapshot) {
        if (inputMode === "professional") {
          setProfessionalForm(
            hydrateProfessionalForm(snapshot.professionalForm, snapshot.sampleProfile)
          );
        } else if (inputMode === "ats") {
          setAtsForm(hydrateAtsForm(snapshot.atsForm, snapshot.sampleProfile));
        } else if (inputMode === "minimal") {
          setMinimalForm(
            hydrateMinimalForm(snapshot.minimalForm, snapshot.sampleProfile)
          );
        } else {
          setMarkdown(
            typeof snapshot.markdown === "string"
              ? snapshot.markdown
              : createInitialMarkdownCv(snapshot.sampleProfile)
          );
        }

        setStatus(
          `${activeMode.title} berhasil di-reset ke custom starter ${activeStarterLabel}.`
        );
        setError(null);
        return;
      }
    }

    if (inputMode === "professional") {
      setProfessionalForm(createInitialProfessionalCvForm(sampleProfile));
    } else if (inputMode === "ats") {
      setAtsForm(createInitialAtsCvForm(sampleProfile));
    } else if (inputMode === "minimal") {
      setMinimalForm(createInitialMinimalCvForm(sampleProfile));
    } else {
      setMarkdown(createInitialMarkdownCv(sampleProfile));
    }

    setStatus(
      `${activeMode.title} berhasil di-reset ke starter ${activeStarterLabel}.`
    );
    setError(null);
  }

  function resetCoverLetterTemplate() {
    setCoverLetterForm(createInitialCoverLetterForm());
    setStatus("Template cover letter berhasil di-reset.");
    setError(null);
  }

  function applyTailoringToActiveMode() {
    if (!jobDescription.trim()) {
      setError("Masukkan job description dulu untuk menjalankan tailoring.");
      setStatus(null);
      return;
    }

    if (inputMode === "professional") {
      setProfessionalForm((current) =>
        tailorProfessionalCvForm(current, tailoring)
      );
    } else if (inputMode === "ats") {
      setAtsForm((current) => tailorAtsCvForm(current, tailoring));
    } else if (inputMode === "minimal") {
      setMinimalForm((current) => tailorMinimalCvForm(current, tailoring));
    } else {
      setMarkdown((current) => tailorMarkdownContent(current, tailoring));
    }

    setError(null);
    setStatus(
      `Tailoring diterapkan ke ${activeMode.title}${
        tailoring.targetRole ? ` untuk ${tailoring.targetRole}` : ""
      }.`
    );
  }

  function applyTailoringToAtsMode() {
    if (!jobDescription.trim()) {
      setError("Masukkan job description dulu untuk menjalankan tailoring.");
      setStatus(null);
      return;
    }

    setAtsForm((current) => tailorAtsCvForm(current, tailoring));
    setInputMode("ats");
    setError(null);
    setStatus(
      `ATS form sudah ditailor${
        tailoring.targetRole ? ` untuk ${tailoring.targetRole}` : ""
      } dan siap digenerate.`
    );
  }

  function saveDraftNow() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedAt = new Date().toISOString();
      const snapshot = buildSnapshot(savedAt);

      window.localStorage.setItem(
        ACTIVE_DRAFT_STORAGE_KEY,
        JSON.stringify(snapshot)
      );
      setHasSavedDraft(true);
      setLastSavedAt(savedAt);
      setStatus("Draft berhasil disimpan ke browser ini.");
      setError(null);
    } catch {
      setError(
        "Draft gagal disimpan. Coba kecilkan ukuran gambar atau hapus asset visual yang tidak diperlukan."
      );
      setStatus(null);
    }
  }

  function loadSavedDraft() {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY);

    if (!raw) {
      setError("Belum ada draft lokal yang bisa dimuat.");
      setStatus(null);
      return;
    }

    try {
      const snapshot = JSON.parse(raw) as ImportedSnapshot;
      applySnapshot(snapshot);
      setHasSavedDraft(true);
      setStatus("Draft lokal berhasil dimuat kembali.");
      setError(null);
    } catch {
      setError("Draft lokal gagal dimuat karena formatnya tidak valid.");
      setStatus(null);
    }
  }

  function clearSavedDraft() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(ACTIVE_DRAFT_STORAGE_KEY);
    setHasSavedDraft(false);
    setLastSavedAt(null);
    setStatus("Draft lokal di browser berhasil dihapus.");
    setError(null);
  }

  function saveNamedDraftNow() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const savedAt = new Date().toISOString();
      const snapshot = buildSnapshot(savedAt);
      const entry = saveNamedDraft(window.localStorage, draftName, snapshot);
      const resolvedDraftName = entry.draftName || draftName;

      setDraftName(resolvedDraftName);
      setNamedDrafts(listNamedDrafts<DraftSnapshot>(window.localStorage));
      setStatus(`Draft bernama "${resolvedDraftName}" berhasil disimpan.`);
      setError(null);
    } catch {
      setError(
        "Named draft gagal disimpan. Coba kecilkan ukuran gambar atau hapus asset visual yang tidak diperlukan."
      );
      setStatus(null);
    }
  }

  function loadNamedDraftById(id: string) {
    if (typeof window === "undefined") {
      return;
    }

    const snapshot = loadNamedDraft<DraftSnapshot>(window.localStorage, id);

    if (!snapshot) {
      setError("Draft bernama tidak ditemukan.");
      setStatus(null);
      return;
    }

    applySnapshot(snapshot);
    setHasSavedDraft(true);
    setStatus(`Draft "${snapshot.draftName}" berhasil dimuat.`);
    setError(null);
  }

  function deleteNamedDraftById(id: string) {
    if (typeof window === "undefined") {
      return;
    }

    const deleted = deleteNamedDraft<DraftSnapshot>(window.localStorage, id);

    if (!deleted) {
      setError("Draft bernama tidak ditemukan.");
      setStatus(null);
      return;
    }

    setNamedDrafts(listNamedDrafts<DraftSnapshot>(window.localStorage));
    setStatus("Draft bernama berhasil dihapus.");
    setError(null);
  }

  function openVisualAssetPicker(kind: VisualAssetKind) {
    if (kind === "profilePhoto") {
      profilePhotoInputRef.current?.click();
      return;
    }

    signatureInputRef.current?.click();
  }

  async function handleVisualAssetImport(
    kind: VisualAssetKind,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const asset = await prepareVisualAsset(file, kind);

      setVisualAssets((current) => ({
        ...current,
        [kind]: asset,
      }));
      setStatus(
        kind === "profilePhoto"
          ? "Foto profil berhasil diproses dan siap ikut ke DOCX/PDF."
          : "Tanda tangan berhasil diproses dan siap ikut ke cover letter DOCX/PDF."
      );
      setError(null);
    } catch (importError) {
      setError(
        importError instanceof Error
          ? importError.message
          : "Gambar gagal diproses."
      );
      setStatus(null);
    } finally {
      event.target.value = "";
    }
  }

  function removeVisualAsset(kind: VisualAssetKind) {
    setVisualAssets((current) => ({
      ...current,
      [kind]: null,
    }));
    setStatus(
      kind === "profilePhoto"
        ? "Foto profil berhasil dihapus dari draft."
        : "Tanda tangan berhasil dihapus dari draft."
    );
    setError(null);
  }

  function openImportPicker() {
    fileInputRef.current?.click();
  }

  function handleExportDraftJson() {
    const savedAt = new Date().toISOString();
    const snapshot = {
      ...buildSnapshot(savedAt),
      draftName,
    };
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${fileName || "cv-draft"}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("Draft JSON berhasil diexport.");
    setError(null);
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith(".json")) {
        const snapshot = JSON.parse(text) as ImportedSnapshot;
        applySnapshot(snapshot);
        setHasSavedDraft(true);
        setNamedDrafts(
          typeof window !== "undefined"
            ? listNamedDrafts<DraftSnapshot>(window.localStorage)
            : []
        );
        setStatus(`File ${file.name} berhasil diimport sebagai draft.`);
        setError(null);
      } else {
        setInputMode("markdown");
        setMarkdown(text);
        const importedBaseName =
          file.name.replace(/\.(md|txt)$/i, "").trim() || "imported-cv";
        setFileName(importedBaseName);
        setDraftName(importedBaseName);
        setStatus(`File ${file.name} berhasil diimport ke mode Markdown.`);
        setError(null);
      }
    } catch {
      setError("File gagal diimport. Gunakan file .md, .txt, atau .json yang valid.");
      setStatus(null);
    } finally {
      event.target.value = "";
    }
  }

  async function downloadGeneratedFile(
    markdownContent: string,
    targetFileName: string,
    route: "/api/cv-docx" | "/api/cv-pdf",
    extension: "docx" | "pdf",
    documentKind: DocumentKind
  ) {
    setIsDownloading(true);
    setStatus(null);
    setError(null);

    try {
      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: targetFileName,
          markdown: markdownContent,
          template: selectedTemplate,
          documentKind,
          visualAssets,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error || "Failed to generate file.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `${targetFileName || "cv-document"}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Failed to generate file."
      );
      return false;
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDownload() {
    const success = await downloadGeneratedFile(
      generatedMarkdown,
      fileName,
      "/api/cv-docx",
      "docx",
      "cv"
    );
    if (success) {
      setStatus("CV DOCX berhasil dibuat dan download sudah dimulai.");
    }
  }

  async function handleDownloadCoverLetter() {
    const success = await downloadGeneratedFile(
      generatedCoverLetter,
      `${fileName}-cover-letter`,
      "/api/cv-docx",
      "docx",
      "cover-letter"
    );
    if (success) {
      setStatus("Cover letter DOCX berhasil dibuat dan download sudah dimulai.");
    }
  }

  async function handleDownloadPdf() {
    const success = await downloadGeneratedFile(
      generatedMarkdown,
      fileName,
      "/api/cv-pdf",
      "pdf",
      "cv"
    );
    if (success) {
      setStatus("CV PDF berhasil dibuat dan download sudah dimulai.");
    }
  }

  async function handleDownloadCoverLetterPdf() {
    const success = await downloadGeneratedFile(
      generatedCoverLetter,
      `${fileName}-cover-letter`,
      "/api/cv-pdf",
      "pdf",
      "cover-letter"
    );
    if (success) {
      setStatus("Cover letter PDF berhasil dibuat dan download sudah dimulai.");
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(generatedMarkdown);
    setStatus("Konten CV yang akan dijadikan DOCX berhasil disalin.");
    setError(null);
  }

  async function handleCopyCoverLetter() {
    await navigator.clipboard.writeText(generatedCoverLetter);
    setStatus("Cover letter berhasil disalin.");
    setError(null);
  }

  async function handleCopyRecruiterMessage() {
    await navigator.clipboard.writeText(recruiterMessage);
    setStatus("Recruiter message berhasil disalin.");
    setError(null);
  }

  const canRemoveProfessionalExperience = professionalForm.experiences.length > 1;
  const canRemoveProfessionalEducation = professionalForm.education.length > 1;
  const canRemoveAtsExperience = atsForm.experiences.length > 1;
  const availableOutputCount = [
    generatedMarkdown.trim(),
    generatedCoverLetter.trim(),
    recruiterMessage.trim(),
  ].filter(Boolean).length;
  const activeAssetCount = [
    visualAssets.profilePhoto,
    visualAssets.signature,
  ].filter(Boolean).length;
  const selectedTemplateLabel =
    DOCX_TEMPLATE_OPTIONS.find((template) => template.id === selectedTemplate)
      ?.label || selectedTemplate;
  const workflowSteps = [
    "Pilih format CV yang paling cocok",
    "Tailor konten dari job description",
    "Generate CV, cover letter, dan recruiter message",
  ];

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-badge">No login required</div>
        <h1>
          Build your <span>CV DOCX</span> with multiple input forms.
        </h1>
        <p>
          Pilih format input yang paling cocok untuk kebutuhanmu: CV profesional
          lengkap, versi ATS yang lebih tajam, resume minimal, atau mode
          Markdown bebas. Semua mode akan diubah jadi dokumen Word saat kamu
          generate.
        </p>
          <div className="hero-stats">
            <div className="hero-stat-card">
              <strong>{activeMode.title}</strong>
              <span>Current builder format</span>
            </div>
          <div className="hero-stat-card">
            <strong>{selectedTemplateLabel}</strong>
            <span>Selected export template</span>
          </div>
          <div className="hero-stat-card">
            <strong>{availableOutputCount} outputs</strong>
            <span>Ready to copy or export</span>
            </div>
            <div className="hero-stat-card">
              <strong>
                {matchAnalysis.isReady
                  ? `${matchAnalysis.score}%`
                  : tailoring.detectedKeywords.length > 0
                    ? `${tailoring.detectedKeywords.length} keywords`
                    : "No JD yet"}
              </strong>
              <span>
                {matchAnalysis.isReady
                  ? matchAnalysis.scoreLabel
                  : "Tailoring signal detected"}
              </span>
            </div>
          </div>
        <div className="workflow-strip">
          {workflowSteps.map((step, index) => (
            <div className="workflow-card" key={step}>
              <span className="workflow-index">0{index + 1}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="layout-grid">
        <div className="card panel">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.txt,.json,text/markdown,text/plain,application/json"
            className="hidden-file-input"
            onChange={handleImportFile}
          />
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            onChange={(event) => handleVisualAssetImport("profilePhoto", event)}
          />
          <input
            ref={signatureInputRef}
            type="file"
            accept="image/*"
            className="hidden-file-input"
            onChange={(event) => handleVisualAssetImport("signature", event)}
          />

          <div className="form-row">
            <label className="label" htmlFor="file-name">
              File name
            </label>
            <input
              id="file-name"
              className="input"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
              placeholder="sample-fullstack-cv"
            />
          </div>

          <section className="section-card section-card-inline">
            <div className="section-header section-header-actions">
              <div>
                <h3>Starter Profiles</h3>
                <p>
                  Pilih sample profile yang paling dekat dengan kebutuhanmu.
                  Draft aktif baru akan diisi ulang saat kamu klik{" "}
                  <code>Load Starter Content</code>.
                </p>
              </div>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={loadSelectedSampleProfile}
              >
                Load Starter Content
              </button>
            </div>

            <div className="sample-profile-grid">
              {SAMPLE_PROFILE_OPTIONS.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={`sample-profile-card ${
                    profile.id === sampleProfile
                      ? "sample-profile-card-active"
                      : ""
                  }`.trim()}
                  onClick={() => setSampleProfile(profile.id)}
                >
                  <span className="sample-profile-kicker">{profile.label}</span>
                  <strong className="sample-profile-title">{profile.title}</strong>
                  <p className="sample-profile-copy">{profile.description}</p>
                  <span className="sample-profile-meta">{profile.fileName}</span>
                </button>
              ))}
            </div>

            <p className="sample-profile-note">
              <strong>Active starter:</strong> {activeStarterLabel}.{" "}
              {activeStarterKind === "custom"
                ? "Reset Template akan kembali ke preset custom yang sedang aktif."
                : "Reset Template akan kembali ke sample bawaan yang sedang dipilih."}
            </p>

            <div className="named-draft-block">
              <div className="form-grid">
                <Field
                  id="custom-starter-name"
                  label="Custom starter name"
                  value={customStarterName}
                  placeholder="misalnya: my-node-react-template"
                  onChange={setCustomStarterName}
                />
              </div>

              <div className="actions actions-tight">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={saveCustomStarterNow}
                >
                  Save Current as Starter
                </button>
              </div>

              <div className="named-draft-list">
                {customStarters.length > 0 ? (
                  customStarters.map((starter) => (
                    <div
                      className={`named-draft-item ${
                        activeStarterKind === "custom" &&
                        activeCustomStarterId === starter.id
                          ? "named-draft-item-active"
                          : ""
                      }`.trim()}
                      key={starter.id}
                    >
                      <div>
                        <strong>{starter.starterName}</strong>
                        <p>{formatSavedTime(starter.savedAt)}</p>
                      </div>
                      <div className="named-draft-actions">
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => loadCustomStarterById(starter.id)}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => deleteCustomStarterById(starter.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="named-draft-empty">
                    Belum ada custom starter. Simpan CV aktifmu sebagai preset
                    pribadi untuk reuse cepat di lamaran berikutnya.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header">
              <div>
                <h3>Photo & Signature</h3>
                <p>
                  Upload foto profil untuk CV dan tanda tangan untuk cover
                  letter. App akan mengoptimalkan ukurannya supaya tetap ringan
                  saat disimpan di browser.
                </p>
              </div>
            </div>

            <div className="asset-grid">
              <div className="asset-card">
                <div className="asset-preview">
                  {visualAssets.profilePhoto ? (
                    <Image
                      src={visualAssets.profilePhoto.dataUrl}
                      alt="Profile preview"
                      width={visualAssets.profilePhoto.width}
                      height={visualAssets.profilePhoto.height}
                      unoptimized
                      className="asset-image asset-image-photo"
                    />
                  ) : (
                    <div className="asset-placeholder">No profile photo</div>
                  )}
                </div>
                <div className="asset-copy">
                  <strong>Profile photo</strong>
                  <p>Dipakai di export CV DOCX dan PDF.</p>
                  <p>{describeVisualAsset(visualAssets.profilePhoto)}</p>
                </div>
                <div className="actions actions-tight">
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => openVisualAssetPicker("profilePhoto")}
                  >
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => removeVisualAsset("profilePhoto")}
                    disabled={!visualAssets.profilePhoto}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="asset-card">
                <div className="asset-preview asset-preview-signature">
                  {visualAssets.signature ? (
                    <Image
                      src={visualAssets.signature.dataUrl}
                      alt="Signature preview"
                      width={visualAssets.signature.width}
                      height={visualAssets.signature.height}
                      unoptimized
                      className="asset-image asset-image-signature"
                    />
                  ) : (
                    <div className="asset-placeholder">No signature</div>
                  )}
                </div>
                <div className="asset-copy">
                  <strong>Signature</strong>
                  <p>Dipakai di export cover letter DOCX dan PDF.</p>
                  <p>{describeVisualAsset(visualAssets.signature)}</p>
                </div>
                <div className="actions actions-tight">
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => openVisualAssetPicker("signature")}
                  >
                    Upload Signature
                  </button>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => removeVisualAsset("signature")}
                    disabled={!visualAssets.signature}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header">
              <div>
                <h3>Local Draft</h3>
                <p>
                  Draft tersimpan otomatis di browser ini saat kamu mengetik, dan
                  bisa dimuat lagi kapan saja.
                </p>
              </div>
            </div>

            <div className="draft-status-row">
              <span className={`draft-indicator ${hasSavedDraft ? "draft-indicator-active" : ""}`.trim()}>
                {hasSavedDraft ? "Auto-save aktif" : "Belum ada draft lokal"}
              </span>
              <span className="draft-status-copy">
                {isDraftReady ? formatSavedTime(lastSavedAt) : "Memeriksa draft lokal..."}
              </span>
            </div>

            <div className="actions actions-tight">
              <button
                type="button"
                className="button button-secondary"
                onClick={saveDraftNow}
              >
                Save Draft Now
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={loadSavedDraft}
              >
                Load Saved Draft
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={clearSavedDraft}
              >
                Clear Saved Draft
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleExportDraftJson}
              >
                Export Draft JSON
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={openImportPicker}
              >
                Import File
              </button>
            </div>

            <div className="named-draft-block">
              <div className="form-grid">
                <Field
                  id="named-draft"
                  label="Named draft"
                  value={draftName}
                  placeholder="misalnya: remote-node-react-role"
                  onChange={setDraftName}
                />
              </div>

              <div className="actions actions-tight">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={saveNamedDraftNow}
                >
                  Save Named Draft
                </button>
              </div>

              <div className="named-draft-list">
                {namedDrafts.length > 0 ? (
                  namedDrafts.map((draft) => (
                    <div className="named-draft-item" key={draft.id}>
                      <div>
                        <strong>{draft.draftName}</strong>
                        <p>{formatSavedTime(draft.savedAt)}</p>
                      </div>
                      <div className="named-draft-actions">
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => loadNamedDraftById(draft.id)}
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => deleteNamedDraftById(draft.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="named-draft-empty">
                    Belum ada named draft. Simpan satu draft dengan nama khusus
                    untuk reuse cepat.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header">
              <div>
                <h3>Job Description Tailoring</h3>
                <p>
                  Paste lowongan kerja di sini untuk mendeteksi role target,
                  keyword penting, dan mengarahkan isi CV secara lokal tanpa login.
                </p>
              </div>
            </div>

            <Area
              id="job-description"
              label="Job description"
              rows={8}
              value={jobDescription}
              placeholder="Paste job description here..."
              onChange={setJobDescription}
            />

            <div className="actions actions-tight">
              <button
                type="button"
                className="button button-secondary"
                onClick={applyTailoringToActiveMode}
              >
                Tailor Active Format
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={applyTailoringToAtsMode}
              >
                Tailor ATS Form
              </button>
            </div>

            <div className="match-summary-grid">
              <div className="match-card match-card-primary">
                <span className="match-label">CV Match Score</span>
                <strong>
                  {matchAnalysis.isReady ? `${matchAnalysis.score}%` : "--"}
                </strong>
                <p>
                  {matchAnalysis.isReady
                    ? matchAnalysis.scoreLabel
                    : "Tambahkan job description untuk menghitung score."}
                </p>
                <div className="match-progress">
                  <span
                    className="match-progress-bar"
                    style={{
                      width: `${matchAnalysis.isReady ? matchAnalysis.score : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="match-card">
                <span className="match-label">Matched Keywords</span>
                <strong>
                  {matchAnalysis.matchedTechnicalKeywords.length +
                    matchAnalysis.matchedSoftKeywords.length}
                </strong>
                <p>
                  {matchAnalysis.matchedTechnicalKeywords.length > 0 ||
                  matchAnalysis.matchedSoftKeywords.length > 0
                    ? [
                        ...matchAnalysis.matchedTechnicalKeywords,
                        ...matchAnalysis.matchedSoftKeywords,
                      ]
                        .slice(0, 4)
                        .join(", ")
                    : "Belum ada keyword yang terdeteksi cocok."}
                </p>
              </div>

              <div className="match-card">
                <span className="match-label">Missing Signals</span>
                <strong>
                  {matchAnalysis.missingTechnicalKeywords.length +
                    matchAnalysis.missingSoftKeywords.length +
                    (matchAnalysis.matchedRole ? 0 : tailoring.targetRole ? 1 : 0)}
                </strong>
                <p>
                  {matchAnalysis.missingTechnicalKeywords.length > 0 ||
                  matchAnalysis.missingSoftKeywords.length > 0
                    ? [
                        ...matchAnalysis.missingTechnicalKeywords,
                        ...matchAnalysis.missingSoftKeywords,
                      ]
                        .slice(0, 4)
                        .join(", ")
                    : matchAnalysis.isReady
                      ? "Tidak ada gap besar yang terdeteksi."
                      : "Belum ada gap karena job description belum dipaste."}
                </p>
              </div>
            </div>

            {matchAnalysis.isReady ? (
              <div className="coverage-grid">
                <div className="coverage-item">
                  <div className="coverage-head">
                    <strong>Technical Coverage</strong>
                    <span>{matchAnalysis.technicalCoverage}%</span>
                  </div>
                  <div className="coverage-track">
                    <span
                      className="coverage-fill"
                      style={{ width: `${matchAnalysis.technicalCoverage}%` }}
                    />
                  </div>
                </div>
                <div className="coverage-item">
                  <div className="coverage-head">
                    <strong>Soft-Skill Coverage</strong>
                    <span>{matchAnalysis.softCoverage}%</span>
                  </div>
                  <div className="coverage-track">
                    <span
                      className="coverage-fill coverage-fill-soft"
                      style={{ width: `${matchAnalysis.softCoverage}%` }}
                    />
                  </div>
                </div>
                <div className="coverage-item">
                  <div className="coverage-head">
                    <strong>Role Alignment</strong>
                    <span>{matchAnalysis.roleCoverage}%</span>
                  </div>
                  <div className="coverage-track">
                    <span
                      className="coverage-fill coverage-fill-role"
                      style={{ width: `${matchAnalysis.roleCoverage}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header">
              <div>
                <h3>DOCX Template</h3>
                <p>
                  Pilih gaya dokumen Word yang akan dipakai saat generate.
                </p>
              </div>
            </div>

            <div className="template-tabs">
              {DOCX_TEMPLATE_OPTIONS.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={`template-tab ${
                    template.id === selectedTemplate ? "template-tab-active" : ""
                  }`.trim()}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <span className="template-tab-label">{template.label}</span>
                  <span className="template-tab-copy">{template.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header">
              <div>
                <h3>Communication Language</h3>
                <p>
                  Pilihan ini akan memengaruhi output cover letter dan recruiter
                  message, tanpa mengubah isi CV utama.
                </p>
              </div>
            </div>

            <div className="language-tabs">
              {[
                { id: "en", label: "English" },
                { id: "id", label: "Bahasa Indonesia" },
              ].map((language) => (
                <button
                  key={language.id}
                  type="button"
                  className={`language-tab ${
                    communicationLanguage === language.id
                      ? "language-tab-active"
                      : ""
                  }`.trim()}
                  onClick={() =>
                    setCommunicationLanguage(
                      language.id as CommunicationLanguage
                    )
                  }
                >
                  {language.label}
                </button>
              ))}
            </div>
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header section-header-actions">
              <div>
                <h3>Cover Letter Generator</h3>
                <p>
                  Isi detail lamaran di bawah, lalu app akan membangun cover
                  letter dari CV aktif dan job description yang sudah kamu paste.
                </p>
              </div>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={resetCoverLetterTemplate}
              >
                Reset cover letter
              </button>
            </div>

            <div className="form-grid">
              <Field
                id="cover-letter-company"
                label="Company name"
                value={coverLetterForm.companyName}
                onChange={(value) => updateCoverLetterField("companyName", value)}
              />
              <Field
                id="cover-letter-manager"
                label="Hiring manager"
                value={coverLetterForm.hiringManager}
                onChange={(value) =>
                  updateCoverLetterField("hiringManager", value)
                }
              />
              <div className="form-span-full">
                <Area
                  id="cover-letter-intro"
                  label="Custom intro paragraph"
                  rows={4}
                  compact
                  value={coverLetterForm.customIntro}
                  placeholder="Optional. Kalau kosong, app akan membuat intro otomatis."
                  onChange={(value) => updateCoverLetterField("customIntro", value)}
                />
              </div>
              <div className="form-span-full">
                <Area
                  id="cover-letter-closing"
                  label="Custom closing paragraph"
                  rows={4}
                  compact
                  value={coverLetterForm.customClosing}
                  placeholder="Optional. Kalau kosong, app akan membuat closing otomatis."
                  onChange={(value) =>
                    updateCoverLetterField("customClosing", value)
                  }
                />
              </div>
            </div>

            <div className="actions actions-tight">
              <button
                type="button"
                className="button button-secondary"
                onClick={handleCopyCoverLetter}
              >
                Copy Cover Letter
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleDownloadCoverLetter}
                disabled={isDownloading || !generatedCoverLetter.trim()}
              >
                Download Cover Letter DOCX
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleDownloadCoverLetterPdf}
                disabled={isDownloading || !generatedCoverLetter.trim()}
              >
                Download Cover Letter PDF
              </button>
            </div>
          </section>

          <section className="section-card section-card-inline">
            <div className="section-header">
              <div>
                <h3>Recruiter Message Generator</h3>
                <p>
                  Pesan singkat ini cocok untuk LinkedIn DM, email perkenalan,
                  atau follow-up cepat ke recruiter.
                </p>
              </div>
            </div>

            <div className="preview-box preview-box-inline">{recruiterMessage}</div>

            <div className="actions actions-tight">
              <button
                type="button"
                className="button button-secondary"
                onClick={handleCopyRecruiterMessage}
              >
                Copy Recruiter Message
              </button>
            </div>
          </section>

          <div className="mode-tabs" role="tablist" aria-label="CV input formats">
            {INPUT_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`mode-tab ${
                  mode.id === inputMode ? "mode-tab-active" : ""
                }`.trim()}
                onClick={() => {
                  setInputMode(mode.id);
                  setStatus(null);
                  setError(null);
                }}
              >
                <span className="mode-tab-label">{mode.label}</span>
                <span className="mode-tab-title">{mode.title}</span>
              </button>
            ))}
          </div>

          <div className="mode-note">
            <strong>{activeMode.title}</strong>
            <p>{activeMode.description}</p>
          </div>

          {inputMode === "professional" ? (
            <div className="section-stack">
              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>Personal Profile</h3>
                    <p>Informasi utama untuk header CV dan ringkasan profesional.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <Field
                    id="professional-full-name"
                    label="Full name"
                    value={professionalForm.fullName}
                    onChange={(value) =>
                      updateProfessionalField("fullName", value)
                    }
                  />
                  <Field
                    id="professional-title"
                    label="Headline / title"
                    value={professionalForm.title}
                    onChange={(value) => updateProfessionalField("title", value)}
                  />
                  <Field
                    id="professional-location"
                    label="Location"
                    value={professionalForm.location}
                    onChange={(value) =>
                      updateProfessionalField("location", value)
                    }
                  />
                  <Field
                    id="professional-email"
                    label="Email"
                    value={professionalForm.email}
                    onChange={(value) => updateProfessionalField("email", value)}
                  />
                  <Field
                    id="professional-phone"
                    label="Phone"
                    value={professionalForm.phone}
                    onChange={(value) => updateProfessionalField("phone", value)}
                  />
                  <Field
                    id="professional-linkedin"
                    label="LinkedIn URL"
                    value={professionalForm.linkedin}
                    onChange={(value) =>
                      updateProfessionalField("linkedin", value)
                    }
                  />
                  <div className="form-span-full">
                    <Area
                      id="professional-summary"
                      label="Professional summary"
                      rows={9}
                      value={professionalForm.summary}
                      onChange={(value) =>
                        updateProfessionalField("summary", value)
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>Skill Categories</h3>
                    <p>
                      Isi per baris atau pisahkan dengan koma. Nanti otomatis jadi
                      bullet di dokumen.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <Area
                    id="professional-frontend"
                    label="Frontend"
                    rows={6}
                    compact
                    value={professionalForm.skills.frontend}
                    onChange={(value) =>
                      updateProfessionalSkill("frontend", value)
                    }
                  />
                  <Area
                    id="professional-backend"
                    label="Backend"
                    rows={6}
                    compact
                    value={professionalForm.skills.backend}
                    onChange={(value) =>
                      updateProfessionalSkill("backend", value)
                    }
                  />
                  <Area
                    id="professional-architecture"
                    label="Architecture & security"
                    rows={7}
                    compact
                    value={professionalForm.skills.architecture}
                    onChange={(value) =>
                      updateProfessionalSkill("architecture", value)
                    }
                  />
                  <Area
                    id="professional-cloud"
                    label="Cloud & DevOps"
                    rows={7}
                    compact
                    value={professionalForm.skills.cloud}
                    onChange={(value) => updateProfessionalSkill("cloud", value)}
                  />
                  <Area
                    id="professional-databases"
                    label="Databases"
                    rows={5}
                    compact
                    value={professionalForm.skills.databases}
                    onChange={(value) =>
                      updateProfessionalSkill("databases", value)
                    }
                  />
                  <Area
                    id="professional-tools"
                    label="Tools & monitoring"
                    rows={5}
                    compact
                    value={professionalForm.skills.tools}
                    onChange={(value) => updateProfessionalSkill("tools", value)}
                  />
                </div>
              </section>

              <section className="section-card">
                <div className="section-header section-header-actions">
                  <div>
                    <h3>Professional Experience</h3>
                    <p>
                      Tambahkan role satu per kartu. Bullet points akan ikut jadi
                      section experience di DOCX.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() =>
                      setProfessionalForm((current) => ({
                        ...current,
                        experiences: [...current.experiences, createEmptyExperience()],
                      }))
                    }
                  >
                    Add experience
                  </button>
                </div>

                <div className="stack-list">
                  {professionalForm.experiences.map((experience, index) => (
                    <div className="subcard" key={`professional-experience-${index}`}>
                      <div className="subcard-header">
                        <strong>Experience {index + 1}</strong>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          disabled={!canRemoveProfessionalExperience}
                          onClick={() =>
                            setProfessionalForm((current) => ({
                              ...current,
                              experiences: current.experiences.filter(
                                (_, currentIndex) => currentIndex !== index
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>

                      <div className="form-grid">
                        <Field
                          id={`professional-role-${index}`}
                          label="Role"
                          value={experience.role}
                          onChange={(value) =>
                            updateProfessionalExperience(index, "role", value)
                          }
                        />
                        <Field
                          id={`professional-company-${index}`}
                          label="Company"
                          value={experience.company}
                          onChange={(value) =>
                            updateProfessionalExperience(index, "company", value)
                          }
                        />
                        <Field
                          id={`professional-period-${index}`}
                          label="Period"
                          value={experience.period}
                          onChange={(value) =>
                            updateProfessionalExperience(index, "period", value)
                          }
                        />
                        <Field
                          id={`professional-location-${index}`}
                          label="Location"
                          value={experience.location}
                          onChange={(value) =>
                            updateProfessionalExperience(index, "location", value)
                          }
                        />
                        <div className="form-span-full">
                          <Area
                            id={`professional-bullets-${index}`}
                            label="Impact bullets"
                            rows={7}
                            value={experience.bullets}
                            onChange={(value) =>
                              updateProfessionalExperience(index, "bullets", value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section-card">
                <div className="section-header section-header-actions">
                  <div>
                    <h3>Achievements, Education & Languages</h3>
                    <p>Lengkapi achievement utama, riwayat pendidikan, dan bahasa.</p>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() =>
                      setProfessionalForm((current) => ({
                        ...current,
                        education: [...current.education, createEmptyEducation()],
                      }))
                    }
                  >
                    Add education
                  </button>
                </div>

                <Area
                  id="professional-achievements"
                  label="Key achievements"
                  rows={6}
                  value={professionalForm.achievements}
                  onChange={(value) =>
                    updateProfessionalField("achievements", value)
                  }
                />

                <div className="stack-list">
                  {professionalForm.education.map((item, index) => (
                    <div className="subcard" key={`professional-education-${index}`}>
                      <div className="subcard-header">
                        <strong>Education {index + 1}</strong>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          disabled={!canRemoveProfessionalEducation}
                          onClick={() =>
                            setProfessionalForm((current) => ({
                              ...current,
                              education: current.education.filter(
                                (_, currentIndex) => currentIndex !== index
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>

                      <div className="form-grid">
                        <Field
                          id={`professional-degree-${index}`}
                          label="Degree"
                          value={item.degree}
                          onChange={(value) =>
                            updateProfessionalEducation(index, "degree", value)
                          }
                        />
                        <Field
                          id={`professional-school-${index}`}
                          label="School"
                          value={item.school}
                          onChange={(value) =>
                            updateProfessionalEducation(index, "school", value)
                          }
                        />
                        <div className="form-span-full">
                          <Field
                            id={`professional-details-${index}`}
                            label="Details"
                            value={item.details}
                            onChange={(value) =>
                              updateProfessionalEducation(index, "details", value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Area
                  id="professional-languages"
                  label="Languages"
                  rows={4}
                  compact
                  value={professionalForm.languages}
                  onChange={(value) => updateProfessionalField("languages", value)}
                />
              </section>
            </div>
          ) : null}

          {inputMode === "ats" ? (
            <div className="section-stack">
              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>ATS Header</h3>
                    <p>
                      Format ini fokus ke keyword, target role, dan pengalaman yang
                      paling relevan untuk screening recruiter.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <Field
                    id="ats-full-name"
                    label="Full name"
                    value={atsForm.fullName}
                    onChange={(value) => updateAtsField("fullName", value)}
                  />
                  <Field
                    id="ats-title"
                    label="Current title"
                    value={atsForm.title}
                    onChange={(value) => updateAtsField("title", value)}
                  />
                  <Field
                    id="ats-target-role"
                    label="Target role"
                    value={atsForm.targetRole}
                    onChange={(value) => updateAtsField("targetRole", value)}
                  />
                  <Field
                    id="ats-location"
                    label="Location"
                    value={atsForm.location}
                    onChange={(value) => updateAtsField("location", value)}
                  />
                  <Field
                    id="ats-email"
                    label="Email"
                    value={atsForm.email}
                    onChange={(value) => updateAtsField("email", value)}
                  />
                  <Field
                    id="ats-phone"
                    label="Phone"
                    value={atsForm.phone}
                    onChange={(value) => updateAtsField("phone", value)}
                  />
                  <div className="form-span-full">
                    <Field
                      id="ats-linkedin"
                      label="LinkedIn URL"
                      value={atsForm.linkedin}
                      onChange={(value) => updateAtsField("linkedin", value)}
                    />
                  </div>
                  <div className="form-span-full">
                    <Area
                      id="ats-summary"
                      label="Targeted summary"
                      rows={6}
                      value={atsForm.summary}
                      onChange={(value) => updateAtsField("summary", value)}
                    />
                  </div>
                </div>
              </section>

              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>ATS Keywords</h3>
                    <p>
                      Isi per line agar keyword mudah tersusun jadi bullet di output.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <Area
                    id="ats-competencies"
                    label="Core competencies"
                    rows={7}
                    compact
                    value={atsForm.competencies}
                    onChange={(value) =>
                      updateAtsField("competencies", value)
                    }
                  />
                  <Area
                    id="ats-technical-keywords"
                    label="Technical keywords"
                    rows={7}
                    compact
                    value={atsForm.technicalKeywords}
                    onChange={(value) =>
                      updateAtsField("technicalKeywords", value)
                    }
                  />
                </div>
              </section>

              <section className="section-card">
                <div className="section-header section-header-actions">
                  <div>
                    <h3>Relevant Experience</h3>
                    <p>
                      Buat 2-4 pengalaman paling relevan untuk lowongan yang sedang
                      ditargetkan.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() =>
                      setAtsForm((current) => ({
                        ...current,
                        experiences: [
                          ...current.experiences,
                          createEmptyAtsExperience(),
                        ],
                      }))
                    }
                  >
                    Add relevant role
                  </button>
                </div>

                <div className="stack-list">
                  {atsForm.experiences.map((experience, index) => (
                    <div className="subcard" key={`ats-experience-${index}`}>
                      <div className="subcard-header">
                        <strong>Relevant role {index + 1}</strong>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          disabled={!canRemoveAtsExperience}
                          onClick={() =>
                            setAtsForm((current) => ({
                              ...current,
                              experiences: current.experiences.filter(
                                (_, currentIndex) => currentIndex !== index
                              ),
                            }))
                          }
                        >
                          Remove
                        </button>
                      </div>

                      <div className="form-grid">
                        <Field
                          id={`ats-role-${index}`}
                          label="Role"
                          value={experience.role}
                          onChange={(value) =>
                            updateAtsExperience(index, "role", value)
                          }
                        />
                        <Field
                          id={`ats-company-${index}`}
                          label="Company"
                          value={experience.company}
                          onChange={(value) =>
                            updateAtsExperience(index, "company", value)
                          }
                        />
                        <Field
                          id={`ats-period-${index}`}
                          label="Period"
                          value={experience.period}
                          onChange={(value) =>
                            updateAtsExperience(index, "period", value)
                          }
                        />
                        <Field
                          id={`ats-keywords-${index}`}
                          label="Keywords"
                          value={experience.keywords}
                          onChange={(value) =>
                            updateAtsExperience(index, "keywords", value)
                          }
                        />
                        <div className="form-span-full">
                          <Area
                            id={`ats-impact-${index}`}
                            label="Impact summary"
                            rows={5}
                            value={experience.impact}
                            onChange={(value) =>
                              updateAtsExperience(index, "impact", value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>Final ATS Sections</h3>
                    <p>
                      Section penutup untuk achievements, education, dan bahasa.
                    </p>
                  </div>
                </div>

                <Area
                  id="ats-achievements"
                  label="Key achievements"
                  rows={5}
                  value={atsForm.achievements}
                  onChange={(value) => updateAtsField("achievements", value)}
                />
                <Area
                  id="ats-education"
                  label="Education"
                  rows={4}
                  compact
                  value={atsForm.education}
                  onChange={(value) => updateAtsField("education", value)}
                />
                <Area
                  id="ats-languages"
                  label="Languages"
                  rows={4}
                  compact
                  value={atsForm.languages}
                  onChange={(value) => updateAtsField("languages", value)}
                />
              </section>
            </div>
          ) : null}

          {inputMode === "minimal" ? (
            <div className="section-stack">
              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>Minimal Resume Form</h3>
                    <p>
                      Cocok untuk one-page resume atau versi pendek yang cepat
                      dikirim.
                    </p>
                  </div>
                </div>

                <div className="form-grid">
                  <Field
                    id="minimal-full-name"
                    label="Full name"
                    value={minimalForm.fullName}
                    onChange={(value) => updateMinimalField("fullName", value)}
                  />
                  <Field
                    id="minimal-title"
                    label="Headline / title"
                    value={minimalForm.title}
                    onChange={(value) => updateMinimalField("title", value)}
                  />
                  <div className="form-span-full">
                    <Field
                      id="minimal-contact-line"
                      label="Contact line"
                      value={minimalForm.contactLine}
                      onChange={(value) =>
                        updateMinimalField("contactLine", value)
                      }
                    />
                  </div>
                  <div className="form-span-full">
                    <Area
                      id="minimal-summary"
                      label="Profile summary"
                      rows={5}
                      value={minimalForm.summary}
                      onChange={(value) => updateMinimalField("summary", value)}
                    />
                  </div>
                  <Area
                    id="minimal-skills"
                    label="Key skills"
                    rows={6}
                    compact
                    value={minimalForm.keySkills}
                    onChange={(value) => updateMinimalField("keySkills", value)}
                  />
                  <Area
                    id="minimal-highlights"
                    label="Career highlights"
                    rows={6}
                    compact
                    value={minimalForm.highlights}
                    onChange={(value) =>
                      updateMinimalField("highlights", value)
                    }
                  />
                  <Area
                    id="minimal-experience"
                    label="Experience snapshot"
                    rows={6}
                    compact
                    value={minimalForm.experienceSnapshot}
                    onChange={(value) =>
                      updateMinimalField("experienceSnapshot", value)
                    }
                  />
                  <Area
                    id="minimal-education"
                    label="Education"
                    rows={5}
                    compact
                    value={minimalForm.education}
                    onChange={(value) =>
                      updateMinimalField("education", value)
                    }
                  />
                  <div className="form-span-full">
                    <Area
                      id="minimal-languages"
                      label="Languages"
                      rows={4}
                      compact
                      value={minimalForm.languages}
                      onChange={(value) =>
                        updateMinimalField("languages", value)
                      }
                    />
                  </div>
                </div>
              </section>
            </div>
          ) : null}

          {inputMode === "markdown" ? (
            <div className="section-stack">
              <section className="section-card">
                <div className="section-header">
                  <div>
                    <h3>Markdown / Freeform Input</h3>
                    <p>
                      Gunakan mode ini kalau kamu ingin full control atas isi dan
                      formatting CV sebelum diubah menjadi DOCX.
                    </p>
                  </div>
                </div>

                <Area
                  id="cv-markdown"
                  label="CV content"
                  rows={20}
                  value={markdown}
                  placeholder="Paste your CV here..."
                  onChange={setMarkdown}
                />
              </section>
            </div>
          ) : null}

          <section className="section-card output-studio">
            <div className="section-header section-header-actions">
              <div>
                <h3>Output Studio</h3>
                <p>
                  Saat isi CV sudah siap, generate file utama dari sini. Cover
                  letter dan recruiter message tetap bisa kamu atur dari section
                  masing-masing di atas.
                </p>
              </div>
              <div className="studio-pills">
                <span className="pill">{selectedTemplateLabel}</span>
                <span className="pill">{activeMode.title}</span>
                <span className="pill">
                  {communicationLanguage === "id"
                    ? "Bahasa Indonesia"
                    : "English"}
                </span>
              </div>
            </div>

            <div className="output-grid">
              <div className="output-card output-card-primary">
                <strong>Main CV Export</strong>
                <p>
                  Generate file utama dengan template <code>{selectedTemplateLabel}</code>
                  {" "}dan nama file <code>{fileName}</code>.
                </p>
                <div className="actions actions-tight">
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleDownload}
                    disabled={isDownloading || !generatedMarkdown.trim()}
                  >
                    {isDownloading ? "Generating DOCX..." : "Download DOCX"}
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleDownloadPdf}
                    disabled={isDownloading || !generatedMarkdown.trim()}
                  >
                    Download PDF
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={handleCopy}
                    disabled={!generatedMarkdown.trim()}
                  >
                    Copy CV Output
                  </button>
                </div>
              </div>

              <div className="output-card">
                <strong>Editing Utilities</strong>
                <p>
                  Reset template aktif, simpan draft lokal, dan lanjut revisi tanpa
                  takut kehilangan progress.
                </p>
                <div className="actions actions-tight">
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={saveDraftNow}
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={resetCurrentMode}
                  >
                    Reset Template
                  </button>
                </div>
              </div>
            </div>
          </section>

          {error ? <div className="status status-error">{error}</div> : null}
          {status ? <div className="status status-success">{status}</div> : null}

          <p className="footer-note">
            Semua mode input di atas akan dikonversi menjadi dokumen Word melalui
            generator yang sama. Untuk mode Markdown, kamu tetap bisa memakai{" "}
            <code>#</code>, <code>##</code>, <code>-</code>, <code>**text**</code>,
            <code>[label](url)</code>, plus foto profil dan tanda tangan opsional
            untuk output DOCX/PDF.
          </p>
        </div>

        <aside className="card panel aside-stack aside-sticky">
          <div className="aside-header">
            <div>
              <h2>Preview Studio</h2>
              <p className="aside-copy">
                Pantau hasil akhir CV, cover letter, recruiter message, dan
                insight utama tanpa perlu scroll terlalu jauh.
              </p>
            </div>
            <div className="studio-pills">
              <span className="pill">{availableOutputCount} ready</span>
              <span className="pill">{activeAssetCount} assets</span>
            </div>
          </div>

          <div className="asset-preview-stack">
            <div className="asset-preview-panel">
              <strong>Profile photo export preview</strong>
              {visualAssets.profilePhoto ? (
                <Image
                  src={visualAssets.profilePhoto.dataUrl}
                  alt="Profile photo export preview"
                  width={visualAssets.profilePhoto.width}
                  height={visualAssets.profilePhoto.height}
                  unoptimized
                  className="asset-image asset-image-photo asset-image-preview"
                />
              ) : (
                <p>Belum ada foto profil untuk export CV.</p>
              )}
            </div>
            <div className="asset-preview-panel">
              <strong>Signature export preview</strong>
              {visualAssets.signature ? (
                <Image
                  src={visualAssets.signature.dataUrl}
                  alt="Signature export preview"
                  width={visualAssets.signature.width}
                  height={visualAssets.signature.height}
                  unoptimized
                  className="asset-image asset-image-signature asset-image-preview-signature"
                />
              ) : (
                <p>Belum ada tanda tangan untuk export cover letter.</p>
              )}
            </div>
          </div>

          <div className="preview-switcher" role="tablist" aria-label="Output previews">
            {[
              { id: "cv", label: "CV" },
              { id: "cover-letter", label: "Cover Letter" },
              { id: "recruiter", label: "Recruiter Msg" },
              { id: "insights", label: "Insights" },
            ].map((panel) => (
              <button
                key={panel.id}
                type="button"
                className={`preview-switch ${
                  activePreviewPanel === panel.id ? "preview-switch-active" : ""
                }`.trim()}
                onClick={() => setActivePreviewPanel(panel.id as PreviewPanel)}
              >
                {panel.label}
              </button>
            ))}
          </div>

          {activePreviewPanel === "cv" ? (
            <>
              <h2>Live DOCX Source</h2>
              <p className="aside-copy">
                Preview ini menunjukkan isi final yang akan dipakai saat generate
                `.docx`.
              </p>
              <div className="preview-box">{generatedMarkdown}</div>
            </>
          ) : null}

          {activePreviewPanel === "cover-letter" ? (
            <>
              <h2>Cover Letter Preview</h2>
              <p className="aside-copy">
                Ini adalah draft surat lamaran yang dibangun dari format CV aktif,
                detail perusahaan, dan hasil tailoring job description.
              </p>
              <div className="preview-box preview-box-secondary">
                {generatedCoverLetter}
              </div>
            </>
          ) : null}

          {activePreviewPanel === "recruiter" ? (
            <>
              <h2>Recruiter Message Preview</h2>
              <p className="aside-copy">
                Pesan pendek ini dibuat untuk kontak pertama yang cepat dan tetap
                relevan dengan role target.
              </p>
              <div className="preview-box preview-box-tertiary">
                {recruiterMessage}
              </div>
            </>
          ) : null}

          {activePreviewPanel === "insights" ? (
            <>
              <h2>Quick Insights</h2>
              <p className="aside-copy">
                Ringkasan cepat untuk memastikan output sudah cukup siap sebelum
                kamu export.
              </p>
              <div className="insight-grid">
                <div className="insight-card">
                  <strong>Match Score</strong>
                  <p>
                    {matchAnalysis.isReady
                      ? `${matchAnalysis.score}% • ${matchAnalysis.scoreLabel}`
                      : "Belum ada score karena job description belum dipaste."}
                  </p>
                </div>
                <div className="insight-card">
                  <strong>Format</strong>
                  <p>{activeMode.title}</p>
                </div>
                <div className="insight-card">
                  <strong>Template</strong>
                  <p>{selectedTemplateLabel}</p>
                </div>
                <div className="insight-card">
                  <strong>Language</strong>
                  <p>
                    {communicationLanguage === "id"
                      ? "Bahasa Indonesia"
                      : "English"}
                  </p>
                </div>
                <div className="insight-card">
                  <strong>Keywords</strong>
                  <p>
                    {tailoring.detectedKeywords.length > 0
                      ? tailoring.detectedKeywords.join(", ")
                      : "Belum ada keyword dari job description."}
                  </p>
                </div>
                <div className="insight-card">
                  <strong>Recommended Next Fix</strong>
                  <p>
                    {matchAnalysis.recommendations[0] ||
                      "CV aktif sudah cukup rapi untuk lanjut export."}
                  </p>
                </div>
              </div>
            </>
          ) : null}

          <div className="meta-list">
            <div className="meta-item">
              <strong>Current format</strong>
              <p>
                <span className="pill">{activeMode.title}</span>
              </p>
            </div>
            <div className="meta-item">
              <strong>Selected DOCX template</strong>
              <p>
                <span className="pill">
                  {
                    DOCX_TEMPLATE_OPTIONS.find(
                      (template) => template.id === selectedTemplate
                    )?.label
                  }
                </span>
              </p>
            </div>
            <div className="meta-item">
              <strong>Visual assets</strong>
              <ul>
                <li>
                  Profile photo:{" "}
                  {visualAssets.profilePhoto
                    ? describeVisualAsset(visualAssets.profilePhoto)
                    : "belum ada"}
                </li>
                <li>
                  Signature:{" "}
                  {visualAssets.signature
                    ? describeVisualAsset(visualAssets.signature)
                    : "belum ada"}
                </li>
              </ul>
            </div>
            <div className="meta-item">
              <strong>Communication language</strong>
              <p>
                <span className="pill">
                  {communicationLanguage === "id"
                    ? "Bahasa Indonesia"
                    : "English"}
                </span>
              </p>
            </div>
            <div className="meta-item">
              <strong>Draft status</strong>
              <p>{isDraftReady ? formatSavedTime(lastSavedAt) : "Memeriksa draft lokal..."}</p>
            </div>
            <div className="meta-item">
              <strong>Named drafts</strong>
              <p>
                {namedDrafts.length > 0
                  ? `${namedDrafts.length} draft bernama tersedia di browser ini.`
                  : "Belum ada named draft yang tersimpan."}
              </p>
            </div>
            <div className="meta-item">
              <strong>Match Summary</strong>
              <p>{matchAnalysis.summary}</p>
            </div>
            <div className="meta-item">
              <strong>Tailoring insights</strong>
              {jobDescription.trim() ? (
                <ul>
                  {tailoring.targetRole ? (
                    <li>Target role: {tailoring.targetRole}</li>
                  ) : null}
                  {tailoring.detectedKeywords.length > 0 ? (
                    <li>
                      Detected keywords: {tailoring.detectedKeywords.join(", ")}
                    </li>
                  ) : (
                    <li>No strong keywords detected yet from the job description.</li>
                  )}
                  {matchAnalysis.missingTechnicalKeywords.length > 0 ? (
                    <li>
                      Missing technical signals:{" "}
                      {matchAnalysis.missingTechnicalKeywords.join(", ")}
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p>Paste job description to see detected role and keywords.</p>
              )}
            </div>
            <div className="meta-item">
              <strong>Cover letter behavior</strong>
              <p>
                Surat lamaran dibangun secara lokal dari CV aktif, keyword
                lowongan, target role, dan detail perusahaan yang kamu isi.
              </p>
            </div>
            <div className="meta-item">
              <strong>Recruiter message behavior</strong>
              <p>
                Pesan recruiter disusun singkat dari CV aktif, target role, dan
                keyword lowongan agar siap dipakai untuk outreach awal.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
