import { calculatePartnerDiscount } from '../Разработка ядра бизнес-логики (Расчет скидки)/discount.js';

const PARTNERS_WITH_SALES_SQL = `
  SELECT
    p.partner_id,
    p.company_name,
    p.contact_email,
    p.phone,
    p.rating,
    COALESCE(SUM(d.quantity), 0)::integer AS total_quantity
  FROM partners p
  LEFT JOIN deliveries d ON d.partner_id = p.partner_id`;

const GROUP_AND_ORDER_SQL = `
  GROUP BY p.partner_id
  ORDER BY p.company_name`;

function toPartnerWithDiscount(row) {
  return {
    partnerId: row.partner_id,
    companyName: row.company_name,
    email: row.contact_email,
    phone: row.phone,
    rating: row.rating === null ? null : Number(row.rating),
    totalQuantity: row.total_quantity,
    discount: calculatePartnerDiscount(row.total_quantity),
  };
}

export async function getPartnerWithDiscount(db, partnerId) {
  const { rows } = await db.query(`${PARTNERS_WITH_SALES_SQL} WHERE p.partner_id = $1 ${GROUP_AND_ORDER_SQL}`, [partnerId]);
  return rows.length === 0 ? null : toPartnerWithDiscount(rows[0]);
}

export async function listPartnersWithDiscount(db) {
  const { rows } = await db.query(`${PARTNERS_WITH_SALES_SQL} ${GROUP_AND_ORDER_SQL}`);
  return rows.map(toPartnerWithDiscount);
}
