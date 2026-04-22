import { Router } from 'express';
import UsersDao from '../dao/Users.dao.js';
import UserRepository from '../repository/UserRepository.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.js';
import { CustomError, EErrors } from '../middleware/error.middleware.js';

const router = Router();
const usersRepository = new UserRepository(new UsersDao());

// Helper: elimina el password antes de enviar al cliente
const sanitizeUser = (user) => {
    const obj = user.toObject ? user.toObject() : { ...user };
    delete obj.password;
    return obj;
};

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Autenticación de usuarios
 */

/**
 * @swagger
 * /api/sessions/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name, last_name, email, password]
 *             properties:
 *               first_name: { type: string, example: Juan }
 *               last_name:  { type: string, example: Pérez }
 *               email:      { type: string, example: juan@email.com }
 *               password:   { type: string, example: '123456' }
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Campos requeridos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password)
            throw CustomError.createError({ name: 'Incomplete Values', message: 'All fields required', code: EErrors.INCOMPLETE_VALUES_ERROR });
        const exists = await usersRepository.getUserByEmail(email);
        if (exists)
            throw CustomError.createError({ name: 'User Exists', message: 'Email already registered', code: EErrors.USER_ALREADY_EXISTS });
        const hashed = await hashPassword(password);
        const user   = await usersRepository.create({ first_name, last_name, email, password: hashed });
        res.status(201).json({ status: 'success', payload: sanitizeUser(user) });
    } catch (err) {
        res.status(err.code ? 400 : 500).json({ status: 'error', error: err.message });
    }
});

/**
 * @swagger
 * /api/sessions/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: juan@email.com }
 *               password: { type: string, example: '123456' }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string, example: success }
 *                 payload:
 *                   type: object
 *                   properties:
 *                     _id:   { type: string }
 *                     email: { type: string }
 *                     role:  { type: string }
 *       400:
 *         description: Campos faltantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // ← Validación PRIMERO (devuelve 400)
        if (!email || !password)
            throw CustomError.createError({ name: 'Incomplete Values', message: 'Email and password required', code: EErrors.INCOMPLETE_VALUES_ERROR });
        const user = await usersRepository.getUserByEmail(email);
        if (!user)
            throw CustomError.createError({ name: 'User Not Found', message: 'Invalid credentials', code: EErrors.USER_NOT_FOUND });
        const valid = await comparePassword(password, user.password);
        if (!valid)
            throw CustomError.createError({ name: 'Invalid Password', message: 'Invalid credentials', code: EErrors.INVALID_PASSWORD });
        await usersRepository.update(user._id, { last_connection: new Date() });
        res.json({ status: 'success', payload: { _id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        // 400 para campos faltantes, 401 para credenciales inválidas
        const status = err.code === EErrors.INCOMPLETE_VALUES_ERROR ? 400 : 401;
        res.status(err.code ? status : 500).json({ status: 'error', error: err.message });
    }
});

export default router;
