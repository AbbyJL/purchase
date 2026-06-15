ALTER TABLE pis ADD COLUMN pl_no TEXT NOT NULL DEFAULT '';
ALTER TABLE pis ADD COLUMN order_qty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pis ADD COLUMN deducted_qty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pis ADD COLUMN outstanding_qty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pis ADD COLUMN in_stock_qty INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pis ADD COLUMN stock_out_qty INTEGER NOT NULL DEFAULT 0;

ALTER TABLE purchase_orders ADD COLUMN pl_no TEXT NOT NULL DEFAULT '';

UPDATE pis
SET
  pl_no = CASE
    WHEN pl_no = '' OR pl_no IS NULL THEN REPLACE(pi_no, 'PI', 'PL')
    ELSE pl_no
  END,
  order_qty = CASE
    WHEN order_qty = 0 THEN COALESCE((SELECT CAST(SUM(json_extract(value, '$.quantity')) AS INTEGER) FROM json_each(lines_json)), 0)
    ELSE order_qty
  END,
  deducted_qty = CASE WHEN deducted_qty = 0 THEN 0 ELSE deducted_qty END,
  outstanding_qty = CASE
    WHEN outstanding_qty = 0 THEN COALESCE(order_qty, 0)
    ELSE outstanding_qty
  END,
  in_stock_qty = CASE
    WHEN in_stock_qty = 0 THEN COALESCE(order_qty, 0)
    ELSE in_stock_qty
  END,
  stock_out_qty = CASE
    WHEN stock_out_qty = 0 THEN COALESCE(order_qty, 0)
    ELSE stock_out_qty
  END;

UPDATE purchase_orders
SET pl_no = CASE
  WHEN pl_no = '' OR pl_no IS NULL THEN REPLACE(po_no, 'PO', 'PL')
  ELSE pl_no
END;
