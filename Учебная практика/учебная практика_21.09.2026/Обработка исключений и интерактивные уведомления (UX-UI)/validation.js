export const PARTNER_TYPES = ['ЗАО', 'ООО', 'ОАО', 'ПАО', 'ИП', 'ТК'];

const RATING_PATTERN = /^\d+$/;
const INN_PATTERN = /^\d{10}$|^\d{12}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimOrNull(value) {
  const trimmed = String(value ?? '').trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizePartner(input) {
  return {
    partnerType: trimOrNull(input.partnerType),
    companyName: trimOrNull(input.companyName),
    inn: trimOrNull(input.inn),
    directorName: trimOrNull(input.directorName),
    address: trimOrNull(input.address),
    email: trimOrNull(input.email),
    phone: trimOrNull(input.phone),
    rating: trimOrNull(input.rating),
  };
}

const MAX_LENGTHS = {
  companyName: { limit: 255, label: 'Наименование' },
  directorName: { limit: 255, label: 'ФИО директора' },
  address: { limit: 255, label: 'Адрес' },
  email: { limit: 255, label: 'Email' },
  phone: { limit: 20, label: 'Телефон' },
};

function checkLengths(partner) {
  const errors = [];
  for (const [field, { limit, label }] of Object.entries(MAX_LENGTHS)) {
    if (partner[field] !== null && partner[field].length > limit) {
      errors.push(`Поле «${label}» длиннее ${limit} символов. Сократите значение до ${limit} символов и повторите сохранение.`);
    }
  }
  return errors;
}

export class ValidationError extends Error {
  constructor(errors) {
    super(errors.join('\n'));
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

function collectErrors(partner) {
  const errors = checkLengths(partner);
  if (partner.companyName === null) {
    errors.push('Наименование партнера не заполнено. Введите название организации и повторите сохранение.');
  }
  if (partner.partnerType === null || !PARTNER_TYPES.includes(partner.partnerType)) {
    errors.push(`Тип партнера не выбран. Выберите значение из списка: ${PARTNER_TYPES.join(', ')}.`);
  }
  if (partner.inn === null || !INN_PATTERN.test(partner.inn)) {
    errors.push('ИНН должен состоять из 10 или 12 цифр без пробелов и дефисов. Проверьте номер и повторите попытку.');
  }
  if (partner.email === null) {
    errors.push('Email не заполнен. Укажите адрес в формате name@company.ru.');
  } else if (!EMAIL_PATTERN.test(partner.email)) {
    errors.push('Email указан неверно. Используйте формат name@company.ru, без пробелов и лишних символов.');
  }
  if (partner.rating !== null && !RATING_PATTERN.test(partner.rating)) {
    errors.push('Рейтинг должен быть целым числом от 0. Пожалуйста, удалите знаки препинания и повторите попытку.');
  }
  return errors;
}

export function assertValidPartner(partner) {
  const errors = collectErrors(partner);
  if (errors.length > 0) {
    throw new ValidationError(errors);
  }
}

export function toDatabasePartner(partner) {
  return { ...partner, rating: partner.rating === null ? null : Number(partner.rating) };
}
