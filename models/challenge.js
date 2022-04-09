const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, default: Date.now },
  availableCodes: [{ type: String}]
});

module.exports = mongoose.model('Challenge', challengeSchema)