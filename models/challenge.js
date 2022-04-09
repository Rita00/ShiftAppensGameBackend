const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const challengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, default: Date.now },
  points: {type: Number, required: true, min: 0},
  availableCodes: [{ type: String, select: false}]
});

module.exports = mongoose.model('Challenge', challengeSchema)