CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  country TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  country TEXT NOT NULL,
  contact TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  customer TEXT NOT NULL,
  product_code TEXT NOT NULL,
  product_name TEXT NOT NULL,
  status TEXT NOT NULL,
  cost_items_json TEXT NOT NULL,
  tiers_json TEXT NOT NULL,
  image_url TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pis (
  id TEXT PRIMARY KEY,
  pi_no TEXT NOT NULL,
  customer TEXT NOT NULL,
  brand TEXT NOT NULL,
  status TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  generated_by TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  lines_json TEXT NOT NULL,
  notes TEXT NOT NULL
);

INSERT OR IGNORE INTO customers (id, name, code, country, contact, phone, email, address, status, notes) VALUES
  ('CU001', 'GMS', 'GMS-001', 'US', 'Amy', '+1-202-555-0142', 'amy@gms.com', 'New York, US', 'Active', '品牌客户'),
  ('CU002', 'SYNSHOO LA INC', 'SYNSHOO-001', 'US', 'Jason', '+1-310-555-0198', 'jason@synshoo.com', 'Los Angeles, US', 'Active', '形式发票客户');

INSERT OR IGNORE INTO suppliers (id, name, code, country, contact, phone, email, address, status, notes) VALUES
  ('SU001', 'Anly', 'SUP-ANLY', 'CN', 'Linda', '86-021-5555', 'linda@anly.cn', 'Shanghai, CN', 'Active', '印刷与加工'),
  ('SU002', 'ZheJiang Factory', 'SUP-ZJ', 'CN', 'Mr. Wang', '86-0571-5555', 'wang@zjfactory.cn', 'Zhejiang, CN', 'Active', '样品生产');

INSERT OR IGNORE INTO quotes (id, brand, customer, product_code, product_name, status, cost_items_json, tiers_json, image_url, notes) VALUES
  ('QU001', 'STONEY CLOVER LANE', 'GMS', 'SCL-001', '印刷贴纸', 'Approved', '[{"label":"纸","amount":0.18},{"label":"印刷","amount":0.12},{"label":"哑油","amount":0.04},{"label":"工艺","amount":0.07}]', '[{"quantity":"1M","unitPrice":0.52},{"quantity":"2.5M","unitPrice":0.41},{"quantity":"5M","unitPrice":0.33}]', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80', '按订单量自动匹配档位');

INSERT OR IGNORE INTO pis (id, pi_no, customer, brand, status, generated_at, generated_by, pdf_url, lines_json, notes) VALUES
  ('PI001', '26060093', 'SYNSHOO LA INC', 'SYNSHOO', 'Generated', '2026-06-09T08:00:00Z', 'Jason', '', '[{"productCode":"SYN-2606","productName":"吊牌","quantity":15000,"unitPrice":0.52},{"productCode":"SYN-2607","productName":"包装卡","quantity":7500,"unitPrice":0.38}]', '一个 PI 可包含多个产品代码');
