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
  // Enhanced tokenizer that handles quoted strings and negative numbers properly
  const tokens = [];
  let i = 0;
  
  while (i < ruleString.length) {
    // Skip whitespace
    if (ruleString[i].trim() === '') {
      i++;
      continue;
    }
    
    // Handle quoted strings as a single token
    if (ruleString[i] === "'" || ruleString[i] === '"') {
      const quoteChar = ruleString[i];
      const startPos = i;
      i++; // Move past the opening quote
      
      // Find the closing quote
      while (i < ruleString.length && ruleString[i] !== quoteChar) {
        i++;
      }
      
      if (i < ruleString.length) {
        // Include the closing quote
        i++;
        tokens.push(ruleString.substring(startPos, i));
      } else {
        // If no closing quote, treat as a syntax error
        throw new Error('Unterminated string literal');
      }
    } 
    // Handle multi-character operators: <=, >=, !=
    else if ((ruleString[i] === '<' || ruleString[i] === '>' || ruleString[i] === '!') && 
             i + 1 < ruleString.length && ruleString[i+1] === '=') {
      tokens.push(ruleString.substring(i, i+2));
      i += 2;
    }
    // Handle single-character operators and parentheses
    else if (['(', ')', '>', '<', '='].includes(ruleString[i])) {
      tokens.push(ruleString[i]);
      i++;
    }
    // Handle negative numbers (when - appears after an operator or at start)
    else if (ruleString[i] === '-' && 
             (i === 0 || 
              ['>', '<', '=', '!=', '<=', '>=', '(', 'AND', 'OR'].includes(tokens[tokens.length - 1])) &&
             i + 1 < ruleString.length && 
             /[0-9]/.test(ruleString[i+1])) {
      
      const startPos = i; // Include the minus sign
      i++; // Move past the minus
      
      // Process the digits
      while (i < ruleString.length && /[0-9.]/.test(ruleString[i])) {
        i++;
      }
      
      tokens.push(ruleString.substring(startPos, i));
    }
    // Handle numbers (integers, decimals)
    else if (/[0-9]/.test(ruleString[i])) {
      const startPos = i;
      
      // Process the digits
      while (i < ruleString.length && /[0-9.]/.test(ruleString[i])) {
        i++;
      }
      
      tokens.push(ruleString.substring(startPos, i));
    }
    // Handle words (identifiers, keywords)
    else if (/[a-zA-Z_]/.test(ruleString[i])) {
      const startPos = i;
      while (i < ruleString.length && /[a-zA-Z0-9_]/.test(ruleString[i])) {
        i++;
      }
      const word = ruleString.substring(startPos, i);
      tokens.push(word.toLowerCase() === "and" ? "AND" : 
                  word.toLowerCase() === "or" ? "OR" : word);
    }
    // Skip other characters
    else {
      i++;
    }
  }
  
  return tokens;
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
    } else if (i + 1 < tokens.length && ['>', '<', '=', '!=', '<=', '>='].includes(tokens[i + 1])) {
      const field = token;         // e.g., "age"
      const operator = tokens[i + 1]; // e.g., ">" or "<="
      const value = tokens[i + 2];    // e.g., "30" or "'fine arts'"

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

// Helper function to normalize number values
const normalizeNumberValue = (value) => {
  // Check if it's a numeric string (including those with leading zeros)
  if (typeof value === 'string' && /^-?[0-9]+(\.[0-9]+)?$/.test(value)) {
    // Convert to number to normalize (removes leading zeros)
    return Number(value);
  }
  return value;
};

const evaluate_rule = (ast, data) => {
  if (ast.type === 'operand') {
    const parts = ast.value.split(' ');
    const field = parts[0];
    const operator = parts[1];
    // Join remaining parts to handle multi-token values
    let value = parts.slice(2).join(' ').replace(/^['"]|['"]$/g, '');
    
    // Case-insensitive field lookup
    const fieldKey = Object.keys(data).find(key => key.toLowerCase() === field.toLowerCase());
    const fieldValue = fieldKey ? data[fieldKey] : undefined;
    
    if (fieldValue === undefined) {
      console.warn(`Field "${field}" not found in data. Available fields: ${Object.keys(data).join(', ')}`);
      return false;
    }
    
    // Normalize numeric values (handle leading zeros and ensure proper number comparison)
    const normalizedFieldValue = normalizeNumberValue(fieldValue);
    const normalizedCompareValue = normalizeNumberValue(value);
    
    // Convert string values to lowercase for case-insensitive comparison
    const fieldValueForComparison = typeof normalizedFieldValue === 'string' ? 
                                   normalizedFieldValue.toLowerCase() : normalizedFieldValue;
    const compareValue = typeof normalizedCompareValue === 'string' ? 
                        normalizedCompareValue.toLowerCase() : normalizedCompareValue;
    
    console.log(`Comparing: ${fieldValueForComparison} ${operator} ${compareValue}`);
    
    switch (operator) {
      case '>':
        // Ensure numeric comparison
        return Number(fieldValueForComparison) > Number(compareValue);
      case '<':
        // Ensure numeric comparison
        return Number(fieldValueForComparison) < Number(compareValue);
      case '>=':
        return Number(fieldValueForComparison) >= Number(compareValue);
      case '<=':
        return Number(fieldValueForComparison) <= Number(compareValue);
      case '=':
        // Use loose equality for numeric values to handle string/number equivalence
        if (typeof fieldValueForComparison === 'number' || typeof compareValue === 'number') {
          // If either side is a number, compare numerically
          return Number(fieldValueForComparison) === Number(compareValue);
        }
        // Otherwise do a string comparison
        return fieldValueForComparison === compareValue;
      case '!=':
        // Use loose inequality for numeric values
        if (typeof fieldValueForComparison === 'number' || typeof compareValue === 'number') {
          // If either side is a number, compare numerically
          return Number(fieldValueForComparison) !== Number(compareValue);
        }
        // Otherwise do a string comparison
        return fieldValueForComparison !== compareValue;
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