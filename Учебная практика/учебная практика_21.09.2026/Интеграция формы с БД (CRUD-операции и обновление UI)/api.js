import { createPartner, getPartnerWithDiscount, listPartnersWithDiscount, updatePartner } from './partners.js';
import { assertValidPartner, normalizePartner, toDatabasePartner, ValidationError } from '../Обработка исключений и интерактивные уведомления (UX-UI)/validation.js';

const PARTNER_ID_PATTERN = /^\/api\/partners\/(\d{1,9})$/;
const MAX_BODY_BYTES = 16 * 1024;
const UNIQUE_VIOLATION = '23505';

export function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_BODY_BYTES) {
        reject(new Error('Request body is too large'));
        request.destroy();
      }
    });
    request.on('end', () => resolve(body === '' ? {} : JSON.parse(body)));
    request.on('error', reject);
  });
}

async function savePartner(db, response, partnerId, body) {
  const partner = normalizePartner(body);
  try {
    assertValidPartner(partner);
    const saved = partnerId === null
      ? await createPartner(db, toDatabasePartner(partner))
      : await updatePartner(db, partnerId, toDatabasePartner(partner));
    if (saved === null) {
      sendJson(response, 404, { errors: ['Партнер не найден в базе данных. Обновите список и откройте карточку заново.'] });
      return;
    }
    sendJson(response, partnerId === null ? 201 : 200, saved);
  } catch (error) {
    if (error instanceof ValidationError) {
      sendJson(response, 400, { errors: error.errors });
      return;
    }
    if (error.code !== UNIQUE_VIOLATION) {
      throw error;
    }
    sendJson(response, 409, { errors: ['Партнер с таким ИНН или email уже есть в базе. Проверьте данные или откройте существующую карточку.'] });
  }
}

export async function handleApiRequest(db, request, response, pathname) {
  const partnerIdMatch = PARTNER_ID_PATTERN.exec(pathname);
  if (request.method === 'GET' && pathname === '/api/partners') {
    sendJson(response, 200, await listPartnersWithDiscount(db));
    return;
  }
  if (request.method === 'POST' && pathname === '/api/partners') {
    await savePartner(db, response, null, await readJsonBody(request));
    return;
  }
  if (partnerIdMatch !== null) {
    const partnerId = Number(partnerIdMatch[1]);
    if (request.method === 'GET') {
      const partner = await getPartnerWithDiscount(db, partnerId);
      sendJson(response, partner === null ? 404 : 200, partner ?? { errors: ['Партнер не найден в базе данных.'] });
      return;
    }
    if (request.method === 'PUT') {
      await savePartner(db, response, partnerId, await readJsonBody(request));
      return;
    }
  }
  sendJson(response, 404, { errors: ['Запрошенный адрес не найден.'] });
}
