const User = require("../models/user");
const { validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function createJWT(email, userId, username) {
  return jwt.sign(
    {
      email,
      userId,
      username
    },
    process.env.JWT_KEY,
    { expiresIn: "24h" }
  );
}

// TODO verificar se username é unico
exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Inputs inválidos.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        username,
        email,
        password: hashedPassword,
      });
      return user.save();
    })
    .then((createdUser) => {
      const token = createJWT(createdUser.email, createdUser._id.toString(), createdUser.us)
      res.status(201).json({
        message: "Utilizador criado!",
        userId: createdUser._id.toString(),
        token: token,
        expiresIn: 3600 * 24,
        username: createdUser.username,
        isAdmin: createdUser.isAdmin
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ username: username })
    .then((user) => {
      if (!user) {
        const error = new Error("Não foi encontrado um utilizador com este username.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Password incorreta.");
        error.statusCode = 401;
        throw error;
      }
      const token  = createJWT(loadedUser.email, loadedUser._id.toString(), loadedUser.username)
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
        expiresIn: 3600 * 24,
        username: loadedUser.username,
        isAdmin: loadedUser.isAdmin
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};