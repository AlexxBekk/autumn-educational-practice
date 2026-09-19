import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../Интеграция с БД и агрегация данных (SQL + Backend)/db.js';
import { getPartnerWithDiscount, listPartnersWithDiscount } from '../Интеграция с БД и агрегация данных (SQL + Backend)/partners.js';
import { createAppServer } from './server.js';

const STRESS_REQUEST_COUNT = 200;

async function startServer(db) {
  const server = createAppServer(db);
  await new Promise((resolve) => server.listen(0, resolve));
  return { server, baseUrl: `http://localhost:${server.address().port}` };
}

after(async () => {
  await pool.end();
});

describe('partners without sales history', () => {
  test('get 0 units and 0% discount instead of NULL', async () => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO partners (company_name, inn) VALUES ('ИП Без Продаж', '000000000000') RETURNING partner_id`,
      );
      const partnerId = rows[0].partner_id;
      const partner = await getPartnerWithDiscount(client, partnerId);
      const listedPartner = (await listPartnersWithDiscount(client)).find((item) => item.partnerId === partnerId);
      assert.equal(partner.totalQuantity, 0);
      assert.equal(partner.discount, 0);
      assert.deepEqual(listedPartner, partner);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  });

  test('unknown partner returns null', async () => {
    assert.equal(await getPartnerWithDiscount(pool, -1), null);
  });
});

describe('HTTP server', () => {
  let server;
  let baseUrl;

  before(async () => {
    ({ server, baseUrl } = await startServer(pool));
  });

  after(() => {
    server.close();
  });

  test('serves the page with the required title, icon and logo', async () => {
    const response = await fetch(`${baseUrl}/`);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /<title>CRM: Список партнеров и скидок<\/title>/);
    assert.match(html, /resources\/icon\.svg/);
    assert.match(html, /resources\/logo\.svg/);
  });

  test('serves every static resource', async () => {
    for (const path of ['/styles.css', '/app.js', '/resources/logo.svg', '/resources/icon.svg']) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 200, path);
    }
  });

  test('returns partners with a computed discount', async () => {
    const response = await fetch(`${baseUrl}/api/partners`);
    const partners = await response.json();
    assert.equal(response.status, 200);
    assert.ok(partners.length > 0);
    for (const partner of partners) {
      assert.ok(Number.isInteger(partner.totalQuantity), partner.companyName);
      assert.ok([0, 5, 10, 15].includes(partner.discount), partner.companyName);
    }
  });

  test('rejects unknown paths, path traversal and other methods', async () => {
    assert.equal((await fetch(`${baseUrl}/missing`)).status, 404);
    assert.equal((await fetch(`${baseUrl}/..%2Fpackage.json`)).status, 404);
    assert.equal((await fetch(`${baseUrl}/api/partners`, { method: 'POST' })).status, 405);
  });

  test(`handles ${STRESS_REQUEST_COUNT} concurrent requests`, async () => {
    const requests = Array.from({ length: STRESS_REQUEST_COUNT }, () => fetch(`${baseUrl}/api/partners`));
    const responses = await Promise.all(requests);
    assert.ok(responses.every((response) => response.status === 200));
    await Promise.all(responses.map((response) => response.arrayBuffer()));
  });
});

describe('database failure', () => {
  test('returns 500 and keeps the server running', async (t) => {
    t.mock.method(console, 'error', () => {});
    const brokenDb = { query: () => Promise.reject(new Error('Database is unavailable')) };
    const { server, baseUrl } = await startServer(brokenDb);
    try {
      assert.equal((await fetch(`${baseUrl}/api/partners`)).status, 500);
      assert.equal((await fetch(`${baseUrl}/`)).status, 200);
    } finally {
      server.close();
    }
  });
});
