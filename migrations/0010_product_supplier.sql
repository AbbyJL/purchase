ALTER TABLE products ADD COLUMN supplier TEXT NOT NULL DEFAULT '';

UPDATE products
SET supplier = CASE id
  WHEN 'SPU001' THEN 'Anly'
  WHEN 'SPU002' THEN 'Anly'
  WHEN 'SPU003' THEN 'ZheJiang Factory'
  WHEN 'SPU004' THEN 'ZheJiang Factory'
  ELSE supplier
END;
