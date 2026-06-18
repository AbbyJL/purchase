ALTER TABLE pis ADD COLUMN vendor TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN our_ref_no TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN delivery_date TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN deliver_to TEXT NOT NULL DEFAULT '';

UPDATE pis
SET
  pi_no = 'PI2603428',
  customer = 'KITH',
  brand = 'KITH',
  vendor = '浙江嘉兴市壹佳印刷有限公司',
  our_ref_no = 'S26060068',
  delivery_date = '2026-06-18',
  deliver_to = '',
  status = 'Generated',
  generated_at = '2026-06-11T00:00:00Z',
  generated_by = 'Jason',
  pdf_url = '',
  lines_json = '[{"productCode":"KITH-TPC10-KHWA080084","productName":"KITH Women''s 2025 Tear Away Standard Apparel CCL - 60mm x 20mm","quantity":0.24,"unitPrice":430}]',
  notes = '对应采购单：请跟AI和批版质量做货！'
WHERE id = 'PI001';
