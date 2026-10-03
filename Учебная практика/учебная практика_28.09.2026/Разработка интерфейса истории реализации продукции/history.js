const PARTNER_HISTORY_SQL = `
  SELECT
    pr.product_name,
    d.quantity,
    to_char(d.delivery_date, 'DD.MM.YYYY') AS sale_date
  FROM deliveries d
  JOIN products pr ON pr.product_id = d.product_id
  WHERE d.partner_id = $1
  ORDER BY d.delivery_date DESC, d.delivery_id DESC`;

export async function listPartnerHistory(db, partnerId) {
  const { rows } = await db.query(PARTNER_HISTORY_SQL, [partnerId]);
  return rows.map((row) => ({
    productName: row.product_name,
    quantity: row.quantity,
    saleDate: row.sale_date,
  }));
}
