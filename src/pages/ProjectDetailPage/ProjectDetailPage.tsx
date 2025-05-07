import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import {
  CircleArrowLeft,
  CirclePlus,
  DeleteIcon,
  SquarePen,
  Trash2,
} from "lucide-react";
import { Input } from "../../components/Input/Input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { fetchTeamMembersThunk } from "../../store/features/teamMembers/teamMemberSlice";
import { toast } from "react-hot-toast";
import { AppDispatch } from "../../store/store";
import {
  fetchProjectById,
  fetchUsers,
  fetchTasksByProjectId,
  createTask,
  updateProject,
  deleteProject,
} from "../../services/projectApi";
import { Select } from "../../components/Select/Select";
import { Avatar, AvatarGroup, ButtonGroup, Divider } from "@mui/material";
import { projectStatusColors, stateColors } from "../../constants/uiColors";
import { TooltipHint } from "../../components/Tooltip/TooltipHint";

interface Project {
  id: string;
  title: string;
  description: string;
  departmentName: string;
  projectManager: any;
  teamMembers: any[];
  status?: string;
}

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [project, setProject] = useState<Project>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchByTitle, setSearchByTitle] = useState("");
  const [selectedTaskState, setSelectedTaskState] = useState<string>("");
  const teamMembers = useSelector(
    (state: RootState) => state.teamMembers.teamMembers
  );
  const userRole = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");

  const isProjectManager = project?.projectManager.id === userId;
  const modalFields = [
    { name: "title", label: "Title", type: "text", visible: true },
    { name: "description", label: "Description", type: "text", visible: true },
    {
      name: "priority",
      label: "Priority",
      type: "picker",
      visible: true,
      isSingleSelect: true,
      options: ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    },
    {
      name: "assignee",
      label: "Assignee",
      type: "picker",
      visible: true,
      isSingleSelect: true,
      options: teamMembers,
    }, // Pass users as options
  ];

  const updateModalFields = [
    { name: "title", label: "Title", type: "text", visible: true },
    { name: "description", label: "Description", type: "text", visible: true },
    {
      name: "departmentName",
      label: "Department Name",
      type: "text",
      visible: true,
    },
    {
      name: "status",
      label: "Status",
      type: "picker",
      isSingleSelect: true,
      visible: true,
      options: ["IN_PROGRESS", "CANCELLED", "COMPLETED"],
    },
    {
      name: "projectManager",
      label: "Project Manager",
      type: "picker",
      visible: userRole === "ADMIN",
      isSingleSelect: true,
      options: users.filter((user) => user.role === "PROJECT_MANAGER"),
    },
    {
      name: "teamMembers",
      label: "Team Members",
      type: "picker",
      visible: true,
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
        setIsUpdateModalOpen(false);
        toast.success("Project updated successfully!");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task");
    }
  };
  const handleDeleteProject = async () => {
    try {
      await deleteProject(id, navigate);
      setIsDeleteModalOpen(false);
      toast.success("Project deleted successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project");
      setIsDeleteModalOpen(false);
    }
  };
  useEffect(() => {
    if (!id) return;
    localStorage.setItem("currentProjectId", id);
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

        dispatch(fetchTeamMembersThunk(id));
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Error loading data");
      }
    };

    loadData();
  }, [id, dispatch]);

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
            <TooltipHint text="Go Back To Projects">
              <button
                onClick={() => navigate(-1)} // update route if needed
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                <CircleArrowLeft />
              </button>
            </TooltipHint>
          </div>
          <div className="flex flex-row">
            <div className="rounded-lg px-8 py-4 items-center flex rounded-b-none align-middle gap-2">
              <h1 className="text-[24px] font-bold font-roboto">
                {project && project.title}
              </h1>
            </div>

            {project && (isProjectManager || userRole === "ADMIN") && (
              <div className="flex items-start py-8 gap-4">
                <TooltipHint text="Update Project">
                  <button onClick={() => setIsUpdateModalOpen(true)}>
                    <SquarePen size={24} />
                  </button>
                </TooltipHint>
                <TooltipHint text="Delete Project">
                  <button onClick={() => setIsDeleteModalOpen(true)}>
                    <Trash2></Trash2>
                  </button>
                </TooltipHint>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-row w-full gap-[160px] align-middle">
          <div className="flex flex-col items-start align-middle px-8 py-4 gap-6">
            <h2 className="text-lg font-roboto">Department</h2>
            <span className="font-roboto font-bold">
              {project && project.departmentName}
            </span>
          </div>

          <div className="flex flex-col items-start align-middle px-8 py-4 gap-4">
            <h2 className="text-lg font-roboto">Status</h2>
            <div
              className={`font-roboto font-bold p-2 rounded-md ${
                projectStatusColors[project?.status] || ""
              }`}
            >
              {project && project.status}
            </div>
          </div>

          <div className="flex flex-col items-start align-middle px-8 py-4 gap-6">
            <h2 className="text-lg font-roboto">Project Manager</h2>
            <span className="font-roboto font-bold">
              {project && project.projectManager.name}
            </span>
          </div>

          <div className="flex flex-col items-start align-middle px-8 py-4 gap-4">
            <h2 className="text-lg font-roboto">Team Members</h2>
            <AvatarGroup max={4}>
              {teamMembers &&
                teamMembers.map((member, index) => (
                  <TooltipHint key={index} text={member.name}>
                    <Avatar
                      alt={member.name}
                      src="/static/images/avatar/1.jpg"
                    />
                  </TooltipHint>
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
        {project && (isProjectManager || userRole === "ADMIN") && (
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 className="text-xl font-roboto font-semibold mb-6">
              Create new Task
            </h2>
            <CirclePlus size={36} />
          </div>
        )}
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
            status: project?.status,
            projectManager: project?.projectManager,
            departmentName: project?.departmentName,
            teamMembers: project?.teamMembers, // Ensure `assignee` exists in users list
          }}
        />
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="DELETE PROJECT"
      >
        <span>Are you sure you want to delete this project ?</span>
        <div className="flex flex-row justify-end gap-6">
          <button
            type="submit"
            className="mt-4 bg-slate-500 text-white py-2 px-4 rounded"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            No
          </button>
          <button
            type="submit"
            className="mt-4 bg-blue-700 text-white py-2 px-4 rounded"
            onClick={handleDeleteProject}
          >
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};
