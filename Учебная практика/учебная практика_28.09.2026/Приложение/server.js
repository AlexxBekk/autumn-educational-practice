import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pool } from './db.js';
import { handleApiRequest, sendJson } from './api.js';
import { logError } from '../Модульное тестирование (Unit Testing) и аудит безопасности/logger.js';
import { handleCalculatorRequest } from '../Интеграция метода расчета и комплексное тестирование/calculator-api.js';

const APP_DIRECTORY = new URL('./', import.meta.url);
const HISTORY_DIRECTORY = new URL('../Разработка интерфейса истории реализации продукции/', import.meta.url);
const CALCULATOR_DIRECTORY = new URL('../Интеграция метода расчета и комплексное тестирование/', import.meta.url);

const HTML_TYPE = 'text/html; charset=utf-8';
const CSS_TYPE = 'text/css; charset=utf-8';
const SCRIPT_TYPE = 'text/javascript; charset=utf-8';
const SVG_TYPE = 'image/svg+xml';

const STATIC_FILES = new Map([
  ['/', { location: new URL('index.html', APP_DIRECTORY), contentType: HTML_TYPE }],
  ['/partner', { location: new URL('partner.html', APP_DIRECTORY), contentType: HTML_TYPE }],
  ['/history', { location: new URL('history.html', HISTORY_DIRECTORY), contentType: HTML_TYPE }],
  ['/calculator', { location: new URL('calculator.html', CALCULATOR_DIRECTORY), contentType: HTML_TYPE }],
  ['/styles.css', { location: new URL('styles.css', APP_DIRECTORY), contentType: CSS_TYPE }],
  ['/form.css', { location: new URL('form.css', APP_DIRECTORY), contentType: CSS_TYPE }],
  ['/dialogs.css', { location: new URL('dialogs.css', APP_DIRECTORY), contentType: CSS_TYPE }],
  ['/history.css', { location: new URL('history.css', HISTORY_DIRECTORY), contentType: CSS_TYPE }],
  ['/main-page.js', { location: new URL('main-page.js', APP_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/partner-form.js', { location: new URL('partner-form.js', APP_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/partner-page.js', { location: new URL('partner-page.js', APP_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/history-page.js', { location: new URL('history-page.js', HISTORY_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/calculator-page.js', { location: new URL('calculator-page.js', CALCULATOR_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/validation.js', { location: new URL('validation.js', APP_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/dialogs.js', { location: new URL('dialogs.js', APP_DIRECTORY), contentType: SCRIPT_TYPE }],
  ['/resources/logo.svg', { location: new URL('resources/logo.svg', APP_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/icon.svg', { location: new URL('resources/icon.svg', APP_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/dialog-error.svg', { location: new URL('resources/dialog-error.svg', APP_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/dialog-warning.svg', { location: new URL('resources/dialog-warning.svg', APP_DIRECTORY), contentType: SVG_TYPE }],
  ['/resources/dialog-info.svg', { location: new URL('resources/dialog-info.svg', APP_DIRECTORY), contentType: SVG_TYPE }],
]);

async function handleRequest(db, request, response) {
  const { pathname } = new URL(request.url, 'http://localhost');
  if (pathname === '/api/reference-types' || pathname.startsWith('/api/materials/')) {
    await handleCalculatorRequest(db, request, response, pathname);
    return;
  }
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
      logError(`Запрос ${request.method} ${request.url} завершился сбоем`, error);
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
