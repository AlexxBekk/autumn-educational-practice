\copy partners (partner_id, company_name, inn, contact_email, phone, rating) FROM 'cleanData/partners_clean.csv' WITH (FORMAT csv, HEADER true)

\copy products (product_id, product_name) FROM 'cleanData/products_clean.csv' WITH (FORMAT csv, HEADER true)

SELECT setval('partners_partner_id_seq', (SELECT MAX(partner_id) FROM partners));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));

DROP TABLE IF EXISTS deliveries_staging;
CREATE TEMP TABLE deliveries_staging (
    delivery_id    INTEGER,
    partner_id     INTEGER,
    product_name   VARCHAR(255),
    delivery_date  DATE,
    quantity       INTEGER,
    total_amount   DECIMAL(12,2)
);

\copy deliveries_staging (delivery_id, partner_id, product_name, delivery_date, quantity, total_amount) FROM 'cleanData/deliveries_clean.csv' WITH (FORMAT csv, HEADER true)

INSERT INTO deliveries (delivery_id, partner_id, product_id, delivery_date, quantity, total_amount)
SELECT s.delivery_id, s.partner_id, p.product_id, s.delivery_date, s.quantity, s.total_amount
FROM deliveries_staging s
JOIN products p ON p.product_name = s.product_name;

DROP TABLE deliveries_staging;

SELECT 'partners' AS table_name, COUNT(*) FROM partners
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'deliveries', COUNT(*) FROM deliveries;
