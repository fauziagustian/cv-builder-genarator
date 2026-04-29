import { NextResponse } from "next/server";
import type { DocxTemplate } from "@/lib/cv/docx-templates";
import { sanitizeFileName } from "@/lib/cv/docx";
import { generatePdfBuffer, PDF_MIME_TYPE } from "@/lib/cv/pdf";
import type { CvVisualAssets, DocumentKind } from "@/lib/cv/visual-assets";

export const runtime = "nodejs";

type RequestBody = {
  fileName?: string;
  markdown?: string;
  template?: DocxTemplate;
  documentKind?: DocumentKind;
  visualAssets?: Partial<CvVisualAssets> | null;
};

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }

  const markdown = body.markdown?.trim();

  if (!markdown) {
    return NextResponse.json(
      { error: "Markdown content is required." },
      { status: 400 }
    );
  }

  const pdfBytes = await generatePdfBuffer(markdown, body.template || "classic", {
    documentKind: body.documentKind || "cv",
    visualAssets: body.visualAssets,
  });
  const fileName = sanitizeFileName(
    body.fileName || "muhammad-fauzi-agustian-cv"
  );

  return new NextResponse(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": PDF_MIME_TYPE,
      "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
