const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const challengeRoutes = require("./routes/challenges")
const authRoutes = require("./routes/auth")
dotenv.config();
dotenv.config({ path: `.env.${process.env.ENVIRONMENT}` });

const app = express()
app.use(bodyParser.json())
app.use(cors())

app.use("/challenges", challengeRoutes)
app.use("/auth", authRoutes)


app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message: message, data: data})
})

mongoose

  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.a9csl.mongodb.net/shift?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8080);
  })
  .catch((error) => {
    console.log(error);
  });