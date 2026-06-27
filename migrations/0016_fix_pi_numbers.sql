UPDATE pis
SET
  pi_no = CASE
    WHEN pi_no LIKE 'PI%' THEN pi_no
    WHEN pi_no LIKE 'PO%' THEN 'PI' || substr(pi_no, 3)
    ELSE 'PI' || pi_no
  END,
  pl_no = CASE
    WHEN pl_no IS NOT NULL AND pl_no <> '' THEN pl_no
    WHEN pi_no LIKE 'PI%' THEN REPLACE(pi_no, 'PI', 'PL')
    WHEN pi_no LIKE 'PO%' THEN 'PL' || substr(pi_no, 3)
    ELSE 'PL' || pi_no
  END
WHERE pi_no NOT LIKE 'PI%' OR pl_no IS NULL OR pl_no = '';
