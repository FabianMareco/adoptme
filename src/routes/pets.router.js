import { Router } from 'express';
import PetsDao from '../dao/Pets.dao.js';
import PetRepository from '../repository/PetRepository.js';
import { uploader } from '../middleware/multer.middleware.js';
import { CustomError, EErrors } from '../middleware/error.middleware.js';

const router = Router();
const petsRepository = new PetRepository(new PetsDao());

/**
 * @swagger
 * tags:
 *   name: Pets
 *   description: Gestión de mascotas
 */

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Obtener todas las mascotas
 *     tags: [Pets]
 *     responses:
 *       200:
 *         description: Lista de mascotas obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pet'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
    try {
        const pets = await petsRepository.getAll();
        res.json({ status: 'success', payload: pets });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/pets/{pid}:
 *   get:
 *     summary: Obtener una mascota por ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Mascota encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Pet' }
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:pid', async (req, res) => {
    try {
        const pet = await petsRepository.getById(req.params.pid);
        if (!pet) throw CustomError.createError({ name: 'Pet Not Found', message: 'Pet not found', code: EErrors.PET_NOT_FOUND });
        res.json({ status: 'success', payload: pet });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Crear una nueva mascota
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, specie]
 *             properties:
 *               name:      { type: string, example: Firulais }
 *               specie:    { type: string, example: dog }
 *               birthDate: { type: string, format: date, example: '2020-05-15' }
 *     responses:
 *       201:
 *         description: Mascota creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Pet' }
 *       400:
 *         description: Datos incompletos o inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req, res) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie) throw CustomError.createError({ name: 'Incomplete Values', message: 'name and specie are required', code: EErrors.INCOMPLETE_VALUES_ERROR });
        const pet = await petsRepository.create({ name, specie, birthDate, adopted: false });
        res.status(201).json({ status: 'success', payload: pet });
    } catch (err) {
        res.status(err.code ? 400 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/pets/withimage:
 *   post:
 *     summary: Crear mascota con imagen
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, specie]
 *             properties:
 *               name:      { type: string }
 *               specie:    { type: string }
 *               birthDate: { type: string, format: date }
 *               image:     { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Mascota creada con imagen
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Pet' }
 *       400:
 *         description: Datos incompletos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/withimage', uploader.single('image'), async (req, res) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie) throw CustomError.createError({ name: 'Incomplete Values', message: 'name and specie are required', code: EErrors.INCOMPLETE_VALUES_ERROR });
        const image = req.file ? `/public/pets/${req.file.filename}` : '';
        const pet = await petsRepository.create({ name, specie, birthDate, adopted: false, image });
        res.status(201).json({ status: 'success', payload: pet });
    } catch (err) {
        res.status(err.code ? 400 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/pets/{pid}:
 *   put:
 *     summary: Actualizar una mascota
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       200:
 *         description: Mascota actualizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Pet' }
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:pid', async (req, res) => {
    try {
        const updated = await petsRepository.update(req.params.pid, req.body);
        if (!updated) throw CustomError.createError({ name: 'Pet Not Found', message: 'Pet not found', code: EErrors.PET_NOT_FOUND });
        res.json({ status: 'success', payload: updated });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/pets/{pid}:
 *   delete:
 *     summary: Eliminar una mascota
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la mascota
 *     responses:
 *       200:
 *         description: Mascota eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/Pet' }
 *       404:
 *         description: Mascota no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:pid', async (req, res) => {
    try {
        const deleted = await petsRepository.delete(req.params.pid);
        if (!deleted) throw CustomError.createError({ name: 'Pet Not Found', message: 'Pet not found', code: EErrors.PET_NOT_FOUND });
        res.json({ status: 'success', payload: deleted });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

export default router;
