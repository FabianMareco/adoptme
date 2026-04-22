import { expect } from 'chai';
import supertest  from 'supertest';
import mongoose   from 'mongoose';
import 'dotenv/config';

import app from '../../src/app.js';

const requester = supertest(app);

let createdUserId;
const testEmail = `test_${Date.now()}@adoptme.com`;

describe('👤 INTEGRATION — /api/users & /api/sessions', () => {

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URL);
        }
    });

    after(async () => {
        if (createdUserId) {
            await mongoose.model('User').findByIdAndDelete(createdUserId);
        }
        await mongoose.disconnect();
    });

    // ────────────────────────────────────────────────────
    describe('POST /api/sessions/register', () => {

        it('debe registrar un usuario con datos válidos', async () => {
            const res = await requester.post('/api/sessions/register').send({
                first_name: 'Test',
                last_name:  'User',
                email:      testEmail,
                password:   '123456'
            });
            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id');
            expect(res.body.payload.email).to.equal(testEmail);

            createdUserId = res.body.payload._id;
        });

        it('el password NO debe aparecer en la respuesta', async () => {
            const email2 = `nopass_${Date.now()}@adoptme.com`;
            const res    = await requester.post('/api/sessions/register').send({
                first_name: 'No', last_name: 'Pass', email: email2, password: 'secret'
            });
            // El payload no debe exponer el password
            expect(res.body.payload).to.not.have.property('password');

            await mongoose.model('User').findByIdAndDelete(res.body.payload._id);
        });

        it('debe fallar con email duplicado (409)', async () => {
            const res = await requester.post('/api/sessions/register').send({
                first_name: 'Test',
                last_name:  'User',
                email:      testEmail,    // mismo email
                password:   '123456'
            });
            expect(res.status).to.be.oneOf([400, 409]);
            expect(res.body.status).to.equal('error');
        });

        it('debe fallar sin first_name (400)', async () => {
            const res = await requester.post('/api/sessions/register').send({
                last_name: 'User', email: 'x@x.com', password: '123'
            });
            expect(res.status).to.equal(400);
        });

        it('debe fallar sin email (400)', async () => {
            const res = await requester.post('/api/sessions/register').send({
                first_name: 'Test', last_name: 'User', password: '123'
            });
            expect(res.status).to.equal(400);
        });

        it('debe fallar con body vacío (400)', async () => {
            const res = await requester.post('/api/sessions/register').send({});
            expect(res.status).to.equal(400);
        });
    });

    // ────────────────────────────────────────────────────
    describe('POST /api/sessions/login', () => {

        it('debe loguear con credenciales válidas', async () => {
            const res = await requester.post('/api/sessions/login').send({
                email:    testEmail,
                password: '123456'
            });
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            expect(res.body.payload).to.have.property('_id');
            expect(res.body.payload).to.have.property('email');
            expect(res.body.payload).to.have.property('role');
        });

        it('el login NO debe exponer el password', async () => {
            const res = await requester.post('/api/sessions/login').send({
                email: testEmail, password: '123456'
            });
            expect(res.body.payload).to.not.have.property('password');
        });

        it('debe fallar con password incorrecto (401)', async () => {
            const res = await requester.post('/api/sessions/login').send({
                email:    testEmail,
                password: 'wrongpassword'
            });
            expect(res.status).to.be.oneOf([400, 401]);
            expect(res.body.status).to.equal('error');
        });

        it('debe fallar con email inexistente (401/404)', async () => {
            const res = await requester.post('/api/sessions/login').send({
                email:    'noexiste@adoptme.com',
                password: '123456'
            });
            expect(res.status).to.be.oneOf([401, 404]);
        });

        it('debe fallar sin body (400)', async () => {
            const res = await requester.post('/api/sessions/login').send({});
            expect(res.status).to.equal(400);
        });
    });

    // ────────────────────────────────────────────────────
    describe('GET /api/users', () => {

        it('debe responder con status 200', async () => {
            const res = await requester.get('/api/users');
            expect(res.status).to.equal(200);
        });

        it('debe devolver un array de usuarios', async () => {
            const res = await requester.get('/api/users');
            expect(res.body.payload).to.be.an('array');
        });

        it('los usuarios deben tener los campos correctos', async () => {
            const res = await requester.get('/api/users');
            if (res.body.payload.length > 0) {
                const user = res.body.payload[0];
                expect(user).to.have.property('_id');
                expect(user).to.have.property('first_name');
                expect(user).to.have.property('last_name');
                expect(user).to.have.property('email');
                expect(user).to.have.property('role');
                expect(user).to.have.property('pets');
            }
        });
    });

    // ────────────────────────────────────────────────────
    describe('GET /api/users/:uid', () => {

        it('debe obtener el usuario creado por ID', async () => {
            const res = await requester.get(`/api/users/${createdUserId}`);
            expect(res.status).to.equal(200);
            expect(res.body.payload._id).to.equal(createdUserId);
            expect(res.body.payload.email).to.equal(testEmail);
        });

        it('debe devolver 404 con ID inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res    = await requester.get(`/api/users/${fakeId}`);
            expect(res.status).to.equal(404);
        });
    });

    // ────────────────────────────────────────────────────
    describe('PUT /api/users/:uid', () => {

        it('debe actualizar el first_name del usuario', async () => {
            const res = await requester
                .put(`/api/users/${createdUserId}`)
                .send({ first_name: 'Updated' });
            expect(res.status).to.equal(200);
            expect(res.body.payload.first_name).to.equal('Updated');
        });

        it('debe devolver 404 con ID inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res    = await requester.put(`/api/users/${fakeId}`).send({ first_name: 'X' });
            expect(res.status).to.equal(404);
        });
    });

    // ────────────────────────────────────────────────────
    describe('DELETE /api/users/:uid', () => {

        it('debe eliminar el usuario creado', async () => {
            const res = await requester.delete(`/api/users/${createdUserId}`);
            expect(res.status).to.equal(200);
            expect(res.body.status).to.equal('success');
            createdUserId = null; // Ya no necesita limpiarse en after()
        });

        it('el usuario eliminado no debe encontrarse en GET', async () => {
            const email3  = `deleted_${Date.now()}@adoptme.com`;
            const created = await requester.post('/api/sessions/register').send({
                first_name: 'Del', last_name: 'User', email: email3, password: '123'
            });
            const idToDel = created.body.payload._id;
            await requester.delete(`/api/users/${idToDel}`);

            const res = await requester.get(`/api/users/${idToDel}`);
            expect(res.status).to.equal(404);
        });

        it('debe devolver 404 al eliminar ID inexistente', async () => {
            const fakeId = '64a1b2c3d4e5f6a7b8c9d0e1';
            const res    = await requester.delete(`/api/users/${fakeId}`);
            expect(res.status).to.equal(404);
        });
    });

    // ────────────────────────────────────────────────────
    describe('GET /api/mocks/mockingusers', () => {

        it('debe generar 50 usuarios por defecto', async () => {
            const res = await requester.get('/api/mocks/mockingusers');
            expect(res.status).to.equal(200);
            expect(res.body.payload).to.have.lengthOf(50);
        });

        it('los passwords deben estar encriptados', async () => {
            const res = await requester.get('/api/mocks/mockingusers?amount=5');
            res.body.payload.forEach(user => {
                expect(user.password).to.match(/^\$2b\$\d+\$/);
            });
        });

        it('los roles deben ser user o admin', async () => {
            const res = await requester.get('/api/mocks/mockingusers?amount=10');
            res.body.payload.forEach(user => {
                expect(['user', 'admin']).to.include(user.role);
            });
        });
    });
});
