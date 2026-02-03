# Guía para Generar y Mantener Documentación OpenAPI

## 📖 ¿Qué es OpenAPI?

OpenAPI (anteriormente Swagger) es una especificación estándar para documentar APIs REST. Permite describir endpoints, parámetros, respuestas y modelos de datos de forma estructurada.

## 🛠️ Opciones para Generar Documentación OpenAPI

### Opción 1: Escribir Manualmente (Actual)

Los archivos `openapi.yaml` actuales fueron creados manualmente. Esta es la opción más precisa pero requiere mantenimiento manual.

**Ventajas:**

- Control total sobre la documentación
- Más preciso y detallado
- No requiere dependencias adicionales

**Desventajas:**

- Requiere actualización manual cuando cambian los endpoints
- Propenso a quedar desactualizado

### Opción 2: Generar Automáticamente con Swagger JSDoc

Puedes generar la documentación automáticamente a partir de comentarios en el código.

#### Instalación:

```bash
npm install --save-dev swagger-jsdoc swagger-ui-express
```

#### Configuración en `src/app.js`:

```javascript
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Customers API",
      version: "1.0.0",
      description: "API de gestión de clientes",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

#### Ejemplo de documentación en el código:

```javascript
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Crear un nuevo cliente
 *     tags: [Customers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 example: "Juan Perez"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "juan@example.com"
 *               phone:
 *                 type: string
 *                 minLength: 5
 *                 example: "+5551234567"
 *     responses:
 *       201:
 *         description: Cliente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Customer'
 *       400:
 *         description: Validación fallida
 */
router.post("/customers", CustomerController.create);

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */
```

### Opción 3: Herramientas de Terceros

#### 3.1 Postman

1. Importa la colección de Postman
2. Usa "Generate Collection" desde las peticiones
3. Exporta como OpenAPI 3.0

#### 3.2 Swagger Editor (Manual)

1. Visita https://editor.swagger.io/
2. Edita el YAML
3. Valida en tiempo real
4. Exporta el archivo

#### 3.3 Stoplight Studio

1. Descarga Stoplight Studio (gratuito)
2. Interfaz gráfica para crear OpenAPI
3. Vista previa en vivo
4. Exporta a YAML/JSON

## 📝 Actualizar Documentación Existente

### Pasos para mantener actualizada la documentación:

1. **Cuando agregas un nuevo endpoint:**
   - Abre el archivo `openapi.yaml` correspondiente
   - Copia un endpoint similar existente
   - Actualiza el path, descripción, parámetros y respuestas

2. **Cuando modificas un endpoint:**
   - Busca el path en `openapi.yaml`
   - Actualiza los parámetros o respuestas modificados

3. **Cuando agregas un nuevo modelo:**
   - Ve a la sección `components/schemas`
   - Agrega el nuevo schema

### Ejemplo de estructura básica:

```yaml
openapi: 3.0.0
info:
  title: API Name
  version: 1.0.0
  description: API Description

servers:
  - url: http://localhost:3001
    description: Development server

paths:
  /endpoint:
    get:
      summary: Descripción breve
      description: Descripción detallada
      tags:
        - TagName
      parameters:
        - name: paramName
          in: query
          schema:
            type: string
          required: false
          description: Descripción del parámetro
      responses:
        "200":
          description: Respuesta exitosa
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ModelName"
        "404":
          description: No encontrado

components:
  schemas:
    ModelName:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
      required:
        - name
```

## 🔍 Validar Documentación

### Online:

- https://editor.swagger.io/ - Valida y visualiza
- https://apitools.dev/swagger-parser/ - Valida sintaxis

### CLI:

```bash
npm install -g @apidevtools/swagger-cli
swagger-cli validate openapi.yaml
```

## 📊 Visualizar Documentación

### 1. Swagger UI (Recomendado)

```bash
cd customers-api
npm install --save swagger-ui-express
```

En `src/app.js`:

```javascript
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./openapi.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

Acceder en: http://localhost:3001/api-docs

### 2. ReDoc

```bash
npm install --save redoc-express
```

```javascript
const redoc = require("redoc-express");

app.get(
  "/docs",
  redoc({
    title: "API Docs",
    specUrl: "/openapi.yaml",
  }),
);
```

### 3. RapiDoc

```html
<!DOCTYPE html>
<html>
  <head>
    <script
      type="module"
      src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"
    ></script>
  </head>
  <body>
    <rapi-doc spec-url="./openapi.yaml"></rapi-doc>
  </body>
</html>
```

## 🚀 Exportar Colección de Postman

Si prefieres trabajar con Postman:

1. Importa el archivo `openapi.yaml` en Postman
2. Postman generará automáticamente la colección
3. Puedes modificar y exportar de vuelta a OpenAPI

### Generar desde Postman:

1. Crea una colección en Postman con todas las peticiones
2. Exporta como Collection v2.1
3. Usa el conversor: https://github.com/postmanlabs/openapi-to-postman

## 📋 Checklist de Documentación

Para cada endpoint documenta:

- [ ] Path y método HTTP
- [ ] Descripción breve y detallada
- [ ] Parámetros de ruta/query/header/body
- [ ] Tipos de datos y validaciones
- [ ] Ejemplos de request
- [ ] Todos los códigos de respuesta posibles (200, 201, 400, 404, 500)
- [ ] Esquemas de respuesta
- [ ] Headers requeridos (Authorization, Content-Type)
- [ ] Ejemplos de respuesta

## 🔄 Automatización (Recomendado para Producción)

Crea un script para generar automáticamente:

```bash
npm install --save-dev swagger-jsdoc

# En package.json:
"scripts": {
  "docs:generate": "node scripts/generate-openapi.js",
  "docs:validate": "swagger-cli validate openapi.yaml"
}
```

`scripts/generate-openapi.js`:

```javascript
const swaggerJsdoc = require("swagger-jsdoc");
const fs = require("fs");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API",
      version: "1.0.0",
    },
  },
  apis: ["./src/routes/*.js"],
};

const spec = swaggerJsdoc(options);
fs.writeFileSync("./openapi.yaml", JSON.stringify(spec, null, 2));
console.log("OpenAPI spec generated successfully");
```

## 📚 Recursos Adicionales

- [OpenAPI Specification](https://swagger.io/specification/)
- [Swagger Editor](https://editor.swagger.io/)
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Postman OpenAPI](https://learning.postman.com/docs/integrations/available-integrations/working-with-openAPI/)
