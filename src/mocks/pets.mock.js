// src/mocks/pets.mock.js
import { faker } from '@faker-js/faker';

/**
 * ¿Por qué esta función?
 * Genera mascotas con el mismo "shape" (forma/estructura)
 * que devolvería un documento de MongoDB, incluyendo _id.
 * Esto es crucial: los tests y el frontend esperan esa estructura.
 */
const generateMockPet = () => {
    const species = faker.helpers.arrayElement(['dog', 'cat', 'rabbit', 'bird', 'hamster']);
    
    return {
        _id: faker.database.mongodbObjectId(),    // Simulamos el _id de Mongo
        name: faker.animal[species]               // Nombre del animal según especie
            ? faker.animal[species]()             // Si faker tiene nombres para esa especie
            : faker.person.firstName(),           // Si no, usamos nombre de persona
        specie: species,
        birthDate: faker.date.past({ years: 10 }),
        adopted: false,                           // Consigna: siempre false
        owner: null,                              // Consigna: sin owner
        image: faker.image.urlLoremFlickr({ 
            category: 'animals', 
            width: 200, 
            height: 200 
        }),
        __v: 0,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
    };
};

/**
 * @param {number} amount - Cantidad de mascotas a generar
 * @returns {Array} Array de objetos mascota
 */
export const generateMockPets = (amount = 100) => {
    return Array.from({ length: amount }, generateMockPet);
};