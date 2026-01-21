class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor); //capture Stack Trace for the better debugging
  }
}

module.exports = ErrorHandler;
