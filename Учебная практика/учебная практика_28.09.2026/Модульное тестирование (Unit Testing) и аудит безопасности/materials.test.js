import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../Приложение/db.js';
import { calculateMaterialRequirement } from '../Разработка ядра алгоритма расчета материалов/materials.js';

const LAMINATE = 1;
const PANELS = 1;
const CORK = 4;
const UNKNOWN_ID = 999;

after(async () => {
  await pool.end();
});

test('стандартный расчет дает известный результат', async () => {
  const result = await calculateMaterialRequirement(LAMINATE, PANELS, 10, 2, 3);
  assert.equal(result, 142);
});

test('дробный результат округляется в большую сторону', async () => {
  const result = await calculateMaterialRequirement(CORK, PANELS, 1, 1.1, 1.1);
  assert.equal(result, 2);
});

test('несуществующие типы продукции и материала дают -1', async () => {
  assert.equal(await calculateMaterialRequirement(UNKNOWN_ID, PANELS, 10, 2, 3), -1);
  assert.equal(await calculateMaterialRequirement(LAMINATE, UNKNOWN_ID, 10, 2, 3), -1);
});

test('отрицательные параметры продукции дают -1', async () => {
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, 10, -2, 3), -1);
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, 10, 2, -3), -1);
});

test('нулевой параметр продукции ошибкой не считается', async () => {
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, 10, 0, 3), 0);
});

test('нулевое и отрицательное количество дают -1', async () => {
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, 0, 2, 3), -1);
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, -5, 2, 3), -1);
});

test('дробное количество и нечисловые параметры дают -1', async () => {
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, 2.5, 2, 3), -1);
  assert.equal(await calculateMaterialRequirement(LAMINATE, PANELS, 10, '2', 3), -1);
});
