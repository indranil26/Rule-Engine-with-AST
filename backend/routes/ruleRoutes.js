const express = require('express');
const { createRule, combineRules, evaluateRule,  getRuleById, modifyRule } = require('../controllers/ruleController');

const router = express.Router();

router.post('/create_rule', createRule);
router.post('/combine_rules', combineRules);
router.post('/evaluate_rule', evaluateRule);
router.put('/modify_rule/:id', modifyRule);
// Add the new route to fetch a rule by ID
router.get('/get_rule/:id', getRuleById);

module.exports = router;
