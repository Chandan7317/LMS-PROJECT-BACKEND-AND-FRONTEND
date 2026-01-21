class ApiResponse {
  constructor(statusCode, success, message, data = null, meta = null) {
    this.statusCode = statusCode; //http status code
    this.message = message; //message describing the respinse
    this.success = success; //boolean indecating succcess or failure
    this.data = data; //data return in the response if any
    this.meta = meta; //additional metadata,if any
  }
  send(res) {
    const response = {};
    response.message = this.message;
    response.success = this.success;
    if (this.data) {
      response.data = this.data;
    }
    if (this.meta) {
      response.meta = this.meta;
    }
    return res.status(this.statusCode).json(response);
  }
}

module.exports = ApiResponse;
