const Rule = require('../models/ruleModel');
class Node {
  constructor(type, left = null, right = null, value = null) {
    this.type = type;  // 'operator' or 'operand'
    this.left = left;  // Left child node
    this.right = right; // Right child node
    this.value = value; // Optional value for operand nodes
  }
}

const tokenize = (ruleString) => {
  return ruleString.match(/[\w]+|[><=()]|and|or/gi).map(token => 
    token.toLowerCase() === "and" ? "AND" : 
    token.toLowerCase() === "or" ? "OR" : 
    token
  );
};


const applyOperator = (operatorStack, operandStack) => {
  const operator = operatorStack.pop();
  const rightOperand = operandStack.pop();
  const leftOperand = operandStack.pop();
  const operatorNode = new Node('operator', leftOperand, rightOperand, operator);
  operandStack.push(operatorNode);  // Push the newly created operator node onto operand stack
};

const parseTokens = (tokens) => {
  const operandStack = [];
  const operatorStack = [];
  console.log('Tokens:', tokens);  // Log tokens for debugging

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token === '(') {
      // Opening parenthesis: Push a marker onto the operator stack
      operatorStack.push(token);
    } else if (token === ')') {
      // Closing parenthesis: Apply operators within the parentheses
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        applyOperator(operatorStack, operandStack);
      }
      operatorStack.pop();  // Remove the '(' from the stack
    } else if (['AND', 'OR'].includes(token)) {
      // Operator: Apply previous operators if precedence is correct
      while (operatorStack.length > 0 && ['AND', 'OR'].includes(operatorStack[operatorStack.length - 1])) {
        applyOperator(operatorStack, operandStack);
      }
      operatorStack.push(token);  // Push the current operator
    } else if (['>', '<', '=', '!='].includes(tokens[i + 1])) {
      const field = token;         // e.g., "age"
      const operator = tokens[i + 1]; // e.g., ">"
      const value = tokens[i + 2];    // e.g., "30"

      console.log(`Creating operand node: ${field} ${operator} ${value}`);
      operandStack.push(new Node('operand', null, null, `${field} ${operator} ${value}`));
      i += 2;  // Skip the operator and value tokens
    }
  }

  // Apply remaining operators in the stack
  while (operatorStack.length > 0) {
    applyOperator(operatorStack, operandStack);
  }

  // Final check: there should be exactly one operand in the stack
  if (operandStack.length !== 1) {
    throw new Error('Invalid rule format: Unmatched operands and operators.');
  }

  return operandStack.pop();  // Return the root node of the AST
};

// Wrapper function for creating a rule
const createRule = (ruleString) => {
  const tokens = tokenize(ruleString);
  return parseTokens(tokens);
};

// Combine multiple rules into one AST
const combine_rules = (rules) => {
  const asts = rules.map(createRule);
  
  // Combine logic, placeholder for combining ASTs
  if (asts.length === 0) return null;

  // Example combining all rules using OR for demonstration
  let combinedAST = asts[0];
  for (let i = 1; i < asts.length; i++) {
    combinedAST = new Node('operator', combinedAST, asts[i], 'OR');  // Simple combination logic
  }
  return combinedAST;
};

// Evaluate the combined AST against the provided data
const evaluate_rule = (ast, data) => {
  if (ast.type === 'operand') {
    const [field, operator, value] = ast.value.split(' ');
 
    switch (operator) {
      case '>':
        return data[field] > Number(value);
      case '<':
        return data[field] < Number(value);
        case '=':
          // Convert both sides to lowercase for case-insensitive comparison
          const fieldValue = typeof data[field] === 'string' ? data[field].toLowerCase() : data[field];
          const compareValue = value.replace(/'/g, '').toLowerCase();
          return fieldValue === compareValue;
        case '!=':
          // Also make the inequality check case-insensitive
          const fieldValueNE = typeof data[field] === 'string' ? data[field].toLowerCase() : data[field];
          const compareValueNE = value.replace(/'/g, '').toLowerCase();
          return fieldValueNE !== compareValueNE;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  } else if (ast.type === 'operator') {
    const leftEval = evaluate_rule(ast.left, data);
    const rightEval = evaluate_rule(ast.right, data);
    switch (ast.value) {
      case 'AND':
        return leftEval && rightEval;
      case 'OR':
        return leftEval || rightEval;
      default:
        throw new Error(`Unsupported operator: ${ast.value}`);
    }
  }
};

// Controller methods
exports.createRule = async (req, res) => {
  try {
    const { rule } = req.body;
    if (!rule) {
      return res.status(400).json({ error: 'Rule string is required' });
    }
    const ast = createRule(rule);
    const newRule = await Rule.create({ rule, ast });
    res.status(201).json(newRule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.combineRules = async (req, res) => {
  try {
    const { rules } = req.body;
    if (!rules || !rules.length) {
      return res.status(400).json({ error: 'At least two rules are required' });
    }
    const combinedAST = combine_rules(rules);
    if (!combinedAST) {
      return res.status(400).json({ error: 'Failed to create combined AST' });
    }
    const combinedRuleString = rules.join(' OR '); // You can modify how you want to represent the combined rule
    const newRule = await Rule.create({ rule: combinedRuleString, ast: combinedAST });
    res.status(201).json({ ast: newRule.ast, _id: newRule._id });  // Return the newly created combined AST
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


exports.evaluateRule = async (req, res) => {
  try {
    const { ast, data } = req.body;

    // Check if the AST and data exist
    if (!ast) {
      return res.status(400).json({ error: 'AST is required' });
    }
    if (!data) {
      return res.status(400).json({ error: 'Data for evaluation is required' });
    }

    // Log the incoming AST to debug
    console.log('AST:', ast);
    
    const result = evaluate_rule(ast, data);
    res.status(200).json({ result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// Get rule by ID
exports.getRuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const rule = await Rule.findById(id);  // Fetch rule from the database by ID
    if (!rule) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    res.status(200).json(rule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.modifyRule = async (req, res) => {
  try {
    const { rule } = req.body;
    const { id } = req.params; // Get the rule ID from the request parameters

    if (!rule) {
      return res.status(400).json({ error: 'Modified rule string is required' });
    }

    const ast = createRule(rule); // Recreate the AST based on the modified rule
    const updatedRule = await Rule.findByIdAndUpdate(id, { rule, ast }, { new: true }); // Update rule in the database

    if (!updatedRule) {
      return res.status(404).json({ error: 'Rule not found' });
    }

    res.status(200).json(updatedRule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// // Test cases
// const rule1 = "((age > 30 AND department = 'Sales') OR (age < 25 AND department = 'Marketing')) AND (salary > 50000 OR experience > 5)";
// const rule2 = "((age > 30 AND department = 'Marketing')) AND (salary > 20000 OR experience > 5)";

// const ast1 = createRule(rule1);
// const ast2 = createRule(rule2);

// console.log("AST for Rule 1:", JSON.stringify(ast1, null, 2));
// console.log("AST for Rule 2:", JSON.stringify(ast2, null, 2));

// const combinedAst = combine_rules([rule1, rule2]);
// const result = evaluate_rule(combinedAst, { age: 35, department: 'Marketing', salary: 10000, experience: 6 });
// console.log("Evaluation Result:", result); // Should evaluate based on combined rules
