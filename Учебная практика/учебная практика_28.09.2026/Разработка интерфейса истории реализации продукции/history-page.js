import { showError } from '/dialogs.js';

const MAIN_PAGE_URL = '/';
const DATABASE_ERROR = 'База данных недоступна. Проверьте подключение и обновите страницу через минуту.';

const pageTitle = document.getElementById('page-title');
const historyStatus = document.getElementById('history-status');
const historyTable = document.getElementById('history-table');
const historyRows = document.getElementById('history-rows');
const rowTemplate = document.getElementById('history-row-template');
const backButton = document.getElementById('back-button');

// Главное окно передает выбранного партнера через строку запроса: /history?partnerId=3.
// С тем же partnerId возвращаемся назад, чтобы реестр подсветил этого партнера.
const partnerId = new URLSearchParams(window.location.search).get('partnerId');

function createHistoryRow(sale) {
  const row = rowTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector('[data-field="productName"]').textContent = sale.productName;
  row.querySelector('[data-field="quantity"]').textContent = sale.quantity;
  row.querySelector('[data-field="saleDate"]').textContent = sale.saleDate;
  return row;
}

function showStatus(message) {
  historyStatus.textContent = message;
  historyStatus.hidden = false;
}

async function requestJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return response.json();
}

async function loadHistory() {
  const [partner, history] = await Promise.all([
    requestJson(`/api/partners/${partnerId}`),
    requestJson(`/api/partners/${partnerId}/history`),
  ]);
  document.title = `CRM: История реализации продукции — ${partner.partnerType} ${partner.companyName}`;
  pageTitle.textContent = `История реализации продукции — ${partner.partnerType} ${partner.companyName}`;
  if (history.length === 0) {
    showStatus('У этого партнера пока нет отгрузок.');
    return;
  }
  historyRows.replaceChildren(...history.map(createHistoryRow));
  historyStatus.hidden = true;
  historyTable.hidden = false;
}

backButton.addEventListener('click', () => window.location.assign(`${MAIN_PAGE_URL}?partnerId=${partnerId}`));

try {
  await loadHistory();
} catch (error) {
  console.error(error);
  showStatus('Не удалось загрузить историю реализации.');
  await showError(DATABASE_ERROR);
}
