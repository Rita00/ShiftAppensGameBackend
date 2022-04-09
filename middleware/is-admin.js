const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = (req, res, next) => {
  User.findOne({_id: req.userId, isAdmin:true})
  .then((userDoc) => {
    if(!userDoc) {
      res.status(401).json({
        msg: 'Permissão negada.'
      })
    }
    next();
  })
  .catch(err => {
      const error = new Error('Permissão negada.');
      error.statusCode = 500;
      throw error;
  });
};