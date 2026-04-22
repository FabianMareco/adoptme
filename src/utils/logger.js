import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logFile   = path.join(__dirname, '../../logs/errors.log');

const { createLogger, transports, format } = winston;
const { combine, timestamp, colorize, printf, errors } = format;

const customLevels = {
    levels: { debug: 0, http: 1, info: 2, warning: 3, error: 4, fatal: 5 },
    colors: { debug: 'grey', http: 'cyan', info: 'green', warning: 'yellow', error: 'red', fatal: 'magenta' }
};

winston.addColors(customLevels.colors);

const consoleFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    colorize({ all: true }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack }) =>
        stack ? `[${timestamp}] ${level}: ${message}\n${stack}`
              : `[${timestamp}] ${level}: ${message}`)
);

const fileFormat = combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    // Filtro: solo guarda error y fatal
    format((info) => info.level === 'error' || info.level === 'fatal' ? info : false)(),
    printf(({ level, message, timestamp, stack }) =>
        stack ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
              : `[${timestamp}] ${level.toUpperCase()}: ${message}`)
);

const fileTransport = new transports.File({
    filename: logFile,
    level:    'fatal',   // ← máximo nivel = captura todo
    format:   fileFormat // ← el formato filtra a error/fatal
});

const devLogger = createLogger({
    levels: customLevels.levels,
    level:  'debug',
    transports: [
        new transports.Console({ format: consoleFormat }),
        fileTransport
    ]
});

const prodLogger = createLogger({
    levels: customLevels.levels,
    level:  'info',
    transports: [
        new transports.Console({ format: consoleFormat }),
        fileTransport
    ]
});

const logger = process.env.NODE_ENV === 'production' ? prodLogger : devLogger;

export default logger;
