ALTER TABLE pis ADD COLUMN purchase_generated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN finance_approved_at TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN packing_info_generated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN commercial_invoice_generated_at TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN payment_confirmed_at TEXT NOT NULL DEFAULT '';

UPDATE pis
SET
  purchase_generated_at = CASE WHEN id = 'PI001' THEN '2026-06-11T02:00:00Z' ELSE purchase_generated_at END,
  finance_approved_at = CASE WHEN id = 'PI001' THEN '2026-06-11T04:30:00Z' ELSE finance_approved_at END,
  packing_info_generated_at = CASE WHEN id = 'PI001' THEN '2026-06-11T06:10:00Z' ELSE packing_info_generated_at END,
  commercial_invoice_generated_at = CASE WHEN id = 'PI001' THEN '2026-06-11T08:15:00Z' ELSE commercial_invoice_generated_at END,
  payment_confirmed_at = CASE WHEN id = 'PI001' THEN '' ELSE payment_confirmed_at END;
