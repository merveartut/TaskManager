const API_BASE = "http://localhost:8080/api";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
  "Content-Type": "application/json",
});

const handleAuthRedirect = (response: Response, navigate: any) => {
  if (response.status === 401) {
    localStorage.removeItem("token");
    navigate("/login");
    return true;
  }
  return false;
};

export const fetchProjectById = async (id: string, navigate: any) => {
  const response = await fetch(`${API_BASE}/projects/v1/${id}`, {
    headers: getAuthHeaders(),
  });
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
};

export const fetchUsers = async (navigate: any) => {
  const response = await fetch(`${API_BASE}/users/v1`, {
    headers: getAuthHeaders(),
  });
  if (handleAuthRedirect(response, navigate)) return [];
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
};

export const fetchTasksByProjectId = async (id: string, navigate: any) => {
  const response = await fetch(`${API_BASE}/tasks/project/${id}`, {
    headers: getAuthHeaders(),
  });
  if (handleAuthRedirect(response, navigate)) return [];
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
};

export const getTaskById = async (id: string, navigate: any) => {
    const response = await fetch(`${API_BASE}/tasks/v1/task/${id}`, {
        headers: getAuthHeaders(),
    });
    if (handleAuthRedirect(response, navigate)) return [];
    if (!response.ok) throw new Error("Failed to get task");
    return response.json();
}

export const createTask = async (data: any, navigate: any) => {
  const response = await fetch(`${API_BASE}/tasks/v1`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
};

export const createComment = async (data: any, navigate: any) => {
  const response = await fetch(`${API_BASE}/comments/v1/add-comment`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to create comment");
  return response.json();
}

export const fetchAttachments = async (id: string, navigate: any) => {
const response = await fetch(`${API_BASE}/attachments/v1/task?taskId=${id}`, {
  headers: getAuthHeaders(),
})
if (handleAuthRedirect(response, navigate)) return [];
if (!response.ok) throw new Error("Failed to fetch attachments");
return response.json();
}

export const fetchComments = async (id: string, navigate: any) => {
  const response = await fetch(`${API_BASE}/comments/v1/task?taskId=${id}`, {
    headers: getAuthHeaders(),
  })
  if (handleAuthRedirect(response, navigate)) return [];
  if (!response.ok) throw new Error("Failed to fetch comments");
  return response.json();
}

export const updateTask = async (data: any, navigate: any) => {
  console.log("neeee dataa", data);
  
  const response = await fetch(`${API_BASE}/tasks/v1/update`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
}

export const getTeamMembers = async (id: string, navigate:any) => {
  const response = await fetch(`${API_BASE}/projects/v1/team-members?id=${id}`, {
    headers: getAuthHeaders(),
  })
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to get team members");
  return response.json();
}

export const createUser = async (data: any, navigate:any) => {
  const response = await fetch(`${API_BASE}/users/v1`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to create user");
  return response.json();
}

export const updateProject = async (data:any, navigate:any) => {
  const response = await fetch(`${API_BASE}/projects/v1`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
  if (handleAuthRedirect(response, navigate)) return null;
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
}