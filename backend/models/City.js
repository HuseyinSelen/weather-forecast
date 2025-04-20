const mongoose = require("mongoose");

const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  temp: Number,
  description: String,
  icon: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("City", citySchema);
