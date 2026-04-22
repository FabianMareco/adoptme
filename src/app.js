import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import logger from './utils/logger.js';
import { setupSwagger } from './utils/swagger.js';

import petsRouter      from './routes/pets.router.js';
import usersRouter     from './routes/users.router.js';
import sessionsRouter  from './routes/sessions.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import mocksRouter     from './routes/mocks.router.js';
import { errorHandler } from './middleware/error.middleware.js';

const app  = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use((req, res, next) => {
    logger.http(`${req.method} ${req.url}`);
    next();
});

// ── Swagger ───────────────────────────────────────────────
setupSwagger(app);

// ── Rutas ─────────────────────────────────────────────────
app.use('/api/pets',      petsRouter);
app.use('/api/users',     usersRouter);
app.use('/api/sessions',  sessionsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/mocks',     mocksRouter);

app.get('/', (req, res) => {
    logger.info('Health check requested');
    res.json({ status: 'OK', message: 'AdoptMe API running' });
});

app.get('/loggerTest', (req, res) => {
    logger.debug('   This is a DEBUG log');
    logger.http('   This is an HTTP log');
    logger.info('   This is an INFO log');
    logger.warning('   This is a WARNING log');
    logger.error('   This is an ERROR log');
    logger.fatal('   This is a FATAL log');
    res.json({
        status:  'success',
        message: 'All log levels tested — check your console and logs/errors.log',
        levels:  ['debug', 'http', 'info', 'warning', 'error', 'fatal'],
        environment: process.env.NODE_ENV
    });
});

app.use(errorHandler);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        logger.info('MongoDB connected successfully');
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV}]`);
            logger.info(`Swagger docs available at http://localhost:${PORT}/api/docs`);
        });
    } catch (err) {
        logger.fatal(`MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

export { app, connectDB };
export default app;
