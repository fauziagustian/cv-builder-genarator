import type {
  AtsCvForm,
  CvInputMode,
  MinimalCvForm,
  ProfessionalCvForm,
} from "@/lib/cv/formats";
import type { TailorAnalysis } from "@/lib/cv/tailor";

export type CommunicationLanguage = "en" | "id";

export type CoverLetterForm = {
  companyName: string;
  hiringManager: string;
  customIntro: string;
  customClosing: string;
};

export function createInitialCoverLetterForm(): CoverLetterForm {
  return {
    companyName: "",
    hiringManager: "",
    customIntro: "",
    customClosing: "",
  };
}

type BuildCoverLetterParams = {
  inputMode: CvInputMode;
  professionalForm: ProfessionalCvForm;
  atsForm: AtsCvForm;
  minimalForm: MinimalCvForm;
  markdown: string;
  tailoring: TailorAnalysis;
  coverLetterForm: CoverLetterForm;
  language: CommunicationLanguage;
};

type CandidateProfile = {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skillHighlights: string[];
};

function splitItems(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function firstSentence(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }

  const match = normalized.match(/.+?[.!?](?:\s|$)/);
  return match?.[0]?.trim() || normalized;
}

function extractMarkdownHeading(markdown: string) {
  return (
    markdown
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("# "))
      ?.slice(2)
      .trim() || ""
  );
}

function extractMarkdownTitle(markdown: string) {
  return (
    markdown
      .split("\n")
      .map((line) => line.trim())
      .find((line) => /^\*\*.+\*\*$/.test(line))
      ?.replace(/^\*\*/, "")
      .replace(/\*\*$/, "")
      .trim() || ""
  );
}

function buildProfileFromActiveMode(
  inputMode: CvInputMode,
  professionalForm: ProfessionalCvForm,
  atsForm: AtsCvForm,
  minimalForm: MinimalCvForm,
  markdown: string
): CandidateProfile {
  if (inputMode === "professional") {
    return {
      name: professionalForm.fullName,
      title: professionalForm.title,
      location: professionalForm.location,
      email: professionalForm.email,
      phone: professionalForm.phone,
      linkedin: professionalForm.linkedin,
      summary: professionalForm.summary,
      skillHighlights: [
        ...splitItems(professionalForm.skills.frontend),
        ...splitItems(professionalForm.skills.backend),
        ...splitItems(professionalForm.skills.cloud),
      ].slice(0, 8),
    };
  }

  if (inputMode === "ats") {
    return {
      name: atsForm.fullName,
      title: atsForm.title,
      location: atsForm.location,
      email: atsForm.email,
      phone: atsForm.phone,
      linkedin: atsForm.linkedin,
      summary: atsForm.summary,
      skillHighlights: [
        ...splitItems(atsForm.competencies),
        ...splitItems(atsForm.technicalKeywords),
      ].slice(0, 8),
    };
  }

  if (inputMode === "minimal") {
    return {
      name: minimalForm.fullName,
      title: minimalForm.title,
      location: "",
      email: "",
      phone: "",
      linkedin: "",
      summary: minimalForm.summary,
      skillHighlights: splitItems(minimalForm.keySkills).slice(0, 8),
    };
  }

  return {
    name: extractMarkdownHeading(markdown) || "YOUR NAME",
    title: extractMarkdownTitle(markdown) || "Professional",
    location: "",
    email: "",
    phone: "",
    linkedin: "",
    summary: "",
    skillHighlights: tailoringFallbackSkills(markdown),
  };
}

function tailoringFallbackSkills(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim())
    .slice(0, 8);
}

function buildGreeting(
  companyName: string,
  hiringManager: string,
  language: CommunicationLanguage
) {
  const isIndonesian = language === "id";

  if (hiringManager.trim() && companyName.trim()) {
    return isIndonesian
      ? `Yth. ${hiringManager.trim()} di ${companyName.trim()},`
      : `Dear ${hiringManager.trim()} at ${companyName.trim()},`;
  }

  if (hiringManager.trim()) {
    return isIndonesian
      ? `Yth. ${hiringManager.trim()},`
      : `Dear ${hiringManager.trim()},`;
  }

  if (companyName.trim()) {
    return isIndonesian
      ? `Yth. Tim Rekrutmen ${companyName.trim()},`
      : `Dear Hiring Team at ${companyName.trim()},`;
  }

  return isIndonesian ? "Yth. Tim Rekrutmen," : "Dear Hiring Team,";
}

function formatDateLine(language: CommunicationLanguage) {
  return new Intl.DateTimeFormat(language === "id" ? "id-ID" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());
}

function joinPhrase(items: string[]) {
  if (items.length === 0) {
    return "";
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`;
  }

  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function buildCoverLetterMarkdown({
  inputMode,
  professionalForm,
  atsForm,
  minimalForm,
  markdown,
  tailoring,
  coverLetterForm,
  language,
}: BuildCoverLetterParams) {
  const profile = buildProfileFromActiveMode(
    inputMode,
    professionalForm,
    atsForm,
    minimalForm,
    markdown
  );

  const targetRole =
    tailoring.targetRole ||
    (inputMode === "ats" ? atsForm.targetRole : profile.title) ||
    "this opportunity";
  const companyName = coverLetterForm.companyName.trim();
  const greeting = buildGreeting(
    companyName,
    coverLetterForm.hiringManager,
    language
  );
  const topSkills = joinPhrase(
    Array.from(new Set([...tailoring.technicalKeywords, ...profile.skillHighlights])).slice(
      0,
      5
    )
  );
  const softFit = joinPhrase(tailoring.softKeywords.slice(0, 3)).toLowerCase();
  const summaryLine = firstSentence(profile.summary);
  const isIndonesian = language === "id";
  const roleLine = isIndonesian
    ? companyName
      ? `Saya menulis surat ini untuk menyampaikan minat saya pada posisi ${targetRole} di ${companyName}.`
      : `Saya menulis surat ini untuk menyampaikan minat saya pada posisi ${targetRole}.`
    : companyName
      ? `I am writing to express my interest in the ${targetRole} role at ${companyName}.`
      : `I am writing to express my interest in the ${targetRole} role.`;
  const capabilityLine = isIndonesian
    ? topSkills
      ? `Latar belakang saya mencakup pengalaman praktis yang kuat dalam ${topSkills}, dan saya secara konsisten membangun solusi production-ready dengan fokus pada performa, reliability, dan maintainability.`
      : `Latar belakang saya mencakup pembangunan solusi production-ready dengan fokus pada performa, reliability, dan maintainability.`
    : topSkills
      ? `My background includes strong hands-on experience in ${topSkills}, and I have consistently delivered production-ready solutions with a focus on performance, reliability, and maintainability.`
      : `My background includes building production-ready solutions with a focus on performance, reliability, and maintainability.`;
  const fitLine = isIndonesian
    ? tailoring.detectedKeywords.length > 0
      ? `Yang paling menarik perhatian saya dari peluang ini adalah fokus pada ${joinPhrase(
          tailoring.detectedKeywords.slice(0, 5)
        )}. Saya percaya pengalaman saya akan memungkinkan saya untuk berkontribusi cepat dan berkolaborasi secara efektif sejak hari pertama${
          softFit ? `, khususnya dalam ${softFit}` : ""
        }.`
      : `Saya akan sangat senang mendapat kesempatan untuk berkontribusi cepat, bekerja erat dengan tim, dan mendukung tujuan peran ini sejak hari pertama.`
    : tailoring.detectedKeywords.length > 0
      ? `What especially draws me to this opportunity is the emphasis on ${joinPhrase(
          tailoring.detectedKeywords.slice(0, 5)
        )}. I believe my experience would allow me to contribute quickly and collaborate effectively from day one${
          softFit ? `, particularly in ${softFit}` : ""
        }.`
      : `I would welcome the opportunity to contribute quickly, work closely with the team, and support the goals of this role from day one.`;

  const lines: string[] = [];

  lines.push(`# ${profile.name || "YOUR NAME"}`, "");

  if (profile.title.trim()) {
    lines.push(`**${profile.title.trim()}**`);
  }

  const contactBits = [
    profile.location.trim(),
    profile.email.trim(),
    profile.phone.trim(),
  ].filter(Boolean);

  if (contactBits.length > 0) {
    lines.push(contactBits.join(" | "));
  }

  if (profile.linkedin.trim()) {
    lines.push(`LinkedIn: [${profile.linkedin.trim()}](${profile.linkedin.trim()})`);
  }

  lines.push(
    "",
    isIndonesian ? "## Surat Lamaran" : "## Cover Letter",
    "",
    formatDateLine(language),
    "",
    greeting,
    ""
  );
  lines.push(roleLine);

  if (coverLetterForm.customIntro.trim()) {
    lines.push("", coverLetterForm.customIntro.trim());
  } else if (summaryLine) {
    lines.push("", summaryLine);
  }

  lines.push("", capabilityLine, "", fitLine);

  if (coverLetterForm.customClosing.trim()) {
    lines.push("", coverLetterForm.customClosing.trim());
  } else {
    lines.push(
      "",
      isIndonesian
        ? "Terima kasih atas waktu dan pertimbangannya. Saya dengan senang hati akan mendiskusikan bagaimana pengalaman saya dapat mendukung tim Anda dan peran ini secara lebih detail."
        : "Thank you for your time and consideration. I would be glad to discuss how my experience can support your team and this role in more detail."
    );
  }

  lines.push(
    "",
    isIndonesian ? "Hormat saya," : "Sincerely,",
    "",
    profile.name || "YOUR NAME"
  );

  return lines.join("\n").trim();
}
