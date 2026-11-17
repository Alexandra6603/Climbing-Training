-- Existing values are stored in display units. Convert them before changing to integers.
UPDATE "StandardAttemptValue" AS value_row
SET "value" = ROUND(value_row."value" * CASE
  WHEN standard."unit" = 'kg' THEN 1000
  WHEN standard."unit" IN ('cm', 'sm') THEN 10
  ELSE 1
END)
FROM "Standard" AS standard
WHERE value_row."standardId" = standard."id";

ALTER TABLE "StandardAttemptValue"
ALTER COLUMN "value" TYPE INTEGER
USING ROUND("value")::INTEGER;

UPDATE "Standard"
SET "unit" = 'cm'
WHERE "unit" = 'sm';
