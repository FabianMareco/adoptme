import { faker } from '@faker-js/faker';
import { hashPassword } from '../utils/bcrypt.js';

export const generateMockUsers = async (amount = 50) => {
    const hashed = await hashPassword('coder123');
    return Array.from({ length: amount }, () => {
        const firstName = faker.person.firstName();
        const lastName  = faker.person.lastName();
        return {
            _id:        faker.database.mongodbObjectId(),
            first_name: firstName,
            last_name:  lastName,
            email:      faker.internet.email({ firstName, lastName }).toLowerCase(),
            password:   hashed,
            role:       faker.helpers.arrayElement(['user', 'admin']),
            pets:       [],
            documents:  [],          // ← Fix: campo requerido por la consigna
            last_connection: null,
            __v: 0,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent(),
        };
    });
};
