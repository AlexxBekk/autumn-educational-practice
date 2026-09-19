import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pool } from '../Интеграция с БД и агрегация данных (SQL + Backend)/db.js';
import { listPartnersWithDiscount } from '../Интеграция с БД и агрегация данных (SQL + Backend)/partners.js';

const UI_DIRECTORY = new URL('../Разработка интерфейса (UI) по руководству по стилю/', import.meta.url);

const STATIC_FILES = new Map([
  ['/', { location: new URL('index.html', UI_DIRECTORY), contentType: 'text/html; charset=utf-8' }],
  ['/styles.css', { location: new URL('styles.css', UI_DIRECTORY), contentType: 'text/css; charset=utf-8' }],
  ['/resources/logo.svg', { location: new URL('resources/logo.svg', UI_DIRECTORY), contentType: 'image/svg+xml' }],
  ['/resources/icon.svg', { location: new URL('resources/icon.svg', UI_DIRECTORY), contentType: 'image/svg+xml' }],
  ['/app.js', { location: new URL('app.js', import.meta.url), contentType: 'text/javascript; charset=utf-8' }],
]);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function handleRequest(db, request, response) {
  const { pathname } = new URL(request.url, 'http://localhost');
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }
  if (pathname === '/api/partners') {
    sendJson(response, 200, await listPartnersWithDiscount(db));
    return;
  }
  const staticFile = STATIC_FILES.get(pathname);
  if (staticFile === undefined) {
    sendJson(response, 404, { error: 'Not found' });
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
        sendJson(response, 500, { error: 'Internal server error' });
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
