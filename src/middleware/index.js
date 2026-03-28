const authenticate = require("./auth.middleware");
const sanitizeInput = require("./security.middleware");

module.exports = { sanitizeInput, authenticate };
