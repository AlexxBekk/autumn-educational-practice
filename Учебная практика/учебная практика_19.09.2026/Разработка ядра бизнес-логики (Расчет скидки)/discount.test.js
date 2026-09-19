import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculatePartnerDiscount } from './discount.js';

const BOUNDARY_CASES = [
  [0, 0],
  [9999, 0],
  [10000, 5],
  [49999, 5],
  [50000, 10],
  [299999, 10],
  [300000, 15],
  [1000000, 15],
];

const INVALID_INPUTS = [-1, 1.5, NaN, Infinity, null, undefined, '10000'];

for (const [totalQuantity, expectedPercent] of BOUNDARY_CASES) {
  test(`${totalQuantity} units -> ${expectedPercent}%`, () => {
    assert.equal(calculatePartnerDiscount(totalQuantity), expectedPercent);
  });
}

for (const input of INVALID_INPUTS) {
  test(`rejects ${typeof input} ${String(input)}`, () => {
    assert.throws(() => calculatePartnerDiscount(input), RangeError);
  });
}
