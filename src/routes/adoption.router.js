import { Router } from 'express';
import AdoptionsDao from '../dao/Adoptions.dao.js';
import UsersDao from '../dao/Users.dao.js';
import PetsDao from '../dao/Pets.dao.js';
import GenericRepository from '../repository/GenericRepository.js';
import UserRepository from '../repository/UserRepository.js';
import PetRepository from '../repository/PetRepository.js';
import { CustomError, EErrors } from '../middleware/error.middleware.js';

const router = Router();
const adoptionsRepo = new GenericRepository(new AdoptionsDao());
const usersRepo     = new UserRepository(new UsersDao());
const petsRepo      = new PetRepository(new PetsDao());

/**
 * @swagger
 * tags:
 *   name: Adoptions
 *   description: Gestión de adopciones
 */

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Obtener todas las adopciones
 *     tags: [Adoptions]
 *     responses:
 *       200:
 *         description: Lista de adopciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Adoption'
 */
router.get('/', async (req, res) => {
    try {
        const adoptions = await adoptionsRepo.getAll();
        res.json({ status: 'success', payload: adoptions });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{aid}:
 *   get:
 *     summary: Obtener una adopción por ID
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: aid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la adopción
 *     responses:
 *       200:
 *         description: Adopción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Adoption' }
 *       404:
 *         description: Adopción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:aid', async (req, res) => {
    try {
        const adoption = await adoptionsRepo.getById(req.params.aid);
        if (!adoption) throw CustomError.createError({ name: 'Adoption Not Found', message: 'Adoption not found', code: EErrors.ADOPTION_NOT_FOUND });
        res.json({ status: 'success', payload: adoption });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/adoptions/{uid}/{pid}:
 *   post:
 *     summary: Crear una adopción — asigna una mascota a un usuario
 *     tags: [Adoptions]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario adoptante
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota a adoptar
 *     responses:
 *       201:
 *         description: Adopción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Adoption' }
 *       400:
 *         description: La mascota ya fue adoptada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuario o mascota no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:uid/:pid', async (req, res) => {
    try {
        const { uid, pid } = req.params;
        const user = await usersRepo.getById(uid);
        if (!user) throw CustomError.createError({ name: 'User Not Found', message: 'User not found', code: EErrors.USER_NOT_FOUND });
        const pet = await petsRepo.getById(pid);
        if (!pet) throw CustomError.createError({ name: 'Pet Not Found', message: 'Pet not found', code: EErrors.PET_NOT_FOUND });
        if (pet.adopted) throw CustomError.createError({ name: 'Pet Already Adopted', message: 'Pet is already adopted', code: EErrors.PET_ALREADY_ADOPTED });
        await petsRepo.update(pid, { adopted: true, owner: uid });
        await usersRepo.update(uid, { pets: [...user.pets, pid] });
        const adoption = await adoptionsRepo.create({ owner: uid, pet: pid });
        res.status(201).json({ status: 'success', payload: adoption });
    } catch (err) {
        res.status(err.code ? 400 : 500).json({ status: 'error', error: err.message });
    }
});

export default router;
