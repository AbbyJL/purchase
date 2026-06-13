ALTER TABLE pis ADD COLUMN item_code TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN product_type TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN size TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN colors TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN finished TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN remarks TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN image_url TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN size_details_json TEXT NOT NULL DEFAULT '[]';

UPDATE pis
SET
  item_code = CASE WHEN id = 'PI001' THEN 'STELMAR-SL06' ELSE item_code END,
  description = CASE WHEN id = 'PI001' THEN '大机，平面' ELSE description END,
  product_type = CASE WHEN id = 'PI001' THEN '大机，平面' ELSE product_type END,
  size = CASE WHEN id = 'PI001' THEN '1.1x4cm' ELSE size END,
  colors = CASE WHEN id = 'PI001' THEN '黑机，黑底白色字' ELSE colors END,
  finished = CASE WHEN id = 'PI001' THEN '超切，对折' ELSE finished END,
  remarks = CASE WHEN id = 'PI001' THEN '14-36--19 1/2-48' ELSE remarks END,
  image_url = CASE WHEN id = 'PI001' THEN 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80' ELSE image_url END,
  size_details_json = CASE
    WHEN id = 'PI001' THEN '[{"size":"14-36","quantity":20000},{"size":"14 1/2 - 37","quantity":20000},{"size":"15-38","quantity":40000},{"size":"15 1/2 - 39","quantity":50000},{"size":"15 3/4 - 40","quantity":50000},{"size":"16-41","quantity":50000},{"size":"16 1/2 - 42","quantity":50000},{"size":"17-43","quantity":40000},{"size":"17 1/2 - 44","quantity":30000},{"size":"18-45","quantity":30000},{"size":"18 1/2 - 46","quantity":20000},{"size":"19-47","quantity":20000},{"size":"19 1/2 - 48","quantity":20000}]'
    ELSE size_details_json
  END;
