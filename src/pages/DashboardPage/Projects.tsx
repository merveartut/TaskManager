import { CirclePlus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { projectStatusColors } from "../../constants/uiColors";

interface Project {
  id: string;
  title: string;
  description: string;
  departmentName: string;
  teamMembers: string;
  status?: string;
}

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const modalFields = [
    { name: "title", label: "Title", type: "text" },
    { name: "description", label: "Description", type: "text" },
    { name: "departmentName", label: "Department Name", type: "text" },
    {
      name: "teamMembers",
      label: "Team Members",
      type: "picker",
      options: users,
    }, // Pass users as options
  ];

  const checkAuthToken = (response: Response) => {
    if (response.status === 401) {
      localStorage.removeItem("token"); // Remove invalid token
      navigate("/login");
      return true; // Return true if the user should be logged out
    }
    return false; // Return false if everything is fine
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/projects/v1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (checkAuthToken(response)) return;

        if (!response.ok) {
          throw new Error("Failed to fetch projects");
        }

        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
        alert("Error loading projects");
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users/v1", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (checkAuthToken(response)) return;

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchProjects();
    fetchUsers();
  }, [navigate]);

  const handleCreateProject = async (formData: Record<string, any>) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:8080/api/projects/v1", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create project");
      }

      const newProject = await response.json();
      setProjects([...projects, newProject]); // Update project list
      setIsModalOpen(false); // Close modal
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Error creating project");
    }
  };

  return (
    <div className="w-full h-full flex  flex-col">
      <div className="flex justify-start p-8">
        <h1 className="text-2xl font-bold mb-4">Projects</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 p-8">
        <div
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <h2 className="text-xl font-semibold mb-6">Create new Project</h2>
          <CirclePlus size={36} />
        </div>

        {projects.map((project: any) => (
          <div
            key={project.id}
            className="bg-white flex flex-col items-center p-4 gap-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/projectDetail/${project.id}`)}
          >
            <h2 className="text-xl font-semibold">{project.title}</h2>
            <p className="text-gray-600">
              Department: {project.departmentName}
            </p>
            <div
              className={`font-roboto font-bold p-2 w-fit rounded-md ${
                projectStatusColors[project?.status] || ""
              }`}
            >
              {project && project.status}
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Creating Project */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CREATE NEW PROJECT"
      >
        <Form fields={modalFields} onSubmit={handleCreateProject} />
      </Modal>
    </div>
  );
};
