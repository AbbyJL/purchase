ALTER TABLE products ADD COLUMN suppliers_json TEXT NOT NULL DEFAULT '[]';

UPDATE products
SET suppliers_json = CASE
  WHEN TRIM(supplier) <> '' THEN json_array(supplier)
  ELSE '[]'
END;
