<div align="center">

# 🚀 Backoffice de Pedidos B2B

### Sistema de Microservicios con Arquitectura RESTful

[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

[![Serverless](https://img.shields.io/badge/Serverless-Framework-FD5750?style=for-the-badge&logo=serverless&logoColor=white)](https://www.serverless.com/)
[![Jest](https://img.shields.io/badge/Jest-Testing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-6BA539?style=for-the-badge&logo=openapiinitiative&logoColor=white)](https://www.openapis.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

[Documentación API](#-documentación-api) • [Instalación](#-instalación) • [Endpoints](#-endpoints) • [Tests](#-tests)

</div>

---

## 📑 Tabla de Contenidos

- [📋 Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
- [🛠️ Tecnologías](#️-tecnologías)
- [📦 Requisitos Previos](#-requisitos-previos)
- [🚀 Instalación](#-instalación)
- [🐳 Ejecución con Docker](#-ejecución-con-docker)
- [⚡ Ejecución Local (Lambda Orchestrator)](#-ejecución-local-lambda-orchestrator)
- [📚 Documentación API](#-documentación-api)
- [🔌 Endpoints](#-endpoints)
  - [Customers API](#customers-api-puerto-3001)
  - [Orders API](#orders-api-puerto-3002)
  - [Lambda Orchestrator](#lambda-orchestrator-puerto-3003)
- [🧪 Tests](#-tests)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔐 Seguridad](#-seguridad)
- [🎯 Características Implementadas](#-características-implementadas)
- [🐛 Troubleshooting](#-troubleshooting)
- [📝 Notas Importantes](#-notas-importantes)
- [🤝 Contribuir](#-contribuir)
- [📄 Licencia](#-licencia)

---

## 📋 Descripción

Este proyecto implementa un sistema completo de e-commerce utilizando microservicios independientes:

- **Customers API**: Gestión de clientes con endpoint interno protegido
- **Orders API**: Gestión de productos y órdenes con control de stock transaccional
- **Lambda Orchestrator**: Orquestador serverless para flujos complejos

## 🏗️ Arquitectura

```
┌─────────────────────┐
│  Lambda Orchestrator│ (Puerto 3003)
│   Serverless HTTP   │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    ▼             ▼
┌─────────┐   ┌─────────┐
│Customers│   │ Orders  │
│   API   │◄──┤   API   │
│  :3001  │   │  :3002  │
└────┬────┘   └────┬────┘
     │             │
     └─────┬───────┘
           ▼
    ┌────────────┐
    │   MySQL    │
    │  :3306     │
    └────────────┘
```

## 🛠️ Tecnologías

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MySQL 8.0
- **Serverless**: Serverless Framework + Offline Plugin
- **Testing**: Jest + Supertest
- **Validación**: Zod
- **Documentación**: OpenAPI 3.0 + Swagger UI
- **Containerización**: Docker + Docker Compose

## 📦 Requisitos Previos

- Node.js >= 18.x
- Docker & Docker Compose
- npm o yarn

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/JACS002/Backoffice-Pedidos-B2B
```

### 2. Instalar dependencias

```bash
# Lambda Orchestrator
cd ../lambda-orchestrator
npm install
```

### 3. Configurar variables de entorno

El proyecto usa Docker con variables predefinidas. Para desarrollo local, las variables por defecto funcionan correctamente.

## 🐳 Ejecución con Docker

### Iniciar todos los servicios

```bash
docker-compose up -d
```

Esto iniciará:

- MySQL (puerto 3306)
- Customers API (puerto 3001)
- Orders API (puerto 3002)

### Verificar estado de los contenedores

```bash
docker ps
```

### Crear las tablas (Migraciones)

```bash
cd customers-api
npm run migrate
```

### Insertar datos de prueba (Seeds)

```bash
npm run seed
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Servicio específico
docker-compose logs -f customers-api
docker-compose logs -f orders-api
```

### Detener servicios

```bash
docker-compose down
```

## ⚡ Ejecución Local (Lambda Orchestrator)

El Lambda Orchestrator se ejecuta fuera de Docker usando Serverless Offline:

```bash
cd lambda-orchestrator
npm run dev
```

Esto iniciará el servidor en `http://localhost:3003`

## 📚 Documentación API

Cada servicio tiene su documentación interactiva con Swagger UI:

- **Customers API**: http://localhost:3001/api-docs
- **Orders API**: http://localhost:3002/api-docs

## 🔌 Endpoints

### Customers API (Puerto 3001)

#### Públicos

**POST /customers** - Crear cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa ACME",
    "email": "ops@acme.com",
    "phone": "+59399999999"
  }'
```

**GET /customers/:id** - Obtener cliente por ID

```bash
curl http://localhost:3001/customers/1
```

**GET /customers?search=&cursor=&limit=** - Buscar clientes con paginación

```bash
# Buscar por nombre
curl "http://localhost:3001/customers?search=ACME&limit=10"

# Con cursor para paginación
curl "http://localhost:3001/customers?cursor=5&limit=10"
```

**PUT /customers/:id** - Actualizar cliente

```bash
curl -X PUT http://localhost:3001/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa ACME Actualizada",
    "phone": "+59398888888"
  }'
```

**DELETE /customers/:id** - Eliminar cliente

```bash
curl -X DELETE http://localhost:3001/customers/1
```

#### Internos (Requiere `Authorization: Bearer SERVICE_TOKEN`)

**GET /internal/customers/:id** - Validar cliente para servicios internos

```bash
curl http://localhost:3001/internal/customers/1 \
  -H "Authorization: Bearer token_secreto_interno_123"
```

### Orders API (Puerto 3002)

#### Productos

**POST /products** - Crear producto

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "PROD-001",
    "name": "Laptop Developer",
    "price_cents": 150000,
    "stock": 10
  }'
```

**GET /products/:id** - Obtener producto

```bash
curl http://localhost:3002/products/1
```

**PATCH /products/:id** - Actualizar precio/stock

```bash
curl -X PATCH http://localhost:3002/products/1 \
  -H "Content-Type: application/json" \
  -d '{
    "price_cents": 160000,
    "stock": 15
  }'
```

**GET /products?search=&cursor=&limit=** - Buscar productos

```bash
# Buscar por nombre o SKU
curl "http://localhost:3002/products?search=Laptop&limit=10"

# Con paginación
curl "http://localhost:3002/products?cursor=5&limit=10"
```

#### Órdenes

**POST /orders** - Crear orden (valida cliente y descuenta stock)

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

**GET /orders/:id** - Obtener orden con items

```bash
curl http://localhost:3002/orders/1
```

**GET /orders?status=&from=&to=&cursor=&limit=** - Listar órdenes con filtros

```bash
# Filtrar por estado
curl "http://localhost:3002/orders?status=CREATED&limit=10"

# Filtrar por rango de fechas
curl "http://localhost:3002/orders?from=2026-01-01&to=2026-12-31&limit=10"

# Combinar filtros
curl "http://localhost:3002/orders?status=CONFIRMED&cursor=5&limit=10"
```

**POST /orders/:id/confirm** - Confirmar orden (idempotente con `X-Idempotency-Key`)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "X-Idempotency-Key: unique-key-123"
```

**POST /orders/:id/cancel** - Cancelar orden y restaurar stock

```bash
curl -X POST http://localhost:3002/orders/1/cancel
```

### Lambda Orchestrator (Puerto 3003)

**POST /dev/orchestrator/create-and-confirm-order** - Crear y confirmar orden completa

Flujo completo: valida cliente → crea orden → confirma orden → respuesta consolidada

**Request:**

```json
{
  "customer_id": 1,
  "items": [
    {
      "product_id": 2,
      "qty": 3
    }
  ],
  "idempotency_key": "abc-123",
  "correlation_id": "req-789"
}
```

**Ejemplo con cURL:**

```bash
curl -X POST http://localhost:3003/dev/orchestrator/create-and-confirm-order \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [{"product_id": 2, "qty": 3}],
    "idempotency_key": "abc-123",
    "correlation_id": "req-789"
  }'
```

**Response (201):**

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
      "total_cents": 120000,
      "items": [
        {
          "product_id": 2,
          "qty": 3,
          "unit_price_cents": 40000,
          "subtotal_cents": 120000
        }
      ]
    }
  }
}
```

## 🧪 Tests

Cada servicio tiene su suite de tests con Jest:

### Ejecutar tests

```bash
# Customers API
cd customers-api
npm test

# Orders API
cd orders-api
npm test
```

### Cobertura de tests

- **Customers API**: 11 tests - Cobertura: 82.69%
- **Orders API**: 13 tests - Cobertura: 81.06%

### Tests incluidos

**Customers API:**

- ✅ Health check
- ✅ CRUD completo de clientes
- ✅ Búsqueda con paginación
- ✅ Endpoint interno con autenticación
- ✅ Validación de datos con Zod

**Orders API:**

- ✅ Health check
- ✅ CRUD de productos
- ✅ Creación de órdenes con validación de cliente
- ✅ Control de stock transaccional
- ✅ Confirmación idempotente
- ✅ Cancelación con restauración de stock
- ✅ Filtros y paginación

## 📁 Estructura del Proyecto

```
Node Backend/
├── customers-api/
│   ├── src/
│   │   ├── app.js              # Aplicación Express
│   │   ├── config/
│   │   │   └── db.js           # Configuración MySQL
│   │   ├── controllers/
│   │   │   └── customer.controller.js
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js
│   │   ├── models/
│   │   │   └── customer.model.js
│   │   └── routes/
│   │       └── customer.routes.js
│   ├── tests/
│   │   ├── setup.js
│   │   └── customers.test.js
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── openapi.yaml
│   ├── Dockerfile
│   └── package.json
│
├── orders-api/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── order.controller.js
│   │   │   └── product.controller.js
│   │   ├── middlewares/
│   │   │   └── idempotency.js
│   │   ├── models/
│   │   │   ├── order.model.js
│   │   │   └── product.model.js
│   │   ├── routes/
│   │   │   ├── order.routes.js
│   │   │   └── product.routes.js
│   │   └── utils/
│   │       └── apiClient.js
│   ├── tests/
│   │   ├── setup.js
│   │   └── orders.test.js
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── openapi.yaml
│   ├── Dockerfile
│   └── package.json
│
├── lambda-orchestrator/
│   ├── handler.js              # Lambda handler
│   ├── serverless.yml          # Configuración Serverless
│   └── package.json
│
├── db/
│   ├── schema.sql              # Esquema de base de datos
│   └── seed.sql                # Datos iniciales
│
├── docker-compose.yml          # Orquestación de servicios
└── README.md
```

## 🔐 Seguridad

### Autenticación entre servicios

Los servicios internos requieren un token Bearer:

```
Authorization: Bearer token_secreto_interno_123
```

### Variables de entorno sensibles

Para producción, configure:

- `SERVICE_TOKEN`: Token para comunicación entre servicios
- `DB_PASS`: Contraseña de MySQL
- `MYSQL_ROOT_PASSWORD`: Contraseña root de MySQL

## 🎯 Características Implementadas

### ✅ Gestión de Clientes

- CRUD completo
- Validación de datos con Zod
- Email único
- Endpoint interno protegido

### ✅ Gestión de Productos

- CRUD completo
- Control de stock
- Actualización atómica de precio/stock

### ✅ Gestión de Órdenes

- Validación de cliente en Customers API
- Verificación de stock disponible
- Descuento transaccional de stock
- Cálculo automático de totales
- Estados: CREATED, CONFIRMED, CANCELED

### ✅ Idempotencia

- Header `X-Idempotency-Key` en confirmación de órdenes
- Cache de respuestas para evitar duplicados
- Respuesta consistente ante reintentos

### ✅ Cancelación de Órdenes

- CREATED: Cancela y restaura stock
- CONFIRMED: Solo dentro de 10 minutos

### ✅ Orquestación Lambda

- Flujo completo: validar → crear → confirmar
- Respuesta consolidada
- Manejo de errores
- Correlation ID para trazabilidad

### ✅ Paginación

- Cursor-based pagination
- Parámetros: `cursor`, `limit`
- Búsqueda con `search`

### ✅ Documentación

- OpenAPI 3.0
- Swagger UI interactivo
- Ejemplos de requests/responses

## 🐛 Troubleshooting

### El puerto 3001/3002/3003 ya está en uso

```bash
# Windows
netstat -ano | findstr ":3001"
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Error de conexión a MySQL

Verifica que el contenedor esté corriendo:

```bash
docker ps | grep mysql
```

Reinicia los servicios:

```bash
docker-compose restart
```

### Tests fallan

Asegúrate de que MySQL esté corriendo:

```bash
docker-compose up -d db
```

Ejecuta las migraciones:

```bash
cd customers-api
npm run migrate
```

### Lambda Orchestrator no responde

Verifica que las APIs estén corriendo:

```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

Revisa los logs:

```bash
cd lambda-orchestrator
npm run dev
```

## 📝 Notas Importantes

1. **Base de Datos Compartida**: Ambas APIs comparten la misma base de datos MySQL (`challenges_db`)
2. **Transacciones**: Las órdenes usan transacciones para garantizar consistencia
3. **Idempotencia**: Crucial para evitar órdenes duplicadas en reintentos
4. **Stock**: Se descuenta al crear la orden, se restaura al cancelar
5. **Validation**: Todos los endpoints validan datos con Zod

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Autores

- Joel Cuascota - [GitHub Profile](https://github.com/JACS002)
