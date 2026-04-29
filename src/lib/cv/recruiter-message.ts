import type {
  AtsCvForm,
  CvInputMode,
  MinimalCvForm,
  ProfessionalCvForm,
} from "@/lib/cv/formats";
import type { TailorAnalysis } from "@/lib/cv/tailor";
import type { CoverLetterForm } from "@/lib/cv/cover-letter";
import type { CommunicationLanguage } from "@/lib/cv/cover-letter";

type BuildRecruiterMessageParams = {
  inputMode: CvInputMode;
  professionalForm: ProfessionalCvForm;
  atsForm: AtsCvForm;
  minimalForm: MinimalCvForm;
  markdown: string;
  tailoring: TailorAnalysis;
  coverLetterForm: CoverLetterForm;
  language: CommunicationLanguage;
};

function extractMarkdownName(markdown: string) {
  return (
    markdown
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.startsWith("# "))
      ?.replace(/^#\s+/, "")
      .trim() || "Candidate"
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
      .trim() || "Professional"
  );
}

function getProfile(inputMode: CvInputMode, professionalForm: ProfessionalCvForm, atsForm: AtsCvForm, minimalForm: MinimalCvForm, markdown: string) {
  if (inputMode === "professional") {
    return {
      name: professionalForm.fullName,
      title: professionalForm.title,
      summary: professionalForm.summary,
    };
  }

  if (inputMode === "ats") {
    return {
      name: atsForm.fullName,
      title: atsForm.title,
      summary: atsForm.summary,
    };
  }

  if (inputMode === "minimal") {
    return {
      name: minimalForm.fullName,
      title: minimalForm.title,
      summary: minimalForm.summary,
    };
  }

  return {
    name: extractMarkdownName(markdown),
    title: extractMarkdownTitle(markdown),
    summary: "",
  };
}

function compactSentence(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function buildRecruiterMessage({
  inputMode,
  professionalForm,
  atsForm,
  minimalForm,
  markdown,
  tailoring,
  coverLetterForm,
  language,
}: BuildRecruiterMessageParams) {
  const profile = getProfile(
    inputMode,
    professionalForm,
    atsForm,
    minimalForm,
    markdown
  );
  const companyName = coverLetterForm.companyName.trim();
  const role =
    tailoring.targetRole ||
    (inputMode === "ats" ? atsForm.targetRole : profile.title) ||
    "this role";
  const keywords = tailoring.technicalKeywords.slice(0, 4);
  const summary = compactSentence(profile.summary).split(". ")[0]?.trim();
  const isIndonesian = language === "id";

  const messageParts = isIndonesian
    ? [
        `Halo${coverLetterForm.hiringManager.trim() ? ` ${coverLetterForm.hiringManager.trim()}` : ""},`,
        `Saya ${profile.name}, seorang ${profile.title}${companyName ? ` yang tertarik dengan peluang di ${companyName}` : ""}.`,
        summary
          ? `${summary}.`
          : "Saya telah membangun aplikasi yang scalable, secure, dan production-ready di lingkungan enterprise maupun startup.",
        keywords.length > 0
          ? `Latar belakang saya sangat kuat di ${keywords.join(", ")}${role ? `, yang menurut saya sangat relevan dengan ${role}` : ""}.`
          : role
            ? `Saya percaya latar belakang saya cukup relevan dengan ${role}.`
            : "",
        "Jika berkenan, saya dengan senang hati dapat membagikan CV saya dan mendiskusikan apakah pengalaman saya cocok untuk kebutuhan tim Anda.",
      ].filter(Boolean)
    : [
        `Hi${coverLetterForm.hiringManager.trim() ? ` ${coverLetterForm.hiringManager.trim()}` : ""},`,
        `I’m ${profile.name}, a ${profile.title}${companyName ? ` interested in opportunities at ${companyName}` : ""}.`,
        summary
          ? `${summary}.`
          : "I’ve been building scalable, secure, and production-ready applications across enterprise and startup environments.",
        keywords.length > 0
          ? `My background is especially strong in ${keywords.join(", ")}${role ? `, which aligns well with ${role}` : ""}.`
          : role
            ? `I believe my background aligns well with ${role}.`
            : "",
        "If helpful, I’d be glad to share my CV and discuss whether my experience could be a fit for your team.",
      ].filter(Boolean);

  return messageParts.join(" ");
}
