const { v4: uuidv4 } = require("uuid");

function requestId(req, res, next) {
    const rid = req.headers["x-request-id"] || uuidv4();
    req.id = rid;
    res.setHeader("x-request-id", rid);
    next();
}

module.exports = requestId;