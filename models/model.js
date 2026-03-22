const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  prompt: String,
  response: String
});

module.exports = mongoose.model('Chat', ChatSchema);