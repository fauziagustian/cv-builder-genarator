# CV Builder Generator

Standalone Next.js app untuk membuat CV, cover letter, dan recruiter message tanpa login.

## Features

- Multiple CV input formats: Professional, ATS, Minimal, dan Markdown
- Export CV ke DOCX dan PDF
- Export cover letter ke DOCX dan PDF
- Recruiter message generator
- Tailoring dari job description
- Autosave draft lokal dan named drafts
- Import/export draft JSON
- Import file Markdown atau TXT
- English / Bahasa Indonesia switch untuk communication output
- Optional profile photo dan signature
- Template output: Classic, Modern, Compact, dan Split (2-column CV)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- `docx` untuk generate Word
- `pdf-lib` untuk generate PDF

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Validation

```bash
npm run lint
npm run build
```

## Deploy

App ini siap di-deploy ke Vercel sebagai standard Next.js project.
