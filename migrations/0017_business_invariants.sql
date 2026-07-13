ALTER TABLE orders ADD COLUMN customer_order_no TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN quantity REAL NOT NULL DEFAULT 1;
ALTER TABLE orders ADD COLUMN unit_price REAL NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN currency TEXT NOT NULL DEFAULT 'CNY';

UPDATE orders
SET
  customer_order_no = CASE WHEN customer_order_no = '' THEN id ELSE customer_order_no END,
  quantity = CASE WHEN quantity <= 0 THEN 1 ELSE quantity END,
  unit_price = CASE WHEN unit_price = 0 THEN total / CASE WHEN quantity <= 0 THEN 1 ELSE quantity END ELSE unit_price END,
  currency = CASE WHEN currency IN ('CNY', 'USD') THEN currency ELSE 'CNY' END;

-- Historical demo data stored quantity in M but labelled downstream rows as PCS.
-- Normalize that one legacy record to the system-wide PCS unit while preserving its amount.
UPDATE pis
SET
  lines_json = json_set(
    lines_json,
    '$[0].quantity', 240,
    '$[0].unitPrice', 0.43,
    '$[0].purchaseUnitPrice', 0.43
  ),
  size_details_json = json_set(size_details_json, '$[0].size', '60mm x 20mm')
WHERE id = 'PI001' AND json_extract(lines_json, '$[0].quantity') = 0.24;

UPDATE purchase_orders
SET lines_json = json_set(
  lines_json,
  '$[0].quantity', 240,
  '$[0].unitPrice', 0.43
)
WHERE id = 'PO001' AND json_extract(lines_json, '$[0].quantity') = 0.24;

CREATE INDEX IF NOT EXISTS idx_orders_customer_order_no ON orders(customer_order_no);
CREATE INDEX IF NOT EXISTS idx_pis_pi_no ON pis(pi_no);
CREATE INDEX IF NOT EXISTS idx_pis_pl_no ON pis(pl_no);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_po_no ON purchase_orders(po_no);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_source_pi_id ON purchase_orders(source_pi_id);

CREATE TRIGGER IF NOT EXISTS orders_validate_insert
BEFORE INSERT ON orders
WHEN NEW.customer_order_no = '' OR NEW.quantity <= 0 OR NEW.unit_price < 0 OR NEW.currency NOT IN ('CNY', 'USD')
BEGIN
  SELECT RAISE(ABORT, 'invalid order quantities or currency');
END;

CREATE TRIGGER IF NOT EXISTS orders_validate_update
BEFORE UPDATE ON orders
WHEN NEW.customer_order_no = '' OR NEW.quantity <= 0 OR NEW.unit_price < 0 OR NEW.currency NOT IN ('CNY', 'USD')
BEGIN
  SELECT RAISE(ABORT, 'invalid order quantities or currency');
END;

CREATE TRIGGER IF NOT EXISTS pis_business_validate_insert
BEFORE INSERT ON pis
WHEN
  NEW.order_qty <= 0
  OR NEW.deducted_qty < 0
  OR NEW.deducted_qty > NEW.order_qty
  OR NEW.outstanding_qty <> NEW.order_qty - NEW.deducted_qty
  OR NEW.in_stock_qty < 0
  OR NEW.stock_out_qty < 0
  OR NEW.stock_out_qty > NEW.outstanding_qty
  OR NEW.stock_out_qty > NEW.in_stock_qty
  OR (NEW.stock_out_qty > 0 AND (NEW.pl_no = '' OR NEW.status = 'Draft'))
  OR (NEW.stock_out_qty = 0 AND NEW.pl_no <> '')
BEGIN
  SELECT RAISE(ABORT, 'invalid PI quantities or PL state');
END;

CREATE TRIGGER IF NOT EXISTS pis_business_validate_update
BEFORE UPDATE ON pis
WHEN
  NEW.order_qty <= 0
  OR NEW.deducted_qty < 0
  OR NEW.deducted_qty > NEW.order_qty
  OR NEW.outstanding_qty <> NEW.order_qty - NEW.deducted_qty
  OR NEW.in_stock_qty < 0
  OR NEW.stock_out_qty < 0
  OR NEW.stock_out_qty > NEW.outstanding_qty
  OR NEW.stock_out_qty > NEW.in_stock_qty
  OR (NEW.stock_out_qty > 0 AND (NEW.pl_no = '' OR NEW.status = 'Draft'))
  OR (NEW.stock_out_qty = 0 AND NEW.pl_no <> '')
BEGIN
  SELECT RAISE(ABORT, 'invalid PI quantities or PL state');
END;

CREATE TRIGGER IF NOT EXISTS pis_number_unique_insert
BEFORE INSERT ON pis
WHEN EXISTS (SELECT 1 FROM pis WHERE pi_no = NEW.pi_no)
BEGIN
  SELECT RAISE(ABORT, 'duplicate PI number');
END;

CREATE TRIGGER IF NOT EXISTS pis_number_unique_update
BEFORE UPDATE OF pi_no ON pis
WHEN EXISTS (SELECT 1 FROM pis WHERE pi_no = NEW.pi_no AND id <> OLD.id)
BEGIN
  SELECT RAISE(ABORT, 'duplicate PI number');
END;

CREATE TRIGGER IF NOT EXISTS pis_pl_unique_insert
BEFORE INSERT ON pis
WHEN NEW.pl_no <> '' AND EXISTS (SELECT 1 FROM pis WHERE pl_no = NEW.pl_no)
BEGIN
  SELECT RAISE(ABORT, 'duplicate PL number');
END;

CREATE TRIGGER IF NOT EXISTS pis_pl_unique_update
BEFORE UPDATE OF pl_no ON pis
WHEN NEW.pl_no <> '' AND EXISTS (SELECT 1 FROM pis WHERE pl_no = NEW.pl_no AND id <> OLD.id)
BEGIN
  SELECT RAISE(ABORT, 'duplicate PL number');
END;

CREATE TRIGGER IF NOT EXISTS purchase_orders_number_unique_insert
BEFORE INSERT ON purchase_orders
WHEN EXISTS (SELECT 1 FROM purchase_orders WHERE po_no = NEW.po_no)
BEGIN
  SELECT RAISE(ABORT, 'duplicate PO number');
END;

CREATE TRIGGER IF NOT EXISTS purchase_orders_number_unique_update
BEFORE UPDATE OF po_no ON purchase_orders
WHEN EXISTS (SELECT 1 FROM purchase_orders WHERE po_no = NEW.po_no AND id <> OLD.id)
BEGIN
  SELECT RAISE(ABORT, 'duplicate PO number');
END;

CREATE TRIGGER IF NOT EXISTS purchase_orders_source_validate_insert
BEFORE INSERT ON purchase_orders
WHEN NEW.po_type = 'purchase' AND (
  NEW.source_pi_id = ''
  OR NEW.pl_no = ''
  OR NOT EXISTS (
    SELECT 1 FROM pis
    WHERE id = NEW.source_pi_id AND pl_no = NEW.pl_no AND stock_out_qty > 0
  )
)
BEGIN
  SELECT RAISE(ABORT, 'purchase order must reference confirmed PI/PL');
END;

CREATE TRIGGER IF NOT EXISTS purchase_orders_source_validate_update
BEFORE UPDATE ON purchase_orders
WHEN NEW.po_type = 'purchase' AND (
  NEW.source_pi_id = ''
  OR NEW.pl_no = ''
  OR NOT EXISTS (
    SELECT 1 FROM pis
    WHERE id = NEW.source_pi_id AND pl_no = NEW.pl_no AND stock_out_qty > 0
  )
)
BEGIN
  SELECT RAISE(ABORT, 'purchase order must reference confirmed PI/PL');
END;
