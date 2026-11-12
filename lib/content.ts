/*
 * Site content, shared by the page (app/page.tsx), the structured data
 * (lib/seo.ts), and /llms.txt (app/llms.txt/route.ts), so they never drift.
 * Every fact here comes from the current resume
 * (public/brad-dunlap-resume-2026.pdf, the same file protomota.com serves,
 * revision November 2026). When the resume changes, update these consts and
 * copy the new PDF and Word file in.
 */

export const SITE = "https://www.braddunlap.info";
export const PROTOMOTA = "https://protomota.com";
export const NEWSLETTER = "https://newsletter.protomota.com/";

export const NAV = [
  { label: "Profile", url: "#profile" },
  { label: "Experience", url: "#experience" },
  { label: "Work", url: "#work" },
  { label: "Skills", url: "#skills" },
  { label: "Protomota Lab", url: "#protomota" },
  { label: "Writing", url: "#writing" },
  { label: "Credentials", url: "#credentials" },
  { label: "Contact", url: "#contact" },
];

export const CONTACT = [
  { label: "Bradenton, FL" },
  { label: "brad@protomota.com", href: "mailto:brad@protomota.com" },
  { label: "protomota.com", href: PROTOMOTA },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/bradley-dunlap/" },
  { label: "Y Combinator", href: "https://www.startupschool.org/cofounder-matching/candidate/GZex5bsDz" },
  { label: "YouTube", href: "https://youtube.com/@protomota" },
];

// Order is Brad's (2026-11-11): LinkedIn and Y Combinator first, GitHub last.
// protomota.com (components/redesign/Socials.js) uses the same order.
export const SOCIALS = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/bradley-dunlap/" },
  { name: "Y Combinator", href: "https://www.startupschool.org/cofounder-matching/candidate/GZex5bsDz" },
  { name: "Substack", href: NEWSLETTER },
  { name: "X", href: "https://x.com/protomotalab" },
  { name: "YouTube", href: "https://youtube.com/@protomota" },
  { name: "GitHub", href: "https://github.com/protomota" },
];

export const KEY_FIGURES = [
  { value: "20+ yrs", label: "Professional experience" },
  { value: "0", label: "Overruns during scoping program" },
  { value: "2", label: "Apps built solo, live on the App Store" },
  { value: "6", label: "Self-published websites and web apps" },
  { value: "2", label: "YouTube channels" },
  { value: "7", label: "Automotive brand apps led" },
  { value: "15", label: "Shopping center apps directed" },
];

export type Span = { label: string; start: string; end: string | null };
export const TIMELINE: Span[] = [
  { label: "Vectorform, Senior iOS Engineer", start: "2007-09", end: "2010-09" },
  { label: "MRM Worldwide, Technical Lead", start: "2010-09", end: "2011-10" },
  { label: "RIIS, Senior Tech Consultant", start: "2011-10", end: "2012-11" },
  { label: "Vectorform, Technical Lead", start: "2012-11", end: "2019-11" },
  { label: "Vectorform, Dir. Quality Experience", start: "2017-09", end: "2023-10" },
  { label: "Vectorform, Dir. Scoping + Estimation", start: "2019-11", end: "2023-10" },
  { label: "NTT DATA, Product Owner", start: "2023-10", end: "2025-04" },
  { label: "NTT DATA, AI + Robotics Research", start: "2025-04", end: "2025-12" },
  { label: "NTT DATA, Tech Lead + Product Owner", start: "2026-01", end: null },
];

export type Role = { title: string; dates: string; bullets: string[] };
export type Org = { org: string; note?: string; href?: string; roles: Role[] };

export const EXPERIENCE: Org[] = [
  {
    org: "NTT DATA",
    note: "Digital Solution Consultant Associate Director · Oct 2023 – Present",
    roles: [
      {
        title: "Technical Lead and Product Owner",
        dates: "Jan 2026 – Present",
        bullets: [
          "Lead a small multidisciplinary engineering team building VR, voice and AI-assisted automation applications for a Fortune 500 client's confidential workflow initiative, now in pilot.",
          "Direct architecture and implementation across Azure, a Next.js web app, a Unity app and supporting automation.",
          "Build AI and voice capabilities: speech recognition, text-to-speech, conversational AI and voice commands.",
        ],
      },
      {
        title: "Research and Development in AI and Robotics Simulation",
        dates: "Apr 2025 – Dec 2025",
        bullets: [
          "Built agentic systems with Claude and Codex to coordinate technical, research and delivery work.",
          "Simulated robots in NVIDIA Omniverse and Isaac Sim and trained them in NVIDIA Isaac Lab; built ROS 2 workflows connecting hardware behavior and software-driven test environments.",
        ],
      },
      {
        title: "Product Owner, Enterprise Mobile Application",
        dates: "Oct 2023 – Apr 2025",
        bullets: [
          "Owned a multi-year iOS and Android application for a top U.S. manufacturing company, translating product direction into epics, user stories and acceptance criteria for a 20+ person team in Azure DevOps.",
        ],
      },
    ],
  },
  {
    org: "Protomota Lab",
    note: "Independent work outside professional employment",
    href: PROTOMOTA,
    roles: [
      {
        title: "Founder and Independent Developer",
        dates: "protomota.com",
        bullets: [
          "Built Jotley solo, from concept through all development, marketing and training materials; live on the App Store.",
          "Built PulseCanvas Studio solo the same way; live on the App Store for Mac, iPhone, iPad and Apple Vision Pro.",
          "Build AI agents with Claude and Codex that automate workflows, including a custom dashboard for the lab.",
          "Run airesourcepro.com and two YouTube channels: free tutorials and videos for learning AI by building with it.",
          "Build and program robots with ROS 2, simulate them in NVIDIA Isaac Sim and train them in NVIDIA Isaac Lab.",
          "Design robot parts and 3D models in Plasticity CAD and Blender, and 3D-print them.",
        ],
      },
    ],
  },
  {
    org: "Vectorform",
    roles: [
      {
        title: "Director of Scoping and Estimation",
        dates: "Nov 2019 – Oct 2023",
        bullets: [
          "Built and led a scoping and estimation process that took the company from several overrun projects per year to zero during program ownership.",
          "Cut estimate turnaround from a week or more to a few days in most cases with repeatable templates.",
          "Improved estimate accuracy and profitability by aligning scope, staffing, feasibility and risk with Sales and Delivery; introduced analytics comparing actuals against estimates.",
          "Trained teams across sales, product, design and engineering on the methodology and reusable estimation tools.",
        ],
      },
      {
        title: "Director of Quality Experience",
        dates: "Sep 2017 – Oct 2023",
        bullets: [
          "Led a small QA team; brought TDD and automated UI testing to Vectorform, extending the practice started at RIIS.",
        ],
      },
      {
        title: "Technical Lead, Mobile Application Engineer",
        dates: "Nov 2012 – Nov 2019",
        bullets: [
          "Led the full lifecycle of seven Stellantis/FCA apps: Mopar, Chrysler, Dodge, Jeep, Ram, Alfa Romeo, Fiat.",
          "Led the DTE Energy Insight App and real-time Energy Meter integration from concept through launch, supported FCC approval, and contributed technical and product expertise to its spin-off into a new company, Powerley.",
          "Directed 15 Taubman shopping center apps with Bluetooth and Wi-Fi indoor navigation and CI/CD releases.",
        ],
      },
    ],
  },
  {
    org: "RIIS",
    roles: [
      {
        title: "Senior Tech Consultant, Mobile Strategy and App Development",
        dates: "Oct 2011 – Nov 2012",
        bullets: [
          "Automated everything on a small team running big projects, writing scripts by hand with early dev and QA tools.",
          "Directed iOS and Android apps; introduced test-driven development, CI/CD pipelines and automated UI testing.",
          "Reverse engineered and penetration tested clients' iOS and Android apps to help harden their security.",
        ],
      },
    ],
  },
  {
    org: "MRM Worldwide",
    roles: [
      {
        title: "Technical Lead, Front End",
        dates: "Sep 2010 – Oct 2011",
        bullets: [
          "Led front-end development for Chevrolet.com's annual model refresh, defining architecture and coding standards.",
          "Mentored developers, partnered with UX and backend teams, and improved performance across devices.",
        ],
      },
    ],
  },
  {
    org: "Vectorform",
    roles: [
      {
        title: "Senior iOS Engineer",
        dates: "Sep 2007 – Sep 2010",
        bullets: [
          "Founded Vectorform's mobile practice as its first iOS developer; led apps featured on the Apple App Store.",
          "Led full development of The Coca-Cola Company's Sprite Mixer iOS music app, a major brand initiative featuring recording artist Drake.",
          "Prototyped Chrysler infotainment and navigation concepts and developed components of the 200C in-dash interface shown at the 2009 North American International Auto Show.",
        ],
      },
    ],
  },
];

export const SKILLS = [
  {
    icon: "ai",
    area: "AI and automation",
    items: "AI engineering, Model Context Protocol (MCP), prompt engineering, AI agents, LLM fine-tuning, end-to-end workflow automation, Claude, Codex, Cursor",
  },
  {
    icon: "code",
    area: "Product engineering",
    items: "React, Next.js, Python, REST API development (personal apps), databases, Swift, SwiftUI, iOS, Android, Unity, virtual reality (VR), voice technologies, Internet of Things (IoT), technical design",
  },
  {
    icon: "robot",
    area: "Robotics and hardware",
    items: "NVIDIA Omniverse, Isaac Sim, Isaac Lab, ROS 2, robot assembly and programming, electronics, 3D printing, Blender, Plasticity CAD",
  },
  {
    icon: "cloud",
    area: "Platform and delivery",
    items: "Infrastructure as Code (IaC), DevOps, CI/CD pipelines, GitHub Actions, Jenkins, Azure DevOps, Azure, AWS, Cloudflare, Linux administration, Docker, Proxmox, JIRA, Fastlane, release automation",
  },
  {
    icon: "shield",
    area: "Testing and security",
    items: "Playwright, mobile UI automation, BrowserStack, test strategy, QA process design, mobile penetration testing, reverse engineering, vulnerability analysis",
  },
  {
    icon: "flow",
    area: "Methods",
    items: "Agile, Scrum, Scaled Agile (SAFe), XP, TDD, PI planning, backlog management, estimation, scope governance",
  },
];

// Selected work: page 3 of the resume. Pictures are never cropped: each
// row is laid out by the images' own aspect ratios.
// `also` adds links under the main one (the card itself opens `href`)
export type Link = { href: string; host: string };
export const YOUTUBE_PROTOMOTA: Link = { href: "https://youtube.com/@protomota", host: "youtube.com/@protomota" };
export const YOUTUBE_AIRP: Link = { href: "https://youtube.com/@airesourcepro", host: "youtube.com/@airesourcepro" };
// `alt` describes the picture itself for screen readers and image search.
export type Work = { key: string; title: string; alt: string; body: string; tech?: string; href: string; host: string; also?: Link[]; ratio: number };
export const WORK_ROWS: Work[][] = [
  [
    {
      key: "jotley",
      title: "Jotley",
      alt: "Jotley on a Mac, iPad and iPhone, showing a meeting note with key points, decisions and action items",
      body: "Private AI notes for Mac, iPhone and iPad. Transcribes speech live, then summarizes and answers questions on the device with Apple Intelligence.",
      tech: "Swift, SwiftUI, Apple Intelligence, iCloud",
      href: "https://jotley.ai",
      host: "jotley.ai",
      ratio: 1905 / 1000,
    },
    {
      key: "pulsecanvas",
      title: "PulseCanvas Studio",
      alt: "PulseCanvas Studio on a Mac, iPad and iPhone, playing colorful kaleidoscope music visualizers",
      body: "Music visualizer and video maker for Mac, iPhone, iPad and Apple Vision Pro. Finds the beat, splits the song into sections and plays native visualizers and MilkDrop effects.",
      tech: "Swift, SwiftUI, Metal, export up to 4K at 60 fps",
      href: "https://pulsecanvas.si",
      host: "pulsecanvas.si",
      ratio: 1905 / 1000,
    },
  ],
  [
    {
      key: "everything-launched",
      title: "Everything we've ever launched",
      alt: "The Everything we've ever launched simulation: a 3D Earth surrounded by tracked objects, with the Space Shuttle Columbia panel open on April 12, 1981",
      body: "Interactive 3D simulation of every object tracked in Earth orbit since Sputnik, appearing launch by launch on a 3D Earth.",
      tech: "3D data visualization, web",
      href: "https://protomota.com/experiments/everything-launched",
      host: "protomota.com/experiments",
      ratio: 1500 / 938,
    },
    {
      key: "iphone-teardown",
      title: "iPhone Duo teardown",
      alt: "Exploded view of the folding iPhone Duo in the interactive teardown, with the logic board step selected",
      body: "A folding iPhone rebuilt in code. Take it apart in repair order and tap any part to see where the numbers came from.",
      tech: "Interactive 3D, web",
      href: "https://protomota.com/experiments/iphone-duo-teardown",
      host: "protomota.com/experiments",
      ratio: 1500 / 883,
    },
    {
      key: "ai-resource-pro",
      title: "AI Resource Pro",
      alt: "AI Resource Pro banner reading Learn AI by building with it, free tutorials and videos",
      body: "Free tutorials and videos for learning AI by building with it: Claude and Codex best practices, computer-use agents and open-weight models on your own GPU.",
      tech: "Next.js, TypeScript, Supabase",
      href: "https://airesourcepro.com",
      host: "airesourcepro.com",
      also: [YOUTUBE_AIRP],
      ratio: 1200 / 630,
    },
  ],
  [
    {
      key: "ogre",
      title: "Project Ogre",
      alt: "Project Ogre, an orange mecanum-wheel robot with a lidar sensor and a Jetson Orin Nano, on a carpet",
      body: "Mecanum-drive robot on a Jetson Orin Nano with RPLIDAR, RealSense depth and autonomous navigation with SLAM and Nav2, trained in Isaac Lab.",
      tech: "ROS 2, Isaac Lab, Isaac Sim, SLAM, Nav2",
      href: "https://newsletter.protomota.com/p/project-ogre-part-1-building-a-mecanum",
      host: "Build log",
      ratio: 1100 / 825,
    },
    {
      key: "so-arm",
      title: "SO-ARM 101 digital twin",
      alt: "The real SO-ARM 101 robot arm next to its yellow digital twin in Isaac Sim",
      body: "A leader arm drives a 6-axis arm in Isaac Sim in real time.",
      tech: "Isaac Sim, ROS 2, LeRobot",
      href: "https://newsletter.protomota.com/p/real-time-so-arm-101-ros2-teleoperation",
      host: "Build log",
      ratio: 1100 / 619,
    },
    {
      key: "jetbot",
      title: "JetBot Orin",
      alt: "JetBot Orin, a small orange two-wheel robot with a Jetson Orin Nano and a camera, on a carpet",
      body: "The NVIDIA JetBot, rebuilt for the Jetson Orin Nano with a custom chassis.",
      tech: "Jetson Orin, OpenCV",
      href: "https://newsletter.protomota.com/p/project-nvidia-jetbot-orin-nano",
      host: "Build log",
      ratio: 1100 / 825,
    },
  ],
  [
    {
      key: "3d-prints",
      title: "3D prints",
      alt: "A 3D-printed armor piece made of overlapping leaf-shaped scales",
      body: "Armor, tools and decorative pieces. The Elven Leaf Armor has over 10,000 downloads.",
      href: "https://makerworld.com/en/@protomota",
      host: "makerworld.com/@protomota",
      ratio: 1100 / 733,
    },
    {
      key: "ai-video",
      title: "AI video and motion",
      alt: "A frame from my AI video work: the word Automation in orange with a streak of light",
      body: "Clips, short videos, titles and visuals that move to music.",
      href: "https://protomota.com/motion",
      host: "protomota.com/motion",
      also: [YOUTUBE_PROTOMOTA],
      ratio: 1100 / 619,
    },
  ],
];

// Jotley always first. Both apps are free and source available (never
// "open source"); Jotley notes stay on the device and in the user's iCloud.
export const LAB = [
  {
    name: "Jotley",
    icon: "/img/jotley-144.png",
    href: "https://jotley.ai",
    host: "jotley.ai",
    meta: "Mac · iPhone · iPad · On the App Store",
    text: "Private AI notes. Transcribes speech live, then summarizes and answers questions on the device with Apple Intelligence.",
  },
  {
    name: "PulseCanvas Studio",
    icon: "/img/pulsecanvas-144.png",
    href: "https://pulsecanvas.si",
    host: "pulsecanvas.si",
    meta: "Mac · iPhone · iPad · Vision Pro · On the App Store",
    text: "Music visualizer and video maker. Finds the beat, splits a song into sections and exports music-synced video up to 4K at 60 fps.",
  },
  {
    name: "AI Resource Pro",
    icon: "/img/airesource-mark.svg",
    href: "https://airesourcepro.com",
    host: "airesourcepro.com",
    also: [YOUTUBE_AIRP],
    meta: "Free tutorials and videos",
    text: "Learn AI by building with it: Claude and Codex best practices, computer-use agents, open-weight models on your own GPU.",
  },
];

// The rest of the app portfolio, in the same order as protomota.com/about
// (Brad 2026-11-12: Jotley, PulseCanvas, then OpenTalon, Inkspring, Voxley, Textley).
export const LAB_APPS = [
  { label: "OpenTalon", href: "https://opentalon.ai", text: "Coming soon: a local task board that hands work to AI agents" },
  { label: "Inkspring", href: "https://inkspring.ai", text: "Coming soon: a private studio for researching and writing posts" },
  { label: "Voxley", href: "https://voxley.si", text: "Coming soon: private dictation for Mac" },
  { label: "Textley", href: "https://textley.ai", text: "Coming soon: a Mac editor for text, Markdown and folder vaults, with a Claude connection" },
];

export const LAB_LINKS = [
  { label: "Experiments", href: `${PROTOMOTA}/experiments`, text: "Interactive simulations and builds" },
  { label: "Motion", href: `${PROTOMOTA}/motion`, text: "AI video and motion work" },
  { label: "Websites", href: `${PROTOMOTA}/websites`, text: "Websites and web apps I've shipped" },
];

export const EDUCATION = ["Bachelor of Fine Arts (BFA) in Graphic Design, Eastern Michigan University"];

export const CERTIFICATIONS = [
  "Google IT Automation with Python Professional Certificate",
  "NTT Gen AI White, Yellow and Green Belt",
  "NTT DATA Agile and Scrum Internal Certification",
  "GitHub Copilot Certified",
  "Google AI Essentials",
];

export const INDUSTRIES =
  "Manufacturing, utilities and energy, automotive, retail and shopping centers, IoT and connected hardware, sweepstakes and promotions, entertainment and consumer brands";
