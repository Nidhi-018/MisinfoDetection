/**
 * Error Handling Middleware
 * Provides standardized error responses
 */

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
    details = err.errors || err.message;
  }

  if (err.name === 'MulterError') {
    status = 400;
    message = 'File Upload Error';
    details = err.message;
  }

  // Don't leak internal errors in production
  if (process.env.NODE_ENV === 'production' && status === 500) {
    message = 'Internal Server Error';
    details = null;
  }

  res.status(status).json({
    error: {
      status,
      message,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

module.exports = errorHandler;

