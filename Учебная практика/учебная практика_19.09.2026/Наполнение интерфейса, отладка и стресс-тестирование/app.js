const partnerList = document.getElementById('partner-list');
const partnerStatus = document.getElementById('partner-status');
const cardTemplate = document.getElementById('partner-card-template');

function formatRating(rating) {
  return rating === null ? 'нет' : rating.toLocaleString('ru-RU');
}

function createPartnerCard(partner) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  card.querySelector('.partner-card__name').textContent = partner.companyName;
  card.querySelector('[data-field="email"]').textContent = partner.email ?? 'Email не указан';
  card.querySelector('[data-field="phone"]').textContent = partner.phone ?? 'Телефон не указан';
  card.querySelector('[data-field="rating"]').textContent = `Рейтинг: ${formatRating(partner.rating)}`;
  card.querySelector('.partner-card__discount').textContent = `${partner.discount ?? 0}%`;
  return card;
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
      showStatus('Партнеры не найдены');
    } else {
      partnerStatus.hidden = true;
    }
  } catch (error) {
    console.error(error);
    showStatus('Не удалось загрузить список партнеров. Обновите страницу позже.');
  }
}

loadPartners();
