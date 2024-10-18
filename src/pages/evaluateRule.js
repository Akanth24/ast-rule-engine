import React, { useState } from "react";
import axios from "axios";
import CombineRulesModal from "@/components/CombineRulesModal";
import { Collapse } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode, faPlus, faRepeat } from "@fortawesome/free-solid-svg-icons";
import CombineRules from "./combineRules";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

const EvaluateRule = () => {
  const [data, setData] = useState({
    age: "",
    department: "",
    salary: "",
    experience: "",
  });
  const [selectedFields, setSelectedFields] = useState({
    age: false,
    department: false,
    salary: false,
    experience: false,
  });
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [show, setShow] = useState(false);
  const [combinedAST, setCombinedAST] = useState(null); // Hold the combined AST here
  const [openAST, setOpenAST] = useState(false);

  console.log(combinedAST);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setSelectedFields((prevFields) => ({ ...prevFields, [name]: checked }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const dynamicData = {};
      Object.keys(selectedFields).forEach((field) => {
        if (selectedFields[field]) {
          dynamicData[field] = data[field];
        }
      });

      const body = {
        ast: combinedAST,
        data: dynamicData,
      };
      console.log(body);

      const response = await axios.post(
        `${BACKEND_API_URL}/rule/evaluate`,
        body
      );
      setResult(response.data.result);
      setMessage("Evaluation successful!");
      setIsError(false);
    } catch (error) {
      setResult(null);
      setMessage(
        `Error: ${error.response.data.message || "Failed to evaluate rule."}`
      );
      setIsError(true);
    }
  };

  return (
    <div className="container my-5">
      <h3>Evaluate Combined Rule</h3>
      {combinedAST ? (
        <>
          <button
            onClick={() => setOpenAST(!openAST)}
            aria-controls="collapse-ast"
            aria-expanded={openAST}
            className="collapse-button my-3"
            style={{
              backgroundColor: !openAST ? "#0a48b2" : "#aaa",
            }}
          >
            <FontAwesomeIcon icon={faCode} className="me-2" />
            {openAST ? "Hide input AST" : "Show input AST"}
          </button>
          <button
            onClick={() => setCombinedAST(null)}
            className="collapse-button ms-4 my-3"
            style={{
              backgroundColor: "#0a48b2",
            }}
          >
            <FontAwesomeIcon icon={faRepeat} className="me-2" />
            refresh
          </button>
        </>
        
      ) : (
        <button
          className="create-button my-3"
          onClick={() => setShow(!show)}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" /> Create Input AST
        </button>
      )}
      {combinedAST && (
        <Collapse in={openAST}>
          <div
            id="collapse-ast"
            className="card border-0 rounded shadow p-5 my-5"
          >
            <h5 className="mb-4">Input AST:</h5>
            <pre
              className="rounded shadow p-3"
              style={{ background: "whiteSmoke" }}
            >
              {JSON.stringify(combinedAST, null, 2)}
            </pre>
          </div>
        </Collapse>
      )}

      {show && <CombineRules
        handleClose={() => setShow(false)}
        setCombinedAST={setCombinedAST} // Pass down the setter function
      />}


      <form
        onSubmit={handleSubmit}
        className="d-flex flex-column p-5 rounded border-0 shadow"
        style={{ backgroundColor: "#e7f0ff" }}
      >
        <label>
          <h5>Select Data for Evaluation:</h5>
        </label>
        <div className="form-group d-flex flex-row justify-content-around p-2 my-3">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="age"
              name="age"
              checked={selectedFields.age}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="age">
              Age
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="department"
              name="department"
              checked={selectedFields.department}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="department">
              Department
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="salary"
              name="salary"
              checked={selectedFields.salary}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="salary">
              Salary
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="experience"
              name="experience"
              checked={selectedFields.experience}
              onChange={handleCheckboxChange}
            />
            <label className="form-check-label" htmlFor="experience">
              Experience
            </label>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-between mb-4">
          {Object.keys(selectedFields).map(
            (field) =>
              selectedFields[field] && (
                <div
                  key={field}
                  className="form-group mb-2"
                  style={{ width: "48%" }}
                >
                  <label htmlFor={field}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id={field}
                    name={field}
                    value={data[field]}
                    onChange={handleFieldChange}
                    placeholder={`Enter ${
                      field.charAt(0).toUpperCase() + field.slice(1)
                    }`}
                  />
                </div>
              )
          )}
        </div>
        <button
          type="submit"
          className="submit-button"
        >
          Evaluate
        </button>
      </form>
      {message && (
        <div
          className={`alert mt-3 ${isError ? "alert-danger" : "alert-success"}`}
          role="alert"
        >
          {message}
        </div>
      )}
      {result !== null && (
        <div
          className={`mt-4 card border-0 shadow p-4 ${
            result ? "bg-success text-white" : "bg-danger text-white"
          } d-flex flex-row gap-3`}
        >
          <h5>Evaluation Result:</h5>
          <div style={{ fontSize: 18 }}>{JSON.stringify(result)}</div>
        </div>
      )}


      <style jsx>{`
        .create-button {
          background-color: #097969;
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
          color: #097969;
          transform: scaleX(1.05);
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
          transform: scale(1.05);
        }
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
    </div>
  );
};

export default EvaluateRule;
