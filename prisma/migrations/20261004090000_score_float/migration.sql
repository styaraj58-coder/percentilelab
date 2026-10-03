-- Negative marking produces fractional scores (e.g. 97.75), so scores can no longer
-- be whole numbers. Existing integer scores convert losslessly.
ALTER TABLE "TestAttempt" ALTER COLUMN "score" TYPE DOUBLE PRECISION;
