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

## Getting Started

1. **Clone the repository**  
   ```bash
   git clone <repo-url>
   
2. **Install dependencies**
   ```bash
    cd <repo-url/backend>
    npm install
   
3. **Create a .env file in the project root and add your MONGO_URI and backend server Port**:
   ```bash
     MONGODB_URI=<mongo-db-uri>
     PORT=3000
   
## Backend Setup
   
1. **Start the MongoDB server (if using a local instance)**.

2. **Run the beckend server**: 
   ```bash
      node server.js
   ```
   
## Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
     cd frontend
   ```

2. **Install dependencies**:
   ```bash
      npm install
   ```
3. **Start the development server**:
   ```bash
      npm run dev
   ```
     
## Usage

  - **Create Rule**: Enter rule on frontend to generate AST.
  - **Combine & Evaluate**: Combine and test eligibility with sample data

Feel free to replace `<repo-url>` and `<mongo-db-uri>` with the actual values! Let me know if you need any more changes.

