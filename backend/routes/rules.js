// backend/routes/rules.js
const express = require('express');
const router = express.Router();
const { create_rule, combine_rules, evaluate_rule } = require('../utils/ruleEngine');
const Rule = require('../models/Rule');

// Create a rule
router.post('/create', async (req, res) => {
    const { rule_string } = req.body;
    try {
        const ast = create_rule(rule_string);
        const newRule = new Rule({ ruleString: rule_string, ast });
        await newRule.save();
        res.json(newRule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Combine multiple rules
router.post('/combine', async (req, res) => {
    const { rule_strings } = req.body;
    try {
        const combinedAST = combine_rules(rule_strings);
        res.json(combinedAST);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Evaluate a rule against data
router.post('/evaluate', async (req, res) => {
    const { rule_id, data } = req.body;
    try {
        const rule = await Rule.findById(rule_id);
        if (!rule) {
            return res.status(404).json({ error: 'Rule not found' });
        }
        const result = evaluate_rule(rule.ast, data);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
