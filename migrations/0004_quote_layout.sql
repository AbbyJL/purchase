ALTER TABLE quotes ADD COLUMN quote_no TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN date TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN modification_date TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN register TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN item_type TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN linkman TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN salesperson TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN item TEXT NOT NULL DEFAULT '';
ALTER TABLE quotes ADD COLUMN lines_json TEXT NOT NULL DEFAULT '[]';

UPDATE quotes
SET
  quote_no = '2606009',
  date = '2026-06-03',
  modification_date = '2026-06-03',
  register = '朱佳毅',
  item_type = 'STONEY CLOVER LANE 感恩卡、信封和贴纸',
  linkman = 'Anly',
  salesperson = 'Jason',
  item = '感恩卡 / 信封 / 贴纸',
  lines_json = '[{"checked":true,"imageUrl":"https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80","productCode":"SCL-TK-001","productName":"300克书纸 感恩卡","price":0,"sample":0,"description":"TYPE: 300克书纸（参考 APPA-T04）\\nSIZE: 6.25\" x 9\" Folded 6.25\" x 4.25\"\\nCOLOR: PMS 11-0104 TCX, PMS 18-5622 TCX, PMS 555C\\nFINISHED: 啤形，压折位线对折\\nREMARKS: 参考原版结构","pricingNotes":"1M:900/M\\n2.5M:720/M\\n5M:690/M","cost":"900/M"},{"checked":true,"imageUrl":"https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=800&q=80","productCode":"SCL-ENV-001","productName":"信封","price":0,"sample":0,"description":"TYPE: 180克书纸信封\\nSIZE: 6.5\" x 4.75\" + 3\" Flap\\nCOLOR: 双面印 PMS 7621C，双面过哑油\\nFINISHED: 啤形，做成信封袋，开口处粘2条双面胶\\nREMARKS: 包含贴纸加工","pricingNotes":"1M:1350/M\\n2.5M:1150/M\\n5M:1100/M","cost":"1350/M"},{"checked":false,"imageUrl":"https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80","productCode":"SCL-STK-001","productName":"贴纸","price":0,"sample":0,"description":"TYPE: 300克书纸贴纸\\nSIZE: 6.25\" x 9\" 适配折页\\nCOLOR: CMYK + PMS 11-0104 TCX\\nFINISHED: 四周圆角，局部镂空\\nREMARKS: 可按批版调整","pricingNotes":"1M:900/M\\n2.5M:720/M\\n5M:690/M","cost":"900/M"}]'
WHERE id = 'QU001';
