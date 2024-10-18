// src/components/CombineRulesModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

const CombineRulesModal = ({ show, handleClose, setCombinedAST }) => {
  const [existingRules, setExistingRules] = useState([]);
  const [selectedRule1, setSelectedRule1] = useState("");
  const [selectedRule2, setSelectedRule2] = useState("");
  const [manualRule1, setManualRule1] = useState("");
  const [manualRule2, setManualRule2] = useState("");
  const [operator, setOperator] = useState("AND");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Fetch existing rules when the component mounts
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

  const handleManualRule1Change = (event) => {
    setManualRule1(event.target.value);
  };

  const handleManualRule2Change = (event) => {
    setManualRule2(event.target.value);
  };

  const handleOperatorChange = (event) => {
    setOperator(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const body = {
        rules: [selectedRule1 || manualRule1, selectedRule2 || manualRule2],
        operator,
      };

      const response = await axios.post(
        `${BACKEND_API_URL}/rule/combine`,
        body
      );
      setMessage("Combined rule created successfully.");
      setIsError(false);
      setCombinedAST(response.data.combinedAST); // Set combined AST in the parent component
      handleClose(); // Close the modal
      // Reset the form
      setManualRule1("");
      setManualRule2("");
      setSelectedRule1("");
      setSelectedRule2("");
    } catch (error) {
      setMessage(
        `Error: ${error.response.data.message || "Failed to combine rules"}`
      );
      setIsError(true);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Combine Rules</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="d-flex flex-column gap-4 p-3">
          <div>
            <div className="form-group p-2">
              <div className="mb-2">
                <strong>Rule 1</strong>
              </div>
              <label htmlFor="existingRule1">Select Existing Rule:</label>
              <select
                className="form-control mb-1"
                id="existingRule1"
                value={selectedRule1}
                onChange={(e) => setSelectedRule1(e.target.value)}
              >
                <option value="">-- Select --</option>
                {existingRules.map((rule) => (
                  <option key={rule._id} value={rule.rule}>
                    {rule.rule}
                  </option>
                ))}
              </select>
              <label htmlFor="manualRule1">OR Enter:</label>
              <input
                type="text"
                className="form-control"
                id="manualRule1"
                value={manualRule1}
                onChange={handleManualRule1Change}
                placeholder="Enter Rule 1"
              />
            </div>
            <div className="form-group p-2">
              <div className="mb-2">
                <strong>Rule 2</strong>
              </div>
              <label htmlFor="existingRule2">Select Existing Rule:</label>
              <select
                className="form-control mb-1"
                id="existingRule2"
                value={selectedRule2}
                onChange={(e) => setSelectedRule2(e.target.value)}
              >
                <option value="">-- Select --</option>
                {existingRules.map((rule) => (
                  <option key={rule._id} value={rule.rule}>
                    {rule.rule}
                  </option>
                ))}
              </select>
              <label htmlFor="manualRule2">OR Enter:</label>
              <input
                type="text"
                className="form-control"
                id="manualRule2"
                value={manualRule2}
                onChange={handleManualRule2Change}
                placeholder="Enter Rule 2"
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <strong>Operator:</strong>
            </label>
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
        `}</style>
        {message && (
          <div
            className={`alert mt-3 ${
              isError ? "alert-danger" : "alert-success"
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CombineRulesModal;
