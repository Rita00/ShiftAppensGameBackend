const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    //TODO complete validation (phone)
    body("email")
      .isEmail()
      .withMessage("Email inválido.")
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Username já registado.");
          }
        });
      })
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email já registado.");
          }
        });
      }),
    body("password").trim().isLength({ min: 4, max: 16 }),
    body("username")
    .custom((value, {req}) => {
      return User.findOne({username: value}).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Este username já existe");
        }
      })
  }),
  ],
  authController.signup
);
router.post("/login", authController.login);

module.exports = router;