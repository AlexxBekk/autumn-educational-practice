import { PARTNER_TYPES } from '/validation.js';

const FORM_FIELDS = ['companyName', 'partnerType', 'inn', 'rating', 'address', 'directorName', 'phone', 'email'];

// Список типов приходит из общих правил валидации: сервер принимает только эти значения.
export function initPartnerTypeOptions(select) {
  const emptyOption = new Option('Не выбран', '');
  select.append(emptyOption);
  for (const partnerType of PARTNER_TYPES) {
    select.append(new Option(partnerType, partnerType));
  }
}

export function readForm(form) {
  const values = {};
  for (const field of FORM_FIELDS) {
    values[field] = form.elements[field].value;
  }
  return values;
}

export function fillForm(form, partner) {
  for (const field of FORM_FIELDS) {
    form.elements[field].value = partner[field] ?? '';
  }
}

export function getFormSnapshot(form) {
  return JSON.stringify(readForm(form));
}
