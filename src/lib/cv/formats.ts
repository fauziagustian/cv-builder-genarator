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

export function createInitialProfessionalCvForm(): ProfessionalCvForm {
  return {
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
  };
}

export function createInitialAtsCvForm(): AtsCvForm {
  return {
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
  };
}

export function createInitialMinimalCvForm(): MinimalCvForm {
  return {
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
  };
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
