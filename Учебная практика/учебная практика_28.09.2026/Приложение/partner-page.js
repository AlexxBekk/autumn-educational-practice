import { fillForm, getFormSnapshot, initPartnerTypeOptions, readForm } from '/partner-form.js';
import { confirmDiscard, showError, showInfo } from '/dialogs.js';
import { assertValidPartner, normalizePartner, ValidationError } from '/validation.js';

const MAIN_PAGE_URL = '/';

// Реестр подсвечивает партнера, с которым работали, если вернуть ему partnerId.
function mainPageUrlFor(savedPartnerId) {
  return savedPartnerId === null ? MAIN_PAGE_URL : `${MAIN_PAGE_URL}?partnerId=${savedPartnerId}`;
}
const DATABASE_ERROR = 'База данных недоступна. Проверьте подключение и повторите сохранение через минуту.';

const form = document.getElementById('partner-form');
const pageTitle = document.getElementById('page-title');
const backButton = document.getElementById('back-button');
const saveButton = document.getElementById('save-button');

// Главное окно передает выбранного партнера через строку запроса: /partner?partnerId=3.
// Пустое значение означает режим добавления новой карточки.
const partnerId = new URLSearchParams(window.location.search).get('partnerId');

let savedSnapshot = '';

function setWindowTitle(mode) {
  document.title = `CRM: Карточка партнера [${mode}]`;
  pageTitle.textContent = `Карточка партнера [${mode}]`;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json();
  return { ok: response.ok, payload };
}

async function loadPartner() {
  const { ok, payload } = await requestJson(`/api/partners/${partnerId}`);
  if (!ok) {
    await showError(payload.errors.join('\n'));
    window.location.assign(MAIN_PAGE_URL);
    return;
  }
  fillForm(form, payload);
}

async function savePartner(event) {
  event.preventDefault();
  const partner = normalizePartner(readForm(form));
  saveButton.disabled = true;
  try {
    assertValidPartner(partner);
    const { ok, payload } = await requestJson(partnerId === null ? '/api/partners' : `/api/partners/${partnerId}`, {
      method: partnerId === null ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner),
    });
    if (!ok) {
      await showError(payload.errors.join('\n'));
      return;
    }
    savedSnapshot = getFormSnapshot(form);
    await showInfo(partnerId === null ? 'Партнер добавлен в базу данных.' : 'Изменения сохранены в базе данных.');
    window.location.assign(mainPageUrlFor(payload.partnerId));
  } catch (error) {
    if (error instanceof ValidationError) {
      await showError(error.message);
      return;
    }
    console.error(error);
    await showError(DATABASE_ERROR);
  } finally {
    saveButton.disabled = false;
  }
}

async function goBack() {
  if (getFormSnapshot(form) !== savedSnapshot) {
    const discard = await confirmDiscard('Введенные данные не сохранены. Если выйти сейчас, изменения будут потеряны без возможности восстановления.');
    if (!discard) {
      return;
    }
  }
  window.location.assign(mainPageUrlFor(partnerId));
}

async function initPage() {
  initPartnerTypeOptions(form.elements.partnerType);
  setWindowTitle(partnerId === null ? 'Добавление' : 'Редактирование');
  if (partnerId !== null) {
    await loadPartner();
  }
  savedSnapshot = getFormSnapshot(form);
  form.addEventListener('submit', savePartner);
  backButton.addEventListener('click', goBack);
}

try {
  await initPage();
} catch (error) {
  console.error(error);
  await showError(DATABASE_ERROR);
}
