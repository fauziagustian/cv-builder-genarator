import type {
  AtsCvForm,
  MinimalCvForm,
  ProfessionalCvForm,
} from "@/lib/cv/formats";

type KeywordBucket =
  | "frontend"
  | "backend"
  | "architecture"
  | "cloud"
  | "tools"
  | "soft";

type KeywordRule = {
  label: string;
  bucket: KeywordBucket;
  patterns: RegExp[];
};

export type TailorAnalysis = {
  targetRole: string;
  detectedKeywords: string[];
  competencies: string[];
  technicalKeywords: string[];
  softKeywords: string[];
  skillBuckets: Record<Exclude<KeywordBucket, "soft">, string[]>;
  fitBullets: string[];
  summaryFocus: string;
};

const KEYWORD_RULES: KeywordRule[] = [
  { label: "Node.js", bucket: "backend", patterns: [/node\.?js/i] },
  { label: "React.js", bucket: "frontend", patterns: [/react(?:\.js)?/i] },
  { label: "TypeScript", bucket: "frontend", patterns: [/typescript/i] },
  { label: "JavaScript", bucket: "frontend", patterns: [/javascript/i] },
  { label: "Express.js", bucket: "backend", patterns: [/express(?:\.js)?/i] },
  { label: "RESTful APIs", bucket: "architecture", patterns: [/restful api|rest api|\bapis?\b/i] },
  { label: "Microservices", bucket: "architecture", patterns: [/microservices?/i] },
  { label: "System Design", bucket: "architecture", patterns: [/system design/i] },
  { label: "Web Security", bucket: "architecture", patterns: [/\bweb security\b/i, /\bapi security\b/i, /\bsecurity\b/i] },
  { label: "OAuth2", bucket: "architecture", patterns: [/oauth2/i] },
  { label: "JWT", bucket: "architecture", patterns: [/\bjwt\b/i] },
  { label: "Cloudflare", bucket: "cloud", patterns: [/cloudflare/i] },
  { label: "Cloudflare Workers", bucket: "cloud", patterns: [/cloudflare workers?/i, /\bworkers\b/i] },
  { label: "CDN", bucket: "cloud", patterns: [/\bcdn\b/i] },
  { label: "Docker", bucket: "cloud", patterns: [/docker/i] },
  { label: "Kubernetes", bucket: "cloud", patterns: [/kubernetes/i] },
  { label: "CI/CD", bucket: "cloud", patterns: [/ci\/cd/i, /continuous integration/i, /continuous delivery/i] },
  { label: "AWS", bucket: "cloud", patterns: [/\baws\b/i] },
  { label: "Azure", bucket: "cloud", patterns: [/\bazure\b/i] },
  { label: "GCP", bucket: "cloud", patterns: [/\bgcp\b/i, /google cloud/i] },
  { label: "Git", bucket: "tools", patterns: [/\bgit\b/i] },
  { label: "QA Collaboration", bucket: "soft", patterns: [/\bqa\b/i] },
  { label: "Product Collaboration", bucket: "soft", patterns: [/\bproduct\b/i] },
  { label: "Design Collaboration", bucket: "soft", patterns: [/\bdesign\b/i] },
  { label: "Troubleshooting", bucket: "soft", patterns: [/troubleshoot/i, /\bdebug/i] },
  { label: "Performance Optimization", bucket: "soft", patterns: [/\bperformance\b/i, /optimi[sz]/i] },
  { label: "Responsive Applications", bucket: "soft", patterns: [/responsive/i, /responsiveness/i] },
  { label: "Remote Collaboration", bucket: "soft", patterns: [/\bremote\b/i] },
  { label: "Independent Work", bucket: "soft", patterns: [/independent/i, /independently/i] },
];

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)));
}

function splitLineBreaks(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCsvOrLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function mergeLineValues(existing: string, additions: string[]) {
  return unique([...splitLineBreaks(existing), ...additions]).join("\n");
}

function mergeSentenceBlocks(existing: string, additions: string[]) {
  return unique([existing.trim(), ...additions.map((item) => item.trim())].filter(Boolean)).join(
    "\n\n"
  );
}

function extractTargetRole(jobDescription: string) {
  const lines = jobDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const lineCandidate = lines.find((line) =>
    /(developer|engineer|architect)/i.test(line)
  );

  if (lineCandidate) {
    return lineCandidate
      .replace(/^hiring\s*:\s*/i, "")
      .replace(/^we are looking for\s+/i, "")
      .replace(/\(.*$/, "")
      .replace(/[-–:].*$/, "")
      .trim();
  }

  const match = jobDescription.match(
    /\b(?:Senior|Lead|Staff|Principal|Junior|Middle)?\s*(?:Full[- ]?stack|Frontend|Backend|Software|Web)\s+(?:Developer|Engineer)\b/i
  );

  return match?.[0]?.trim() || "";
}

function buildSummaryFocus(targetRole: string, topTechnical: string[], softKeywords: string[]) {
  const technical = topTechnical.slice(0, 4).join(", ");
  const soft = softKeywords.slice(0, 2).join(" and ").toLowerCase();

  if (targetRole && technical && soft) {
    return `Tailored for ${targetRole} with emphasis on ${technical}, plus proven strength in ${soft}.`;
  }

  if (targetRole && technical) {
    return `Tailored for ${targetRole} with emphasis on ${technical}.`;
  }

  if (technical) {
    return `Targeted emphasis on ${technical} for this application.`;
  }

  return targetRole ? `Tailored for ${targetRole}.` : "";
}

export function analyzeJobDescription(jobDescription: string): TailorAnalysis {
  const text = jobDescription.trim();
  const detected: string[] = [];
  const competencies: string[] = [];
  const technicalKeywords: string[] = [];
  const softKeywords: string[] = [];
  const skillBuckets: Record<Exclude<KeywordBucket, "soft">, string[]> = {
    frontend: [],
    backend: [],
    architecture: [],
    cloud: [],
    tools: [],
  };

  if (!text) {
    return {
      targetRole: "",
      detectedKeywords: [],
      competencies: [],
      technicalKeywords: [],
      softKeywords: [],
      skillBuckets,
      fitBullets: [],
      summaryFocus: "",
    };
  }

  for (const rule of KEYWORD_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      detected.push(rule.label);

      if (rule.bucket === "soft") {
        softKeywords.push(rule.label);
      } else {
        technicalKeywords.push(rule.label);
        skillBuckets[rule.bucket].push(rule.label);
      }
    }
  }

  competencies.push(
    ...unique([
      ...skillBuckets.frontend,
      ...skillBuckets.backend,
      ...skillBuckets.architecture,
      ...softKeywords,
    ])
  );

  const targetRole = extractTargetRole(text);
  const uniqueDetected = unique(detected);
  const uniqueTechnical = unique(technicalKeywords);
  const uniqueSoft = unique(softKeywords);
  const fitBullets = unique(
    [
      uniqueTechnical.length > 0
        ? `Aligned with role requirements in ${uniqueTechnical
            .slice(0, 6)
            .join(", ")}.`
        : "",
      uniqueSoft.length > 0
        ? `Strong fit for ${uniqueSoft
            .slice(0, 3)
            .join(", ")
            .toLowerCase()}.`
        : "",
      targetRole
        ? `Prepared to position this application specifically for ${targetRole}.`
        : "",
    ].filter(Boolean)
  );

  return {
    targetRole,
    detectedKeywords: uniqueDetected,
    competencies: unique(competencies),
    technicalKeywords: uniqueTechnical,
    softKeywords: uniqueSoft,
    skillBuckets: {
      frontend: unique(skillBuckets.frontend),
      backend: unique(skillBuckets.backend),
      architecture: unique(skillBuckets.architecture),
      cloud: unique(skillBuckets.cloud),
      tools: unique(skillBuckets.tools),
    },
    fitBullets,
    summaryFocus: buildSummaryFocus(targetRole, uniqueTechnical, uniqueSoft),
  };
}

export function tailorProfessionalCvForm(
  form: ProfessionalCvForm,
  analysis: TailorAnalysis
) {
  if (analysis.detectedKeywords.length === 0 && !analysis.targetRole) {
    return form;
  }

  return {
    ...form,
    summary: mergeSentenceBlocks(form.summary, [analysis.summaryFocus]),
    skills: {
      ...form.skills,
      frontend: mergeLineValues(form.skills.frontend, analysis.skillBuckets.frontend),
      backend: mergeLineValues(form.skills.backend, analysis.skillBuckets.backend),
      architecture: mergeLineValues(
        form.skills.architecture,
        analysis.skillBuckets.architecture
      ),
      cloud: mergeLineValues(form.skills.cloud, analysis.skillBuckets.cloud),
      tools: mergeLineValues(form.skills.tools, analysis.skillBuckets.tools),
    },
    achievements: mergeLineValues(form.achievements, analysis.fitBullets),
  };
}

export function tailorAtsCvForm(form: AtsCvForm, analysis: TailorAnalysis) {
  if (analysis.detectedKeywords.length === 0 && !analysis.targetRole) {
    return form;
  }

  const firstExperience = form.experiences[0];

  return {
    ...form,
    targetRole: analysis.targetRole || form.targetRole,
    summary: mergeSentenceBlocks(form.summary, [analysis.summaryFocus]),
    competencies: mergeLineValues(form.competencies, analysis.competencies),
    technicalKeywords: mergeLineValues(
      form.technicalKeywords,
      analysis.technicalKeywords
    ),
    achievements: mergeLineValues(form.achievements, analysis.fitBullets),
    experiences: form.experiences.map((experience, index) =>
      index === 0 && firstExperience
        ? {
            ...experience,
            keywords: unique([
              ...splitCsvOrLines(experience.keywords),
              ...analysis.technicalKeywords,
              ...analysis.softKeywords,
            ]).join(", "),
          }
        : experience
    ),
  };
}

export function tailorMinimalCvForm(
  form: MinimalCvForm,
  analysis: TailorAnalysis
) {
  if (analysis.detectedKeywords.length === 0 && !analysis.targetRole) {
    return form;
  }

  return {
    ...form,
    title: analysis.targetRole || form.title,
    summary: mergeSentenceBlocks(form.summary, [analysis.summaryFocus]),
    keySkills: mergeLineValues(form.keySkills, analysis.technicalKeywords),
    highlights: mergeLineValues(form.highlights, analysis.fitBullets),
  };
}

export function tailorMarkdownContent(markdown: string, analysis: TailorAnalysis) {
  if (analysis.detectedKeywords.length === 0 && !analysis.targetRole) {
    return markdown;
  }

  const lines = [markdown.trim()];

  if (analysis.targetRole) {
    lines.push("", "## Targeted Role", "", `- ${analysis.targetRole}`);
  }

  if (analysis.technicalKeywords.length > 0 || analysis.softKeywords.length > 0) {
    lines.push("", "## Targeted Fit", "");
    lines.push(
      ...unique([...analysis.technicalKeywords, ...analysis.softKeywords]).map(
        (item) => `- ${item}`
      )
    );
  }

  if (analysis.summaryFocus) {
    lines.push("", "## Tailoring Note", "", analysis.summaryFocus);
  }

  return lines.join("\n").trim();
}
