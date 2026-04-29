export type DocxTemplate = "classic" | "modern" | "compact" | "split";

export const DOCX_TEMPLATE_OPTIONS: Array<{
  id: DocxTemplate;
  label: string;
  description: string;
}> = [
  {
    id: "classic",
    label: "Classic",
    description: "Formal and balanced layout for general professional applications.",
  },
  {
    id: "modern",
    label: "Modern",
    description: "Sharper accent styling for product, startup, and remote tech roles.",
  },
  {
    id: "compact",
    label: "Compact",
    description: "Tighter spacing for denser one-page or ATS-friendly CV output.",
  },
  {
    id: "split",
    label: "Split",
    description:
      "Two-column CV layout with a focused sidebar for skills, achievements, and education.",
  },
];
