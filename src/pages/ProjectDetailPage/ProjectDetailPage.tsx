import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { CircleArrowLeft, CirclePlus, SquarePen } from "lucide-react";
import { Input } from "../../components/Input/Input";
import {
  fetchProjectById,
  fetchUsers,
  fetchTasksByProjectId,
  createTask,
  getTeamMembers,
  updateProject,
} from "../../services/projectApi";
import { Select } from "../../components/Select/Select";
import { Avatar, AvatarGroup, Divider } from "@mui/material";
import { projectStatusColors, stateColors } from "../../constants/uiColors";

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
  const [teamMembers, setTeamMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
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

  const updateModalFields = [
    { name: "title", label: "Title", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "departmentName", label: "Department Name", type: "text" },
    {
      name: "status",
      label: "Status",
      type: "picker",
      options: ["IN_PROGRESS", "CANCELLED", "COMPLETED"],
    },
    {
      name: "teamMembers",
      label: "Team Members",
      type: "picker",
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
  const handleUpdateProject = async (formData: any) => {
    const fullData = {
      ...formData,
      id: id,
    };

    try {
      const updatedProject = await updateProject(fullData, navigate);
      if (updatedProject) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task");
    }
  };
  useEffect(() => {
    if (!id) return;
    localStorage.setItem("currentProjectId", id);
    const loadData = async () => {
      try {
        const [tasksData, usersData, projectData, teamMembersData] =
          await Promise.all([
            fetchTasksByProjectId(id, navigate),
            fetchUsers(navigate),
            fetchProjectById(id, navigate),
            getTeamMembers(id, navigate),
          ]);

        setTasks(tasksData);
        setUsers(usersData);
        setProject(projectData);
        setTeamMembers(teamMembersData);
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
      task.state &&
      (task.state.toString().includes(selectedTaskState) ||
        selectedTaskState === "ALL")
    );
  });

  return (
    <div className="w-full h-full flex  flex-col">
      <div className="flex flex-col items-start justify-start p-8">
        <div className="flex flex-row align-middle gap-2">
          <div className="left-32 py-4 items-center flex">
            <button
              onClick={() => navigate(-1)} // update route if needed
              className="text-blue-600 hover:text-blue-800 font-semibold underline"
            >
              <CircleArrowLeft />
            </button>
          </div>
          <div className="flex flex-row">
            <div className="rounded-lg px-8 py-4 items-center flex rounded-b-none align-middle gap-2">
              <h1 className="text-[24px] font-bold font-roboto">
                {project && project.title}
              </h1>
            </div>
            <div className="flex items-start py-8">
              <button onClick={() => setIsUpdateModalOpen(true)}>
                <SquarePen size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row w-full gap-[160px] align-middle">
          <div className="flex flex-col items-start align-middle px-8 py-4 gap-6">
            <h2 className="text-lg font-roboto">Department</h2>
            <span className="font-roboto font-bold">
              {project && project.departmentName}
            </span>
          </div>

          <div className="flex flex-col items-start align-middle px-8 py-4 gap-6">
            <h2 className="text-lg font-roboto">Status</h2>
            <div
              className={`font-roboto font-bold p-2 rounded-md ${
                projectStatusColors[project?.status] || ""
              }`}
            >
              {project && project.status}
            </div>
          </div>
          <div className="flex flex-col items-start align-middle px-8 py-4 gap-4">
            <h2 className="text-lg font-roboto">Team Members</h2>
            <AvatarGroup max={4}>
              {teamMembers.map((member, index) => (
                <Avatar
                  key={index}
                  alt={member.name}
                  src="/static/images/avatar/1.jpg"
                />
              ))}
            </AvatarGroup>
          </div>
        </div>
      </div>

      <div className="flex justify-start p-8">
        <h2 className="text-xl mb-4 font-roboto">
          {project && project.description}
        </h2>
      </div>
      <Divider></Divider>
      <div className="flex flex-row justify-between items-center p-8">
        <h1 className="text-[24px] font-bold px-8 font-roboto">Tasks</h1>
        <div className="flex flex-row gap-4">
          <Input
            label="Search by title"
            type="text"
            name="title"
            variant="outlined"
            customClass="bg-white rounded-md"
            value={searchByTitle}
            onChange={(e) => setSearchByTitle(e.target.value)}
          ></Input>
          <Select
            options={[
              "ALL",
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
            customClass="bg-white rounded-md w-[200px]"
            label="Filter By State"
          ></Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-8">
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h2 className="text-xl font-roboto font-semibold mb-6">
            Create new Task
          </h2>
          <CirclePlus size={36} />
        </div>

        {filteredTasks.map((task: any) => (
          <div
            key={task.id}
            className="bg-white flex flex-col p-4 items-center rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/taskDetail/${task.id}`)}
          >
            <h2 className="text-xl font-roboto font-semibold">{task.title}</h2>
            <p className="text-gray-600 font-roboto mt-4">
              Assignee: {task.assignee.name}
            </p>
            <div
              className={`text-gray-600 mt-4 font-roboto font-bold w-fit p-2 rounded-md ${
                stateColors[task.state] || ""
              }`}
            >
              {task.state}
            </div>
          </div>
        ))}
      </div>
      {/* Modal for Creating Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CREATE NEW TASK"
      >
        <Form fields={modalFields} onSubmit={handleCreateTask} />
      </Modal>

      {/* Modal for Updating Project */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="UPDATE PROJECT"
      >
        <Form
          fields={updateModalFields}
          onSubmit={handleUpdateProject}
          initialValues={{
            title: project?.title,
            description: project?.description,
            state: project?.status,
            departmentName: project?.departmentName,
            teamMembers: project?.teamMembers, // Ensure `assignee` exists in users list
          }}
        />
      </Modal>
    </div>
  );
};
