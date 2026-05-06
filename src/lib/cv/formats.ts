export type CvInputMode = "professional" | "ats" | "minimal" | "markdown";

export type CvExperience = {
  role: string;
  company: string;
  period: string;
  location: string;
  bullets: string;
};

export type CvEducation = {
  degree: string;
  school: string;
  details: string;
};

export type ProfessionalSkills = {
  frontend: string;
  backend: string;
  architecture: string;
  cloud: string;
  databases: string;
  tools: string;
};

export type ProfessionalCvForm = {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: ProfessionalSkills;
  experiences: CvExperience[];
  achievements: string;
  education: CvEducation[];
  languages: string;
};

export type AtsExperience = {
  role: string;
  company: string;
  period: string;
  impact: string;
  keywords: string;
};

export type AtsCvForm = {
  fullName: string;
  title: string;
  targetRole: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  competencies: string;
  technicalKeywords: string;
  experiences: AtsExperience[];
  achievements: string;
  education: string;
  languages: string;
};

export type MinimalCvForm = {
  fullName: string;
  title: string;
  contactLine: string;
  summary: string;
  keySkills: string;
  highlights: string;
  experienceSnapshot: string;
  education: string;
  languages: string;
};

export type SampleProfileId = "fullstack" | "frontend" | "product";

export type SampleProfileOption = {
  id: SampleProfileId;
  label: string;
  title: string;
  description: string;
  fileName: string;
  draftName: string;
};

export function createEmptyExperience(): CvExperience {
  return {
    role: "",
    company: "",
    period: "",
    location: "",
    bullets: "",
  };
}

export function createEmptyEducation(): CvEducation {
  return {
    degree: "",
    school: "",
    details: "",
  };
}

export function createEmptyAtsExperience(): AtsExperience {
  return {
    role: "",
    company: "",
    period: "",
    impact: "",
    keywords: "",
  };
}

export const SAMPLE_PROFILE_OPTIONS: SampleProfileOption[] = [
  {
    id: "fullstack",
    label: "Fullstack",
    title: "Remote Fullstack Developer",
    description:
      "Node.js, React, Cloudflare, APIs, and platform delivery sample.",
    fileName: "sample-fullstack-cv",
    draftName: "sample-fullstack-application",
  },
  {
    id: "frontend",
    label: "Frontend",
    title: "Senior Frontend Engineer",
    description:
      "React, TypeScript, design systems, accessibility, and UX performance sample.",
    fileName: "sample-frontend-cv",
    draftName: "sample-frontend-application",
  },
  {
    id: "product",
    label: "Product",
    title: "Product Engineer",
    description:
      "React, Node.js, experimentation, growth systems, and cross-functional delivery sample.",
    fileName: "sample-product-engineer-cv",
    draftName: "sample-product-application",
  },
];

type SampleProfileSeed = {
  fileName: string;
  draftName: string;
  professional: ProfessionalCvForm;
  ats: AtsCvForm;
  minimal: MinimalCvForm;
};

const SAMPLE_PROFILE_SEEDS: Record<SampleProfileId, SampleProfileSeed> = {
  fullstack: {
    fileName: "sample-fullstack-cv",
    draftName: "sample-fullstack-application",
    professional: {
      fullName: "ALEXANDRA REYES",
      title:
        "Senior Fullstack Developer (Node.js | React | Cloudflare | Platform Engineering)",
      location: "Singapore | Open to Remote",
      email: "alex.reyes@example.com",
      phone: "+1 415 555 0142",
      linkedin: "https://www.linkedin.com/in/sample-fullstack-profile",
      summary:
        "Senior Fullstack Developer with 6+ years of experience building secure, scalable, and high-performance web platforms across SaaS, fintech, and B2B commerce environments.\n\nStrong background in Node.js and React, with hands-on experience designing REST APIs, shipping edge-enabled features with Cloudflare, and operating cloud-native services with solid observability and CI/CD workflows.\n\nComfortable working independently in remote teams, collaborating with product, design, QA, and engineering partners, and turning ambiguous requirements into polished production systems.",
      skills: {
        frontend: "React.js\nNext.js\nTypeScript\nJavaScript\nHTML\nCSS",
        backend:
          "Node.js (Express.js, Fastify)\nPython (FastAPI)\nGo (Fiber)\nBackground jobs and service integrations",
        architecture:
          "RESTful API Design\nMicroservices Architecture\nEvent-driven Systems\nSystem Design\nJWT\nOAuth2\nAPI Security\nRate Limiting\nEdge caching strategy",
        cloud:
          "Cloudflare Workers\nCloudflare CDN\nCloudflare WAF\nDocker\nKubernetes\nCI/CD\nGitHub Actions\nAWS\nVercel",
        databases: "PostgreSQL\nMySQL\nRedis\nElasticsearch",
        tools: "Datadog\nGrafana\nSentry\nGit\nPostman\nSwagger",
      },
      experiences: [
        {
          role: "Senior Fullstack Developer",
          company: "Northstar Labs",
          period: "Mar 2024 - Present",
          location: "Remote (Singapore)",
          bullets:
            "Led delivery of a Node.js and React platform used by multi-region SaaS customers.\nBuilt and maintained REST APIs, background jobs, and internal tooling for support and operations teams.\nIntegrated Cloudflare Workers, CDN caching, and security rules to improve edge performance and request protection.\nReduced median page load time by 37% through API tuning, caching strategy, and frontend optimization.\nPartnered with product, design, and QA in a remote environment and shipped features from discovery to production.",
        },
        {
          role: "Fullstack Engineer",
          company: "Atlas Commerce Cloud",
          period: "Jan 2022 - Feb 2024",
          location: "Kuala Lumpur, Malaysia",
          bullets:
            "Developed React dashboards and Node.js services for B2B order, inventory, and catalog workflows.\nDesigned reusable API contracts consumed by web clients, back-office tools, and partner integrations.\nIntroduced CI/CD pipelines with GitHub Actions and container-based preview deployments.\nImproved application monitoring with Grafana and Sentry, shortening issue triage time across the engineering team.",
        },
        {
          role: "Software Engineer",
          company: "Harbor Health Systems",
          period: "Jun 2020 - Dec 2021",
          location: "Jakarta, Indonesia",
          bullets:
            "Built appointment, billing, and reporting modules for an internal healthcare operations platform.\nRefactored legacy endpoints into modular services and improved test coverage for critical business flows.\nCollaborated across backend, frontend, and QA to stabilize releases and reduce regression issues.\nAutomated deployment checks and incident dashboards to support faster production response.",
        },
        {
          role: "Junior Web Developer",
          company: "Brightlane Studio",
          period: "Jul 2018 - May 2020",
          location: "Bandung, Indonesia",
          bullets:
            "Built marketing sites and lightweight CMS modules for SME clients using JavaScript and Node.js.\nSupported UI implementation, API integrations, and content publishing workflows.\nHelped standardize reusable frontend components and deployment checklists for agency projects.",
        },
      ],
      achievements:
        "Improved production performance by more than 35% through caching, API tuning, and frontend optimization.\nBuilt secure API and edge delivery patterns using Cloudflare, CI/CD, and observability tooling.\nLed remote collaboration across product, design, QA, and engineering teams.\nShipped production-ready features from architecture planning through post-release support.",
      education: [
        {
          degree: "Bachelor of Computer Science",
          school: "Pacific International University",
          details: "Graduated with Distinction",
        },
        {
          degree: "Diploma in Software Engineering",
          school: "City Institute of Technology",
          details: "GPA: 3.72 / 4.00",
        },
      ],
      languages:
        "English (Professional Working Proficiency)\nIndonesian (Native)\nMandarin (Conversational)",
    },
    ats: {
      fullName: "ALEXANDRA REYES",
      title: "Senior Fullstack Developer",
      targetRole: "Senior Fullstack Developer (Remote Product Team)",
      location: "Singapore | Open to Remote",
      email: "alex.reyes@example.com",
      phone: "+1 415 555 0142",
      linkedin: "https://www.linkedin.com/in/sample-fullstack-profile",
      summary:
        "Senior Fullstack Developer with 6+ years of experience building secure, scalable, and high-performance product platforms. Strong practical experience with Node.js, React, Cloudflare, RESTful APIs, CI/CD, debugging, and remote collaboration.",
      competencies:
        "Node.js\nReact.js\nRESTful APIs\nSystem Design\nCloudflare\nWeb Security\nTroubleshooting\nRemote Collaboration",
      technicalKeywords:
        "JavaScript\nTypeScript\nExpress.js\nFastify\nCloudflare Workers\nCloudflare CDN\nDocker\nKubernetes\nGitHub Actions\nCI/CD\nOAuth2\nJWT",
      experiences: [
        {
          role: "Senior Fullstack Developer",
          company: "Northstar Labs",
          period: "Mar 2024 - Present",
          impact:
            "Led a Node.js and React platform, built REST APIs and support tooling, and integrated Cloudflare edge services to improve performance and request security in a remote setup.",
          keywords:
            "Node.js, React, Cloudflare, APIs, remote collaboration, debugging",
        },
        {
          role: "Fullstack Engineer",
          company: "Atlas Commerce Cloud",
          period: "Jan 2022 - Feb 2024",
          impact:
            "Developed React dashboards, Node.js services, reusable APIs, and CI/CD workflows for B2B commerce operations while partnering with cross-functional teams.",
          keywords:
            "Node.js, React, RESTful APIs, CI/CD, product collaboration",
        },
        {
          role: "Software Engineer",
          company: "Harbor Health Systems",
          period: "Jun 2020 - Dec 2021",
          impact:
            "Improved system reliability by modernizing legacy endpoints, stabilizing releases, and supporting incident response through better automation and observability.",
          keywords:
            "performance optimization, root cause analysis, monitoring, production support",
        },
      ],
      achievements:
        "Improved production performance by more than 35% through caching and API optimization.\nBuilt edge-ready delivery patterns using Cloudflare and CI/CD.\nLed implementation across product, design, QA, and engineering teams in remote environments.",
      education:
        "Bachelor of Computer Science - Pacific International University (Graduated with Distinction)\nDiploma in Software Engineering - City Institute of Technology (GPA: 3.72 / 4.00)",
      languages:
        "English (Professional Working Proficiency)\nIndonesian (Native)\nMandarin (Conversational)",
    },
    minimal: {
      fullName: "ALEXANDRA REYES",
      title: "Senior Fullstack Developer",
      contactLine:
        "Singapore | Open to Remote | alex.reyes@example.com | +1 415 555 0142 | LinkedIn: https://www.linkedin.com/in/sample-fullstack-profile",
      summary:
        "Senior Fullstack Developer with 6+ years of experience building secure and scalable product platforms across SaaS, fintech, and commerce environments.",
      keySkills:
        "Node.js\nReact.js\nTypeScript\nRESTful APIs\nCloudflare\nWeb Security\nDocker\nCI/CD\nSystem Design\nRemote Collaboration",
      highlights:
        "Built and scaled customer-facing platforms with Node.js and React.\nImproved production performance by more than 35%.\nIntegrated Cloudflare services for faster and safer delivery.\nExperienced working independently in remote product teams.",
      experienceSnapshot:
        "Senior Fullstack Developer - Northstar Labs (2024 - Present)\nFullstack Engineer - Atlas Commerce Cloud (2022 - 2024)\nSoftware Engineer - Harbor Health Systems (2020 - 2021)\nJunior Web Developer - Brightlane Studio (2018 - 2020)",
      education:
        "Bachelor of Computer Science - Pacific International University\nDiploma in Software Engineering - City Institute of Technology",
      languages: "English\nIndonesian\nMandarin",
    },
  },
  frontend: {
    fileName: "sample-frontend-cv",
    draftName: "sample-frontend-application",
    professional: {
      fullName: "JORDAN KIM",
      title:
        "Senior Frontend Engineer (React | TypeScript | Design Systems | Accessibility)",
      location: "Seoul | Remote-friendly",
      email: "jordan.kim@example.com",
      phone: "+82 10 5555 0198",
      linkedin: "https://www.linkedin.com/in/sample-frontend-profile",
      summary:
        "Senior Frontend Engineer with 7+ years of experience building polished, accessible, and resilient web experiences for product teams in healthtech, ecommerce, and SaaS.\n\nDeep expertise in React, TypeScript, design systems, and performance optimization, with a strong product sense and consistent collaboration across design, content, QA, and engineering.\n\nKnown for turning ambiguous product requirements into elegant UI systems, improving usability at scale, and raising frontend quality through testing, observability, and better component architecture.",
      skills: {
        frontend:
          "React.js\nNext.js\nTypeScript\nJavaScript\nStorybook\nHTML\nCSS\nAccessibility (WCAG)",
        backend:
          "Node.js BFF services\nGraphQL integration\nFirebase\nREST API consumption",
        architecture:
          "Design Systems\nComponent Architecture\nState Management\nPerformance Budgets\nFrontend Testing Strategy\nExperimentation",
        cloud:
          "Vercel\nCloudflare CDN\nGitHub Actions\nPreview Deployments\nCI/CD",
        databases: "Headless CMS\nContent APIs\nAnalytics events",
        tools:
          "Playwright\nCypress\nSentry\nFigma\nGit\nPostman\nLighthouse",
      },
      experiences: [
        {
          role: "Senior Frontend Engineer",
          company: "Luma Health App",
          period: "Apr 2024 - Present",
          location: "Remote (South Korea)",
          bullets:
            "Led frontend delivery for patient and provider experiences used across multiple care workflows.\nBuilt shared React component primitives and documentation that reduced UI duplication across squads.\nImproved accessibility and page speed, helping key onboarding flows reach WCAG AA alignment and faster Largest Contentful Paint scores.\nCollaborated closely with product designers, content, and QA to ship high-trust user experiences in weekly releases.",
        },
        {
          role: "Frontend Engineer",
          company: "Orbit Commerce",
          period: "Jan 2021 - Mar 2024",
          location: "Seoul, South Korea",
          bullets:
            "Built customer-facing storefront modules and internal merchandising tools with React and TypeScript.\nOwned migration from legacy UI patterns to a token-based design system with better consistency and theming.\nIntroduced Playwright smoke tests and release checklists that reduced UI regressions before launch.\nPartnered with analytics and product teams to instrument experiments and improve conversion flows.",
        },
        {
          role: "UI Engineer",
          company: "Studio Pixel",
          period: "Jul 2018 - Dec 2020",
          location: "Busan, South Korea",
          bullets:
            "Implemented responsive websites, content modules, and campaign landing pages for multiple client brands.\nWorked with designers to translate high-fidelity concepts into maintainable frontend code.\nImproved reusable layout patterns and frontend review practices across the agency team.",
        },
      ],
      achievements:
        "Shipped and scaled design system foundations across multiple product surfaces.\nImproved accessibility, performance, and release confidence through stronger testing and observability.\nPartnered deeply with design and product teams to raise UI quality without slowing delivery.",
      education: [
        {
          degree: "Bachelor of Multimedia Engineering",
          school: "East Asia Tech University",
          details: "Graduated with Honors",
        },
      ],
      languages:
        "English (Professional Working Proficiency)\nKorean (Native)",
    },
    ats: {
      fullName: "JORDAN KIM",
      title: "Senior Frontend Engineer",
      targetRole: "Senior Frontend Engineer (Remote Product Team)",
      location: "Seoul | Remote-friendly",
      email: "jordan.kim@example.com",
      phone: "+82 10 5555 0198",
      linkedin: "https://www.linkedin.com/in/sample-frontend-profile",
      summary:
        "Senior Frontend Engineer with 7+ years of experience building accessible, high-performance product experiences. Strong practical experience with React, TypeScript, design systems, performance optimization, testing, and cross-functional collaboration.",
      competencies:
        "React.js\nTypeScript\nDesign Systems\nAccessibility\nPerformance Optimization\nExperimentation\nCross-functional Collaboration",
      technicalKeywords:
        "Next.js\nStorybook\nPlaywright\nCypress\nLighthouse\nCloudflare CDN\nGitHub Actions\nSentry\nAnalytics",
      experiences: [
        {
          role: "Senior Frontend Engineer",
          company: "Luma Health App",
          period: "Apr 2024 - Present",
          impact:
            "Led frontend delivery for patient and provider workflows, improved accessibility, and built shared component primitives that scaled across squads.",
          keywords:
            "React, TypeScript, accessibility, design systems, frontend performance",
        },
        {
          role: "Frontend Engineer",
          company: "Orbit Commerce",
          period: "Jan 2021 - Mar 2024",
          impact:
            "Built storefront and merchandising experiences, introduced a token-based design system, and reduced regressions with Playwright-based release checks.",
          keywords:
            "React, Next.js, design system, testing, experimentation",
        },
        {
          role: "UI Engineer",
          company: "Studio Pixel",
          period: "Jul 2018 - Dec 2020",
          impact:
            "Delivered responsive client websites and reusable frontend modules while collaborating closely with designers and content teams.",
          keywords:
            "responsive UI, collaboration, accessibility, implementation",
        },
      ],
      achievements:
        "Improved accessibility and frontend quality across product surfaces.\nScaled reusable component systems and release checks.\nPartnered closely with design, product, and QA to ship polished user experiences.",
      education:
        "Bachelor of Multimedia Engineering - East Asia Tech University (Graduated with Honors)",
      languages:
        "English (Professional Working Proficiency)\nKorean (Native)",
    },
    minimal: {
      fullName: "JORDAN KIM",
      title: "Senior Frontend Engineer",
      contactLine:
        "Seoul | Remote-friendly | jordan.kim@example.com | +82 10 5555 0198 | LinkedIn: https://www.linkedin.com/in/sample-frontend-profile",
      summary:
        "Senior Frontend Engineer with 7+ years of experience building accessible and high-performance product experiences with React and TypeScript.",
      keySkills:
        "React.js\nTypeScript\nNext.js\nDesign Systems\nAccessibility\nFrontend Performance\nTesting\nCross-functional Collaboration",
      highlights:
        "Built shared component systems for multi-team product delivery.\nImproved accessibility and release confidence.\nExperienced partnering deeply with design and product teams.",
      experienceSnapshot:
        "Senior Frontend Engineer - Luma Health App (2024 - Present)\nFrontend Engineer - Orbit Commerce (2021 - 2024)\nUI Engineer - Studio Pixel (2018 - 2020)",
      education:
        "Bachelor of Multimedia Engineering - East Asia Tech University",
      languages: "English\nKorean",
    },
  },
  product: {
    fileName: "sample-product-engineer-cv",
    draftName: "sample-product-application",
    professional: {
      fullName: "PRIYA NAIR",
      title:
        "Product Engineer (React | Node.js | Growth Systems | AI Workflows)",
      location: "Bangalore | Open to Remote",
      email: "priya.nair@example.com",
      phone: "+91 98765 43210",
      linkedin: "https://www.linkedin.com/in/sample-product-engineer-profile",
      summary:
        "Product Engineer with 6+ years of experience shipping user-facing features, internal tools, and growth systems for SaaS and collaboration products.\n\nStrong experience across React, Node.js, experimentation, analytics instrumentation, and rapid end-to-end delivery, with a healthy bias toward measurable product outcomes.\n\nWorks comfortably across product, design, data, and customer-facing teams to identify high-leverage opportunities, launch quickly, and iterate based on user signals.",
      skills: {
        frontend:
          "React.js\nNext.js\nTypeScript\nJavaScript\nTailwind CSS\nExperiment-driven UI",
        backend:
          "Node.js (Express.js)\nServer Actions\nSupabase\nPostgreSQL\nQueues and automation",
        architecture:
          "Product Thinking\nFeature Flagging\nExperimentation\nEvent Tracking\nAuth Flows\nAPI Design",
        cloud:
          "Vercel\nCloudflare CDN\nGitHub Actions\nCI/CD\nServerless Functions",
        databases: "PostgreSQL\nRedis\nAnalytics Warehouses",
        tools:
          "Amplitude\nMixpanel\nPostHog\nSentry\nGit\nFigma\nPostman",
      },
      experiences: [
        {
          role: "Product Engineer",
          company: "SignalFlow",
          period: "May 2024 - Present",
          location: "Remote (India)",
          bullets:
            "Built and launched growth experiments, onboarding flows, and workspace collaboration features across a React and Node.js product stack.\nWorked with product managers and designers to scope small, fast iterations tied to activation and retention goals.\nImproved analytics quality, event naming consistency, and release confidence for product experiments.\nDelivered internal tooling that helped support and operations teams respond faster to customer issues.",
        },
        {
          role: "Fullstack Engineer",
          company: "Beacon CRM",
          period: "Feb 2021 - Apr 2024",
          location: "Bangalore, India",
          bullets:
            "Developed customer-facing workflows, admin tools, and API integrations for a sales operations platform.\nIntroduced reusable frontend patterns and backend utilities that shortened delivery time for new feature squads.\nPartnered with growth and data teams to instrument experiments, funnels, and lifecycle messaging triggers.",
        },
        {
          role: "Software Engineer",
          company: "SprintFox",
          period: "Jul 2018 - Jan 2021",
          location: "Pune, India",
          bullets:
            "Built internal operations dashboards and workflow automation tools for distributed support teams.\nMaintained React interfaces and Node.js APIs while coordinating closely with QA and customer operations.\nHelped simplify release processes and improved debugging support for production incidents.",
        },
      ],
      achievements:
        "Shipped product experiments tied directly to activation and retention goals.\nImproved analytics instrumentation and internal tooling for faster iteration.\nBalanced product speed with reliable implementation, debugging, and collaboration.",
      education: [
        {
          degree: "Bachelor of Information Technology",
          school: "South City Institute of Technology",
          details: "First Class",
        },
      ],
      languages:
        "English (Professional Working Proficiency)\nHindi (Native)\nMalayalam (Native)",
    },
    ats: {
      fullName: "PRIYA NAIR",
      title: "Product Engineer",
      targetRole: "Product Engineer (Remote Growth Team)",
      location: "Bangalore | Open to Remote",
      email: "priya.nair@example.com",
      phone: "+91 98765 43210",
      linkedin: "https://www.linkedin.com/in/sample-product-engineer-profile",
      summary:
        "Product Engineer with 6+ years of experience shipping user-facing features, growth experiments, internal tools, and API-backed workflows. Strong practical experience with React, Node.js, analytics instrumentation, experimentation, and cross-functional delivery.",
      competencies:
        "React.js\nNode.js\nProduct Thinking\nExperimentation\nAnalytics\nInternal Tools\nCross-functional Collaboration",
      technicalKeywords:
        "TypeScript\nNext.js\nExpress.js\nPostgreSQL\nSupabase\nFeature Flags\nAmplitude\nMixpanel\nGitHub Actions\nCI/CD",
      experiences: [
        {
          role: "Product Engineer",
          company: "SignalFlow",
          period: "May 2024 - Present",
          impact:
            "Built onboarding, collaboration, and growth features in a React and Node.js stack while partnering with product and design on measurable activation goals.",
          keywords:
            "React, Node.js, product experimentation, analytics, remote collaboration",
        },
        {
          role: "Fullstack Engineer",
          company: "Beacon CRM",
          period: "Feb 2021 - Apr 2024",
          impact:
            "Developed feature workflows, reusable frontend patterns, and backend utilities for a sales operations platform while supporting growth instrumentation.",
          keywords:
            "fullstack delivery, APIs, experimentation, internal tooling",
        },
        {
          role: "Software Engineer",
          company: "SprintFox",
          period: "Jul 2018 - Jan 2021",
          impact:
            "Built operations dashboards and workflow tools, improved release processes, and supported debugging for distributed support teams.",
          keywords:
            "React, Node.js, support tooling, debugging, operations",
        },
      ],
      achievements:
        "Shipped growth experiments linked to activation and retention goals.\nImproved analytics quality and release confidence.\nBuilt internal tools that helped product and operations teams move faster.",
      education:
        "Bachelor of Information Technology - South City Institute of Technology (First Class)",
      languages:
        "English (Professional Working Proficiency)\nHindi (Native)\nMalayalam (Native)",
    },
    minimal: {
      fullName: "PRIYA NAIR",
      title: "Product Engineer",
      contactLine:
        "Bangalore | Open to Remote | priya.nair@example.com | +91 98765 43210 | LinkedIn: https://www.linkedin.com/in/sample-product-engineer-profile",
      summary:
        "Product Engineer with 6+ years of experience shipping user-facing features, growth systems, and internal tools with React and Node.js.",
      keySkills:
        "React.js\nNode.js\nTypeScript\nExperimentation\nAnalytics\nAPI Design\nInternal Tools\nCross-functional Delivery",
      highlights:
        "Shipped growth features tied to activation and retention.\nBuilt internal tools and analytics workflows for faster product iteration.\nComfortable moving from idea to shipped feature in remote teams.",
      experienceSnapshot:
        "Product Engineer - SignalFlow (2024 - Present)\nFullstack Engineer - Beacon CRM (2021 - 2024)\nSoftware Engineer - SprintFox (2018 - 2021)",
      education:
        "Bachelor of Information Technology - South City Institute of Technology",
      languages: "English\nHindi\nMalayalam",
    },
  },
};

function cloneSample<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getSampleProfileSeed(
  profileId: SampleProfileId = "fullstack"
): SampleProfileSeed {
  return SAMPLE_PROFILE_SEEDS[profileId] || SAMPLE_PROFILE_SEEDS.fullstack;
}

export function getSampleProfileDefaults(
  profileId: SampleProfileId = "fullstack"
) {
  const sample = getSampleProfileSeed(profileId);

  return {
    fileName: sample.fileName,
    draftName: sample.draftName,
  };
}

export function createInitialProfessionalCvForm(
  profileId: SampleProfileId = "fullstack"
): ProfessionalCvForm {
  return cloneSample(getSampleProfileSeed(profileId).professional);
}

export function createInitialAtsCvForm(
  profileId: SampleProfileId = "fullstack"
): AtsCvForm {
  return cloneSample(getSampleProfileSeed(profileId).ats);
}

export function createInitialMinimalCvForm(
  profileId: SampleProfileId = "fullstack"
): MinimalCvForm {
  return cloneSample(getSampleProfileSeed(profileId).minimal);
}

export function createInitialMarkdownCv(
  profileId: SampleProfileId = "fullstack"
) {
  return buildProfessionalMarkdown(createInitialProfessionalCvForm(profileId));
}

function splitItems(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinMarkdown(lines: string[]) {
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function pushBulletSection(lines: string[], heading: string, value: string) {
  const items = splitItems(value);

  if (items.length === 0) {
    return;
  }

  lines.push(`## ${heading}`, "");
  lines.push(...items.map((item) => `- ${item}`));
  lines.push("");
}

function pushSkillSection(lines: string[], heading: string, value: string) {
  const items = splitItems(value);

  if (items.length === 0) {
    return;
  }

  lines.push(`### ${heading}`, "");
  lines.push(...items.map((item) => `- ${item}`));
  lines.push("");
}

function formatLinkedIn(url: string) {
  const value = url.trim();

  if (!value) {
    return "";
  }

  return `LinkedIn: [${value}](${value})`;
}

export function buildProfessionalMarkdown(form: ProfessionalCvForm) {
  const lines: string[] = [];

  lines.push(`# ${form.fullName.trim() || "YOUR NAME"}`, "");

  if (form.title.trim()) {
    lines.push(`**${form.title.trim()}**`);
  }

  if (form.location.trim()) {
    lines.push(form.location.trim());
  }

  if (form.email.trim()) {
    lines.push(`Email: ${form.email.trim()}`);
  }

  if (form.phone.trim()) {
    lines.push(`Phone: ${form.phone.trim()}`);
  }

  const linkedInLine = formatLinkedIn(form.linkedin);
  if (linkedInLine) {
    lines.push(linkedInLine);
  }

  if (form.summary.trim()) {
    lines.push("", "## Professional Summary", "", form.summary.trim(), "");
  }

  lines.push("## Core Skills", "");
  pushSkillSection(lines, "Frontend", form.skills.frontend);
  pushSkillSection(lines, "Backend", form.skills.backend);
  pushSkillSection(lines, "Architecture & Security", form.skills.architecture);
  pushSkillSection(lines, "Cloud & DevOps", form.skills.cloud);
  pushSkillSection(lines, "Databases", form.skills.databases);
  pushSkillSection(lines, "Tools & Monitoring", form.skills.tools);

  const experiences = form.experiences.filter(
    (experience) =>
      experience.role.trim() ||
      experience.company.trim() ||
      experience.period.trim() ||
      experience.bullets.trim()
  );

  if (experiences.length > 0) {
    lines.push("## Professional Experience", "");

    for (const experience of experiences) {
      if (experience.role.trim()) {
        lines.push(`### ${experience.role.trim()}`);
      }

      const companyLine = [experience.company.trim(), experience.location.trim()]
        .filter(Boolean)
        .join(" - ");

      if (companyLine) {
        lines.push("", `**${companyLine}**`);
      }

      if (experience.period.trim()) {
        lines.push(experience.period.trim());
      }

      const bullets = splitItems(experience.bullets);
      if (bullets.length > 0) {
        lines.push("", ...bullets.map((item) => `- ${item}`));
      }

      lines.push("");
    }
  }

  pushBulletSection(lines, "Key Achievements", form.achievements);

  const education = form.education.filter(
    (item) => item.degree.trim() || item.school.trim() || item.details.trim()
  );

  if (education.length > 0) {
    lines.push("## Education", "");

    for (const item of education) {
      if (item.degree.trim()) {
        lines.push(`### ${item.degree.trim()}`);
      }

      if (item.school.trim()) {
        lines.push("", `**${item.school.trim()}**`);
      }

      if (item.details.trim()) {
        lines.push(item.details.trim());
      }

      lines.push("");
    }
  }

  pushBulletSection(lines, "Languages", form.languages);

  return joinMarkdown(lines);
}

export function buildAtsMarkdown(form: AtsCvForm) {
  const lines: string[] = [];

  lines.push(`# ${form.fullName.trim() || "YOUR NAME"}`, "");

  if (form.title.trim()) {
    lines.push(`**${form.title.trim()}**`);
  }

  if (form.targetRole.trim()) {
    lines.push(`Target Role: ${form.targetRole.trim()}`);
  }

  if (form.location.trim()) {
    lines.push(form.location.trim());
  }

  if (form.email.trim()) {
    lines.push(`Email: ${form.email.trim()}`);
  }

  if (form.phone.trim()) {
    lines.push(`Phone: ${form.phone.trim()}`);
  }

  const linkedInLine = formatLinkedIn(form.linkedin);
  if (linkedInLine) {
    lines.push(linkedInLine);
  }

  if (form.summary.trim()) {
    lines.push("", "## Targeted Summary", "", form.summary.trim(), "");
  }

  pushBulletSection(lines, "Core Competencies", form.competencies);
  pushBulletSection(lines, "Technical Keywords", form.technicalKeywords);

  const experiences = form.experiences.filter(
    (experience) =>
      experience.role.trim() ||
      experience.company.trim() ||
      experience.period.trim() ||
      experience.impact.trim() ||
      experience.keywords.trim()
  );

  if (experiences.length > 0) {
    lines.push("## Relevant Experience", "");

    for (const experience of experiences) {
      if (experience.role.trim()) {
        lines.push(`### ${experience.role.trim()}`);
      }

      if (experience.company.trim()) {
        lines.push("", `**${experience.company.trim()}**`);
      }

      if (experience.period.trim()) {
        lines.push(experience.period.trim());
      }

      if (experience.impact.trim()) {
        lines.push("", `- ${experience.impact.trim()}`);
      }

      const keywords = splitItems(experience.keywords);
      if (keywords.length > 0) {
        lines.push(`- Keywords: ${keywords.join(", ")}`);
      }

      lines.push("");
    }
  }

  pushBulletSection(lines, "Key Achievements", form.achievements);
  pushBulletSection(lines, "Education", form.education);
  pushBulletSection(lines, "Languages", form.languages);

  return joinMarkdown(lines);
}

export function buildMinimalMarkdown(form: MinimalCvForm) {
  const lines: string[] = [];

  lines.push(`# ${form.fullName.trim() || "YOUR NAME"}`, "");

  if (form.title.trim()) {
    lines.push(`**${form.title.trim()}**`);
  }

  if (form.contactLine.trim()) {
    lines.push(form.contactLine.trim());
  }

  if (form.summary.trim()) {
    lines.push("", "## Profile", "", form.summary.trim(), "");
  }

  pushBulletSection(lines, "Key Skills", form.keySkills);
  pushBulletSection(lines, "Career Highlights", form.highlights);
  pushBulletSection(lines, "Experience Snapshot", form.experienceSnapshot);
  pushBulletSection(lines, "Education", form.education);
  pushBulletSection(lines, "Languages", form.languages);

  return joinMarkdown(lines);
}
