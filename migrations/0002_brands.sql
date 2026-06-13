CREATE TABLE IF NOT EXISTS brands (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  customer TEXT NOT NULL,
  supplier TEXT NOT NULL,
  country TEXT NOT NULL,
  status TEXT NOT NULL,
  owner TEXT NOT NULL,
  notes TEXT NOT NULL
);

INSERT OR IGNORE INTO brands (id, name, code, customer, supplier, country, status, owner, notes) VALUES
  ('BR001', 'STONEY CLOVER LANE', 'SCL-001', 'GMS', 'Anly', 'US', 'Active', 'Jason', '贴纸 / 信封 / 纸卡'),
  ('BR002', 'SYNSHOO', 'SYN-2606', 'SYNSHOO LA INC', 'ZheJiang Factory', 'US', 'Active', 'Linda', '吊牌 / 商业发票'),
  ('BR003', 'GLOBAL ERP DEMO', 'GRP-1001', 'Sample Customer', 'Internal', 'CN', 'Inactive', 'Cheese', '用于测试品牌关联');
