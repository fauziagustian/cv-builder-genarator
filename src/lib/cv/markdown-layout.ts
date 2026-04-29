export type ParsedMarkdownSection = {
  title: string;
  lines: string[];
};

export type ParsedMarkdownDocument = {
  title: string;
  subtitle: string;
  headerLines: string[];
  sections: ParsedMarkdownSection[];
};

const SIDEBAR_SECTION_TITLES = new Set([
  "core skills",
  "core competencies",
  "technical keywords",
  "key skills",
  "career highlights",
  "key achievements",
  "education",
  "languages",
]);

function stripBoldMarkers(value: string) {
  return value.replace(/^\*\*/, "").replace(/\*\*$/, "").trim();
}

export function parseMarkdownDocument(markdown: string): ParsedMarkdownDocument {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const sections: ParsedMarkdownSection[] = [];
  let currentSection: ParsedMarkdownSection | null = null;
  let title = "";
  let subtitle = "";
  const headerLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (!title && line.startsWith("# ")) {
      title = line.slice(2).trim();
      continue;
    }

    if (line.startsWith("## ")) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: line.slice(3).trim(),
        lines: [],
      };
      continue;
    }

    if (currentSection) {
      currentSection.lines.push(line);
      continue;
    }

    if (!subtitle && /^\*\*.+\*\*$/.test(line)) {
      subtitle = stripBoldMarkers(line);
      continue;
    }

    headerLines.push(line);
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    title,
    subtitle,
    headerLines,
    sections,
  };
}

export function splitSectionsForTwoColumn(sections: ParsedMarkdownSection[]) {
  const sidebarSections: ParsedMarkdownSection[] = [];
  const mainSections: ParsedMarkdownSection[] = [];

  for (const section of sections) {
    const normalizedTitle = section.title.toLowerCase().trim();

    if (SIDEBAR_SECTION_TITLES.has(normalizedTitle)) {
      sidebarSections.push(section);
    } else {
      mainSections.push(section);
    }
  }

  if (mainSections.length === 0 && sidebarSections.length > 0) {
    mainSections.push(sidebarSections.pop() as ParsedMarkdownSection);
  }

  if (sidebarSections.length === 0 && mainSections.length > 1) {
    const fallbackIndex = mainSections.findIndex((section) =>
      ["education", "languages", "key achievements"].includes(
        section.title.toLowerCase().trim()
      )
    );

    if (fallbackIndex >= 0) {
      sidebarSections.push(...mainSections.splice(fallbackIndex, 1));
    }
  }

  return {
    sidebarSections,
    mainSections,
  };
}
