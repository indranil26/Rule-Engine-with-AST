const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  rule: { type: String, required: true },
  ast: { type: Object, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Rule = mongoose.model('Rule', ruleSchema);
module.exports = Rule;
