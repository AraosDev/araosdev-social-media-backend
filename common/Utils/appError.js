const ENV = process.env.NODE_ENV;

const catchReqResAsync = (fn) => (req, res, next) => fn(req, res, next).catch(next);

const catchWebSocketAsync = (func, websocket) => {
    const handleError = (err) => {
        const error = {
            status: err.status || 500,
            message: err.message || 'UNKNOWN_ERROR',
            stack: err.stack || 'UNKNOWN_STACK',
            errors: err
        };
        console.error(error)
        websocket.send({ status: error.status, message: error.message, ...(ENV === 'local' ? { stack: error.stack, errors: error.errors } : {}) });
    }
    return (...args) => {
        try {
            const ret = func.apply(this, args);
            if (ret && typeof ret.catch === 'function') ret.catch(handleError)
        } catch (e) {
            handleError(e);
        }
    }
}

class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'CLIENT_ERROR' : 'SERVER_ERROR';
        this.isOperationalError = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = { AppError, catchReqResAsync, catchWebSocketAsync };