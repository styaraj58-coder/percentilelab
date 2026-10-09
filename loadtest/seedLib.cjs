// Seeding logic for the load test. Used by seed.cjs (which adds the safety
// guard that refuses to run against production).
//
// It creates, all clearly marked and easy to remove:
//   - N student accounts   loadtest-0001@loadtest.invalid ...
//   - 1 admin account      loadtest-admin@loadtest.invalid
//   - 1 synthetic mock     "LOADTEST Mock" - 200 questions, UNPUBLISHED, so it
//                          never appears on any public page or student list
//   - 1 in-progress attempt per student, so each virtual student can open the
//     exam page directly (the cheap "start test" insert is skipped)
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const bcrypt = require("bcryptjs");

const EMAIL_DOMAIN = "loadtest.invalid";
const TEST_TITLE = "LOADTEST Mock";
const DATA_FILE = path.join(__dirname, "data.json");

const id = () => crypto.randomUUID();
const studentEmail = (i) => `loadtest-${String(i).padStart(4, "0")}@${EMAIL_DOMAIN}`;

const words =
  "analysis ratio percentage sequence argument inference passage table chart arrangement statement conclusion probability average profit distance interest section difficulty accuracy selection strategy".split(
    " "
  );
const sentence = (n, seed) =>
  Array.from({ length: n }, (_, k) => words[(seed * 7 + k * 3) % words.length]).join(" ");

// Mirrors the real MAH-CET mock: 75 / 25 / 50 / 50 questions, with shared
// passages for some groups of questions.
const SECTIONS = [
  { name: "Logical Reasoning", questions: 75, passageEvery: 5 },
  { name: "Abstract Reasoning", questions: 25, passageEvery: 0 },
  { name: "Quantitative Aptitude", questions: 50, passageEvery: 5 },
  { name: "Verbal Ability & Reading Comprehension", questions: 50, passageEvery: 5 },
];

async function createTestContent(prisma, adminId, scale = 1) {
  const test = await prisma.test.create({
    data: {
      title: TEST_TITLE,
      description: "Synthetic test used only for load testing. Never published.",
      targetExam: "MH-CET (MBA)",
      durationMinutes: 150,
      published: false,
      isFreePreview: true,
      createdById: adminId,
    },
  });

  const sections = [];
  const passages = [];
  const questions = [];
  const options = [];
  let seed = 1;

  SECTIONS.forEach((def, sIdx) => {
    const sectionId = id();
    sections.push({ id: sectionId, testId: test.id, name: def.name, order: sIdx });
    const count = Math.max(5, Math.round(def.questions * scale));
    let passageId = null;
    for (let q = 0; q < count; q++) {
      if (def.passageEvery && q % def.passageEvery === 0) {
        passageId = id();
        passages.push({ id: passageId, sectionId, title: null, text: sentence(160, seed++) + "." });
      }
      const qid = id();
      questions.push({
        id: qid,
        sectionId,
        passageId: def.passageEvery ? passageId : null,
        order: q,
        text: sentence(24, seed++) + "?",
        explanation: sentence(40, seed++) + ".",
        marks: 1,
        topic: def.name,
        subTopic: "Synthetic",
      });
      for (let o = 0; o < 5; o++) {
        options.push({ id: id(), questionId: qid, text: sentence(6, seed++), order: o, isCorrect: o === q % 5 });
      }
    }
  });

  await prisma.section.createMany({ data: sections });
  await prisma.passage.createMany({ data: passages });
  await prisma.question.createMany({ data: questions });
  await prisma.option.createMany({ data: options });
  return test.id;
}

async function writeDataFile(prisma, testId, users) {
  const questions = await prisma.question.findMany({
    where: { section: { testId } },
    select: { id: true, options: { select: { id: true }, orderBy: { order: "asc" } } },
    orderBy: [{ section: { order: "asc" } }, { order: "asc" }],
  });
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({
      testId,
      questions: questions.map((q) => ({ id: q.id, options: q.options.map((o) => o.id) })),
      users,
    })
  );
  return questions.length;
}

async function createAttempts(prisma, testId, students, passwordByUser) {
  const attempts = students.map((s) => ({ id: id(), testId, studentId: s.id }));
  await prisma.testAttempt.createMany({ data: attempts });
  return students.map((s, i) => ({
    email: s.email,
    password: passwordByUser,
    attemptId: attempts[i].id,
  }));
}

async function findLoadtestTest(prisma) {
  return prisma.test.findFirst({ where: { title: TEST_TITLE, published: false }, select: { id: true } });
}

async function seed(prisma, { users = 300, scale = 1, log = console.log } = {}) {
  if (await findLoadtestTest(prisma)) {
    throw new Error('A "LOADTEST Mock" already exists. Run "cleanup" first, or "reset" to only recreate the attempts.');
  }

  const password = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email: `loadtest-admin@${EMAIL_DOMAIN}` },
    update: {},
    create: { name: "Loadtest Admin", email: `loadtest-admin@${EMAIL_DOMAIN}`, passwordHash, role: "ADMIN" },
  });

  const rows = Array.from({ length: users }, (_, i) => ({
    id: id(),
    name: `Load Test ${i + 1}`,
    email: studentEmail(i + 1),
    passwordHash,
    role: "STUDENT",
    isPremium: true,
    phone: "9000000000",
    college: "Load Test College",
    course: "BBA",
    targetExam: "MH-CET (MBA)",
  }));
  await prisma.user.createMany({ data: rows, skipDuplicates: true });
  log(`created ${users} students`);

  const testId = await createTestContent(prisma, admin.id, scale);
  const students = await prisma.user.findMany({
    where: { email: { endsWith: `@${EMAIL_DOMAIN}` }, role: "STUDENT" },
    select: { id: true, email: true },
    orderBy: { email: "asc" },
  });
  const list = await createAttempts(prisma, testId, students, password);
  const questionCount = await writeDataFile(prisma, testId, list);
  log(`created the synthetic test with ${questionCount} questions and ${list.length} in-progress attempts`);
  return { testId, users: list.length, questions: questionCount, dataFile: DATA_FILE };
}

// Submitted attempts can't be reused, so recreate fresh in-progress ones
// before every run.
async function reset(prisma, { log = console.log } = {}) {
  const test = await findLoadtestTest(prisma);
  if (!test) throw new Error('No "LOADTEST Mock" found. Run seed first.');
  const old = JSON.parse(fs.existsSync(DATA_FILE) ? fs.readFileSync(DATA_FILE, "utf8") : "{}");
  const password = old.users?.[0]?.password;
  if (!password) throw new Error("data.json is missing - cannot reuse the student password. Run cleanup, then seed again.");

  const deleted = await prisma.testAttempt.deleteMany({ where: { testId: test.id } });
  const students = await prisma.user.findMany({
    where: { email: { endsWith: `@${EMAIL_DOMAIN}` }, role: "STUDENT" },
    select: { id: true, email: true },
    orderBy: { email: "asc" },
  });
  const list = await createAttempts(prisma, test.id, students, password);
  await writeDataFile(prisma, test.id, list);
  log(`removed ${deleted.count} old attempts, created ${list.length} fresh ones`);
  return { users: list.length };
}

async function cleanup(prisma, { log = console.log } = {}) {
  const tests = await prisma.test.deleteMany({ where: { title: TEST_TITLE, published: false } });
  const users = await prisma.user.deleteMany({ where: { email: { endsWith: `@${EMAIL_DOMAIN}` } } });
  if (fs.existsSync(DATA_FILE)) fs.unlinkSync(DATA_FILE);
  log(`deleted ${tests.count} synthetic test(s) and ${users.count} load-test account(s)`);
  return { tests: tests.count, users: users.count };
}

module.exports = { seed, reset, cleanup, EMAIL_DOMAIN, TEST_TITLE, DATA_FILE };
