export type ExamSection = {
  name: string;
  questions: string;
  detail?: string;
};

export type SyllabusGroup = {
  category: string;
  topics: string[];
};

export type ExamInfo = {
  slug: string;
  shortName: string;
  fullName: string;
  conductedBy: string;
  about: string;
  pattern: {
    mode: string;
    duration: string;
    totalQuestions: string;
    markingScheme: string;
    sections: ExamSection[];
  };
  syllabus: SyllabusGroup[];
};

export const exams: ExamInfo[] = [
  {
    slug: "mah-cet",
    shortName: "MAH-CET",
    fullName: "Maharashtra Common Entrance Test (MBA/MMS)",
    conductedBy: "State CET Cell, Maharashtra",
    about:
      "MAH-CET (MBA/MMS) is the state-level entrance test for admission to MBA/MMS programs at management institutes across Maharashtra, including the Jamnalal Bajaj Institute, Sydenham, and PUMBA. It's a computer-based test built around speed and accuracy across four sections, with no negative marking — which changes the risk calculus compared to national exams like CAT.",
    pattern: {
      mode: "Computer-based test (CBT)",
      duration: "150 minutes",
      totalQuestions: "200 MCQs",
      markingScheme: "+1 per correct answer, no negative marking",
      sections: [
        { name: "Logical Reasoning", questions: "75 questions", detail: "Largest section by weight" },
        { name: "Abstract Reasoning", questions: "25 questions" },
        { name: "Quantitative Aptitude", questions: "50 questions" },
        { name: "Verbal Ability / Reading Comprehension", questions: "50 questions" },
      ],
    },
    syllabus: [
      {
        category: "Logical & Abstract Reasoning",
        topics: [
          "Critical reasoning and assumptions",
          "Coding-decoding",
          "Blood relations and direction sense",
          "Seating arrangement and puzzles",
          "Series completion and pattern recognition",
          "Syllogisms and statement-conclusion",
        ],
      },
      {
        category: "Quantitative Aptitude",
        topics: [
          "Arithmetic (percentages, ratio, profit & loss, time-speed-distance)",
          "Algebra and equations",
          "Number systems",
          "Geometry and mensuration",
          "Data interpretation (tables, graphs, charts)",
          "Data sufficiency",
        ],
      },
      {
        category: "Verbal Ability & Reading Comprehension",
        topics: [
          "Reading comprehension passages",
          "Para jumbles and para completion",
          "Fill in the blanks and vocabulary",
          "Sentence correction and grammar",
          "Synonyms, antonyms, and analogies",
        ],
      },
    ],
  },
  {
    slug: "cat",
    shortName: "CAT",
    fullName: "Common Admission Test",
    conductedBy: "Indian Institutes of Management (IIMs), on rotation",
    about:
      "CAT is India's most competitive MBA entrance exam, used for admission to the IIMs and accepted by hundreds of other B-schools. It tests data interpretation and logical reasoning as a standalone section, alongside quant and verbal, under strict sectional time limits — you can't borrow time from one section to finish another.",
    pattern: {
      mode: "Computer-based test (CBT), sectional timing enforced",
      duration: "~120 minutes (individual sectional time limits apply)",
      totalQuestions: "~66 questions (MCQ + Type-In-The-Answer/TITA)",
      markingScheme: "+3 for correct, -1 for wrong MCQ answers, no negative marking on TITA",
      sections: [
        { name: "Verbal Ability & Reading Comprehension (VARC)", questions: "~24 questions" },
        { name: "Data Interpretation & Logical Reasoning (DILR)", questions: "~20 questions" },
        { name: "Quantitative Ability (QA)", questions: "~22 questions" },
      ],
    },
    syllabus: [
      {
        category: "Verbal Ability & Reading Comprehension",
        topics: [
          "Long and short reading comprehension passages",
          "Para jumbles",
          "Para summary",
          "Odd sentence out",
          "Critical reasoning within passages",
        ],
      },
      {
        category: "Data Interpretation & Logical Reasoning",
        topics: [
          "Tables, bar/line/pie charts, caselets",
          "Set-based puzzles (arrangement, scheduling, grouping)",
          "Games and tournaments",
          "Network and route diagrams",
          "Data sufficiency-style reasoning",
        ],
      },
      {
        category: "Quantitative Ability",
        topics: [
          "Arithmetic (percentages, averages, ratio-proportion, time-work, TSD)",
          "Algebra (equations, inequalities, functions)",
          "Number systems",
          "Geometry and mensuration",
          "Permutation, combination & probability",
          "Logarithms, indices, and surds",
        ],
      },
    ],
  },
  {
    slug: "xat",
    shortName: "XAT",
    fullName: "Xavier Aptitude Test",
    conductedBy: "XLRI Jamshedpur (on behalf of XAMI)",
    about:
      "XAT is the entrance exam for XLRI and over 150 other institutes. It's known for a distinct Decision Making section that tests judgment on business-style case situations rather than pure calculation, plus a General Knowledge section that most other MBA exams skip entirely.",
    pattern: {
      mode: "Computer-based test (CBT)",
      duration: "~165 minutes (incl. GK section)",
      totalQuestions: "~95-100 questions across all sections",
      markingScheme: "+1 for correct, -0.25 for wrong; extra penalty for excessive unattempted questions",
      sections: [
        { name: "Verbal & Logical Ability", questions: "~26 questions" },
        { name: "Decision Making", questions: "~21 questions" },
        { name: "Quantitative Ability & Data Interpretation", questions: "~28 questions" },
        { name: "General Knowledge", questions: "~25 questions", detail: "Not counted toward percentile, used for shortlisting" },
      ],
    },
    syllabus: [
      {
        category: "Verbal & Logical Ability",
        topics: [
          "Reading comprehension",
          "Critical reasoning and para jumbles",
          "Vocabulary and grammar",
          "Analogies and verbal logic",
        ],
      },
      {
        category: "Decision Making",
        topics: [
          "Case-based situational judgment",
          "Ethical dilemmas and business scenarios",
          "Conditional/rule-based decision problems",
        ],
      },
      {
        category: "Quantitative Ability & Data Interpretation",
        topics: [
          "Arithmetic, algebra, geometry, number systems",
          "Data interpretation (tables, graphs)",
          "Data sufficiency",
        ],
      },
      {
        category: "General Knowledge",
        topics: [
          "Current affairs (national & international business/economy news)",
          "Static GK (history, geography, polity)",
          "Business and corporate awareness",
        ],
      },
    ],
  },
  {
    slug: "snap",
    shortName: "SNAP",
    fullName: "Symbiosis National Aptitude Test",
    conductedBy: "Symbiosis International (Deemed University)",
    about:
      "SNAP is the gateway exam for Symbiosis institutes such as SIBM Pune and SCMHRD. It's a shorter, high-speed test compared to CAT/XAT, with a heavier weight on general English and a dedicated analytical & logical reasoning section.",
    pattern: {
      mode: "Computer-based test (CBT)",
      duration: "60 minutes",
      totalQuestions: "~60 questions",
      markingScheme: "+1 per correct answer, -0.25 for wrong answers on MCQs",
      sections: [
        { name: "General English", questions: "~15 questions" },
        { name: "Quantitative, Data Interpretation & Data Sufficiency", questions: "~20 questions" },
        { name: "Analytical & Logical Reasoning", questions: "~25 questions" },
      ],
    },
    syllabus: [
      {
        category: "General English",
        topics: [
          "Reading comprehension",
          "Verbal reasoning",
          "Vocabulary usage and grammar",
          "Para jumbles and sentence correction",
        ],
      },
      {
        category: "Quantitative, DI & Data Sufficiency",
        topics: [
          "Arithmetic and algebra",
          "Geometry and mensuration",
          "Data interpretation (charts, tables)",
          "Data sufficiency problems",
        ],
      },
      {
        category: "Analytical & Logical Reasoning",
        topics: [
          "Puzzles and arrangements",
          "Coding-decoding",
          "Family tree and direction-based problems",
          "Critical reasoning",
        ],
      },
    ],
  },
  {
    slug: "nmat",
    shortName: "NMAT",
    fullName: "NMAT by GMAC",
    conductedBy: "Graduate Management Admission Council (GMAC)",
    about:
      "NMAT is the entrance test for NMIMS, VIT, and several other institutes. Its standout feature is flexibility — candidates can attempt it up to three times within a testing window and the best score counts, and each of the three sections has its own fixed sub-time-limit.",
    pattern: {
      mode: "Computer-based test (CBT), multiple attempts allowed",
      duration: "~120 minutes (fixed per-section time limits)",
      totalQuestions: "108 questions",
      markingScheme: "+1 per correct answer, no negative marking",
      sections: [
        { name: "Language Skills", questions: "36 questions" },
        { name: "Quantitative Skills", questions: "36 questions" },
        { name: "Logical Reasoning", questions: "36 questions" },
      ],
    },
    syllabus: [
      {
        category: "Language Skills",
        topics: [
          "Reading comprehension",
          "Vocabulary and grammar",
          "Verbal reasoning and sentence correction",
        ],
      },
      {
        category: "Quantitative Skills",
        topics: [
          "Arithmetic and algebra",
          "Geometry and mensuration",
          "Data interpretation and data sufficiency",
          "Number systems and probability",
        ],
      },
      {
        category: "Logical Reasoning",
        topics: [
          "Critical reasoning",
          "Puzzles, arrangement, and sequencing",
          "Coding-decoding",
          "Syllogisms",
        ],
      },
    ],
  },
  {
    slug: "cmat",
    shortName: "CMAT",
    fullName: "Common Management Admission Test",
    conductedBy: "National Testing Agency (NTA)",
    about:
      "CMAT is a national-level exam accepted by AICTE-approved B-schools across India, including many government-run institutes. It includes a dedicated Innovation & Entrepreneurship section not found in most other MBA exams, alongside the standard quant, reasoning, and verbal sections.",
    pattern: {
      mode: "Computer-based test (CBT)",
      duration: "180 minutes",
      totalQuestions: "100 questions",
      markingScheme: "+4 for correct, -1 for wrong answer",
      sections: [
        { name: "Quantitative Techniques & Data Interpretation", questions: "25 questions" },
        { name: "Logical Reasoning", questions: "25 questions" },
        { name: "Language Comprehension", questions: "25 questions" },
        { name: "General Awareness", questions: "25 questions" },
      ],
    },
    syllabus: [
      {
        category: "Quantitative Techniques & DI",
        topics: [
          "Arithmetic, algebra, geometry",
          "Data interpretation (tables, graphs)",
          "Number systems and modern math",
        ],
      },
      {
        category: "Logical Reasoning",
        topics: [
          "Puzzles and seating arrangements",
          "Coding-decoding, blood relations",
          "Critical and analytical reasoning",
        ],
      },
      {
        category: "Language Comprehension",
        topics: [
          "Reading comprehension",
          "Grammar and vocabulary",
          "Para jumbles and verbal reasoning",
        ],
      },
      {
        category: "General Awareness",
        topics: [
          "Current affairs (business, economy, national/international)",
          "Static GK",
        ],
      },
    ],
  },
  {
    slug: "mat",
    shortName: "MAT",
    fullName: "Management Aptitude Test",
    conductedBy: "All India Management Association (AIMA)",
    about:
      "MAT is unique for running four times a year and offering both a paper-based and computer-based mode, making it a flexible option accepted by a wide range of B-schools. It closely mirrors the classic five-section MBA aptitude format.",
    pattern: {
      mode: "Paper-based (PBT), Computer-based (CBT), or Internet-based (IBT) — candidate's choice",
      duration: "150 minutes",
      totalQuestions: "200 questions",
      markingScheme: "+1 for correct, -0.25 for wrong answer",
      sections: [
        { name: "Language Comprehension", questions: "40 questions" },
        { name: "Mathematical Skills", questions: "40 questions" },
        { name: "Data Analysis & Sufficiency", questions: "40 questions" },
        { name: "Intelligence & Critical Reasoning", questions: "40 questions" },
        { name: "Indian & Global Environment", questions: "40 questions", detail: "General knowledge, usually not counted toward composite score" },
      ],
    },
    syllabus: [
      {
        category: "Language Comprehension",
        topics: ["Reading comprehension", "Grammar and vocabulary", "Verbal reasoning"],
      },
      {
        category: "Mathematical Skills",
        topics: ["Arithmetic, algebra, geometry", "Number systems", "Mensuration"],
      },
      {
        category: "Data Analysis & Sufficiency",
        topics: ["Tables, graphs, and charts", "Data sufficiency problems"],
      },
      {
        category: "Intelligence & Critical Reasoning",
        topics: ["Puzzles and arrangements", "Coding-decoding", "Critical reasoning", "Syllogisms"],
      },
      {
        category: "Indian & Global Environment",
        topics: ["Current affairs", "Static general knowledge", "Business and economy news"],
      },
    ],
  },
];
