import React, { useState, useEffect } from "react";
import { Collapse } from "react-bootstrap";
import axios from "axios";
import Tree from "react-d3-tree";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faDiagramProject, faPlusCircle } from "@fortawesome/free-solid-svg-icons";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

const CombineRules = ({handleClose = () => {}, setCombinedAST = () => {} }) => {
  const [existingRules, setExistingRules] = useState([]);
  const [rules, setRules] = useState([{ selectedRule: "", manualRule: "" }]);
  const [operator, setOperator] = useState("AND");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [ast, setAst] = useState(null);
  const [openAST, setOpenAST] = useState(false);
  const [openTree, setOpenTree] = useState(false);

  useEffect(() => {
    const fetchExistingRules = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/rule/existing`);
        setExistingRules(response.data);
      } catch (error) {
        console.error("Error fetching existing rules:", error);
      }
    };

    fetchExistingRules();
  }, []);

  // Handle adding a new rule input field
  const addRuleField = () => {
    setRules([...rules, { selectedRule: "", manualRule: "" }]);
  };

  // Handle changes in rule selection or manual input for a specific rule
  const handleRuleChange = (index, field, value) => {
    const updatedRules = rules.map((rule, i) =>
      i === index ? { ...rule, [field]: value } : rule
    );
    setRules(updatedRules);
  };

  const handleOperatorChange = (event) => {
    setOperator(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Prepare the list of rules for the backend
      const rulesArray = rules.map(
        (rule) => rule.selectedRule || rule.manualRule
      );

      const body = {
        rules: rulesArray,
        operator,
      };

      const response = await axios.post(
        `${BACKEND_API_URL}/rule/combine`,
        body
      );
      setMessage(`Combined rule created successfully.`);
      setIsError(false);
      setAst(response.data.combinedAST);
      setCombinedAST(response.data.combinedAST);
      handleClose();
      setRules([{ selectedRule: "", manualRule: "" }]);
    } catch (error) {
      setMessage(
        `Error: ${error.response?.data?.message || "Failed to combine rules"}`
      );
      setIsError(true);
      setAst(null);
    }
  };

  // Convert AST to a format suitable for react-d3-tree
  const convertToD3TreeData = (node) => {
    if (!node) return null;

    return {
      name: node.value || node.type,
      children: [node.left, node.right]
        .map(convertToD3TreeData)
        .filter((child) => child),
    };
  };

  const treeData = ast ? convertToD3TreeData(ast) : null;

  return (
    <div className="container my-5">
      <div
        className="p-5 rounded shadow border-0 mt-4"
        style={{ background: "#e7f0ff" }}
      >
        <h3>Combine Rules</h3>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4 p-3">
          {rules.map((rule, index) => (
            <div className="d-flex flex-column gap-3" key={index}>
              <h5>Rule {index+1}</h5>
              <div className="form-group mb-2 w-100 d-flex flex-row justify-content-between gap-2">
                <div className="w-50">
                <label htmlFor={`existingRule${index}`}>Select Existing:</label>
                <select
                  className="form-control mt-1"
                  id={`existingRule${index}`}
                  value={rule.selectedRule}
                  onChange={(e) =>
                    handleRuleChange(index, "selectedRule", e.target.value)
                  }
                >
                  <option value="">-- Select --</option>
                  {existingRules.map((rule) => (
                    <option key={rule._id} value={rule.rule}>
                      {rule.rule}
                    </option>
                  ))}
                </select>
                </div>
                <div className="w-50">
                <label htmlFor={`manualRule${index}`}>OR Enter:</label>
                <input
                  type="text"
                  className="form-control mt-1"
                  id={`manualRule${index}`}
                  value={rule.manualRule}
                  onChange={(e) =>
                    handleRuleChange(index, "manualRule", e.target.value)
                  }
                  placeholder={`Enter Rule ${index + 1}`}
                />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="add-rule-button"
            onClick={addRuleField}
          >
            <FontAwesomeIcon icon={faPlusCircle} className="me-2" />
            Add Another Rule
          </button>

          <div className="form-group">
            <label>Operator:</label>
            <div className="mt-2">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="operator"
                  id="operatorAnd"
                  value="AND"
                  checked={operator === "AND"}
                  onChange={handleOperatorChange}
                />
                <label className="form-check-label" htmlFor="operatorAnd">
                  AND
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="operator"
                  id="operatorOr"
                  value="OR"
                  checked={operator === "OR"}
                  onChange={handleOperatorChange}
                />
                <label className="form-check-label" htmlFor="operatorOr">
                  OR
                </label>
              </div>
            </div>
          </div>
          <button type="submit" className="submit-button">
            Combine Rules
          </button>
        </form>
      </div>

      {message && (
        <div
          className={`alert mt-3 ${isError ? "alert-danger" : "alert-success"}`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="d-flex flex-row justify-content-between py-2">
        {ast && (
          <button
            onClick={() => setOpenAST(!openAST)}
            aria-controls="collapse-ast"
            aria-expanded={openAST}
            className="collapse-button mt-3"
            style={{
              backgroundColor: !openAST ? "#0a48b2" : "#aaa",
            }}
          >
            <FontAwesomeIcon icon={faCode} className="me-2" />
            {openAST ? "Hide AST" : "View AST"}
          </button>
        )}

        {treeData && (
          <button
            onClick={() => setOpenTree(!openTree)}
            aria-controls="collapse-tree"
            aria-expanded={openTree}
            className="collapse-button mt-3"
            style={{
              backgroundColor: !openTree ? "#0a48b2" : "#aaa",
            }}
          >
            <FontAwesomeIcon icon={faDiagramProject} className="me-2" />
            {openTree ? "Hide Graphical AST" : "View Graphical AST"}
          </button>
        )}
      </div>

      <div>
        {ast && (
          <Collapse in={openAST}>
            <div
              id="collapse-ast"
              className="card border-0 rounded shadow p-5 my-5"
            >
              <h5 className="mb-4">Generated AST:</h5>
              <pre
                className="rounded shadow p-3"
                style={{ background: "whiteSmoke" }}
              >
                {JSON.stringify(ast, null, 2)}
              </pre>
            </div>
          </Collapse>
        )}
        {treeData && (
          <Collapse in={openTree}>
            <div
              id="collapse-tree"
              className="card border-0 rounded shadow p-5 my-5"
            >
              <h5 className="mb-4">Graphical Representation of AST:</h5>
              <div
                className="rounded shadow p-3"
                style={{
                  width: "100%",
                  height: "500px",
                  background: "whiteSmoke",
                }}
              >
                <Tree data={treeData} />
              </div>
            </div>
          </Collapse>
        )}
      </div>

      <style jsx>{`
        .submit-button {
          background-color: #0a48b2;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: ease 0.4s;
          font-weight: 500;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .submit-button:hover {
          background-color: #fff;
          color: #0a48b2;
          transform: scaleX(1.05);
        }

        .add-rule-button {
          background-color: #0a48b2;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: ease 0.4s;
          font-weight: 500;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .add-rule-button:hover {
          transform: scale(1.1);
        }

        .collapse-button {
          background-color: inherit;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: ease 0.4s;
          font-weight: 500;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .collapse-button:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default CombineRules;
