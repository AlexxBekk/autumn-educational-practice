# Решения по очистке данных

## import_partners.csv -> partners_clean.csv
- Убраны пробелы вокруг company_name.
- Исправлено экранирование внутренних кавычек под CSV-формат.
- Убрана пустая строка в конце файла.
- phone (партнёр 2) и rating (партнёр 3) путые ->  NULL.

## import_sales.txt - > deliveries_clean.csv
- sale_id=102: дата "15.03.2026" ->  "2026-03-15".
- sale_id=104: исключён т.к. partner_id=4 отсутствует в partners_clean.csv.
- product_name вынесен в products_clean.csv.
