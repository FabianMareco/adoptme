import { expect } from 'chai';
import { generateMockPets } from '../../src/mocks/pets.mock.js';
import { generateMockUsers } from '../../src/mocks/users.mock.js';

// ── Tests unitarios: no necesitan BD ni servidor ──────────
// Testean funciones puras de manera aislada

describe('🐾 UNIT — Mock Generators', () => {

    describe('generateMockPets()', () => {

        it('debe generar la cantidad correcta de mascotas', () => {
            const pets = generateMockPets(10);
            expect(pets).to.be.an('array');
            expect(pets).to.have.lengthOf(10);
        });

        it('debe generar 100 mascotas por defecto', () => {
            const pets = generateMockPets();
            expect(pets).to.have.lengthOf(100);
        });

        it('cada mascota debe tener los campos requeridos', () => {
            const pets = generateMockPets(5);
            pets.forEach(pet => {
                expect(pet).to.have.property('_id');
                expect(pet).to.have.property('name');
                expect(pet).to.have.property('specie');
                expect(pet).to.have.property('birthDate');
                expect(pet).to.have.property('adopted');
                expect(pet).to.have.property('owner');
                expect(pet).to.have.property('image');
            });
        });

        it('adopted debe ser siempre false (consigna)', () => {
            const pets = generateMockPets(20);
            pets.forEach(pet => {
                expect(pet.adopted).to.be.false;
            });
        });

        it('owner debe ser siempre null (consigna)', () => {
            const pets = generateMockPets(20);
            pets.forEach(pet => {
                expect(pet.owner).to.be.null;
            });
        });

        it('_id debe ser un string con formato de ObjectId de MongoDB', () => {
            const pets = generateMockPets(5);
            const mongoIdRegex = /^[a-f\d]{24}$/i;
            pets.forEach(pet => {
                expect(pet._id).to.match(mongoIdRegex);
            });
        });

        it('los nombres deben ser strings no vacíos', () => {
            const pets = generateMockPets(10);
            pets.forEach(pet => {
                expect(pet.name).to.be.a('string');
                expect(pet.name).to.not.be.empty;
            });
        });

        it('no debe generar mascotas duplicadas (IDs únicos)', () => {
            const pets = generateMockPets(50);
            const ids  = pets.map(p => p._id);
            const unique = new Set(ids);
            expect(unique.size).to.equal(pets.length);
        });
    });

    describe('generateMockUsers()', () => {

        it('debe generar la cantidad correcta de usuarios', async () => {
            const users = await generateMockUsers(5);
            expect(users).to.be.an('array');
            expect(users).to.have.lengthOf(5);
        });

        it('debe generar 50 usuarios por defecto', async () => {
            const users = await generateMockUsers();
            expect(users).to.have.lengthOf(50);
        });

        it('cada usuario debe tener los campos requeridos', async () => {
            const users = await generateMockUsers(3);
            users.forEach(user => {
                expect(user).to.have.property('_id');
                expect(user).to.have.property('first_name');
                expect(user).to.have.property('last_name');
                expect(user).to.have.property('email');
                expect(user).to.have.property('password');
                expect(user).to.have.property('role');
                expect(user).to.have.property('pets');
                expect(user).to.have.property('documents');
            });
        });

        it('password debe estar encriptado (no ser texto plano)', async () => {
            const users = await generateMockUsers(3);
            users.forEach(user => {
                expect(user.password).to.not.equal('coder123');
                expect(user.password).to.match(/^\$2b\$\d+\$/); // formato bcrypt
            });
        });

        it('role debe ser user o admin solamente (consigna)', async () => {
            const users = await generateMockUsers(20);
            users.forEach(user => {
                expect(['user', 'admin']).to.include(user.role);
            });
        });

        it('pets debe ser un array vacío (consigna)', async () => {
            const users = await generateMockUsers(5);
            users.forEach(user => {
                expect(user.pets).to.be.an('array');
                expect(user.pets).to.have.lengthOf(0);
            });
        });

        it('email debe tener formato válido', async () => {
            const users = await generateMockUsers(10);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            users.forEach(user => {
                expect(user.email).to.match(emailRegex);
            });
        });

        it('la distribución de roles debe incluir ambos valores', async () => {
            // Con 50 usuarios, estadísticamente deben aparecer ambos roles
            const users = await generateMockUsers(50);
            const roles = users.map(u => u.role);
            expect(roles).to.include('user');
            expect(roles).to.include('admin');
        });
    });
});
