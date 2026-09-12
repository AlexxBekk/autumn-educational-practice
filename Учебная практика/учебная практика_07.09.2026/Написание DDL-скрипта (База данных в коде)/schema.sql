DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS partners;

CREATE TABLE partners (
    partner_id     SERIAL PRIMARY KEY,
    company_name   VARCHAR(255) NOT NULL,
    inn            VARCHAR(12)  NOT NULL UNIQUE,
    contact_email  VARCHAR(255) UNIQUE,
    phone          VARCHAR(20),
    rating         DECIMAL(2,1)
);

CREATE TABLE products (
    product_id     SERIAL PRIMARY KEY,
    product_name   VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE deliveries (
    delivery_id    INTEGER PRIMARY KEY,
    partner_id     INTEGER NOT NULL REFERENCES partners(partner_id) ON DELETE RESTRICT,
    product_id     INTEGER NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    delivery_date  DATE NOT NULL,
    quantity       INTEGER NOT NULL,
    total_amount   DECIMAL(12,2) NOT NULL
);
