import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import Tree from "react-d3-tree";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCode,
  faDiagramProject,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";

const BACKEND_API_URL = process.env.BACKEND_API_URL;

const HomePage = () => {
  const router = useRouter();
  const [rules, setRules] = useState([]); // State to hold the list of rules
  const [showASTModal, setShowASTModal] = useState(false); // State to control AST Modal
  const [showGraphicalModal, setShowGraphicalModal] = useState(false); // State to control Graphical Modal
  const [selectedAST, setSelectedAST] = useState(null); // State to hold selected AST
  const [selectedTreeData, setSelectedTreeData] = useState(null); // State to hold selected tree data for graphical AST
  const [editRule, setEditRule] = useState(null); // Track the rule being edited
  const [showEditModal, setShowEditModal] = useState(false); // For edit modal
  const [newRule, setNewRule] = useState(""); // For updating rule in modal
  useEffect(() => {
    // Fetch the list of rules from the backend
    const fetchRules = async () => {
      try {
        const response = await axios.get(`${BACKEND_API_URL}/rule/existing`);
        setRules(response.data);
      } catch (error) {
        console.error("Error fetching rules:", error);
      }
    };

    fetchRules();
  }, []);

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

  // Handle opening the AST modal
  const handleASTModalOpen = (ast) => {
    setSelectedAST(ast);
    setShowASTModal(true);
  };

  // Handle closing the AST modal
  const handleASTModalClose = () => {
    setSelectedAST(null);
    setShowASTModal(false);
  };

  // Handle opening the Graphical AST modal
  const handleGraphicalModalOpen = (ast) => {
    const treeData = convertToD3TreeData(ast);
    setSelectedTreeData(treeData);
    setShowGraphicalModal(true);
  };

  // Handle closing the Graphical AST modal
  const handleGraphicalModalClose = () => {
    setSelectedTreeData(null);
    setShowGraphicalModal(false);
  };

  // Handle navigation to the create rule page
  const handleCreateRule = () => {
    router.push("/createRule"); // Navigates to the create rule page
  };

  // Handle delete rule
  const handleDeleteRule = async (ruleId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0a48b2",
      cancelButtonColor: "#f81b1b",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${BACKEND_API_URL}/rule/${ruleId}`);
          setRules(rules.filter((rule) => rule._id !== ruleId)); // Remove deleted rule from the list

          Swal.fire("Deleted!", "Your rule has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting rule:", error);
          Swal.fire("Error!", "Failed to delete the rule.", "error");
        }
      }
    });
  };

  // Handle opening the edit modal
  const handleEditModalOpen = (rule) => {
    setEditRule(rule);
    setNewRule(rule.rule);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditRule(null);
    setNewRule("");
  };

  // Handle edit rule submit
  const handleEditSubmit = async () => {
    try {
      const updatedRule = { rule: newRule }; // Prepare updated rule
      await axios.put(`${BACKEND_API_URL}/rule/${editRule._id}`, updatedRule);

      // Update the rules list with the edited rule
      const updatedRules = rules.map((r) =>
        r._id === editRule._id ? { ...r, rule: newRule } : r
      );
      setRules(updatedRules);

      Swal.fire("Success!", "Rule has been updated.", "success");
      handleEditModalClose();
    } catch (error) {
      Swal.fire("Error!", "Failed to update the rule.", "error");
    }
  };

  return (
    <div className="container my-5">
      <h2>List of Rules</h2>
      <div
        className="row p-4 rounded mt-4"
        style={{ backgroundColor: "#e7f0ff" }}
      >
        {rules.length === 0 ? (
          <div className="text-center mt-5">
            <h4>No rules available</h4>
            <button onClick={handleCreateRule} className="create-button mt-3">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create a New Rule
            </button>
          </div>
        ) : (
          rules.map((rule, index) => (
            <div className="col-md-4" key={rule._id}>
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <Card.Title className="d-flex flex-row justify-content-between">
                    {`Rule ${index + 1}`}
                    <div>
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditModalOpen(rule)}
                        className="edit-delete-button mr-2"
                        style={{color:'#0a48b2'}} 
                      >
                        <FontAwesomeIcon icon={faPen} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteRule(rule._id)}
                        className="edit-delete-button"
                        style={{color:'#f81b1b'}} 
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </Card.Title>
                  <Card.Text className="mt-4">{rule.rule}</Card.Text>

                  <div className="d-flex flex-row justify-content-between mt-5">
                    {/* Button to open the AST modal */}
                    <button
                      onClick={() => handleASTModalOpen(rule.ast)}
                      className="view-button"
                      style={{ backgroundColor: "#0a48b2" }}
                    >
                      <FontAwesomeIcon icon={faCode} className="me-2" /> View
                      AST
                    </button>

                    {/* Button to open the Graphical AST modal */}
                    <button
                      onClick={() => handleGraphicalModalOpen(rule.ast)}
                      className="view-button"
                      style={{ backgroundColor: "#fff", color: "#0a48b2" }}
                    >
                      <FontAwesomeIcon
                        icon={faDiagramProject}
                        className="me-2"
                      />{" "}
                      Graphical AST
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </div>
          ))
        )}
      </div>

      {/* AST Modal */}
      <Modal show={showASTModal} onHide={handleASTModalClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Abstract Syntax Tree (AST)</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAST && (
            <pre>{JSON.stringify(selectedAST, null, 2)}</pre> // Pretty print AST JSON
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleASTModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Graphical AST Modal */}
      <Modal
        show={showGraphicalModal}
        onHide={handleGraphicalModalClose}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Graphical AST Representation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTreeData && (
            <div style={{ width: "100%", height: "500px" }}>
              <Tree data={selectedTreeData} />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleGraphicalModalClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal show={showEditModal} onHide={handleEditModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Rule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formRule">
              <Form.Label>Rule:</Form.Label>
              <Form.Control
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <button className="cancel-button" style={{backgroundColor:'#555'}} onClick={handleEditModalClose}>
            Cancel
          </button>
          <button className="save-button" style={{backgroundColor:'#0a48b2'}}onClick={handleEditSubmit}>
            Save Changes
          </button>
        </Modal.Footer>
      </Modal>

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

        .save-button,.cancel-button {
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
        .save-button:hover,.cancel-button:hover {
          transform: scale(1.1);
        }

        .view-button {
          background-color: inherit;
          color: white;
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: ease 0.4s;
          font-weight: 500;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .view-button:hover {
          transform: scale(1.1);
        }

        .edit-delete-button{
            color:inherit;
            background-color: transparent;
            border: none;
            cursor: pointer;
            transition: ease 0.4s;
        }
        .edit-delete-button:hover{
            transform: scale(1.2);
        }
      `}</style>
    </div>
  );
};

export default HomePage;
