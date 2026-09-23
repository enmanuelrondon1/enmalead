-- 1. Columna nullable
ALTER TABLE "Property" ADD COLUMN "slug" TEXT;

-- 2. Backfill: slug a partir del título, único por agencia
WITH base AS (
  SELECT
    id,
    "agencyId",
    "createdAt",
    COALESCE(
      NULLIF(
        trim(both '-' from
          regexp_replace(
            translate(lower(title), 'áéíóúüñàèìòùâêîôû', 'aeiouunaeiouaeiou'),
            '[^a-z0-9]+', '-', 'g'
          )
        ),
        ''
      ),
      'propiedad'
    ) AS s
  FROM "Property"
),
numbered AS (
  SELECT
    id,
    s,
    row_number() OVER (PARTITION BY "agencyId", s ORDER BY "createdAt", id) AS rn
  FROM base
)
UPDATE "Property" p
SET "slug" = CASE WHEN n.rn = 1 THEN n.s ELSE n.s || '-' || n.rn END
FROM numbered n
WHERE p.id = n.id;

-- 3. Obligatorio + único por agencia
ALTER TABLE "Property" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX "Property_agencyId_slug_key" ON "Property"("agencyId", "slug");
