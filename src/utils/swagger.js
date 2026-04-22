import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi    from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title:       'AdoptMe API',
            version:     '1.0.0',
            description: 'API REST para gestión de adopciones de mascotas — Coderhouse Backend III',
            contact: {
                name:  'AdoptMe Dev Team',
                email: 'dev@adoptme.com'
            }
        },
        servers: [
            { url: 'http://localhost:8080', description: 'Development server' },
            { url: 'https://adoptme-production.railway.app', description: 'Production server' }
        ],
        components: {
            schemas: {
                Pet: {
                    type: 'object',
                    properties: {
                        _id:       { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
                        name:      { type: 'string', example: 'Firulais' },
                        specie:    { type: 'string', example: 'dog' },
                        birthDate: { type: 'string', format: 'date', example: '2020-05-15' },
                        adopted:   { type: 'boolean', example: false },
                        owner:     { type: 'string', nullable: true, example: null },
                        image:     { type: 'string', example: '/public/pets/photo.jpg' }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        _id:        { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
                        first_name: { type: 'string', example: 'Juan' },
                        last_name:  { type: 'string', example: 'Pérez' },
                        email:      { type: 'string', example: 'juan@email.com' },
                        role:       { type: 'string', enum: ['user', 'admin'], example: 'user' },
                        pets:       { type: 'array', items: { type: 'string' } },
                        documents:  { type: 'array', items: { $ref: '#/components/schemas/Document' } },
                        last_connection: { type: 'string', format: 'date-time', nullable: true }
                    }
                },
                Document: {
                    type: 'object',
                    properties: {
                        name:      { type: 'string', example: 'DNI' },
                        reference: { type: 'string', example: '/public/documents/dni.pdf' }
                    }
                },
                Adoption: {
                    type: 'object',
                    properties: {
                        _id:   { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
                        owner: { $ref: '#/components/schemas/User' },
                        pet:   { $ref: '#/components/schemas/Pet' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status:  { type: 'string', example: 'error' },
                        message: { type: 'string', example: 'Resource not found' }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        status:  { type: 'string', example: 'success' },
                        payload: { type: 'object' }
                    }
                }
            }
        }
    },
    // Rutas donde Swagger busca los comentarios JSDoc
    apis: [
        path.join(__dirname, '../routes/*.router.js'),
        path.join(__dirname, '../routes/*.js')
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app) => {
    // UI interactiva
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { background-color: #e74c3c; }',
        customSiteTitle: 'AdoptMe API Docs'
    }));
    // JSON spec (útil para importar en Postman)
    app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
