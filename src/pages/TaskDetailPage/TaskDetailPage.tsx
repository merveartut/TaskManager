import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createComment,
  fetchAttachments,
  fetchComments,
  fetchUsers,
  getTaskById,
  updateTask,
} from "../../services/projectApi";
import { Editor } from "primereact/editor";
import { FileUploader } from "../../components/FileUpload/FileUploader";
import { stateColors } from "../../constants/uiColors";

import {
  Circle,
  CircleArrowLeft,
  CircleCheckBig,
  Pin,
  SquarePen,
} from "lucide-react";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { AccordionCard } from "../../components/Accordion/AccordionCard";
import { Checkbox } from "@mui/material";

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
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

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
      name: "state",
      label: "State",
      type: "picker",
      isSingleSelect: true,
      defaultValue: "BACKLOG",
      options: [
        "BACKLOG",
        "IN_ANALYSIS",
        "IN_DEVELOPMENT",
        "CANCELLED",
        "BLOCKED",
        "COMPLETED",
      ],
    },
    {
      name: "assignee",
      label: "Assignee",
      type: "picker",
      isSingleSelect: true,
      options: users,
    }, // Pass users as options
  ];

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [taskData, attachments, commentsData, usersData] =
          await Promise.all([
            getTaskById(id, navigate),
            fetchAttachments(id, navigate),
            fetchComments(id, navigate),
            fetchUsers(navigate),
          ]);

        setTask(taskData);
        setFiles(attachments);
        setComments(commentsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Error loading data");
      }
    };

    loadData();
  }, [id]);

  const handleUpdateTask = async (formData: any) => {
    const fullData = {
      ...formData,
      project: { id: localStorage.getItem("currentProjectId") },
      id: id,
    };

    try {
      const updatedTask = await updateTask(fullData, navigate);
      if (updatedTask) {
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task");
    }
  };

  const handleSendComment = async () => {
    const fullData = {
      text: commentText,
      task: { id },
      commenter: { id: userId },
    };

    try {
      const newComment = await createComment(fullData, navigate);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setCommentText("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Error creating comment");
    }
  };

  const processedFiles = useMemo(() => {
    return files?.map((file: any) => {
      const fileName = file.filePath.split(/[\\/]/).pop();
      const fileUrl = `http://localhost:8080/api/attachments/files/${fileName}`;
      const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName);
      return { ...file, fileName, fileUrl, isImage };
    });
  }, [files]);

  return (
    <div className="w-full h-full flex flex-row">
      {task && (
        <div className="w-1/2 p-6 flex flex-col gap-4">
          <div className="flex flex-row">
            <div className="left-32 py-4">
              <button
                onClick={() => navigate(-1)} // update route if needed
                className="text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                <CircleArrowLeft />
              </button>
            </div>
            <div className="flex flex-col rounded-lg w-full p-8">
              <div className="rounded-lg px-8 py-4 items-center flex rounded-b-none align-middle gap-2">
                <h1 className="text-[24px] font-bold font-roboto">
                  {task.title}
                </h1>
              </div>
              <div className="flex flex-row w-full gap-[160px] align-middle">
                <div className="flex flex-col items-start align-middle px-8 py-4 gap-6">
                  <h2 className="text-lg font-roboto">Assignee</h2>
                  <span className="font-roboto font-bold">
                    {task.assignee.name}
                  </span>
                </div>
                <div className="flex flex-col items-start align-middle px-8 py-4 gap-4">
                  <h2 className="text-lg font-roboto">Status</h2>
                  <div
                    className={`font-roboto font-bold p-2 rounded-md ${
                      stateColors[task.state] || ""
                    }`}
                  >
                    {task.state}
                  </div>
                </div>
              </div>

              <div className="flex justify-start p-8">
                <h2 className="text-lg mb-4 font-roboto">{task.description}</h2>
              </div>
            </div>
            <div className="flex items-start p-8">
              <button onClick={() => setIsModalOpen(true)}>
                <SquarePen size={24} />
              </button>
            </div>
          </div>

          <AccordionCard
            header="Attachments"
            defaultExpanded={processedFiles && processedFiles.length}
            content={
              <div className="flex flex-row p-4">
                <ul className="p-4 flex gap-2 flex-wrap overflow-auto">
                  <div className="w-fit bg-gray-200 flex items-center justify-center mb-2 p-4 rounded">
                    <FileUploader taskId={id} userId={userId} label=" " />
                  </div>
                  {processedFiles &&
                    processedFiles.map((file) => (
                      <li
                        key={file.id}
                        className="flex flex-col items-center w-32"
                      >
                        {file.isImage ? (
                          <img
                            src={file.fileUrl}
                            alt={file.fileName}
                            className="w-16 h-16 object-cover mb-2 rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 flex items-center justify-center mb-2 rounded">
                            📄
                          </div>
                        )}
                        <a
                          href={file.fileUrl}
                          download
                          className="text-xs text-blue-600 hover:underline break-words text-center font-roboto"
                        >
                          {file.fileName}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            }
          />
          <AccordionCard
            header="Comments"
            defaultExpanded={comments && comments.length}
            content={
              <div className="flex flex-col items-start p-8">
                <div className="h-fit overflow-auto mb-6">
                  <ul>
                    {comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="border w-[600px] rounded-xl shadow-sm p-4 mb-4 bg-white w-full"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-gray-800 font-roboto">
                            {comment.commenter?.name || "Unknown User"}
                          </span>
                          <div className="flex flex-col gap-2">
                            <span className="text-sm text-gray-500 font-roboto">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500 font-roboto">
                              {new Date(comment.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        <div
                          className="prose prose-sm max-w-full flex items-start"
                          dangerouslySetInnerHTML={{ __html: comment.text }}
                        />
                      </div>
                    ))}
                  </ul>
                </div>
                <div className="h-[200px] w-full flex flex-col gap-4">
                  <div className="max-h-[120px] w-full">
                    <Editor
                      value={commentText}
                      onTextChange={(e) => setCommentText(e.htmlValue)}
                      className="h-full w-full"
                    />
                  </div>

                  <div className="flex flex-row w-full justify-end mt-8">
                    <button
                      type="submit"
                      className={`mt-4 ${
                        !commentText || commentText.length === 0
                          ? "bg-zinc-300"
                          : "bg-blue-700"
                      } text-white py-1 px-4 rounded font-roboto`}
                      disabled={!commentText || commentText.length === 0}
                      onClick={handleSendComment}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )}
      <div className="w-1/2 p-6 flex flex-col gap-4">
        <div className="flex flex-col p-8 gap-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2">
          <div className="flex flex-row align-middle">
            <Pin className="rotate-45" />
            <div className="flex justify-center w-full">
              <h1 className="text-lg font-bold  font-roboto">Todos</h1>
            </div>
          </div>

          <ul>
            <li className="mb-4">
              <div className="flex flex-row justify-between items-center">
                <div className="flex align-middle h-[32px]">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                </div>
                <Checkbox
                  defaultChecked
                  icon={
                    <span className="w-[32px] h-[32px]">
                      <Circle className="w-full h-full" />
                    </span>
                  }
                  checkedIcon={
                    <span className="w-[32px] h-[32px]">
                      <CircleCheckBig className="w-full h-full" />
                    </span>
                  }
                />
              </div>
            </li>
            <li>
              <div className="flex flex-row justify-between align-middle items-center">
                <div className="flex align-middle h-[32px]">
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                </div>
                <Checkbox
                  defaultChecked
                  icon={
                    <span className="w-[32px] h-[32px]">
                      <Circle className="w-full h-full" />
                    </span>
                  }
                  checkedIcon={
                    <span className="w-[32px] h-[32px]">
                      <CircleCheckBig className="w-full h-full" />
                    </span>
                  }
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="CREATE NEW TASK"
      >
        {task && id && (
          <Form
            fields={modalFields}
            onSubmit={handleUpdateTask}
            initialValues={{
              title: task.title,
              description: task.description,
              state: task.state,
              priority: task.priority,
              assignee: task.assignee, // Ensure `assignee` exists in users list
            }}
          />
        )}
      </Modal>
    </div>
  );
};
