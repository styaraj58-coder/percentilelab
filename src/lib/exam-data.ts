export type ExamSection = {
  name: string;
  questions: string;
  detail?: string;
};

export type SyllabusGroup = {
  category: string;
  topics: string[];
};

export type TentativeDate = {
  label: string;
  window: string;
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
  topColleges: string[];
  tentativeDates: TentativeDate[];
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
    topColleges: [
      "Jamnalal Bajaj Institute of Management Studies (JBIMS), Mumbai",
      "Sydenham Institute of Management Studies (SIMSREE), Mumbai",
      "Department of Management Sciences (PUMBA), Pune",
      "K J Somaiya Institute of Management, Mumbai",
      "Welingkar Institute of Management (WeSchool), Mumbai",
      "N L Dalmia Institute of Management Studies, Mumbai",
      "Vishwakarma Institute of Management, Pune",
      "IES Management College and Research Centre, Mumbai",
      "SIES College of Management Studies, Mumbai",
      "Government College of Engineering, Amravati (Dept. of Management)",
    ],
    tentativeDates: [
      { label: "Registration opens", window: "Early January" },
      { label: "Registration closes", window: "Mid-February" },
      { label: "Exam day", window: "Mid-to-late March" },
      { label: "Result", window: "April" },
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
    topColleges: [
      "IIM Ahmedabad",
      "IIM Bangalore",
      "IIM Calcutta",
      "IIM Lucknow",
      "IIM Kozhikode",
      "IIM Indore",
      "Faculty of Management Studies (FMS), Delhi",
      "SP Jain Institute of Management and Research (SPJIMR), Mumbai",
      "MDI Gurgaon",
      "IIM Shillong",
    ],
    tentativeDates: [
      { label: "Registration opens", window: "Early August" },
      { label: "Registration closes", window: "Mid-September" },
      { label: "Exam day", window: "Last Sunday of November" },
      { label: "Result", window: "Early January" },
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
    topColleges: [
      "Institute of Management Technology (IMT), Ghaziabad",
      "Xavier Institute of Management and Entrepreneurship (XIME)",
      "Jaipuria Institute of Management",
      "Balaji Institute of Modern Management (BIMM), Pune",
      "Alliance University, Bangalore",
      "ICFAI Business School (IBS)",
      "Amity Business School",
      "Fore School of Management, Delhi",
      "Loyola Institute of Business Administration (LIBA), Chennai",
      "Symbiosis Institute of Management Studies (SIMS), Pune",
    ],
    tentativeDates: [
      { label: "Test windows", window: "Runs 4 times a year — February, May, September, December" },
      { label: "Registration", window: "Closes ~1–2 weeks before each test window" },
      { label: "Result", window: "~2–3 weeks after each test window" },
    ],
  },
  {
    slug: "atma",
    shortName: "ATMA",
    fullName: "AIMS Test for Management Admissions",
    conductedBy: "Association of Indian Management Schools (AIMS)",
    about:
      "ATMA is a national-level exam conducted several times a year and accepted by a wide network of AIMS-member B-schools. It follows a straightforward three-section format split into two equal halves, with a short break in between, and rewards balanced, all-round preparation over depth in any one area.",
    pattern: {
      mode: "Computer-based test (CBT)",
      duration: "180 minutes (two parts of 90 minutes each, with a break)",
      totalQuestions: "180 questions",
      markingScheme: "+1 for correct, -0.25 for wrong answer",
      sections: [
        { name: "Analytical Reasoning Skills", questions: "60 questions" },
        { name: "Verbal Skills", questions: "60 questions" },
        { name: "Quantitative Skills", questions: "60 questions" },
      ],
    },
    syllabus: [
      {
        category: "Analytical Reasoning Skills",
        topics: [
          "Puzzles and seating arrangements",
          "Coding-decoding",
          "Blood relations and direction sense",
          "Syllogisms and critical reasoning",
          "Series and pattern recognition",
        ],
      },
      {
        category: "Verbal Skills",
        topics: [
          "Reading comprehension",
          "Grammar and sentence correction",
          "Vocabulary (synonyms, antonyms, analogies)",
          "Para jumbles and fill in the blanks",
        ],
      },
      {
        category: "Quantitative Skills",
        topics: [
          "Arithmetic (percentages, ratio, profit & loss, time-speed-distance)",
          "Algebra and number systems",
          "Geometry and mensuration",
          "Data interpretation and data sufficiency",
        ],
      },
    ],
    topColleges: [
      "Great Lakes Institute of Management, Chennai",
      "Loyola Institute of Business Administration (LIBA), Chennai",
      "Xavier Institute of Management and Entrepreneurship (XIME)",
      "T A Pai Management Institute (TAPMI), Manipal",
      "Alliance University, Bangalore",
      "Christ University, Bangalore",
      "IFIM Business School, Bangalore",
      "Jaipuria Institute of Management",
      "Fore School of Management, Delhi",
      "K J Somaiya Institute of Management, Mumbai",
    ],
    tentativeDates: [
      { label: "Test windows", window: "Runs ~6 times a year — roughly Feb, Apr, May, Jul, Sep, Dec" },
      { label: "Registration", window: "Closes ~1–2 weeks before each test window" },
      { label: "Result", window: "~1–2 weeks after each test window" },
    ],
  },
];
