const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  completedChallenges: [
    {
      type: Schema.Types.ObjectId, 
      ref: "Challenge"
    }
  ]
});

module.exports = mongoose.model('User', userSchema)