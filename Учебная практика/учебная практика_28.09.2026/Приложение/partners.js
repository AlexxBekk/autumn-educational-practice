import { calculatePartnerDiscount } from './discount.js';

const PARTNERS_WITH_SALES_SQL = `
  SELECT
    p.partner_id,
    p.partner_type,
    p.company_name,
    p.inn,
    p.director_name,
    p.address,
    p.contact_email,
    p.phone,
    p.rating,
    COALESCE(SUM(d.quantity), 0) AS total_quantity
  FROM partners p
  LEFT JOIN deliveries d ON d.partner_id = p.partner_id`;

const GROUP_AND_ORDER_SQL = `
  GROUP BY p.partner_id
  ORDER BY p.company_name`;

const INSERT_PARTNER_SQL = `
  INSERT INTO partners (partner_type, company_name, inn, director_name, address, contact_email, phone, rating)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING partner_id`;

const UPDATE_PARTNER_SQL = `
  UPDATE partners
  SET partner_type = $1,
      company_name = $2,
      inn = $3,
      director_name = $4,
      address = $5,
      contact_email = $6,
      phone = $7,
      rating = $8
  WHERE partner_id = $9
  RETURNING partner_id`;

function toPartnerWithDiscount(row) {
  const totalQuantity = Number(row.total_quantity);
  return {
    partnerId: row.partner_id,
    partnerType: row.partner_type,
    companyName: row.company_name,
    inn: row.inn,
    directorName: row.director_name,
    address: row.address,
    email: row.contact_email,
    phone: row.phone,
    rating: row.rating,
    totalQuantity,
    discount: calculatePartnerDiscount(totalQuantity),
  };
}

function toSqlValues(partner) {
  return [
    partner.partnerType,
    partner.companyName,
    partner.inn,
    partner.directorName,
    partner.address,
    partner.email,
    partner.phone,
    partner.rating,
  ];
}

export async function listPartnersWithDiscount(db) {
  const { rows } = await db.query(`${PARTNERS_WITH_SALES_SQL} ${GROUP_AND_ORDER_SQL}`);
  return rows.map(toPartnerWithDiscount);
}

export async function getPartnerWithDiscount(db, partnerId) {
  const { rows } = await db.query(`${PARTNERS_WITH_SALES_SQL} WHERE p.partner_id = $1 ${GROUP_AND_ORDER_SQL}`, [partnerId]);
  return rows.length === 0 ? null : toPartnerWithDiscount(rows[0]);
}

export async function createPartner(db, partner) {
  const { rows } = await db.query(INSERT_PARTNER_SQL, toSqlValues(partner));
  return getPartnerWithDiscount(db, rows[0].partner_id);
}

export async function updatePartner(db, partnerId, partner) {
  const { rows } = await db.query(UPDATE_PARTNER_SQL, [...toSqlValues(partner), partnerId]);
  return rows.length === 0 ? null : getPartnerWithDiscount(db, partnerId);
}
