import React, { useState } from 'react'; 
import axios from 'axios';

function App() {
  const [rule, setRule] = useState('');
  const [rules, setRules] = useState(['']);
  const [ruleId, setRuleId] = useState(null);
  const [combinedRuleId, setCombinedRuleId] = useState(null);
  const [modifiedRule, setModifiedRule] = useState('');
  const [data, setData] = useState({ age: '', department: '', salary: '', experience: '' });
  const [result, setResult] = useState(null);

  const addRuleField = () => {
    setRules([...rules, '']);
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/rules/create_rule', { rule });
      setRuleId(response.data._id);
      setResult('Rule created successfully!');
    } catch (err) {
      setResult('Error creating rule.');
    }
  };

  const handleRuleModification = async (e) => {
    e.preventDefault();
    if (!ruleId) {
      setResult('No rule selected for modification.');
      return;
    }
    try {
      await axios.put(`http://localhost:3000/api/rules/modify_rule/${ruleId}`, { rule: modifiedRule });
      setResult('Rule modified successfully!');
    } catch (err) {
      setResult('Error modifying rule.');
    }
  };

  const handleEvaluation = async (e) => {
    e.preventDefault();
    try {
      let ast;
      if (ruleId) {
        const ruleResponse = await axios.get(`http://localhost:3000/api/rules/get_rule/${ruleId}`);
        ast = ruleResponse.data.ast;
      } else {
        setResult('No rule available for evaluation.');
        return;
      }
      const response = await axios.post('http://localhost:3000/api/rules/evaluate_rule', { ast, data });
      setResult(response.data.result ? 'User matches the rule' : 'User does not match the rule');
    } catch (err) {
      setResult(`Error evaluating rule: ${err.message}`);
    }
  };

  const handleCombineRules = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/rules/combine_rules', { rules });
      if (response.data._id) {
        setCombinedRuleId(response.data._id);
        setResult('Rules combined successfully!');
      } else {
        setResult('Error: No combined rule ID returned.');
      }
    } catch (err) {
      setResult('Error combining rules.');
    }
  };

  const handleCombinedRuleEvaluation = async (e) => {
    e.preventDefault();
    try {
      let ast;
      if (combinedRuleId) {
        const ruleResponse = await axios.get(`http://localhost:3000/api/rules/get_rule/${combinedRuleId}`);
        if (ruleResponse.data && ruleResponse.data.ast) {
          ast = ruleResponse.data.ast;
        } else {
          setResult('Error: No AST found for combined rule.');
          return;
        }
      } else {
        setResult('No combined rule available for evaluation.');
        return;
      }
      const response = await axios.post('http://localhost:3000/api/rules/evaluate_rule', { ast, data });
      setResult(response.data.result ? 'User matches the combined rule' : 'User does not match the combined rule');
    } catch (err) {
      setResult(`Error evaluating combined rule: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Result Display */}
      {result && (
  <div
    className={`text-center p-4 rounded mb-6 shadow-md ${
      result.toLowerCase().includes('no') || result.toLowerCase().includes('error')
        ? 'bg-red-100 border border-red-300 text-red-800'  // Red tone for errors/negative results
        : 'bg-blue-100 border border-blue-300 text-blue-800' // Blue tone for success
    }`}
  >
    <h3 className="text-xl font-bold">Result: {result}</h3>
  </div>
)}

      <h1 className="text-3xl font-bold mb-6 text-center">Rule Engine</h1>

      <form onSubmit={handleRuleSubmit} className="mb-6 p-4 bg-white rounded shadow-md">
        <label className="block text-lg font-semibold mb-2">
          Rule String:
          <input
            type="text"
            value={rule}
            onChange={(e) => setRule(e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          />
        </label>
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded mt-4">Create Rule</button>
      </form>

      <form onSubmit={handleRuleModification} className="mb-6 p-4 bg-white rounded shadow-md">
        <h3 className="text-lg font-semibold mb-2">Modify Rule</h3>
        <label className="block text-lg font-semibold mb-2">
          Modified Rule String:
          <input
            type="text"
            value={modifiedRule}
            onChange={(e) => setModifiedRule(e.target.value)}
            className="w-full mt-2 p-2 border rounded"
          />
        </label>
        <button type="submit" className="w-full bg-green-500 text-white py-2 rounded mt-4">Modify Rule</button>
      </form>

      <form onSubmit={handleEvaluation} className="mb-6 p-4 bg-white rounded shadow-md">
        <h3 className="text-lg font-semibold mb-2">Evaluate Rule</h3>
        {['age', 'department', 'salary', 'experience'].map((field, index) => (
          <label key={index} className="block text-lg font-semibold mb-2">
            {field.charAt(0).toUpperCase() + field.slice(1)}:
            <input
              type={field === 'department' ? 'text' : 'number'}
              value={data[field]}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              className="w-full mt-2 p-2 border rounded"
            />
          </label>
        ))}
        <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded mt-4">Evaluate Single Rule</button>
        <button
          type="button"
          onClick={handleCombinedRuleEvaluation}
          className="w-full bg-indigo-500 text-white py-2 rounded mt-2"
        >
          Evaluate Combined Rule
        </button>
      </form>

      <form onSubmit={handleCombineRules} className="mb-6 p-4 bg-white rounded shadow-md">
        <h3 className="text-lg font-semibold mb-2">Combine Multiple Rules</h3>
        {rules.map((rule, index) => (
          <div key={index} className="mb-2">
            <label className="block text-lg font-semibold">
              Rule {index + 1}:
              <input
                type="text"
                value={rule}
                onChange={(e) => {
                  const updatedRules = [...rules];
                  updatedRules[index] = e.target.value;
                  setRules(updatedRules);
                }}
                className="w-full mt-2 p-2 border rounded"
              />
            </label>
          </div>
        ))}
        <button type="button" onClick={addRuleField} className="w-full bg-gray-500 text-white py-2 rounded mt-4">
          Add Another Rule
        </button>
        <button type="submit" className="w-full bg-purple-500 text-white py-2 rounded mt-4">Combine Rules</button>
      </form>
    </div>
  );
}

export default App;
