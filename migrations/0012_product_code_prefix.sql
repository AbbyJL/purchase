ALTER TABLE products ADD COLUMN code_prefix TEXT NOT NULL DEFAULT '';
ALTER TABLE products ADD COLUMN quote_product_codes_json TEXT NOT NULL DEFAULT '[]';

UPDATE products
SET
  code_prefix = CASE id
    WHEN 'SPU001' THEN 'SCL'
    WHEN 'SPU002' THEN 'KITH'
    WHEN 'SPU003' THEN 'SYNSHOO'
    WHEN 'SPU004' THEN 'RABO'
    ELSE COALESCE(code_prefix, '')
  END,
  quote_product_codes_json = CASE id
    WHEN 'SPU001' THEN '["SCL-TK-001","SCL-ENV-001","SCL-STK-001"]'
    WHEN 'SPU002' THEN '["KITH-TPC10-KHWA080084"]'
    WHEN 'SPU003' THEN '["SYNSHOO-TPX18-SNWA090011"]'
    WHEN 'SPU004' THEN '["RABO-HT01","RABO-HT02"]'
    ELSE COALESCE(quote_product_codes_json, '[]')
  END;
