import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pool } from '../Интеграция формы с БД (CRUD-операции и обновление UI)/db.js';
import { handleApiRequest, sendJson } from '../Интеграция формы с БД (CRUD-операции и обновление UI)/api.js';

const NAVIGATION_DIRECTORY = new URL('./', import.meta.url);
const FORM_DIRECTORY = new URL('../Разработка формы добавления-редактирования партнера/', import.meta.url);
const CRUD_DIRECTORY = new URL('../Интеграция формы с БД (CRUD-операции и обновление UI)/', import.meta.url);
const DIALOGS_DIRECTORY = new URL('../Обработка исключений и интерактивные уведомления (UX-UI)/', import.meta.url);

const HTML_TYPE = 'text/html; charset=utf-8';
const CSS_TYPE = 'text/css; charset=utf-8';
const SCRIPT_TYPE = 'text/javascript; charset=utf-8';
const SVG_TYPE = 'image/svg+xml';

const STATIC_FILES = new Map([
  ['/', { location: new URL('index.html', NAVIGATION_DIRECTORY), contentType: HTML_TYPE }],
  ['/partner', { location: new URL('partner.html', FORM_DIRECTORY), contentType: HTML_TYPE }],
  ['/styles.css', { location: new URL('styles.css', NAVIGATION_DIRECTORY), contentType: CSS_TYPE }],
  ['/form.css', { location: new URL('form.css', FORM_DIRECTORY), contentType: CSS_TYPE }],
  ['/dialogs.css', { location: new URL('dialogs.css', DIALOGS_DIRECTORY), contentType: CSS_TYPE }],
  ['/main-page.js', { location: new URL('main-page.js', NAVIGATION_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/partner-form.js', { location: new URL('partner-form.js', FORM_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/partner-page.js', { location: new URL('partner-page.js', CRUD_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/validation.js', { location: new URL('validation.js', DIALOGS_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/dialogs.js', { location: new URL('dialogs.js', DIALOGS_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/resources/logo.svg', { location: new URL('resources/logo.svg', NAVIGATION_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/icon.svg', { location: new URL('resources/icon.svg', NAVIGATION_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/dialog-error.svg', { location: new URL('resources/dialog-error.svg', DIALOGS_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/dialog-warning.svg', { location: new URL('resources/dialog-warning.svg', DIALOGS_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/dialog-info.svg', { location: new URL('resources/dialog-info.svg', DIALOGS_DIRECTORY), contentType: SVG_TYPE }],
]);

async function handleRequest(db, request, response) {
  const { pathname } = new URL(request.url, 'http://localhost');
  if (pathname.startsWith('/api/')) {
    await handleApiRequest(db, request, response, pathname);
    return;
  }
  const staticFile = STATIC_FILES.get(pathname);
  if (staticFile === undefined || request.method !== 'GET') {
    sendJson(response, 404, { errors: ['Запрошенная страница не найдена.'] });
    return;
  }
  const content = await readFile(staticFile.location);
  response.writeHead(200, { 'Content-Type': staticFile.contentType });
  response.end(content);
}

export function createAppServer(db) {
  return createServer((request, response) => {
    handleRequest(db, request, response).catch((error) => {
      console.error(error);
      if (!response.headersSent) {
        sendJson(response, 500, { errors: ['Сервер не смог обработать запрос. Повторите попытку позже.'] });
      }
    });
  });
}

if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  createAppServer(pool).listen(port, () => {
    console.log(`CRM is running at http://localhost:${port}`);
  });
}
