// src/routes/mocks.router.js
import { Router } from 'express';
import { generateMockPets } from '../mocks/pets.mock.js';
import { generateMockUsers } from '../mocks/users.mock.js';

const router = Router();

/**
 * GET /api/mocks/mockingpets
 * 
 * ¿Por qué query param en lugar de ruta dinámica?
 * /mockingpets?amount=100  → más RESTful para filtros/cantidades
 * /mockingpets/100         → ruta dinámica (mejor para IDs de recursos)
 * La consigna pide 100 por defecto, pero hacerlo configurable es buena práctica.
 */
router.get('/mockingpets', (req, res) => {
    try {
        const amount = parseInt(req.query.amount) || 100;
        
        if (amount > 1000) {
            return res.status(400).json({ 
                status: 'error', 
                error: 'Amount cannot exceed 1000 to prevent server overload' 
            });
        }
        
        const pets = generateMockPets(amount);
        
        res.status(200).json({
            status: 'success',
            payload: pets
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

/**
 * GET /api/mocks/mockingusers
 * Genera 50 usuarios con password encriptado por defecto
 */
router.get('/mockingusers', async (req, res) => {
    try {
        const amount = parseInt(req.query.amount) || 50;
        
        if (amount > 500) {
            return res.status(400).json({ 
                status: 'error', 
                error: 'Amount cannot exceed 500 to prevent server overload' 
            });
        }
        
        const users = await generateMockUsers(amount);
        
        res.status(200).json({
            status: 'success',
            payload: users
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

/**
 * POST /api/mocks/generateData
 * 
 * BONUS: Endpoint que genera E inserta en la BD real
 * Muy útil para poblar la BD de desarrollo en segundos
 */
router.post('/generateData', async (req, res) => {
    try {
        const { users = 0, pets = 0 } = req.body;
        
        // Importamos los modelos de Mongoose solo cuando se necesitan
        const { default: UserModel } = await import('../dao/models/User.js');
        const { default: PetModel } = await import('../dao/models/Pet.js');
        
        const mockUsers = await generateMockUsers(users);
        const mockPets = generateMockPets(pets);
        
        // insertMany es más eficiente que múltiples save()
        // porque hace UNA sola operación en MongoDB
        const insertedUsers = await UserModel.insertMany(mockUsers);
        const insertedPets = await PetModel.insertMany(mockPets);
        
        res.status(201).json({
            status: 'success',
            message: `${insertedUsers.length} users and ${insertedPets.length} pets inserted successfully`,
            payload: {
                users: insertedUsers,
                pets: insertedPets
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

export default router;