import { appendFileSync } from 'node:fs';

const LOG_FILE = new URL('../app.log', import.meta.url);

// Ошибки подключения PostgreSQL присылает до того, как применится кодировка клиента,
// поэтому их текст подставляем сами, иначе в журнале окажутся нечитаемые символы.
const CONNECTION_REASONS = new Map([
  ['28P01', 'неверный пароль пользователя базы данных'],
  ['28000', 'пользователю отказано в доступе к базе данных'],
  ['3D000', 'база данных с таким именем не найдена'],
  ['ECONNREFUSED', 'сервер базы данных не отвечает'],
  ['ENOTFOUND', 'адрес сервера базы данных не найден'],
]);

export function logError(message, error) {
  const moment = new Date().toLocaleString('ru-RU');
  const reason = CONNECTION_REASONS.get(error.code) ?? error.message;
  const line = `${moment} ОШИБКА. ${message}. Причина: ${reason}\n`;
  console.error(line.trim());
  try {
    appendFileSync(LOG_FILE, line);
  } catch (writeError) {
    console.error(`Не удалось записать app.log: ${writeError.message}`);
  }
}
