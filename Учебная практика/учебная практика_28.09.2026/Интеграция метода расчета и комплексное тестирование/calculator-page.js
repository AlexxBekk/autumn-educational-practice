import { showError } from '/dialogs.js';

const MAIN_PAGE_URL = '/';
const CALCULATION_FAILED = -1;
const DATABASE_ERROR = 'База данных недоступна. Проверьте подключение и повторите расчет через минуту.';
const INVALID_INPUT_ERROR = 'Расчет не выполнен. Проверьте данные: количество продукции должно быть целым числом больше нуля, параметры 1 и 2 неотрицательными числами с точкой вместо запятой, а типы продукции и материала должны быть выбраны из списка.';

const form = document.getElementById('calculator-form');
const resultLine = document.getElementById('calculation-result');
const calculateButton = document.getElementById('calculate-button');
const backButton = document.getElementById('back-button');

function fillTypeOptions(select, types) {
  select.replaceChildren(...types.map((type) => new Option(type.name, type.id)));
}

function toNumber(value) {
  const trimmed = value.trim();
  return trimmed === '' ? null : Number(trimmed);
}

function showResult(result) {
  resultLine.textContent = `Требуется материала: ${result} ед.`;
  resultLine.hidden = false;
}

async function loadReferenceTypes() {
  const response = await fetch('/api/reference-types');
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  const { productTypes, materialTypes } = await response.json();
  fillTypeOptions(form.elements.productTypeId, productTypes);
  fillTypeOptions(form.elements.materialTypeId, materialTypes);
}

async function calculate(event) {
  event.preventDefault();
  resultLine.hidden = true;
  calculateButton.disabled = true;
  try {
    const response = await fetch('/api/materials/calculation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productTypeId: toNumber(form.elements.productTypeId.value),
        materialTypeId: toNumber(form.elements.materialTypeId.value),
        quantity: toNumber(form.elements.quantity.value),
        param1: toNumber(form.elements.param1.value),
        param2: toNumber(form.elements.param2.value),
      }),
    });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const { result } = await response.json();
    // Ответ приходит с кодом 200 даже при ошибке т.к. по ТЗ метод сообщает о некорректных данных значением -1.
    if (result === CALCULATION_FAILED) {
      await showError(INVALID_INPUT_ERROR);
      return;
    }
    showResult(result);
  } catch (error) {
    console.error(error);
    await showError(DATABASE_ERROR);
  } finally {
    calculateButton.disabled = false;
  }
}

backButton.addEventListener('click', () => window.location.assign(MAIN_PAGE_URL));
form.addEventListener('submit', calculate);

try {
  await loadReferenceTypes();
} catch (error) {
  console.error(error);
  await showError(DATABASE_ERROR);
}
