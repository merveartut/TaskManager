import { CirclePlus, Delete } from "lucide-react";
import React, { useState } from "react";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { createUser } from "../../services/projectApi";
import { useNavigate } from "react-router-dom";

export const SettingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const modalFields = [
    { name: "name", label: "Name", type: "text" },
    { name: "password", label: "Password", type: "text" },
    {
      name: "role",
      label: "Role",
      type: "picker",
      isSingleSelect: true,
      options: ["PROJECT_MANAGER", "TEAM_LEADER", "TEAM_MEMBER"],
    },
  ];

  const handleCreateUser = async (formData: any) => {
    try {
      const newUser = await createUser(formData, navigate);
      if (newUser) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error creating user");
    }
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-8">
      <div
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      >
        <h2 className="text-xl font-roboto font-semibold mb-6">Add New User</h2>
        <CirclePlus size={36} />
      </div>
      <div
        onClick={() => setIsModalOpen(true)}
        className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      >
        <h2 className="text-xl font-roboto font-semibold mb-6">Delete User</h2>
        <Delete size={36} />
      </div>
      {/* Modal for Creating Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CREATE NEW USER"
      >
        <Form fields={modalFields} onSubmit={handleCreateUser} />
      </Modal>
    </div>
  );
};
