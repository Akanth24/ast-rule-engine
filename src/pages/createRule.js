import React, { useState } from "react";
import axios from "axios";
import Tree from "react-d3-tree";
import { Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faDiagramProject, faPlus } from "@fortawesome/free-solid-svg-icons";
const BACKEND_API_URL = process.env.BACKEND_API_URL;

const CreateRule = () => {
  const [rule, setRule] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [ast, setAst] = useState(null); // State to hold the AST
  const [openAST, setOpenAST] = useState(false); // State for controlling AST collapse
  const [openTree, setOpenTree] = useState(false); // State for controlling Tree collapse

  const handleInputChange = (event) => {
    setRule(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_API_URL}/rule/create`, {
        rule,
      });
      setMessage(`Rule created successfully: ${response.data.rule}`);
      setIsError(false);
      setAst(response.data.ast); // Store the AST in the state
      setRule("");
    } catch (error) {
      setMessage(
        `Error: ${error.response.data.message || "Failed to create rule"}`
      );
      setIsError(true);
      setAst(null); // Reset AST on error
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
    <div className="container mt-5">
      <h2>Create a Rule</h2>
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded shadow border-0 mt-4"
        style={{ background: "#e7f0ff" }}
      >
        <div className="form-group d-flex flex-row align-items-center gap-3 mb-3">
          <label htmlFor="ruleInput" style={{ fontSize: 18 }}>
            Rule:
          </label>
          <input
            type="text"
            className="text-area form-control "
            id="ruleInput"
            value={rule}
            onChange={handleInputChange}
            placeholder="Enter the Rule."
            required
          />
        </div>
        <button type="submit" className="create-button mt-2">
        <FontAwesomeIcon icon={faPlus}  className="me-2"/>Create Rule
        </button>
      </form>

      {message && (
        <div
          className={`alert mt-4 p-4 ${
            isError ? "alert-danger" : "alert-success"
          }`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="d-flex flex-row justify-content-between py-2 ">
        {/* Show AST section only if ast is present */}
        {ast && (
            <button
              onClick={() => setOpenAST(!openAST)}
              aria-controls="collapse-ast"
              aria-expanded={openAST}
              className="collapse-button mt-3"
              style={{
                backgroundColor : !openAST ? '#0a48b2' : '#aaa'
              }}
            >
              <FontAwesomeIcon icon={faCode} className="me-2" /> {openAST ? "Hide AST" : "View AST"}
            </button>
        )}

        {/* Show Tree section only if treeData is present */}
        {treeData && (
            <button
              onClick={() => setOpenTree(!openTree)}
              aria-controls="collapse-tree"
              aria-expanded={openTree}
              className="collapse-button mt-3"
              style={{
                backgroundColor : !openTree ? '#0a48b2' : '#aaa'
              }}
            >
              <FontAwesomeIcon icon={faDiagramProject} className="me-2" /> {openTree
                ? "Hide Graphical AST"
                : "View Graphical AST"}
            </button>
        )}
      </div>
      <div>
        {ast && <Collapse in={openAST}>
            <div id="collapse-ast" className="card border-0 rounded shadow p-5 my-5">
                <h5 className="mb-4">Generated AST:</h5>
                <pre className="rounded shadow p-3" style={{background:'whiteSmoke'}}>{JSON.stringify(ast, null, 2)}</pre>
            </div>
        </Collapse>}
        {treeData && <Collapse in={openTree}>
            <div id="collapse-tree" className="card border-0 rounded shadow p-5 my-5">
                <h5 className="mb-4">Graphical Representation of AST:</h5>
                <div className="rounded shadow p-3" style={{ width: "100%", height: "500px",background:'whiteSmoke' }}>
                    <Tree data={treeData} />
                </div>
            </div>
        </Collapse>}
      </div>

      <style jsx>{`
        .create-button {
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

        .create-button:hover {
          background-color: #fff;
          color: #0a48b2;
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

export default CreateRule;
