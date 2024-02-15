class AppError extends Error {
    constructor(statusCode, message) {
        this.message = message;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'CLIENT_ERROR' : 'SERVER_ERROR';
        this.isOperationalError = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;