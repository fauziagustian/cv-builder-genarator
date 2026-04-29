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
    fullName: "MUHAMMAD FAUZI AGUSTIAN",
    title: "Senior Fullstack Developer (Node.js | React | REST APIs | Microservices | Cloud)",
    location: "Indonesia",
    email: "fauziagst04@gmail.com",
    phone: "+62 896-9768-5267",
    linkedin: "https://www.linkedin.com/in/muhammad-fauzi-agustian/",
    summary:
      "Senior Fullstack Developer with 5+ years of experience building scalable, secure, and high-performance web applications across banking, enterprise, and startup environments.\n\nStrong expertise in backend development with Node.js, Java, and Go, combined with hands-on frontend experience using React and modern JavaScript/TypeScript. Proven track record in designing and building RESTful APIs, optimizing distributed systems, and delivering production-ready applications with strong attention to performance, security, and reliability.\n\nExperienced working independently in remote environments and collaborating effectively with product, design, QA, and engineering teams to deliver end-to-end solutions.",
    skills: {
      frontend: "React.js\nJavaScript\nTypeScript\nHTML\nCSS",
      backend:
        "Node.js (Express.js)\nJava (Spring Boot)\nGo (Gin/Fiber)\nPHP (Laravel)",
      architecture:
        "RESTful API Design\nMicroservices Architecture\nEvent-driven Architecture (Kafka, MQ)\nSystem Design\nJWT\nOAuth2\nHTTPS\nAPI Security\nRate Limiting",
      cloud:
        "Docker\nKubernetes\nCI/CD\nGitOps (ArgoCD)\nHelm\nAWS\nAzure\nGCP\nCDN and edge-ready delivery",
      databases: "MySQL\nPostgreSQL\nOracle\nCassandra\nNeo4j",
      tools: "Dynatrace\nGrafana\nDatadog\nAzure Logs\nGit\nPostman\nSwagger",
    },
    experiences: [
      {
        role: "Senior Fullstack & DevOps Engineer",
        company: "Cybe Pty Ltd (Block Identity)",
        period: "Feb 2026 - Present",
        location: "Remote (Australia)",
        bullets:
          "Built an end-to-end platform from scratch, covering backend services, infrastructure, and deployment workflows.\nDesigned a scalable microservices architecture with clear API contracts and service-to-service communication patterns.\nDeveloped high-performance REST APIs and ensured smooth readiness for frontend integration.\nImplemented graph-based data modeling using Neo4j for complex relationship-driven use cases.\nContainerized services with Docker and deployed them to Kubernetes environments.\nBuilt and maintained CI/CD pipelines using GitOps with ArgoCD and Helm.\nStrengthened platform reliability through monitoring, logging, troubleshooting, and operational improvements.\nWorked directly with leadership in a fully remote environment and delivered independently across backend and infrastructure areas.",
      },
      {
        role: "Senior Fullstack Engineer (Backend-focused)",
        company: "AMK Technology (Client: Maybank)",
        period: "Jan 2025 - Dec 2025",
        location: "",
        bullets:
          "Developed scalable backend services for a mobile banking platform with strong focus on performance and reliability.\nDesigned and implemented secure RESTful APIs consumed by frontend and mobile applications.\nBuilt fraud detection and device validation systems for high-security use cases.\nIntegrated services with ESB, OTP services, and core banking systems.\nCollaborated closely with frontend, QA, and product teams in an Agile delivery model.\nEnsured application security, responsiveness, and production stability.",
      },
      {
        role: "Senior Application Support Engineer (Fullstack Systems)",
        company: "PT Global Intra Talenta (Client: AIA Financial)",
        period: "Mar 2024 - Mar 2025",
        location: "",
        bullets:
          "Diagnosed and resolved fullstack issues across frontend, backend, APIs, and infrastructure.\nImproved system response time from 19 seconds to 8 seconds, delivering a 58% performance improvement.\nInvestigated logs, traces, and API behavior using Dynatrace and Azure Logs.\nPerformed root cause analysis and coordinated fixes with engineering teams.\nProposed and implemented improvements that enhanced both performance and user experience.",
      },
      {
        role: "Senior Software Engineer",
        company: "Multi Arta Sentosa Bank",
        period: "Jul 2023 - Mar 2024",
        location: "",
        bullets:
          "Led backend development using Java Spring Boot and Kafka for enterprise-grade systems.\nRefactored a monolithic application into a scalable microservices architecture.\nCollaborated with frontend teams to deliver integrated end-to-end features.\nImproved code quality, reduced technical debt, and increased test coverage to 95%.\nConducted code reviews and supported other engineers through technical mentoring.",
      },
      {
        role: "Middle Software Engineer",
        company: "Informasi Teknologi Indonesia",
        period: "Aug 2022 - Aug 2023",
        location: "",
        bullets:
          "Developed backend services using Java Spring Boot and Go.\nDesigned and built REST APIs for frontend integration.\nSupported migration from monolithic architecture to microservices.\nImproved system scalability and service performance.",
      },
      {
        role: "Fullstack Developer",
        company: "Mitreka Solusi Indonesia",
        period: "Jan 2021 - Aug 2022",
        location: "",
        bullets:
          "Built fullstack applications using Node.js (Express) and JavaScript/TypeScript.\nDeveloped REST APIs and CMS systems for business applications.\nBuilt frontend interfaces and integrated them with backend services.\nDeveloped an LMS platform using Moodle and custom plugins.\nProduced API documentation and unit tests to support maintainability and team collaboration.",
      },
    ],
    achievements:
      "Built a production-ready platform from scratch across backend, infrastructure, and CI/CD layers.\nImproved application performance by more than 50% in a production environment.\nLed microservices transformation initiatives in enterprise systems.\nBuilt strong expertise in debugging, root cause analysis, and production issue resolution.\nWorked effectively with global stakeholders in remote delivery environments.",
    education: [
      {
        degree: "Bachelor of Information Systems",
        school: "Bina Nusantara University",
        details: "GPA: 3.67",
      },
      {
        degree: "Diploma in Computer Engineering",
        school: "Bogor Agricultural University",
        details: "GPA: 3.09",
      },
    ],
    languages: "English (Professional Working Proficiency)\nIndonesian (Native)",
  };
}

export function createInitialAtsCvForm(): AtsCvForm {
  return {
    fullName: "MUHAMMAD FAUZI AGUSTIAN",
    title: "Senior Fullstack Developer",
    targetRole: "Senior Fullstack Developer (Remote Contract)",
    location: "Indonesia",
    email: "fauziagst04@gmail.com",
    phone: "+62 896-9768-5267",
    linkedin: "https://www.linkedin.com/in/muhammad-fauzi-agustian/",
    summary:
      "Senior Fullstack Developer with 5+ years of experience building scalable, secure, and high-performance applications across banking, enterprise, and startup environments. Strong practical experience with Node.js, React, RESTful APIs, microservices, CI/CD, debugging, and remote collaboration.",
    competencies:
      "Node.js\nReact.js\nRESTful APIs\nSystem Design\nMicroservices\nWeb Security\nTroubleshooting\nRemote Collaboration",
    technicalKeywords:
      "JavaScript\nTypeScript\nExpress.js\nDocker\nKubernetes\nGit\nCI/CD\nArgoCD\nHelm\nCloud CDN\nOAuth2\nJWT",
    experiences: [
      {
        role: "Senior Fullstack & DevOps Engineer",
        company: "Cybe Pty Ltd (Block Identity)",
        period: "Feb 2026 - Present",
        impact:
          "Built an end-to-end platform from scratch, developed REST APIs, deployed services with Docker and Kubernetes, and maintained GitOps delivery pipelines in a remote environment.",
        keywords:
          "Node.js, APIs, CI/CD, Kubernetes, remote collaboration, debugging",
      },
      {
        role: "Senior Fullstack Engineer (Backend-focused)",
        company: "AMK Technology (Client: Maybank)",
        period: "Jan 2025 - Dec 2025",
        impact:
          "Developed scalable backend services, secure APIs, fraud detection, and integrations with banking systems while partnering with frontend, QA, and product teams.",
        keywords:
          "Node.js, RESTful APIs, security, system integration, Agile",
      },
      {
        role: "Senior Application Support Engineer",
        company: "PT Global Intra Talenta (Client: AIA Financial)",
        period: "Mar 2024 - Mar 2025",
        impact:
          "Improved system performance from 19 seconds to 8 seconds and led fullstack troubleshooting across frontend, backend, logs, and infrastructure.",
        keywords:
          "performance optimization, root cause analysis, monitoring, logs",
      },
    ],
    achievements:
      "Improved application performance by 58% in production.\nLed backend and infrastructure delivery in remote teams.\nBuilt enterprise-grade APIs with strong focus on reliability and security.",
    education:
      "Bachelor of Information Systems - Bina Nusantara University (GPA: 3.67)\nDiploma in Computer Engineering - Bogor Agricultural University (GPA: 3.09)",
    languages: "English (Professional Working Proficiency)\nIndonesian (Native)",
  };
}

export function createInitialMinimalCvForm(): MinimalCvForm {
  return {
    fullName: "MUHAMMAD FAUZI AGUSTIAN",
    title: "Senior Fullstack Developer",
    contactLine:
      "Indonesia | fauziagst04@gmail.com | +62 896-9768-5267 | LinkedIn: https://www.linkedin.com/in/muhammad-fauzi-agustian/",
    summary:
      "Senior Fullstack Developer with 5+ years of experience building secure and scalable applications across banking, enterprise, and startup environments.",
    keySkills:
      "Node.js\nReact.js\nJavaScript\nTypeScript\nRESTful APIs\nMicroservices\nDocker\nKubernetes\nCI/CD\nSystem Design",
    highlights:
      "Built a production-ready platform from scratch.\nImproved application performance by more than 50%.\nLed microservices transformation in enterprise systems.\nExperienced working independently in remote teams.",
    experienceSnapshot:
      "Senior Fullstack & DevOps Engineer - Cybe Pty Ltd (2026 - Present)\nSenior Fullstack Engineer - AMK Technology / Maybank (2025)\nSenior Application Support Engineer - PT Global Intra Talenta / AIA Financial (2024 - 2025)\nSenior Software Engineer - Multi Arta Sentosa Bank (2023 - 2024)",
    education:
      "Bachelor of Information Systems - Bina Nusantara University (GPA: 3.67)\nDiploma in Computer Engineering - Bogor Agricultural University (GPA: 3.09)",
    languages: "English\nIndonesian",
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
