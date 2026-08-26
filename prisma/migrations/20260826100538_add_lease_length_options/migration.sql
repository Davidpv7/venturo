-- AlterTable: add the fixed 3/6/12-month option flags alongside the old column first
ALTER TABLE "Room"
  ADD COLUMN "leaseLength3Months" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "leaseLength6Months" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "leaseLength12Months" BOOLEAN NOT NULL DEFAULT false;

-- Backfill from the old leaseLengthMonths value: exact match wins; any other
-- value (there is currently one legacy room set to 2) falls back to whichever
-- of 3/6/12 is numerically closest, ties broken toward the lower option.
UPDATE "Room" SET
  "leaseLength3Months" = (
    "leaseLengthMonths" = 3
    OR (
      "leaseLengthMonths" NOT IN (3, 6, 12)
      AND ABS("leaseLengthMonths" - 3) <= ABS("leaseLengthMonths" - 6)
      AND ABS("leaseLengthMonths" - 3) <= ABS("leaseLengthMonths" - 12)
    )
  ),
  "leaseLength6Months" = (
    "leaseLengthMonths" = 6
    OR (
      "leaseLengthMonths" NOT IN (3, 6, 12)
      AND ABS("leaseLengthMonths" - 6) < ABS("leaseLengthMonths" - 3)
      AND ABS("leaseLengthMonths" - 6) <= ABS("leaseLengthMonths" - 12)
    )
  ),
  "leaseLength12Months" = (
    "leaseLengthMonths" = 12
    OR (
      "leaseLengthMonths" NOT IN (3, 6, 12)
      AND ABS("leaseLengthMonths" - 12) < ABS("leaseLengthMonths" - 3)
      AND ABS("leaseLengthMonths" - 12) < ABS("leaseLengthMonths" - 6)
    )
  );

-- Drop the old single-value column now that every room has been backfilled
ALTER TABLE "Room" DROP COLUMN "leaseLengthMonths";

-- Restore the schema's intended default (true) for leaseLength6Months, which
-- only applied to rows inserted after this migration, not the backfill above
ALTER TABLE "Room" ALTER COLUMN "leaseLength6Months" SET DEFAULT true;
