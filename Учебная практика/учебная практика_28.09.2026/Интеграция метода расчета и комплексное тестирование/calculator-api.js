import { readJsonBody, sendJson } from '../Приложение/api.js';
import { calculateMaterialRequirement } from '../Разработка ядра алгоритма расчета материалов/materials.js';

const PRODUCT_TYPES_SQL = 'SELECT product_type_id, type_name FROM product_types ORDER BY type_name';
const MATERIAL_TYPES_SQL = 'SELECT material_type_id, type_name FROM material_types ORDER BY type_name';

function toNumberOrNull(value) {
  return typeof value === 'number' ? value : null;
}

export async function handleCalculatorRequest(db, request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/reference-types') {
    const productTypes = await db.query(PRODUCT_TYPES_SQL);
    const materialTypes = await db.query(MATERIAL_TYPES_SQL);
    sendJson(response, 200, {
      productTypes: productTypes.rows.map((row) => ({ id: row.product_type_id, name: row.type_name })),
      materialTypes: materialTypes.rows.map((row) => ({ id: row.material_type_id, name: row.type_name })),
    });
    return;
  }
  if (request.method === 'POST' && pathname === '/api/materials/calculation') {
    const body = await readJsonBody(request);
    const result = await calculateMaterialRequirement(
      toNumberOrNull(body.productTypeId),
      toNumberOrNull(body.materialTypeId),
      toNumberOrNull(body.quantity),
      toNumberOrNull(body.param1),
      toNumberOrNull(body.param2),
    );
    sendJson(response, 200, { result });
    return;
  }
  sendJson(response, 404, { errors: ['Запрошенный адрес не найден.'] });
}
