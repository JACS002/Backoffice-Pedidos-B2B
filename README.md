# Sistema de Pedidos B2B - Microservicios

Sistema completo de gestión de pedidos B2B compuesto por dos APIs REST (Customers y Orders) y un Lambda orquestador, utilizando MySQL como base de datos.

## 📋 Estructura del Proyecto

```
/
├── customers-api/          # API de gestión de clientes
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── config/
│   │   └── app.js
│   ├── Dockerfile
│   ├── openapi.yaml
│   └── package.json
├── orders-api/            # API de gestión de productos y órdenes
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── config/
│   │   └── app.js
│   ├── Dockerfile
│   ├── openapi.yaml
│   └── package.json
├── lambda-orchestrator/   # Orquestador serverless
│   ├── handler.js
│   ├── serverless.yml
│   └── package.json
├── db/
│   ├── schema.sql        # Esquema de base de datos
│   └── seed.sql          # Datos iniciales
├── docker-compose.yml
└── README.md

```

## 🚀 Inicio Rápido

### Prerrequisitos

- Docker y Docker Compose
- Node.js 20+ (para desarrollo local del Lambda)
- MySQL 8.0 (incluido en Docker Compose)

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd Node\ Backend
```

### 2. Configurar variables de entorno

**Para Docker Compose:**

Copia el archivo `.env.example` a `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

El archivo `.env` ya contiene los valores por defecto. Puedes modificarlos según tus necesidades.

**Para Lambda Orchestrator (desarrollo local):**

```env
PORT=3001
DB_HOST=db
DB_USER=root
DB_PASS=root
DB_NAME=challenges_db
SERVICE_TOKEN=token_secreto_interno_123
```

**Orders API:**

```env
PORT=3002
DB_HOST=db
DB_USER=root
DB_PASS=root
DB_NAME=challenges_db
SERVICE_TOKEN=token_secreto_interno_123
CUSTOMERS_API_URL=http://customers-api:3001
```

**Lambda Orchestrator:**

```env
CUSTOMERS_API_URL=http://localhost:3001
ORDERS_API_URL=http://localhost:3002
SERVICE_TOKEN=token_secreto_interno_123
```

### 3. Levantar servicios con Docker Compose

```bash
# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### 4. Verificar que los servicios están corriendo

```bash
# Customers API
curl http://localhost:3001/health

# Orders API
curl http://localhost:3002/health

# Ver documentación interactiva con Swagger UI
# Customers API: http://localhost:3001/api-docs
# Orders API: http://localhost:3002/api-docs
```

## 📡 APIs Disponibles

### Customers API (Puerto 3001)

**Endpoints públicos:**

- `POST /customers` - Crear cliente
- `GET /customers/:id` - Obtener cliente por ID
- `GET /customers?search=&cursor=&limit=` - Buscar clientes (paginación cursor)
- `PUT /customers/:id` - Actualizar cliente
- `DELETE /customers/:id` - Eliminar cliente

**Endpoints internos (requieren token):**

- `GET /internal/customers/:id` - Validación de cliente (usado por Orders API)

### Orders API (Puerto 3002)

**Productos:**

- `POST /products` - Crear producto
- `GET /products/:id` - Obtener producto
- `GET /products?search=&cursor=&limit=` - Buscar productos
- `PATCH /products/:id` - Actualizar precio/stock

**Órdenes:**

- `POST /orders` - Crear orden (valida cliente, verifica stock, descuenta en transacción)
- `GET /orders/:id` - Obtener orden con items
- `GET /orders?status=&from=&to=&cursor=&limit=` - Buscar órdenes con filtros
- `POST /orders/:id/confirm` - Confirmar orden (idempotente con X-Idempotency-Key)
- `POST /orders/:id/cancel` - Cancelar orden (restaura stock según reglas)

### Lambda Orchestrator (Puerto 3003 en local)

**Endpoint:**

- `POST /dev/orchestrator/create-and-confirm-order` - Orquesta creación y confirmación de pedidos

## 🧪 Ejemplos de uso con cURL

### 1. Crear un cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Perez",
    "email": "juan@test.com",
    "phone": "+5550000"
  }'
```

### 2. Crear un producto

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-004",
    "name": "Mouse Inalámbrico",
    "price_cents": 5000,
    "stock": 50
  }'
```

### 3. Crear una orden

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "qty": 2
      }
    ]
  }'
```

### 4. Confirmar orden (idempotente)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: confirm-order-1-abc123"
```

### 5. Usar el Lambda Orchestrator (creación + confirmación en un solo paso)

```bash
curl -X POST http://localhost:3003/dev/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 2,
        "qty": 3
      }
    ],
    "idempotency_key": "abc-123",
    "correlation_id": "req-789"
  }'
```

**Respuesta esperada (201):**

```json
{
  "success": true,
  "correlation_id": "req-789",
  "data": {
    "customer": {
      "id": 1,
      "name": "Empresa ACME",
      "email": "ops@acme.com",
      "phone": "+59399999999"
    },
    "order": {
      "id": 101,
      "status": "CONFIRMED",
      "total_cents": 459900,
      "items": [
        {
          "product_id": 2,
          "qty": 3,
          "unit_price_cents": 129900,
          "subtotal_cents": 389700
        }
      ]
    }
  }
}
```

## 🔧 Lambda Orchestrator - Desarrollo Local

### 1. Instalar dependencias

```bash
cd lambda-orchestrator
npm install
```

### 2. Ejecutar en modo local con Serverless Offline

```bash
npm run dev
```

El Lambda estará disponible en: `http://localhost:3003/dev/orchestrator/create-and-confirm-order`

### 3. Desplegar en AWS (opcional)

```bash
# Configurar credenciales AWS
aws configure

# Actualizar variables de entorno en serverless.yml con URLs públicas
# CUSTOMERS_API_URL: https://your-customers-api.com
# ORDERS_API_URL: https://your-orders-api.com

# Desplegar
npm run deploy
```

## 🗃️ Base de Datos

### Schema

Las tablas incluidas son:

- `customers` - Clientes con email único
- `products` - Productos con SKU único y control de stock
- `orders` - Órdenes con estados (CREATED, CONFIRMED, CANCELED)
- `order_items` - Items de cada orden con precios
- `idempotency_keys` - Control de idempotencia para evitar duplicados

### Datos de prueba

El archivo `seed.sql` incluye:

- 1 cliente de prueba (Empresa ACME)
- 3 productos de ejemplo

### Migraciones

Las migraciones se ejecutan automáticamente al iniciar el contenedor de MySQL gracias a Docker Compose que monta `/db` en `/docker-entrypoint-initdb.d`.

## 🔒 Autenticación

### Endpoints Internos

Los endpoints `/internal/*` requieren autenticación mediante token Bearer:

```bash
curl http://localhost:3001/internal/customers/1 \
  -H "Authorization: Bearer token_secreto_interno_123"
```

### Idempotencia

Los endpoints de confirmación y cancelación requieren el header `X-Idempotency-Key` para garantizar que operaciones duplicadas no causen efectos secundarios:

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "X-Idempotency-Key: unique-key-123"
```

Si se repite la misma petición con la misma key, se devolverá el mismo resultado sin volver a ejecutar la operación.

## 📊 Estados de las Órdenes

- **CREATED**: Orden creada, stock descontado
- **CONFIRMED**: Orden confirmada
- **CANCELED**: Orden cancelada, stock restaurado

### Reglas de Cancelación

- **CREATED**: Se puede cancelar siempre, restaura stock
- **CONFIRMED**: Se puede cancelar solo dentro de 10 minutos desde su creación, restaura stock
- Después de 10 minutos en CONFIRMED, no se puede cancelar

## 🧪 Testing

Para ejecutar las pruebas (si se implementan):

```bash
# En cada servicio
npm test
```

## 🧪 Testing

### Ejecutar tests

Cada API incluye tests unitarios y de integración con Jest.

**Customers API:**

```bash
cd customers-api
npm install
npm test
```

**Orders API:**

```bash
cd orders-api
npm install
npm test
```

### Ver cobertura de tests

```bash
npm test -- --coverage
```

### Tests en modo watch (desarrollo)

```bash
npm run test:watch
```

### Tests incluidos

**Customers API:**

- ✅ Health check
- ✅ CRUD completo de clientes
- ✅ Validaciones de datos
- ✅ Paginación
- ✅ Autenticación de endpoints internos

**Orders API:**

- ✅ CRUD de productos
- ✅ Creación de órdenes con validaciones
- ✅ Confirmación idempotente
- ✅ Cancelación con restauración de stock
- ✅ Búsqueda con filtros
- ✅ Validación de stock insuficiente

## 🔧 Scripts NPM Disponibles

**Customers API / Orders API:**

- `npm start` - Iniciar en producción
- `npm run dev` - Iniciar con nodemon (desarrollo)

**Lambda Orchestrator:**

- `npm run dev` - Ejecutar con serverless-offline
- `npm run deploy` - Desplegar a AWS

## 📖 Documentación OpenAPI

Cada API incluye su documentación OpenAPI 3.0:

- Customers API: `/customers-api/openapi.yaml`
- Orders API: `/orders-api/openapi.yaml`

### 🎨 Visualizar documentación interactiva

Ambas APIs incluyen **Swagger UI integrado** para probar los endpoints directamente desde el navegador:

**Customers API:**

```
http://localhost:3001/api-docs
```

**Orders API:**

```
http://localhost:3002/api-docs
```

Desde la interfaz de Swagger UI puedes:

- 📖 Ver toda la documentación de endpoints
- 🧪 Probar los endpoints directamente
- 📝 Ver ejemplos de request/response
- 🔍 Explorar los esquemas de datos

### Otras formas de visualizar

Puedes visualizarlas en [Swagger Editor](https://editor.swagger.io/) o importarlas en Postman/Insomnia.

## 🐳 Docker Compose

### Servicios incluidos:

1. **db** - MySQL 8.0 (puerto 3306)
2. **customers-api** - API de clientes (puerto 3001)
3. **orders-api** - API de órdenes (puerto 3002)

### Comandos útiles:

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f customers-api

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes (limpieza completa)
docker-compose down -v

# Reconstruir imágenes
docker-compose build --no-cache

# Reiniciar un servicio específico
docker-compose restart customers-api

# Acceder a MySQL
docker-compose exec db mysql -uroot -proot challenges_db

# Ver estado de los servicios
docker-compose ps
```

### Variables de entorno

Todas las configuraciones se gestionan desde el archivo `.env` en la raíz del proyecto:

```bash
# .env
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE=challenges_db
CUSTOMERS_API_PORT=3001
ORDERS_API_PORT=3002
MYSQL_PORT=3306
SERVICE_TOKEN=token_secreto_interno_123
```

Para cambiar configuraciones, edita el archivo `.env` y reinicia los servicios:

```bash
docker-compose down
docker-compose up -d
```

## 🏗️ Arquitectura

```
┌─────────────┐
│   Cliente   │
│ (Postman/   │
│  Insomnia)  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│     Lambda       │
│  Orchestrator    │◄── Serverless Framework
└────┬─────────┬───┘
     │         │
     ▼         ▼
┌─────────┐ ┌─────────┐
│Customers│ │ Orders  │
│   API   │ │   API   │
└────┬────┘ └────┬────┘
     │           │
     └─────┬─────┘
           ▼
      ┌─────────┐
      │  MySQL  │
      └─────────┘
```

## 📝 Características Técnicas

- ✅ **Node.js 20** con Express
- ✅ **Validación** con Zod
- ✅ **SQL parametrizado** para prevenir SQL injection
- ✅ **Transacciones** para operaciones críticas (stock)
- ✅ **Idempotencia** con X-Idempotency-Key
- ✅ **Paginación cursor-based** para escalabilidad
- ✅ **Autenticación** con Bearer tokens para endpoints internos
- ✅ **Docker Compose** para desarrollo local
- ✅ **Serverless Framework** para Lambda
- ✅ **OpenAPI 3.0** para documentación
- ✅ **Códigos HTTP apropiados** (200, 201, 400, 404, 409, 500)

## 🚨 Troubleshooting

### Los contenedores no inician

```bash
docker-compose down -v
docker-compose up -d
```

### Error de conexión a MySQL

Espera a que MySQL esté completamente iniciado:

```bash
docker-compose logs db
```

### Lambda no responde

Verifica que las APIs estén corriendo y accesibles desde el Lambda.

## 📄 Licencia

MIT

## 👥 Autor

Tu nombre aquí
