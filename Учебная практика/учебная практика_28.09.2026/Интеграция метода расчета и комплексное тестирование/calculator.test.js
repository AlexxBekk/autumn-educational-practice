import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../Приложение/db.js';
import { createAppServer } from '../Приложение/server.js';

const LAMINATE = 1;
const PANELS = 1;

async function startServer() {
  const server = createAppServer(pool);
  await new Promise((resolve) => server.listen(0, resolve));
  return { server, baseUrl: `http://localhost:${server.address().port}` };
}

async function calculate(baseUrl, body) {
  const response = await fetch(`${baseUrl}/api/materials/calculation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  assert.equal(response.status, 200);
  const payload = await response.json();
  return payload.result;
}

after(async () => {
  await pool.end();
});

test('страница калькулятора и справочники отдаются сервером', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const page = await fetch(`${baseUrl}/calculator`);
    const types = await fetch(`${baseUrl}/api/reference-types`);
    const payload = await types.json();
    assert.match(await page.text(), /<title>CRM: Калькулятор расчета материалов<\/title>/);
    assert.ok(payload.productTypes.length > 0);
    assert.ok(payload.materialTypes.length > 0);
  } finally {
    server.close();
  }
});

test('корректные данные возвращают рассчитанное количество', async () => {
  const { server, baseUrl } = await startServer();
  try {
    const result = await calculate(baseUrl, { productTypeId: LAMINATE, materialTypeId: PANELS, quantity: 10, param1: 2, param2: 3 });
    assert.equal(result, 142);
  } finally {
    server.close();
  }
});

test('некорректные данные возвращают -1, а сервер продолжает работать', async () => {
  const { server, baseUrl } = await startServer();
  try {
    assert.equal(await calculate(baseUrl, { productTypeId: 999, materialTypeId: PANELS, quantity: 10, param1: 2, param2: 3 }), -1);
    assert.equal(await calculate(baseUrl, { productTypeId: LAMINATE, materialTypeId: PANELS, quantity: 10, param1: -2, param2: 3 }), -1);
    assert.equal(await calculate(baseUrl, { productTypeId: LAMINATE, materialTypeId: PANELS, quantity: 0, param1: 2, param2: 3 }), -1);
    assert.equal(await calculate(baseUrl, {}), -1);
    assert.equal(await calculate(baseUrl, { productTypeId: LAMINATE, materialTypeId: PANELS, quantity: '10', param1: 'два', param2: 3 }), -1);
    assert.equal((await fetch(`${baseUrl}/api/reference-types`)).status, 200);
  } finally {
    server.close();
  }
});
