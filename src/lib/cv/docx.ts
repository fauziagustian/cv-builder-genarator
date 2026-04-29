import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableBorders,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlign,
  WidthType,
  type ParagraphChild,
} from "docx";
import type { DocxTemplate } from "@/lib/cv/docx-templates";
import {
  parseMarkdownDocument,
  splitSectionsForTwoColumn,
  type ParsedMarkdownSection,
} from "@/lib/cv/markdown-layout";
import {
  fitWithinBox,
  hydrateVisualAssets,
  resolveDocxImageType,
  type CvVisualAssets,
  type DocumentKind,
} from "@/lib/cv/visual-assets";

const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type TemplateConfig = {
  titleAlign: (typeof AlignmentType)[keyof typeof AlignmentType];
  imageAlign: (typeof AlignmentType)[keyof typeof AlignmentType];
  titleColor: string;
  headingColor: string;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  sidebarFill: string;
  sidebarHeadingColor: string;
  titleSize: number;
  bodySize: number;
  headingSizes: Record<1 | 2 | 3, number>;
  paragraphAfter: number;
  bulletAfter: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

const TEMPLATE_CONFIG: Record<DocxTemplate, TemplateConfig> = {
  classic: {
    titleAlign: AlignmentType.CENTER,
    imageAlign: AlignmentType.CENTER,
    titleColor: "0F172A",
    headingColor: "111827",
    textColor: "111827",
    mutedColor: "475569",
    accentColor: "2563EB",
    sidebarFill: "EFF6FF",
    sidebarHeadingColor: "1D4ED8",
    titleSize: 32,
    bodySize: 22,
    headingSizes: {
      1: 30,
      2: 26,
      3: 24,
    },
    paragraphAfter: 120,
    bulletAfter: 80,
    margins: {
      top: 900,
      right: 900,
      bottom: 900,
      left: 900,
    },
  },
  modern: {
    titleAlign: AlignmentType.LEFT,
    imageAlign: AlignmentType.LEFT,
    titleColor: "0F766E",
    headingColor: "0F172A",
    textColor: "0F172A",
    mutedColor: "475569",
    accentColor: "0EA5E9",
    sidebarFill: "ECFEFF",
    sidebarHeadingColor: "0F766E",
    titleSize: 34,
    bodySize: 22,
    headingSizes: {
      1: 32,
      2: 28,
      3: 24,
    },
    paragraphAfter: 130,
    bulletAfter: 90,
    margins: {
      top: 820,
      right: 860,
      bottom: 820,
      left: 860,
    },
  },
  compact: {
    titleAlign: AlignmentType.LEFT,
    imageAlign: AlignmentType.LEFT,
    titleColor: "1E293B",
    headingColor: "334155",
    textColor: "1F2937",
    mutedColor: "64748B",
    accentColor: "2563EB",
    sidebarFill: "F8FAFC",
    sidebarHeadingColor: "1E40AF",
    titleSize: 28,
    bodySize: 20,
    headingSizes: {
      1: 28,
      2: 24,
      3: 22,
    },
    paragraphAfter: 80,
    bulletAfter: 45,
    margins: {
      top: 680,
      right: 720,
      bottom: 680,
      left: 720,
    },
  },
  split: {
    titleAlign: AlignmentType.LEFT,
    imageAlign: AlignmentType.LEFT,
    titleColor: "0F172A",
    headingColor: "0F172A",
    textColor: "1F2937",
    mutedColor: "475569",
    accentColor: "0F766E",
    sidebarFill: "ECFDF5",
    sidebarHeadingColor: "0F766E",
    titleSize: 34,
    bodySize: 21,
    headingSizes: {
      1: 30,
      2: 23,
      3: 21,
    },
    paragraphAfter: 96,
    bulletAfter: 64,
    margins: {
      top: 760,
      right: 760,
      bottom: 760,
      left: 760,
    },
  },
};

function getTemplateConfig(template: DocxTemplate) {
  return TEMPLATE_CONFIG[template] || TEMPLATE_CONFIG.classic;
}

function titleParagraph(text: string, template: DocxTemplate) {
  const config = getTemplateConfig(template);

  return new Paragraph({
    alignment: config.titleAlign,
    spacing: {
      after: config.paragraphAfter + 60,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: config.titleColor,
        size: config.titleSize,
      }),
    ],
  });
}

function createImageParagraph(params: {
  asset: NonNullable<CvVisualAssets["profilePhoto"] | CvVisualAssets["signature"]>;
  template: DocxTemplate;
  maxWidth: number;
  maxHeight: number;
  spacingAfter: number;
}) {
  const { asset, template, maxWidth, maxHeight, spacingAfter } = params;
  const config = getTemplateConfig(template);
  const dimensions = fitWithinBox(
    asset.width,
    asset.height,
    maxWidth,
    maxHeight
  );

  return new Paragraph({
    alignment: config.imageAlign,
    spacing: {
      after: spacingAfter,
    },
    children: [
      new ImageRun({
        type: resolveDocxImageType(asset.mimeType),
        data: asset.dataUrl,
        transformation: dimensions,
      }),
    ],
  });
}

function createSplitHeaderText(
  text: string,
  template: DocxTemplate,
  options?: {
    bold?: boolean;
    color?: string;
    size?: number;
    spacingAfter?: number;
  }
) {
  const config = getTemplateConfig(template);

  return new Paragraph({
    spacing: {
      after: options?.spacingAfter ?? config.paragraphAfter,
    },
    children: [
      new TextRun({
        text,
        bold: options?.bold ?? false,
        color: options?.color ?? config.textColor,
        size: options?.size ?? config.bodySize,
      }),
    ],
  });
}

function createSplitSectionHeading(
  text: string,
  template: DocxTemplate,
  sidebar = false
) {
  const config = getTemplateConfig(template);

  return new Paragraph({
    spacing: {
      before: sidebar ? 140 : 240,
      after: sidebar ? 80 : 120,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: sidebar ? config.sidebarHeadingColor : config.headingColor,
        size: sidebar ? config.headingSizes[3] : config.headingSizes[2],
      }),
    ],
  });
}

function createSplitSubheading(text: string, template: DocxTemplate, sidebar = false) {
  const config = getTemplateConfig(template);

  return new Paragraph({
    spacing: {
      before: sidebar ? 70 : 100,
      after: 50,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: config.textColor,
        size: sidebar ? config.bodySize : config.headingSizes[3],
      }),
    ],
  });
}

function createSplitBodyParagraph(
  text: string,
  template: DocxTemplate,
  sidebar = false
) {
  const config = getTemplateConfig(template);

  return new Paragraph({
    spacing: {
      after: sidebar ? 70 : config.paragraphAfter,
    },
    children: parseInlineMarkdown(text, template),
  });
}

function createSplitBulletParagraph(
  text: string,
  template: DocxTemplate,
  sidebar = false
) {
  const config = getTemplateConfig(template);

  return new Paragraph({
    bullet: {
      level: 0,
    },
    spacing: {
      after: sidebar ? 55 : config.bulletAfter,
    },
    children: parseInlineMarkdown(text, template),
  });
}

function buildSplitSectionParagraphs(
  sections: ParsedMarkdownSection[],
  template: DocxTemplate,
  sidebar = false
) {
  const paragraphs: Paragraph[] = [];

  for (const section of sections) {
    paragraphs.push(createSplitSectionHeading(section.title, template, sidebar));

    for (const line of section.lines) {
      if (line.startsWith("### ")) {
        paragraphs.push(
          createSplitSubheading(line.slice(4).trim(), template, sidebar)
        );
        continue;
      }

      if (line.startsWith("- ")) {
        paragraphs.push(
          createSplitBulletParagraph(line.slice(2).trim(), template, sidebar)
        );
        continue;
      }

      paragraphs.push(createSplitBodyParagraph(line, template, sidebar));
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push(createSplitBodyParagraph("", template, sidebar));
  }

  return paragraphs;
}

function buildSplitCvChildren(
  markdown: string,
  template: DocxTemplate,
  options?: GenerateDocxOptions
) {
  const config = getTemplateConfig(template);
  const parsed = parseMarkdownDocument(markdown);

  if (!parsed.title || parsed.sections.length === 0) {
    return markdownToParagraphs(markdown, template, options);
  }

  const visualAssets = hydrateVisualAssets(options?.visualAssets);
  const { sidebarSections, mainSections } = splitSectionsForTwoColumn(
    parsed.sections
  );
  const titleCellParagraphs: Paragraph[] = [
    new Paragraph({
      spacing: {
        after: 80,
      },
      children: [
        new TextRun({
          text: parsed.title,
          bold: true,
          color: config.titleColor,
          size: config.titleSize,
        }),
      ],
    }),
  ];

  if (parsed.subtitle) {
    titleCellParagraphs.push(
      createSplitHeaderText(parsed.subtitle, template, {
        bold: true,
        color: config.accentColor,
        size: config.headingSizes[3],
        spacingAfter: 100,
      })
    );
  }

  for (const line of parsed.headerLines) {
    titleCellParagraphs.push(
      createSplitHeaderText(line, template, {
        color: line.startsWith("LinkedIn:") ? config.accentColor : config.mutedColor,
        spacingAfter: 65,
      })
    );
  }

  const children: Array<Paragraph | Table> = [];

  if (visualAssets.profilePhoto) {
    children.push(
      new Table({
        borders: TableBorders.NONE,
        layout: TableLayoutType.FIXED,
        columnWidths: [1600, 7000],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                borders: TableBorders.NONE,
                width: {
                  size: 1600,
                  type: WidthType.DXA,
                },
                children: [
                  createImageParagraph({
                    asset: visualAssets.profilePhoto,
                    template,
                    maxWidth: 86,
                    maxHeight: 86,
                    spacingAfter: 0,
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                borders: TableBorders.NONE,
                width: {
                  size: 7000,
                  type: WidthType.DXA,
                },
                children: titleCellParagraphs,
              }),
            ],
          }),
        ],
      })
    );
  } else {
    children.push(...titleCellParagraphs);
  }

  children.push(
    new Table({
      borders: TableBorders.NONE,
      layout: TableLayoutType.FIXED,
      columnWidths: [2650, 5950],
      rows: [
        new TableRow({
          children: [
            new TableCell({
              verticalAlign: VerticalAlign.TOP,
              shading: {
                fill: config.sidebarFill,
                color: "auto",
              },
              borders: TableBorders.NONE,
              width: {
                size: 2650,
                type: WidthType.DXA,
              },
              margins: {
                top: 140,
                bottom: 140,
                left: 180,
                right: 180,
              },
              children: buildSplitSectionParagraphs(
                sidebarSections,
                template,
                true
              ),
            }),
            new TableCell({
              verticalAlign: VerticalAlign.TOP,
              borders: TableBorders.NONE,
              width: {
                size: 5950,
                type: WidthType.DXA,
              },
              margins: {
                top: 80,
                bottom: 80,
                left: 260,
                right: 0,
              },
              children: buildSplitSectionParagraphs(mainSections, template),
            }),
          ],
        }),
      ],
    })
  );

  return children;
}

function getHeading(level: 1 | 2 | 3, text: string, template: DocxTemplate) {
  const config = getTemplateConfig(template);
  const headingMap = {
    1: HeadingLevel.HEADING_1,
    2: HeadingLevel.HEADING_2,
    3: HeadingLevel.HEADING_3,
  } as const;

  return new Paragraph({
    heading: headingMap[level],
    spacing: {
      before: level === 1 ? 320 : 240,
      after: 140,
    },
    children: [
      new TextRun({
        text,
        bold: true,
        color: config.headingColor,
        size: config.headingSizes[level],
      }),
    ],
  });
}

function parseInlineMarkdown(
  text: string,
  template: DocxTemplate
): ParagraphChild[] {
  const config = getTemplateConfig(template);
  const children: ParagraphChild[] = [];
  const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^)]+)\)|\*\*([^*]+)\*\*)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      children.push(
        new TextRun({
          text: text.slice(lastIndex, match.index),
          color: config.textColor,
          size: config.bodySize,
        })
      );
    }

    const [fullMatch, , linkLabel, linkUrl, boldText] = match;

    if (linkLabel && linkUrl) {
      children.push(
        new ExternalHyperlink({
          link: linkUrl,
          children: [
            new TextRun({
              text: linkLabel,
              color: config.accentColor,
              size: config.bodySize,
              underline: {
                type: UnderlineType.SINGLE,
              },
            }),
          ],
        })
      );
    } else if (boldText) {
      children.push(
        new TextRun({
          text: boldText,
          bold: true,
          color: config.textColor,
          size: config.bodySize,
        })
      );
    } else {
      children.push(
        new TextRun({
          text: fullMatch,
          color: config.textColor,
          size: config.bodySize,
        })
      );
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    children.push(
      new TextRun({
        text: text.slice(lastIndex),
        color: config.textColor,
        size: config.bodySize,
      })
    );
  }

  return children.length > 0
    ? children
    : [
        new TextRun({
          text,
          color: config.textColor,
          size: config.bodySize,
        }),
      ];
}

type GenerateDocxOptions = {
  documentKind?: DocumentKind;
  visualAssets?: Partial<CvVisualAssets> | null;
};

function markdownToParagraphs(
  markdown: string,
  template: DocxTemplate,
  options?: GenerateDocxOptions
) {
  const config = getTemplateConfig(template);
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const paragraphs: Paragraph[] = [];
  const visualAssets = hydrateVisualAssets(options?.visualAssets);
  const lastNonEmptyLine =
    [...lines]
      .reverse()
      .map((line) => line.trim())
      .find(Boolean) || "";
  let titleHandled = false;
  let signatureInserted = false;

  if (options?.documentKind === "cv" && visualAssets.profilePhoto) {
    paragraphs.push(
      createImageParagraph({
        asset: visualAssets.profilePhoto,
        template,
        maxWidth: 112,
        maxHeight: 112,
        spacingAfter: config.paragraphAfter + 40,
      })
    );
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (
      options?.documentKind === "cover-letter" &&
      visualAssets.signature &&
      !signatureInserted &&
      line === lastNonEmptyLine
    ) {
      paragraphs.push(
        createImageParagraph({
          asset: visualAssets.signature,
          template,
          maxWidth: 180,
          maxHeight: 72,
          spacingAfter: config.paragraphAfter,
        })
      );
      signatureInserted = true;
    }

    if (line.startsWith("# ")) {
      const text = line.slice(2).trim();
      if (!titleHandled) {
        paragraphs.push(titleParagraph(text, template));
        titleHandled = true;
      } else {
        paragraphs.push(getHeading(1, text, template));
      }
      continue;
    }

    if (line.startsWith("## ")) {
      paragraphs.push(getHeading(2, line.slice(3).trim(), template));
      continue;
    }

    if (line.startsWith("### ")) {
      paragraphs.push(getHeading(3, line.slice(4).trim(), template));
      continue;
    }

    if (line.startsWith("- ")) {
      paragraphs.push(
        new Paragraph({
          bullet: {
            level: 0,
          },
          spacing: {
            after: config.bulletAfter,
          },
          children: parseInlineMarkdown(line.slice(2).trim(), template),
        })
      );
      continue;
    }

    paragraphs.push(
      new Paragraph({
        spacing: {
          after: config.paragraphAfter,
        },
        children: parseInlineMarkdown(line, template),
      })
    );
  }

  return paragraphs;
}

export function sanitizeFileName(input: string) {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "cv-document"
  );
}

export async function generateCvDocxBuffer(
  markdown: string,
  template: DocxTemplate = "classic",
  options?: GenerateDocxOptions
) {
  const config = getTemplateConfig(template);
  const children =
    template === "split" && options?.documentKind === "cv"
      ? buildSplitCvChildren(markdown, template, options)
      : markdownToParagraphs(markdown, template, options);
  const document = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: config.margins,
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(document);
}

export { DOCX_MIME_TYPE };
