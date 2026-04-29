import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { DocxTemplate } from "@/lib/cv/docx-templates";
import {
  parseMarkdownDocument,
  splitSectionsForTwoColumn,
  type ParsedMarkdownSection,
} from "@/lib/cv/markdown-layout";
import {
  fitWithinBox,
  hydrateVisualAssets,
  type CvVisualAssets,
  type DocumentKind,
  type StoredVisualAsset,
} from "@/lib/cv/visual-assets";

const PDF_MIME_TYPE = "application/pdf";

type PdfTemplateConfig = {
  titleColor: ReturnType<typeof rgb>;
  headingColor: ReturnType<typeof rgb>;
  textColor: ReturnType<typeof rgb>;
  mutedColor: ReturnType<typeof rgb>;
  accentColor: ReturnType<typeof rgb>;
  sidebarFill: ReturnType<typeof rgb>;
  sidebarHeadingColor: ReturnType<typeof rgb>;
  titleSize: number;
  headingSizes: Record<1 | 2 | 3, number>;
  bodySize: number;
  lineHeight: number;
  headingSpacingBefore: Record<1 | 2 | 3, number>;
  headingSpacingAfter: number;
  paragraphSpacing: number;
  bulletSpacing: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
};

const PDF_TEMPLATE_CONFIG: Record<DocxTemplate, PdfTemplateConfig> = {
  classic: {
    titleColor: rgb(0.06, 0.09, 0.16),
    headingColor: rgb(0.07, 0.09, 0.12),
    textColor: rgb(0.11, 0.14, 0.19),
    mutedColor: rgb(0.28, 0.34, 0.43),
    accentColor: rgb(0.15, 0.39, 0.92),
    sidebarFill: rgb(0.94, 0.97, 1),
    sidebarHeadingColor: rgb(0.11, 0.31, 0.84),
    titleSize: 22,
    headingSizes: { 1: 18, 2: 15, 3: 13 },
    bodySize: 10.5,
    lineHeight: 14,
    headingSpacingBefore: { 1: 18, 2: 14, 3: 12 },
    headingSpacingAfter: 8,
    paragraphSpacing: 7,
    bulletSpacing: 5,
    margins: { top: 54, right: 54, bottom: 54, left: 54 },
  },
  modern: {
    titleColor: rgb(0.06, 0.46, 0.43),
    headingColor: rgb(0.07, 0.09, 0.12),
    textColor: rgb(0.08, 0.1, 0.16),
    mutedColor: rgb(0.28, 0.34, 0.43),
    accentColor: rgb(0.05, 0.65, 0.91),
    sidebarFill: rgb(0.93, 0.99, 1),
    sidebarHeadingColor: rgb(0.06, 0.46, 0.43),
    titleSize: 24,
    headingSizes: { 1: 19, 2: 16, 3: 13 },
    bodySize: 10.5,
    lineHeight: 14,
    headingSpacingBefore: { 1: 18, 2: 14, 3: 12 },
    headingSpacingAfter: 8,
    paragraphSpacing: 7,
    bulletSpacing: 5,
    margins: { top: 50, right: 52, bottom: 50, left: 52 },
  },
  compact: {
    titleColor: rgb(0.12, 0.16, 0.23),
    headingColor: rgb(0.2, 0.25, 0.34),
    textColor: rgb(0.12, 0.14, 0.19),
    mutedColor: rgb(0.39, 0.45, 0.55),
    accentColor: rgb(0.15, 0.39, 0.92),
    sidebarFill: rgb(0.97, 0.98, 0.99),
    sidebarHeadingColor: rgb(0.12, 0.25, 0.69),
    titleSize: 19,
    headingSizes: { 1: 16, 2: 14, 3: 12 },
    bodySize: 9.5,
    lineHeight: 12.5,
    headingSpacingBefore: { 1: 14, 2: 10, 3: 8 },
    headingSpacingAfter: 6,
    paragraphSpacing: 5,
    bulletSpacing: 3.5,
    margins: { top: 42, right: 46, bottom: 42, left: 46 },
  },
  split: {
    titleColor: rgb(0.06, 0.09, 0.16),
    headingColor: rgb(0.06, 0.09, 0.16),
    textColor: rgb(0.12, 0.14, 0.19),
    mutedColor: rgb(0.28, 0.34, 0.43),
    accentColor: rgb(0.06, 0.46, 0.43),
    sidebarFill: rgb(0.93, 0.99, 0.96),
    sidebarHeadingColor: rgb(0.06, 0.46, 0.43),
    titleSize: 22,
    headingSizes: { 1: 18, 2: 14, 3: 12 },
    bodySize: 10,
    lineHeight: 13.5,
    headingSpacingBefore: { 1: 16, 2: 12, 3: 8 },
    headingSpacingAfter: 7,
    paragraphSpacing: 6,
    bulletSpacing: 4,
    margins: { top: 48, right: 48, bottom: 48, left: 48 },
  },
};

function getTemplateConfig(template: DocxTemplate) {
  return PDF_TEMPLATE_CONFIG[template] || PDF_TEMPLATE_CONFIG.classic;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    const width = font.widthOfTextAtSize(next, size);

    if (width <= maxWidth || !current) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function drawWrappedText(params: {
  page: PDFPage;
  lines: string[];
  x: number;
  y: number;
  font: PDFFont;
  size: number;
  color: ReturnType<typeof rgb>;
  lineHeight: number;
}) {
  const { page, lines, x, y, font, size, color, lineHeight } = params;

  for (const [index, line] of lines.entries()) {
    page.drawText(line, {
      x,
      y: y - index * lineHeight,
      font,
      size,
      color,
    });
  }
}

function sanitizeLine(line: string) {
  return line.replace(/\r/g, "").trim();
}

function simplifyInlineMarkdown(text: string) {
  return text
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, "$1 ($2)")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .trim();
}

type GeneratePdfOptions = {
  documentKind?: DocumentKind;
  visualAssets?: Partial<CvVisualAssets> | null;
};

async function drawVisualAsset(params: {
  pdf: PDFDocument;
  page: PDFPage;
  asset: StoredVisualAsset;
  x: number;
  y: number;
  maxWidth: number;
  maxHeight: number;
}) {
  const { pdf, page, asset, x, y, maxWidth, maxHeight } = params;
  const image =
    asset.mimeType === "image/png"
      ? await pdf.embedPng(asset.dataUrl)
      : await pdf.embedJpg(asset.dataUrl);
  const dimensions = fitWithinBox(
    asset.width,
    asset.height,
    maxWidth,
    maxHeight
  );

  page.drawImage(image, {
    x,
    y: y - dimensions.height,
    width: dimensions.width,
    height: dimensions.height,
  });

  return dimensions.height;
}

async function generateSplitPdfBuffer(
  markdown: string,
  template: DocxTemplate,
  options?: GeneratePdfOptions
) {
  const config = getTemplateConfig(template);
  const parsed = parseMarkdownDocument(markdown);

  if (!parsed.title || parsed.sections.length === 0) {
    return null;
  }

  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const visualAssets = hydrateVisualAssets(options?.visualAssets);
  const { sidebarSections, mainSections } = splitSectionsForTwoColumn(
    parsed.sections
  );
  const pages: PDFPage[] = [];

  function createPage() {
    const page = pdf.addPage();
    pages.push(page);
    return page;
  }

  function getPage(index: number) {
    while (!pages[index]) {
      createPage();
    }

    return pages[index];
  }

  function getPageSize(index: number) {
    return getPage(index).getSize();
  }

  function drawSidebarBackground(pageIndex: number, startY: number) {
    const page = getPage(pageIndex);
    const { height } = page.getSize();
    const pageStartY = pageIndex === 0 ? startY : height - config.margins.top;
    const maxWidth =
      page.getSize().width - config.margins.left - config.margins.right;
    const sidebarWidth = maxWidth * 0.31;

    page.drawRectangle({
      x: config.margins.left,
      y: config.margins.bottom,
      width: sidebarWidth,
      height: pageStartY - config.margins.bottom,
      color: config.sidebarFill,
    });
  }

  const firstPage = createPage();
  const { width, height } = firstPage.getSize();
  const maxWidth = width - config.margins.left - config.margins.right;
  const headerPhotoGap = visualAssets.profilePhoto ? 18 : 0;
  const headerPhotoSize = visualAssets.profilePhoto
    ? fitWithinBox(visualAssets.profilePhoto.width, visualAssets.profilePhoto.height, 82, 82)
    : null;
  const textX =
    config.margins.left + (headerPhotoSize ? headerPhotoSize.width + headerPhotoGap : 0);
  const textWidth =
    maxWidth - (headerPhotoSize ? headerPhotoSize.width + headerPhotoGap : 0);
  let headerTextY = height - config.margins.top;

  if (visualAssets.profilePhoto) {
    const photoHeight = await drawVisualAsset({
      pdf,
      page: firstPage,
      asset: visualAssets.profilePhoto,
      x: config.margins.left,
      y: height - config.margins.top,
      maxWidth: 82,
      maxHeight: 82,
    });

    headerTextY = Math.max(headerTextY, height - config.margins.top);

    const titleLines = wrapText(parsed.title, boldFont, config.titleSize, textWidth);
    drawWrappedText({
      page: firstPage,
      lines: titleLines,
      x: textX,
      y: headerTextY,
      font: boldFont,
      size: config.titleSize,
      color: config.titleColor,
      lineHeight: config.lineHeight + 4,
    });
    let textCursorY = headerTextY - titleLines.length * (config.lineHeight + 4) - 6;

    if (parsed.subtitle) {
      const subtitleLines = wrapText(
        parsed.subtitle,
        boldFont,
        config.headingSizes[3],
        textWidth
      );
      drawWrappedText({
        page: firstPage,
        lines: subtitleLines,
        x: textX,
        y: textCursorY,
        font: boldFont,
        size: config.headingSizes[3],
        color: config.accentColor,
        lineHeight: config.lineHeight,
      });
      textCursorY -= subtitleLines.length * config.lineHeight + 4;
    }

    for (const line of parsed.headerLines) {
      const simplifiedLine = simplifyInlineMarkdown(line);
      const headerLines = wrapText(
        simplifiedLine,
        regularFont,
        config.bodySize,
        textWidth
      );
      drawWrappedText({
        page: firstPage,
        lines: headerLines,
        x: textX,
        y: textCursorY,
        font: regularFont,
        size: config.bodySize,
        color: line.startsWith("LinkedIn:") ? config.accentColor : config.mutedColor,
        lineHeight: config.lineHeight,
      });
      textCursorY -= headerLines.length * config.lineHeight + 2;
    }

    const headerBottomY = Math.min(
      textCursorY,
      height - config.margins.top - photoHeight
    );
    headerTextY = headerBottomY - 18;
  } else {
    const titleLines = wrapText(parsed.title, boldFont, config.titleSize, maxWidth);
    drawWrappedText({
      page: firstPage,
      lines: titleLines,
      x: config.margins.left,
      y: headerTextY,
      font: boldFont,
      size: config.titleSize,
      color: config.titleColor,
      lineHeight: config.lineHeight + 4,
    });
    let textCursorY = headerTextY - titleLines.length * (config.lineHeight + 4) - 6;

    if (parsed.subtitle) {
      const subtitleLines = wrapText(
        parsed.subtitle,
        boldFont,
        config.headingSizes[3],
        maxWidth
      );
      drawWrappedText({
        page: firstPage,
        lines: subtitleLines,
        x: config.margins.left,
        y: textCursorY,
        font: boldFont,
        size: config.headingSizes[3],
        color: config.accentColor,
        lineHeight: config.lineHeight,
      });
      textCursorY -= subtitleLines.length * config.lineHeight + 4;
    }

    for (const line of parsed.headerLines) {
      const simplifiedLine = simplifyInlineMarkdown(line);
      const headerLines = wrapText(
        simplifiedLine,
        regularFont,
        config.bodySize,
        maxWidth
      );
      drawWrappedText({
        page: firstPage,
        lines: headerLines,
        x: config.margins.left,
        y: textCursorY,
        font: regularFont,
        size: config.bodySize,
        color: line.startsWith("LinkedIn:") ? config.accentColor : config.mutedColor,
        lineHeight: config.lineHeight,
      });
      textCursorY -= headerLines.length * config.lineHeight + 2;
    }

    headerTextY = textCursorY - 18;
  }

  firstPage.drawLine({
    start: {
      x: config.margins.left,
      y: headerTextY + 8,
    },
    end: {
      x: width - config.margins.right,
      y: headerTextY + 8,
    },
    thickness: 1,
    color: config.sidebarHeadingColor,
    opacity: 0.25,
  });

  const bodyStartY = headerTextY - 10;
  drawSidebarBackground(0, bodyStartY);

  const sidebarWidth = maxWidth * 0.31;
  const columnGap = 18;
  const mainWidth = maxWidth - sidebarWidth - columnGap;
  const sidebarX = config.margins.left + 12;
  const mainX = config.margins.left + sidebarWidth + columnGap;

  function renderSectionsInColumn(params: {
    sections: ParsedMarkdownSection[];
    columnX: number;
    columnWidth: number;
    sidebar: boolean;
  }) {
    const { sections, columnX, columnWidth, sidebar } = params;
    let pageIndex = 0;
    let page = getPage(pageIndex);
    let y = bodyStartY;

    const ensureSpace = (requiredHeight: number) => {
      if (y - requiredHeight < config.margins.bottom) {
        pageIndex += 1;
        page = getPage(pageIndex);
        y = getPageSize(pageIndex).height - config.margins.top;
        drawSidebarBackground(pageIndex, y);
      }
    };

    const drawTextBlock = (
      text: string,
      font: PDFFont,
      size: number,
      color: ReturnType<typeof rgb>,
      lineHeight: number,
      spacingAfter: number,
      indent = 0
    ) => {
      const wrapped = wrapText(text, font, size, columnWidth - indent);
      ensureSpace(wrapped.length * lineHeight + spacingAfter);
      drawWrappedText({
        page,
        lines: wrapped,
        x: columnX + indent,
        y,
        font,
        size,
        color,
        lineHeight,
      });
      y -= wrapped.length * lineHeight + spacingAfter;
    };

    for (const section of sections) {
      y -= sidebar ? 4 : 8;
      drawTextBlock(
        section.title,
        boldFont,
        sidebar ? config.headingSizes[3] : config.headingSizes[2],
        sidebar ? config.sidebarHeadingColor : config.headingColor,
        config.lineHeight,
        sidebar ? 4 : 6
      );

      for (const line of section.lines) {
        if (line.startsWith("### ")) {
          drawTextBlock(
            simplifyInlineMarkdown(line.slice(4).trim()),
            boldFont,
            sidebar ? config.bodySize : config.headingSizes[3],
            config.textColor,
            config.lineHeight,
            3
          );
          continue;
        }

        if (line.startsWith("- ")) {
          drawTextBlock(
            `• ${simplifyInlineMarkdown(line.slice(2).trim())}`,
            regularFont,
            config.bodySize,
            config.textColor,
            config.lineHeight,
            sidebar ? 3.5 : config.bulletSpacing,
            6
          );
          continue;
        }

        drawTextBlock(
          simplifyInlineMarkdown(line),
          /\*\*.+\*\*/.test(line) ? boldFont : regularFont,
          config.bodySize,
          line.startsWith("LinkedIn:") ? config.accentColor : config.textColor,
          config.lineHeight,
          sidebar ? 4 : config.paragraphSpacing
        );
      }

      y -= sidebar ? 4 : 8;
    }
  }

  renderSectionsInColumn({
    sections: sidebarSections,
    columnX: sidebarX,
    columnWidth: sidebarWidth - 24,
    sidebar: true,
  });
  renderSectionsInColumn({
    sections: mainSections,
    columnX: mainX,
    columnWidth: mainWidth,
    sidebar: false,
  });

  return pdf.save();
}

export async function generatePdfBuffer(
  markdown: string,
  template: DocxTemplate = "classic",
  options?: GeneratePdfOptions
) {
  if (template === "split" && options?.documentKind === "cv") {
    const splitPdf = await generateSplitPdfBuffer(markdown, template, options);

    if (splitPdf) {
      return splitPdf;
    }
  }

  const config = getTemplateConfig(template);
  const pdf = await PDFDocument.create();
  const regularFont = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pages: PDFPage[] = [];

  function addPage() {
    const page = pdf.addPage();
    pages.push(page);
    return page;
  }

  let page = addPage();
  let { width, height } = page.getSize();
  let y = height - config.margins.top;
  const maxWidth = width - config.margins.left - config.margins.right;
  const visualAssets = hydrateVisualAssets(options?.visualAssets);
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const lastNonEmptyLine =
    [...lines]
      .reverse()
      .map((line) => sanitizeLine(line))
      .find(Boolean) || "";
  let titleHandled = false;
  let signatureInserted = false;

  function ensureSpace(requiredHeight: number) {
    if (y - requiredHeight < config.margins.bottom) {
      page = addPage();
      ({ width, height } = page.getSize());
      y = height - config.margins.top;
    }
  }

  function drawParagraph(
    text: string,
    font: PDFFont,
    size: number,
    color: ReturnType<typeof rgb>,
    lineHeight: number,
    spacingAfter: number,
    indent = 0
  ) {
    const wrapped = wrapText(text, font, size, maxWidth - indent);
    ensureSpace(wrapped.length * lineHeight + spacingAfter);
    drawWrappedText({
      page,
      lines: wrapped,
      x: config.margins.left + indent,
      y,
      font,
      size,
      color,
      lineHeight,
    });
    y -= wrapped.length * lineHeight + spacingAfter;
  }

  if (options?.documentKind === "cv" && visualAssets.profilePhoto) {
    const photoSize = fitWithinBox(
      visualAssets.profilePhoto.width,
      visualAssets.profilePhoto.height,
      112,
      112
    );
    ensureSpace(photoSize.height + 18);

    const photoHeight = await drawVisualAsset({
      pdf,
      page,
      asset: visualAssets.profilePhoto,
      x:
        template === "classic"
          ? config.margins.left + (maxWidth - photoSize.width) / 2
          : config.margins.left,
      y,
      maxWidth: 112,
      maxHeight: 112,
    });

    y -= photoHeight + 18;
  }

  for (const rawLine of lines) {
    const line = sanitizeLine(rawLine);

    if (!line) {
      y -= config.paragraphSpacing;
      continue;
    }

    if (
      options?.documentKind === "cover-letter" &&
      visualAssets.signature &&
      !signatureInserted &&
      line === lastNonEmptyLine
    ) {
      const signatureSize = fitWithinBox(
        visualAssets.signature.width,
        visualAssets.signature.height,
        180,
        72
      );

      ensureSpace(signatureSize.height + 8);

      const signatureHeight = await drawVisualAsset({
        pdf,
        page,
        asset: visualAssets.signature,
        x: config.margins.left,
        y,
        maxWidth: 180,
        maxHeight: 72,
      });

      y -= signatureHeight + 8;
      signatureInserted = true;
    }

    if (line.startsWith("# ")) {
      const text = line.slice(2).trim();

      if (!titleHandled) {
        const titleLines = wrapText(text, boldFont, config.titleSize, maxWidth);
        ensureSpace(titleLines.length * (config.lineHeight + 4) + 12);
        drawWrappedText({
          page,
          lines: titleLines,
          x: config.margins.left,
          y,
          font: boldFont,
          size: config.titleSize,
          color: config.titleColor,
          lineHeight: config.lineHeight + 4,
        });
        y -= titleLines.length * (config.lineHeight + 4) + 12;
        titleHandled = true;
      } else {
        y -= config.headingSpacingBefore[1];
        drawParagraph(
          text,
          boldFont,
          config.headingSizes[1],
          config.headingColor,
          config.lineHeight + 2,
          config.headingSpacingAfter
        );
      }
      continue;
    }

    if (line.startsWith("## ")) {
      y -= config.headingSpacingBefore[2];
      drawParagraph(
        line.slice(3).trim(),
        boldFont,
        config.headingSizes[2],
        config.headingColor,
        config.lineHeight + 1,
        config.headingSpacingAfter
      );
      continue;
    }

    if (line.startsWith("### ")) {
      y -= config.headingSpacingBefore[3];
      drawParagraph(
        line.slice(4).trim(),
        boldFont,
        config.headingSizes[3],
        config.headingColor,
        config.lineHeight,
        config.headingSpacingAfter
      );
      continue;
    }

    if (line.startsWith("- ")) {
      drawParagraph(
        `• ${simplifyInlineMarkdown(line.slice(2).trim())}`,
        regularFont,
        config.bodySize,
        config.textColor,
        config.lineHeight,
        config.bulletSpacing,
        6
      );
      continue;
    }

    drawParagraph(
      simplifyInlineMarkdown(line),
      /\*\*.+\*\*/.test(line) ? boldFont : regularFont,
      config.bodySize,
      line.startsWith("LinkedIn:") ? config.accentColor : config.textColor,
      config.lineHeight,
      config.paragraphSpacing
    );
  }

  return pdf.save();
}

export { PDF_MIME_TYPE };
