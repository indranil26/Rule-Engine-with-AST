# Rule Engine with AST

A simple rule engine for eligibility determination based on attributes like age, department, income, and spend, using an Abstract Syntax Tree (AST).

## Features
- **Dynamic Rule Creation**: Create rules as ASTs.
- **Rule Combination**: Combine multiple AST rules.
- **Rule Evaluation**: Evaluate rules against user attributes.

## API Endpoints

- **Create Rule**: `POST /api/rules/create_rule`
  - **Body**: `{ rule: "<rule_string>" }`
  
- **Combine Rules**: `POST /api/rules/combine_rules`
  - **Body**: `{ rules: ["<rule_string1>", "<rule_string2>"] }`
  
- **Evaluate Rule**: `POST /api/rules/evaluate_rule`
  - **Body**: `{ ast: <AST>, data: { age, department, salary, experience } }`

## Setup

1. **Clone and Install**  
   ```bash
   git clone <repo-url>
   cd <repo-folder/backend> && npm install
   cd frontend && npm install
2. **Configure Environment**
   Create .env in backend:
   ```
     MONGODB_URI=<mongo-db-uri>
     PORT=3000
4. **Run Application**
   -Backend:
   ```
     node server.js
   ```
   -Frontend:
   ```
     npm run dev`
   ```
## Usage
  -**Create Rule**: Enter rule on frontend to generate AST.
  -**Combine & Evaluate**: Combine and test eligibility with sample data


Feel free to replace `<repo-url>` and `<mongo-db-uri>` with the actual values! Let me know if you need any more changes.

