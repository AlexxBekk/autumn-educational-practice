import { showError } from '/dialogs.js';

const EDIT_PAGE_URL = '/partner';

const partnerList = document.getElementById('partner-list');
const partnerStatus = document.getElementById('partner-status');
const cardTemplate = document.getElementById('partner-card-template');
const addPartnerButton = document.getElementById('add-partner-button');

function openPartnerCard(partnerId) {
  const url = partnerId === null ? EDIT_PAGE_URL : `${EDIT_PAGE_URL}?partnerId=${partnerId}`;
  window.location.assign(url);
}

function createPartnerCard(partner) {
  const item = cardTemplate.content.firstElementChild.cloneNode(true);
  const card = item.querySelector('.partner-card');
  card.querySelector('.partner-card__name').textContent = `${partner.partnerType} | ${partner.companyName}`;
  card.querySelector('[data-field="director"]').textContent = partner.directorName ?? 'Директор не указан';
  card.querySelector('[data-field="phone"]').textContent = partner.phone ?? 'Телефон не указан';
  card.querySelector('[data-field="rating"]').textContent = `Рейтинг: ${partner.rating ?? 'нет'}`;
  card.querySelector('.partner-card__discount').textContent = `${partner.discount ?? 0}%`;
  card.addEventListener('click', () => openPartnerCard(partner.partnerId));
  return item;
}

function showStatus(message) {
  partnerStatus.textContent = message;
  partnerStatus.hidden = false;
}

async function loadPartners() {
  try {
    const response = await fetch('/api/partners');
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const partners = await response.json();
    partnerList.replaceChildren(...partners.map(createPartnerCard));
    if (partners.length === 0) {
      showStatus('Партнеры не найдены. Добавьте первого партнера.');
    } else {
      partnerStatus.hidden = true;
    }
  } catch (error) {
    console.error(error);
    showStatus('Не удалось загрузить список партнеров.');
    await showError('База данных недоступна. Проверьте подключение и обновите страницу через минуту.');
  }
}

addPartnerButton.addEventListener('click', () => openPartnerCard(null));

await loadPartners();
