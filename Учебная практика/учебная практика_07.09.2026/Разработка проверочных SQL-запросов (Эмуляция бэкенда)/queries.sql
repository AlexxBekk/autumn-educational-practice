SELECT
    p.partner_id,
    p.company_name,
    COUNT(d.delivery_id) AS deliveries_count
FROM partners p
LEFT JOIN deliveries d ON d.partner_id = p.partner_id
GROUP BY p.partner_id, p.company_name
ORDER BY p.company_name;


BEGIN;

INSERT INTO partners (company_name, inn, contact_email, phone, rating)
VALUES ('ООО "Новый Партнёр"', '7799999999', 'new_partner@example.com', '+79990001122', NULL)
ON CONFLICT (inn) DO UPDATE SET
    company_name  = EXCLUDED.company_name,
    contact_email = EXCLUDED.contact_email,
    phone         = EXCLUDED.phone
RETURNING partner_id;

INSERT INTO deliveries (partner_id, product_id, delivery_date, quantity, total_amount)
VALUES (
    (SELECT partner_id FROM partners WHERE inn = '7799999999'),
    1,
    CURRENT_DATE,
    5,
    2500.00
);

COMMIT;


SELECT
    d.delivery_id,
    pr.product_name,
    d.delivery_date,
    d.quantity,
    d.total_amount
FROM deliveries d
JOIN products pr ON pr.product_id = d.product_id
WHERE d.partner_id = 1
  AND d.delivery_date BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY d.delivery_date;
