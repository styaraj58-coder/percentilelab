#!/usr/bin/env node
// Seeds / resets / removes the load-test data in a STAGING database.
//
//   node loadtest/seed.cjs seed    --users 300 --yes
//   node loadtest/seed.cjs reset   --yes        (fresh attempts before each run)
//   node loadtest/seed.cjs cleanup --yes
//
// The target database comes from loadtest/.env.staging (DATABASE_URL) and this
// script REFUSES to run if that points at the production project.
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dotenv = require(path.join(root, "node_modules", "dotenv"));
const { PrismaClient } = require(path.join(root, "node_modules", "@prisma", "client"));
const lib = require("./seedLib.cjs");

function fail(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args.find((a) => !a.startsWith("--"));
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
if (!["seed", "reset", "cleanup"].includes(command)) {
  fail("Usage: node loadtest/seed.cjs <seed|reset|cleanup> [--users 300] [--scale 1] --yes");
}

// ---- the staging database --------------------------------------------------
const stagingFile = path.resolve(root, flag("env", "loadtest/.env.staging"));
if (!fs.existsSync(stagingFile)) {
  fail(`Missing ${path.relative(root, stagingFile)}. Copy loadtest/.env.staging.example, fill in your STAGING database URL.`);
}
const staging = dotenv.parse(fs.readFileSync(stagingFile));
const stagingUrl = staging.DATABASE_URL;
if (!stagingUrl) fail("DATABASE_URL is missing in the staging env file.");

// ---- never production ------------------------------------------------------
const prod = fs.existsSync(path.join(root, ".env")) ? dotenv.parse(fs.readFileSync(path.join(root, ".env"))) : {};
const prodRef = (prod.SUPABASE_URL || "").match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
const hostOf = (url) => {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
};
// Supabase poolers share one host across projects, so the project reference
// (inside the username / host) is what identifies production.
const looksLikeProd = [stagingUrl, staging.DIRECT_URL]
  .filter(Boolean)
  .some((u) => (prodRef && u.includes(prodRef)) || [prod.DATABASE_URL, prod.DIRECT_URL].includes(u));
if (looksLikeProd) {
  fail("The staging DATABASE_URL points at the PRODUCTION project. Refusing to continue. Create a separate staging Supabase project.");
}

if (!args.includes("--yes")) {
  fail(`About to run "${command}" on database host ${hostOf(stagingUrl)}.\nIf that is your STAGING database, run again with --yes.`);
}

const prisma = new PrismaClient({ datasourceUrl: stagingUrl });

(async () => {
  console.log(`Target: ${hostOf(stagingUrl)} (staging)`);
  if (command === "seed") {
    const result = await lib.seed(prisma, { users: Number(flag("users", 300)), scale: Number(flag("scale", 1)) });
    console.log(`\n✔ Done. ${result.users} students, ${result.questions} questions.\n  Test data written to ${path.relative(root, result.dataFile)} (git-ignored).`);
  } else if (command === "reset") {
    await lib.reset(prisma);
    console.log("\n✔ Fresh attempts ready - you can start a new run.");
  } else {
    await lib.cleanup(prisma);
    console.log("\n✔ Load-test data removed.");
  }
})()
  .catch((e) => fail(e.message))
  .finally(() => prisma.$disconnect());
