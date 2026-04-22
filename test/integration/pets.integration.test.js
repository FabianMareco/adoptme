import { expect } from 'chai';
import supertest  from 'supertest';
import mongoose   from 'mongoose';
import 'dotenv/config';

import app from '../../src/app.js';

const requester = supertest(app);

// Variable para guardar IDs entre tests
let createdPetId;

describe('🐾 INTEGRATION — /api/pets', () => {

    // ── Setup: conectar a BD de test antes de todos los tests
    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL);
        }
    });

    // ── Teardown: limpiar datos de test y desconectar
    after(async () => {
        if (createdPetId) {
            await mongoose.model('Pet').findByIdAndDelete(createdPetId);
        }
        await mongoose.disconnect();
    });

    // ────────────────────────────────────────────────────
    describe('GET /api/pets', () => {

        it('debe responder con status 200', async () => {
            const res = await requester.get('/api/pets');
            expect(res.status).to.equal(200);
        });

        it('debe devolver un objeto con status success', async () => {
            const res = await requester.get('/api/pets');
            expect(res.body).to.have.property('status', 'success');
        });

        it('payload debe ser un array', async () => {
            const res = await requester.get('/api/pets');
            expect(res.body.payload).to.be.an('array');
        });

        it('cada mascota debe tener las propiedades correctas', async () => {
            // Primero creamos una mascota para asegurar que hay datos
            await requester.post('/api/pets').send({
                name: 'TestPet', specie: 'dog', birthDate: '2020-01-01'
            });
            const res = await requester.get('/api/pets');
            if (res.body.payload.length > 0) {
                const pet = res.body.payload[0];
                expect(pet).to.have.property('_id');
                expect(pet).to.have.property('name');
                expect(pet).to.have.property('specie');
                expect(pet).to.have.property('adopted');
                expect(pet.adopted).to.be.a('boolean');
            }
        });
    });

    // ────────────────────────────────────────────────────
    describe('POST /api/pets', () => {

        it('debe crear una mascota con datos válidos', async () => {
            const newPet = { name: 'Firulais', specie: 'dog', birthDate: '2020-05-15' };
            const res    = await requester.post('/api/pets').send(newPet);

            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id');
            expect(res.body.payload.name).to.equal('Firulais');
            expect(res.body.payload.specie).to.equal('dog');

            // Guardamos el ID para el teardown y tests posteriores
            createdPetId = res.body.payload._id;
        });

        it('la mascota creada debe tener adopted = false por defecto', async () => {
            const res = await requester.post('/api/pets').send({
                name: 'Michi', specie: 'cat'
            });
            expect(res.body.payload.adopted).to.be.false;

            // Limpiamos este extra
            await mongoose.model('Pet').findByIdAndDelete(res.body.payload._id);
        });

        it('debe fallar sin el campo name (400)', async () => {
            const res = await requester.post('/api/pets').send({ specie: 'dog' });
            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
        });

        it('debe fallar sin el campo specie (400)', async () => {
            const res = await requester.post('/api/pets').send({ name: 'Rex' });
            expect(res.status).to.equal(400);
            expect(res.body.status).to.equal('error');
        });

        it('debe fallar con body vacío (400)', async () => {
            const res = await requester.post('/api/pets').send({});
            expect(res.status).to.equal(400);
        });
    });

    // ────────────────────────────────────────────────────
    describe('GET /api/pets/:pid', () => {

        it('debe obtener una mascota por ID válido', async () => {
            const res = await requester.get(`/api/pets/${createdPetId}`);
            expect(res.status).to.equal(200);
            expect(res.body.payload._id).to.equal(createdPetId);
            expect(res.body.payload.name).to.equal('Firulais');
        });

        it('debe devolver 404 con ID inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res    = await requester.get(`/api/pets/${fakeId}`);
            expect(res.status).to.equal(404);
            expect(res.body.status).to.equal('error');
        });

        it('debe devolver error con ID con formato inválido', async () => {
            const res = await requester.get('/api/pets/id-invalido-123');
            expect(res.status).to.be.oneOf([400, 404, 500]);
            expect(res.body.status).to.equal('error');
        });
    });

    // ────────────────────────────────────────────────────
    describe('PUT /api/pets/:pid', () => {

        it('debe actualizar el nombre de una mascota', async () => {
            const res = await requester
                .put(`/api/pets/${createdPetId}`)
                .send({ name: 'Firulais Actualizado' });

            expect(res.status).to.equal(200);
            expect(res.body.payload.name).to.equal('Firulais Actualizado');
        });

        it('la actualización no debe cambiar campos no enviados', async () => {
            const res = await requester
                .put(`/api/pets/${createdPetId}`)
                .send({ name: 'Firulais' });

            expect(res.body.payload.specie).to.equal('dog');
        });

        it('debe devolver 404 al actualizar ID inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res    = await requester.put(`/api/pets/${fakeId}`).send({ name: 'X' });
            expect(res.status).to.equal(404);
        });
    });

    // ────────────────────────────────────────────────────
    describe('DELETE /api/pets/:pid', () => {

        it('debe eliminar una mascota existente', async () => {
            // Creamos una mascota específica para eliminar
            const created = await requester.post('/api/pets').send({
                name: 'ToDelete', specie: 'rabbit'
            });
            const idToDelete = created.body.payload._id;
            const res = await requester.delete(`/api/pets/${idToDelete}`);

            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
        });

        it('la mascota eliminada no debe encontrarse en GET', async () => {
            const created = await requester.post('/api/pets').send({
                name: 'AlsoDelete', specie: 'bird'
            });
            const idToDelete = created.body.payload._id;
            await requester.delete(`/api/pets/${idToDelete}`);

            const res = await requester.get(`/api/pets/${idToDelete}`);
            expect(res.status).to.equal(404);
        });

        it('debe devolver 404 al eliminar ID inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res    = await requester.delete(`/api/pets/${fakeId}`);
            expect(res.status).to.equal(404);
        });
    });

    // ────────────────────────────────────────────────────
    describe('GET /api/mocks/mockingpets', () => {

        it('debe generar 100 mascotas por defecto', async () => {
            const res = await requester.get('/api/mocks/mockingpets');
            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(100);
        });

        it('debe respetar el parámetro amount', async () => {
            const res = await requester.get('/api/mocks/mockingpets?amount=25');
            expect(res.body.payload).to.have.lengthOf(25);
        });

        it('las mascotas generadas deben tener adopted=false', async () => {
            const res = await requester.get('/api/mocks/mockingpets?amount=10');
            res.body.payload.forEach(pet => {
                expect(pet.adopted).to.be.false;
            });
        });

        it('las mascotas generadas deben tener owner=null', async () => {
            const res = await requester.get('/api/mocks/mockingpets?amount=10');
            res.body.payload.forEach(pet => {
                expect(pet.owner).to.be.null;
            });
        });
    });
});
