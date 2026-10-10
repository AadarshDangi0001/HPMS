const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Invalid MongoDB ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // Duplicate key error (e.g. double-booked slot, duplicate bed number)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyPattern || {}).join(', ');
    message = field.includes('doctor')
      ? 'This doctor is already booked for the selected date and time'
      : `Duplicate value for field: ${field}`;
  }

  if (statusCode >= 500) {
    console.error(err);
    message = 'Something went wrong on the server';
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
};

module.exports = { errorHandler, notFound };
