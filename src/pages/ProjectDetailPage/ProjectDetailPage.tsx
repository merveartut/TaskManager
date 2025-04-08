import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { CirclePlus } from "lucide-react";
import { Input } from "../../components/Input/Input";
import {
  fetchProjectById,
  fetchUsers,
  fetchTasksByProjectId,
  createTask,
} from "../../services/projectApi";
import { Select } from "../../components/Select/Select";

interface Project {
  id: string;
  title: string;
  description: string;
  departmentName: string;
  teamMembers: string;
  status?: string;
}

export const ProjectDetailPage = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [project, setProject] = useState<Project>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchByTitle, setSearchByTitle] = useState("");
  const [selectedTaskState, setSelectedTaskState] = useState<string>("");

  const modalFields = [
    { name: "title", label: "Title", type: "text" },
    { name: "description", label: "Description", type: "text" },
    {
      name: "priority",
      label: "Priority",
      type: "picker",
      isSingleSelect: true,
      options: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    },
    {
      name: "assignee",
      label: "Assignee",
      type: "picker",
      isSingleSelect: true,
      options: users,
    }, // Pass users as options
  ];

  const handleCreateTask = async (formData: any) => {
    const fullData = {
      ...formData,
      project: { id },
    };

    try {
      const newTask = await createTask(fullData, navigate);
      if (newTask) {
        setTasks((prev) => [...prev, newTask]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert("Error creating task");
    }
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [tasksData, usersData, projectData] = await Promise.all([
          fetchTasksByProjectId(id, navigate),
          fetchUsers(navigate),
          fetchProjectById(id, navigate),
        ]);

        setTasks(tasksData);
        setUsers(usersData);
        setProject(projectData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Error loading data");
      }
    };

    loadData();
  }, [id]);

  const filteredTasks = tasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(searchByTitle.toLowerCase()) &&
      task.state.includes(selectedTaskState)
    );
  });

  return (
    <div className="w-full h-full flex  flex-col">
      <div className="flex flex-col items-start justify-start p-8">
        <h1 className="text-2xl font-bold mb-4">{project && project.title}</h1>
        <h2 className="text-l font-bold mb-4">
          Department: {project && project.departmentName}
        </h2>
        <h2 className="text-l font-bold mb-4">
          Status: {project && project.status}
        </h2>
      </div>

      <div className="flex justify-start p-8">
        <h2 className="text-xl mb-4">{project && project.description}</h2>
      </div>

      <div className="flex flex-row justify-between items-center p-4 pl-8 bg-blue-900">
        <h1 className="text-2xl text-white font-bold">Tasks</h1>
        <div className="flex flex-row gap-4">
          <Input
            label="Search by title"
            type="text"
            name="title"
            variant="filled"
            customClass="bg-white rounded-md"
            value={searchByTitle}
            onChange={(e) => setSearchByTitle(e.target.value)}
          ></Input>
          <Select
            options={[
              "BACKLOG",
              "IN_ANALYSIS",
              "IN_DEVELOPMENT",
              "CANCELLED",
              "BLOCKED",
              "COMPLETED",
            ]}
            selectedValues={selectedTaskState}
            displayLabel={false}
            onChange={(selected) => setSelectedTaskState(selected)}
            isSingleSelect={true}
            customClass="bg-white rounded-md"
            label="Filter By State"
          ></Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-8">
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h2 className="text-xl font-semibold mb-6">Create new Task</h2>
          <CirclePlus size={36} />
        </div>

        {filteredTasks.map((task: any) => (
          <div
            key={task.id}
            className="bg-white flex flex-col p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/taskDetail/${task.id}`)}
          >
            <h2 className="text-xl font-semibold">{task.title}</h2>
            <p className="text-gray-600 mt-4">Status: {task.state}</p>
            <p className="text-gray-600 mt-4">Assignee: {task.assignee.name}</p>
          </div>
        ))}
      </div>
      {/* Modal for Creating Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
      >
        <Form fields={modalFields} onSubmit={handleCreateTask} />
      </Modal>
    </div>
  );
};
