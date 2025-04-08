import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTaskById } from "../../services/projectApi";
import { Editor } from "primereact/editor";
import { FileUploader } from "../../components/FileUpload/FileUploader";

interface Task {
  id: string;
  title: string;
  description: string;
  state?: string;
  priority: string;
  assignee?: any;
}

export const TaskDetailPage = () => {
  const { id } = useParams();
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  const [task, setTask] = useState<Task>();
  const [commentText, setCommentText] = useState("");
  const [files, setFiles] = useState<any>();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [taskData] = await Promise.all([getTaskById(id, navigate)]);

        setTask(taskData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Error loading data");
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const fetchFiles = async () => {
      const res = await fetch(
        `http://localhost:8080/api/attachments/v1/task?taskId=${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setFiles(data);
    };
    fetchFiles();
  }, [id]);

  return (
    <div className="w-full h-full flex  flex-col">
      {task && (
        <div>
          <div className="flex flex-col items-start justify-start p-8">
            <h1 className="text-2xl font-bold mb-4">{task.title}</h1>
            <h2 className="text-l font-bold mb-4">
              Assignee: {task.assignee.name}
            </h2>
            <h2 className="text-l font-bold mb-4">Status: {task.state}</h2>
          </div>

          <div className="flex justify-start p-8">
            <h2 className="text-xl mb-4">{task.description}</h2>
          </div>
          <div>
            <h2>Attachemnts</h2>
            <ul>{files && files.map((file) => <li>{file.filePath}</li>)}</ul>
            <FileUploader taskId={id} userId={userId} />
          </div>
          <div style={{ height: "120px", width: "800px" }}>
            <Editor
              value={commentText}
              onTextChange={(e) => setCommentText(e.htmlValue)}
              style={{ height: "120px", width: "800px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
