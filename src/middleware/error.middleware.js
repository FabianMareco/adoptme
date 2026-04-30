export const EErrors = {
    // Errores de Usuario
    INVALID_TYPES_ERROR: 1,
    INCOMPLETE_VALUES_ERROR: 2,
    USER_ALREADY_EXISTS: 3,
    USER_NOT_FOUND: 4,
    INVALID_PASSWORD: 5,
    
    // Errores de Mascota
    PET_NOT_FOUND: 6,
    PET_ALREADY_ADOPTED: 7,
    
    // Errores de Adopción
    ADOPTION_NOT_FOUND: 8,
    
    // Errores de Sistema
    DATABASE_ERROR: 9,
    UNAUTHORIZED: 10,
};

export const errorsDict = {
    [EErrors.INVALID_TYPES_ERROR]: {
        name: 'Invalid Types Error',
        message: 'One or more fields have invalid data types',
        statusCode: 400
    },
    [EErrors.INCOMPLETE_VALUES_ERROR]: {
        name: 'Incomplete Values Error', 
        message: 'Required fields are missing',
        statusCode: 400
    },
    [EErrors.USER_ALREADY_EXISTS]: {
        name: 'User Already Exists',
        message: 'A user with this email already exists',
        statusCode: 409  // 409 Conflict: el recurso ya existe
    },
    [EErrors.USER_NOT_FOUND]: {
        name: 'User Not Found',
        message: 'The requested user does not exist',
        statusCode: 404
    },
    [EErrors.INVALID_PASSWORD]: {
        name: 'Invalid Password',
        message: 'The provided password is incorrect',
        statusCode: 401  // 401 Unauthorized: credenciales inválidas
    },
    [EErrors.PET_NOT_FOUND]: {
        name: 'Pet Not Found',
        message: 'The requested pet does not exist',
        statusCode: 404
    },
    [EErrors.PET_ALREADY_ADOPTED]: {
        name: 'Pet Already Adopted',
        message: 'This pet has already been adopted',
        statusCode: 409
    },
    [EErrors.ADOPTION_NOT_FOUND]: {
        name: 'Adoption Not Found',
        message: 'The requested adoption record does not exist',
        statusCode: 404
    },
    [EErrors.DATABASE_ERROR]: {
        name: 'Database Error',
        message: 'An error occurred while accessing the database',
        statusCode: 500
    },
    [EErrors.UNAUTHORIZED]: {
        name: 'Unauthorized',
        message: 'You do not have permission to perform this action',
        statusCode: 403  // 403 Forbidden: autenticado pero sin permisos
    }
};

/**
 * Clase de error personalizada
 * Extiende Error nativo para mantener compatibilidad con el stack de Node.js
 */
export class CustomError extends Error {
    constructor({ name, message, cause, code }) {
        super(message);
        this.name = name;
        this.cause = cause;
        this.code = code;
    }
    
    static createError({ name, message, cause, code }) {
        return new CustomError({ name, message, cause, code });
    }
}

/**
 * Middleware de manejo de errores de Express
 */
export const errorHandler = (err, req, res, next) => {
    // Si es nuestro error customizado
    if (err instanceof CustomError && err.code) {
        const errorInfo = errorsDict[err.code];
        if (errorInfo) {
            return res.status(errorInfo.statusCode).json({
                status: 'error',
                code: err.code,
                name: errorInfo.name,
                message: errorInfo.message,
                // Solo mostramos el cause en desarrollo
                ...(process.env.NODE_ENV === 'development' && { cause: err.cause })
            });
        }
    }
    
    // Error genérico (no controlado)
    console.error('Unhandled error:', err);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
};