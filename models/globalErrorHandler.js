const ENV = process.env.NODE_ENV;
const unAuthorizedErrors = ['TokenExpiredError', 'JsonWebTokenError']
const mongoDbOpsErrNames = ['CastError', 'ValidationError'];

function getStatusCode(err) {
    if (unAuthorizedErrors.includes(err.name))
        return 401;
    if (mongoDbOpsErrNames.includes(err.name) || err.code === 11000)
        return 400;
    if (err.statusCode) return err.statusCode;
    return 500;
}

function handleErrorInLocal(err, res) {
    res.status(err.statusCode).send({
        status: err.status,
        message: err.message,
        stack: err.stack,
        errors: err
    });
}

function globalErrorHandler(err, _req, res, _next) {
    err.statusCode = getStatusCode(err);
    err.status = err.status || 'UNKNOWN_ERROR';

    if (ENV === 'local') handleErrorInLocal(err, res);
}

module.exports = globalErrorHandler;