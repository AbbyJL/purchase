CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_key TEXT NOT NULL,
  price INTEGER NOT NULL,
  stock INTEGER NOT NULL,
  status TEXT NOT NULL,
  image_url TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  product TEXT NOT NULL,
  status TEXT NOT NULL,
  total INTEGER NOT NULL,
  channel TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  client TEXT NOT NULL,
  status TEXT NOT NULL,
  amount INTEGER NOT NULL,
  deadline TEXT NOT NULL
);

INSERT OR IGNORE INTO products (id, name, category_key, price, stock, status) VALUES
  ('SPU001', '莫兰迪色系连衣裙', 'clothing', 199, 100, 'In stock'),
  ('SPU002', '浅紫简约T恤', 'clothing', 99, 200, 'In stock'),
  ('SPU003', '木纹文件收纳盒', 'office', 68, 74, 'Low stock'),
  ('SPU004', '桌面储物托盘', 'home', 58, 0, 'Out of stock');

INSERT OR IGNORE INTO orders (id, customer, product, status, total, channel) VALUES
  ('OR24001', '杭州轻岛贸易', '莫兰迪色系连衣裙', 'Paid', 1990, '线上'),
  ('OR24002', '星河商贸', '浅紫简约T恤', 'Packed', 1188, '门店'),
  ('OR24003', '北辰选品', '木纹文件收纳盒', 'Shipped', 1360, '批发'),
  ('OR24004', '云栖生活', '桌面储物托盘', 'Pending', 580, '线上');

INSERT OR IGNORE INTO contracts (id, title, client, status, amount, deadline) VALUES
  ('CT-001', '商品供货框架协议', '杭州轻岛贸易', 'Active', 186000, '2026-08-16'),
  ('CT-002', '年度采购合作合同', '星河商贸', 'Review', 390000, '2026-07-04'),
  ('CT-003', '渠道分销补充协议', '北辰选品', 'Draft', 126000, '2026-06-28'),
  ('CT-004', '企业服务续约合同', '云栖生活', 'Expired', 520000, '2026-04-10');
