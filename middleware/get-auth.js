const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Bearer <token>
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      err.statusCode = 500;
      throw err;
    }
    req.userId = decodedToken.userId;
  }

  next();
};
