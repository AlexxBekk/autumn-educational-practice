import { showError } from '/dialogs.js';

const EDIT_PAGE_URL = '/partner';
const HISTORY_PAGE_URL = '/history';
const CALCULATOR_PAGE_URL = '/calculator';

const partnerList = document.getElementById('partner-list');
const partnerStatus = document.getElementById('partner-status');
const cardTemplate = document.getElementById('partner-card-template');
const addPartnerButton = document.getElementById('add-partner-button');
const calculatorButton = document.getElementById('calculator-button');

// Карточка и история возвращают менеджера на реестр со своим partnerId,
// чтобы подсветить партнера, с которым он работал, и не терять место в списке.
const lastVisitedPartnerId = new URLSearchParams(window.location.search).get('partnerId');

function openPage(url, partnerId) {
  window.location.assign(partnerId === null ? url : `${url}?partnerId=${partnerId}`);
}

function createPartnerCard(partner) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector('.partner-card__name').textContent = `${partner.partnerType} | ${partner.companyName}`;
  card.querySelector('[data-field="director"]').textContent = partner.directorName ?? 'Директор не указан';
  card.querySelector('[data-field="phone"]').textContent = partner.phone ?? 'Телефон не указан';
  card.querySelector('[data-field="rating"]').textContent = `Рейтинг: ${partner.rating ?? 'нет'}`;
  card.querySelector('.partner-card__discount').textContent = `${partner.discount ?? 0}%`;
  card.querySelector('.partner-card__open').addEventListener('click', () => openPage(EDIT_PAGE_URL, partner.partnerId));
  card.querySelector('.partner-card__history').addEventListener('click', () => openPage(HISTORY_PAGE_URL, partner.partnerId));
  if (String(partner.partnerId) === lastVisitedPartnerId) {
    card.classList.add('partner-card--selected');
  }
  return card;
}

function showStatus(message) {
  partnerStatus.textContent = message;
  partnerStatus.hidden = false;
}

function focusLastVisitedPartner() {
  const selectedCard = partnerList.querySelector('.partner-card--selected');
  if (selectedCard !== null) {
    selectedCard.scrollIntoView({ block: 'center' });
  }
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
      return;
    }
    partnerStatus.hidden = true;
    focusLastVisitedPartner();
  } catch (error) {
    console.error(error);
    showStatus('Не удалось загрузить список партнеров.');
    await showError('База данных недоступна. Проверьте подключение и обновите страницу через минуту.');
  }
}

addPartnerButton.addEventListener('click', () => openPage(EDIT_PAGE_URL, null));
calculatorButton.addEventListener('click', () => openPage(CALCULATOR_PAGE_URL, null));

await loadPartners();
