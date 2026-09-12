```mermaid
erDiagram
    partners {
        int partner_id PK
        varchar company_name
        varchar inn UK
        varchar contact_email UK
        varchar phone
        decimal rating
    }

    products {
        int product_id PK
        varchar product_name UK
    }

    deliveries {
        int delivery_id PK
        int partner_id FK
        int product_id FK
        date delivery_date
        int quantity
        decimal total_amount
    }

    partners ||--o{ deliveries : "получает"
    products ||--o{ deliveries : "поставляется в"
```
