-- 0013: Add po_type and craft process fields to purchase_orders
-- Support two PO types: 'purchase' (standard) and 'craft' (production/craft sheet)

ALTER TABLE purchase_orders ADD COLUMN po_type TEXT NOT NULL DEFAULT 'purchase';
ALTER TABLE purchase_orders ADD COLUMN order_no TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN maker TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN make_date TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN style_no TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN customer_order_no TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN craft_product_name TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN related_order_no TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN sheet_size TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN material_in TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN up_count TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN remainder INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN finished_qty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE purchase_orders ADD COLUMN pack_count TEXT NOT NULL DEFAULT '';
ALTER TABLE purchase_orders ADD COLUMN print_method TEXT NOT NULL DEFAULT '[]';
ALTER TABLE purchase_orders ADD COLUMN proof_type TEXT NOT NULL DEFAULT '[]';
ALTER TABLE purchase_orders ADD COLUMN post_process TEXT NOT NULL DEFAULT '[]';
ALTER TABLE purchase_orders ADD COLUMN craft_notes TEXT NOT NULL DEFAULT '';

-- Update existing records to 'purchase' type
UPDATE purchase_orders SET po_type = 'purchase' WHERE po_type = '' OR po_type IS NULL;

-- Seed a sample craft process sheet
INSERT OR IGNORE INTO purchase_orders (
  id,
  po_type,
  po_no,
  source_pi_id,
  date,
  order_no,
  status,
  maker,
  make_date,
  style_no,
  customer_order_no,
  craft_product_name,
  related_order_no,
  customer,
  delivery_date,
  vendor,
  sheet_size,
  material_in,
  up_count,
  quantity,
  remainder,
  finished_qty,
  pack_count,
  print_method,
  proof_type,
  post_process,
  craft_notes,
  notes,
  lines_json,
  packing_rows_json
) VALUES (
  'CRFT001',
  'craft',
  'CRFT260605006',
  '',
  '2026-06-05',
  '260605006',
  'Draft',
  'FC007',
  '2026-06-05',
  'SKI DEV 挂牌',
  '',
  '250g双铜 标规',
  '26006882',
  '022',
  '0000-00-00',
  '嘉兴市壹佳印刷有限公司',
  '230 * 325',
  '35',
  '9',
  315,
  200,
  115,
  '',
  '[]',
  '["CTP版"]',
  '["印刷","贴膜","对裱","模切","上UV"]',
  '单面四色印 覆哑膜 轻刀裱 logo上UV',
  '工艺单示例数据',
  '[]',
  '[]'
);
