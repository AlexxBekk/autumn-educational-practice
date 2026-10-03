import pg from 'pg';

// Соединение переключил на UTF8, иначе на windows PostgreSQL отдает текст ошибок
// в кодировке windows-1251 и в app.log попадают нечитаемые символы.
export const pool = new pg.Pool({ client_encoding: 'UTF8' });
