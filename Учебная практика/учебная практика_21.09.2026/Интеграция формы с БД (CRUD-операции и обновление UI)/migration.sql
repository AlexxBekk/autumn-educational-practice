BEGIN;

ALTER TABLE partners ADD COLUMN IF NOT EXISTS partner_type VARCHAR(10);
ALTER TABLE partners ADD COLUMN IF NOT EXISTS director_name VARCHAR(255);
ALTER TABLE partners ADD COLUMN IF NOT EXISTS address VARCHAR(255);

UPDATE partners
SET partner_type = split_part(company_name, ' ', 1),
    company_name = substring(company_name FROM position(' ' IN company_name) + 1)
WHERE partner_type IS NULL
  AND split_part(company_name, ' ', 1) IN ('ЗАО', 'ООО', 'ОАО', 'ПАО', 'ИП', 'ТК');

UPDATE partners SET company_name = trim(BOTH '"' FROM company_name);

ALTER TABLE partners ALTER COLUMN partner_type SET NOT NULL;

ALTER TABLE partners ALTER COLUMN rating TYPE INTEGER USING ROUND(rating);

ALTER TABLE partners DROP CONSTRAINT IF EXISTS partners_rating_check;
ALTER TABLE partners ADD CONSTRAINT partners_rating_check CHECK (rating >= 0);

COMMIT;
