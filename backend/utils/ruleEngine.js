// backend/utils/ruleEngine.js

// Node structure representing the AST
class Node {
    constructor(type, value = null, left = null, right = null) {
        this.type = type;  // "operator" or "operand"
        this.value = value; // For operand: { attribute, operator, value } | For operator: "AND"/"OR"
        this.left = left;   // Left child Node
        this.right = right; // Right child Node
    }
}

// Function to create AST from a rule string
function createAST(rule_string) {
    const tokens = rule_string.split(' ');
    if (tokens.includes('AND') || tokens.includes('OR')) {
        const operatorIndex = tokens.findIndex(token => token === 'AND' || token === 'OR');
        const operator = tokens[operatorIndex];
        const leftTokens = tokens.slice(0, operatorIndex);
        const rightTokens = tokens.slice(operatorIndex + 1);
        return new Node(
            "operator",
            operator,
            createAST(leftTokens.join(' ')),
            createAST(rightTokens.join(' '))
        );
    }
    // Handle conditions like "age > 30"
    const attribute = tokens[0];
    const operator = tokens[1];
    const value = isNaN(tokens[2]) ? tokens[2].replace(/['"]+/g, '') : Number(tokens[2]);
    return new Node("operand", { attribute, operator, value });
}

// Function to combine multiple rules into a single AST
function combineRules(rules) {
    if (rules.length === 1) return createAST(rules[0]);

    // Combine rules using a frequent operator heuristic (default: 'AND')
    const combinedAST = new Node("operator", "AND");
    combinedAST.left = createAST(rules[0]);
    combinedAST.right = combineRules(rules.slice(1));
    return combinedAST;
}

// Function to evaluate the rule against user data
function evaluateAST(ast, data) {
    if (ast.type === 'operand') {
        const { attribute, operator, value } = ast.value;
        const user_value = data[attribute];

        switch (operator) {
            case '>': return user_value > value;
            case '<': return user_value < value;
            case '=': return user_value === value;
            default: throw new Error(`Unsupported operator: ${operator}`);
        }
    } else if (ast.type === 'operator') {
        const leftResult = evaluateAST(ast.left, data);
        const rightResult = evaluateAST(ast.right, data);

        if (ast.value === 'AND') return leftResult && rightResult;
        if (ast.value === 'OR') return leftResult || rightResult;
        throw new Error(`Unsupported operator: ${ast.value}`);
    }
}

// API: create_rule
function create_rule(rule_string) {
    return createAST(rule_string);
}

// API: combine_rules
function combine_rules(rules) {
    return combineRules(rules);
}

// API: evaluate_rule
function evaluate_rule(ruleAST, data) {
    return evaluateAST(ruleAST, data);
}

// Example usage:
const rule1 = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
const rule2 = "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";

// Creating individual ASTs
const ast1 = create_rule(rule1);
const ast2 = create_rule(rule2);

// Combining rules
const combinedAST = combine_rules([rule1, rule2]);

// Evaluating rules against data
const userData = { age: 35, department: "Sales", salary: 60000, experience: 3 };
console.log(evaluate_rule(combinedAST, userData)); // Output: true/false based on rule evaluation

module.exports = { create_rule, combine_rules, evaluate_rule };
