import { Router } from 'express';
import UsersDao from '../dao/Users.dao.js';
import UserRepository from '../repository/UserRepository.js';
import { uploader } from '../middleware/multer.middleware.js';
import { CustomError, EErrors } from '../middleware/error.middleware.js';

const router = Router();
const usersRepository = new UserRepository(new UsersDao());

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Lista de usuarios (sin passwords)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get('/', async (req, res) => {
    try {
        const users = await usersRepository.getAll();
        res.json({ status: 'success', payload: users });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/users/{uid}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:uid', async (req, res) => {
    try {
        const user = await usersRepository.getById(req.params.uid);
        if (!user) throw CustomError.createError({ name: 'User Not Found', message: 'User not found', code: EErrors.USER_NOT_FOUND });
        res.json({ status: 'success', payload: user });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/users/{uid}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name:  { type: string }
 *               email:      { type: string }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:uid', async (req, res) => {
    try {
        const updated = await usersRepository.update(req.params.uid, req.body);
        if (!updated) throw CustomError.createError({ name: 'User Not Found', message: 'User not found', code: EErrors.USER_NOT_FOUND });
        res.json({ status: 'success', payload: updated });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/users/{uid}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:uid', async (req, res) => {
    try {
        const deleted = await usersRepository.delete(req.params.uid);
        if (!deleted) throw CustomError.createError({ name: 'User Not Found', message: 'User not found', code: EErrors.USER_NOT_FOUND });
        res.json({ status: 'success', payload: deleted });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/users/{uid}/documents:
 *   post:
 *     summary: Subir documentos de un usuario
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Documentos subidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/:uid/documents', uploader.array('documents'), async (req, res) => {
    try {
        const user = await usersRepository.getById(req.params.uid);
        if (!user) throw CustomError.createError({ name: 'User Not Found', message: 'User not found', code: EErrors.USER_NOT_FOUND });
        const newDocs = req.files.map(f => ({ name: f.originalname, reference: `/public/documents/${f.filename}` }));
        const updated = await usersRepository.update(req.params.uid, {
            documents: [...(user.documents || []), ...newDocs]
        });
        res.json({ status: 'success', payload: updated });
    } catch (err) {
        res.status(err.code ? 404 : 500).json({ status: 'error', error: err.message });
    }
});

export default router;
