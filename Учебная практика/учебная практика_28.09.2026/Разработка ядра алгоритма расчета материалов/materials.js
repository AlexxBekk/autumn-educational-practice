import { pool } from '../Приложение/db.js';
import { logError } from '../Модульное тестирование (Unit Testing) и аудит безопасности/logger.js';

const PRODUCT_TYPE_SQL = 'SELECT coefficient FROM product_types WHERE product_type_id = $1';
const MATERIAL_TYPE_SQL = 'SELECT defect_percent FROM material_types WHERE material_type_id = $1';

const CALCULATION_FAILED = -1;

function isAllowedParameter(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export async function calculateMaterialRequirement(productTypeId, materialTypeId, quantity, param1, param2) {
  try {
    if (!Number.isInteger(productTypeId) || !Number.isInteger(materialTypeId)) {
      return CALCULATION_FAILED;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return CALCULATION_FAILED;
    }
    if (!isAllowedParameter(param1) || !isAllowedParameter(param2)) {
      return CALCULATION_FAILED;
    }
    const productType = await pool.query(PRODUCT_TYPE_SQL, [productTypeId]);
    const materialType = await pool.query(MATERIAL_TYPE_SQL, [materialTypeId]);
    if (productType.rows.length === 0 || materialType.rows.length === 0) {
      return CALCULATION_FAILED;
    }
    const coefficient = Number(productType.rows[0].coefficient);
    const defectPercent = Number(materialType.rows[0].defect_percent);
    const requirementPerUnit = param1 * param2 * coefficient;
    const netRequirement = requirementPerUnit * quantity;
    return Math.ceil(netRequirement * (1 + defectPercent / 100));
  } catch (error) {
    logError('Расчет материалов не выполнен', error);
    return CALCULATION_FAILED;
  }
}
