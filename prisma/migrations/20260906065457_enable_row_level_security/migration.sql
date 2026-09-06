-- Enable Row Level Security on every table in the public schema, with no
-- permissive policies. The app never queries Postgres through Supabase's
-- auto-generated REST/GraphQL API (it connects via Prisma using the table
-- owner role, which RLS never restricts) - this closes that API off as a
-- defense-in-depth measure in case the project's anon key is ever exposed.
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PasswordResetToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Test" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Section" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Passage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Option" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TestAttempt" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Resource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankQuestionSet" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankQuestion" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BankOption" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Answer" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
