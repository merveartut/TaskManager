import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createComment,
  deleteTask,
  fetchAttachments,
  fetchComments,
  getTaskById,
  updateTask,
  updateTaskState,
} from "../../services/projectApi";
import { Editor } from "primereact/editor";
import { FileUploader } from "../../components/FileUpload/FileUploader";
import { stateColors, taskPriorityColors } from "../../constants/uiColors";

import { CircleArrowLeft, SquarePen, Trash2 } from "lucide-react";
import { Modal } from "../../components/Modal/Modal";
import { Form } from "../../components/Form/Form";
import { AccordionCard } from "../../components/Accordion/AccordionCard";
import { Dropdown } from "../../components/DropdownButton/Dropdown";
import { TodosPage } from "../TodosPage/TodosPage";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { TooltipHint } from "../../components/Tooltip/TooltipHint";
import toast from "react-hot-toast";

interface Task {
  id: string;
  title: string;
  description: string;
  state?: string;
  priority: string;
  assignee?: any;
  project: any;
}
const API_BASE = import.meta.env.VITE_API_URL;

export const TaskDetailPage = () => {
  const { id } = useParams<string>();
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | any>();
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [files, setFiles] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState("");
  const [pendingState, setPendingState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentUser = localStorage.getItem("userId");
  const teamMembers = useSelector(
    (state: RootState) => state.teamMembers.teamMembers
  );
  const isProjectManager = task?.project?.projectManager.id === userId;
  const canUpdateTodoState =
    isProjectManager ||
    userRole === "ADMIN" ||
    userRole === "GUEST" ||
    task?.assignee.id === userId;
  const modalFields: any = [
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

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [taskData, attachments, commentsData] = await Promise.all([
          getTaskById(id, navigate),
          fetchAttachments(id, navigate),
          fetchComments(id, navigate),
        ]);

        setTask(taskData);
        setFiles(attachments);
        setComments(commentsData);
        setLoading(false);
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
      state: task?.state,
      id: id,
    };

    try {
      setLoading(true);
      const updatedTask = await updateTask(fullData, navigate);
      if (updatedTask) {
        setTask(updatedTask);
        setLoading(false);
        setIsModalOpen(false);
        toast.success("Task updated successfully!");
      }
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Error updating task");
    }
  };

  const handleDeleteTask = async () => {
    try {
      setLoading(true);
      // @ts-ignore
      await deleteTask(id, navigate);
      setLoading(false);
      setIsDeleteModalOpen(false);
      toast.success("Task deleted successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Error deleting task");
      setIsDeleteModalOpen(false);
    }
  };
  const handleSendComment = async () => {
    const fullData = {
      text: commentText,
      task: { id },
      commenter: { id: userId, role: userRole },
    };

    try {
      setLoading(true);
      const newComment = await createComment(fullData, navigate);
      if (newComment) {
        // @ts-ignore
        setComments((prev) => [...prev, newComment]);
        setLoading(false);
        setCommentText("");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("Error creating comment");
    }
  };
  const handleStateChange = async (newState: string) => {
    if (["BLOCKED", "CANCELLED"].includes(newState)) {
      // Check BLOCKED-specific constraint
      if (
        newState === "BLOCKED" &&
        // @ts-ignore
        !["IN_ANALYSIS", "IN_DEVELOPMENT"].includes(task.state)
      ) {
        alert("You can only block a task that's in analysis or development.");
        return;
      }

      // Open reason modal
      setPendingState(newState);
      setIsReasonModalOpen(true);
      return;
    }
    try {
      setLoading(true);
      const updated = await updateTaskState(
        // @ts-ignore
        { id: task.id, state: newState },
        navigate
      );
      setTask(updated);
      setLoading(false);
    } catch (error) {
      console.error("Error updating task state", error);
      alert("State transition failed.");
    }
  };

  const reloadAttachments = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const attachments = await fetchAttachments(id, navigate);
      setFiles(attachments);
      setLoading(false);
    } catch (error) {
      console.error("Error loading attachments:", error);
      alert("Error loading attachments");
    }
  };

  const submitReasonAndUpdateState = async () => {
    if (!pendingState || !task || !reasonText.trim()) return;

    try {
      setLoading(true);
      const updated = await updateTaskState(
        { id: task.id, state: pendingState, reason: reasonText },
        navigate
      );
      setTask(updated);
      setLoading(false);
      setIsReasonModalOpen(false);
      setReasonText("");
      setPendingState(null);
    } catch (error) {
      console.error("Error submitting reason", error);
      alert("Failed to update task with reason.");
    }
  };

  const processedFiles = useMemo(() => {
    return files?.map((file: any) => {
      const fileName = file.filePath.split(/[\\/]/).pop();
      const fileUrl = `${API_BASE}/api/attachments/files/${fileName}`;
      const isImage = /\.(jpg|jpeg|png|gif|bmp)$/i.test(fileName);
      return { ...file, fileName, fileUrl, isImage };
    });
  }, [files]);

  return (
    <div className="w-full h-full flex flex-wrap lg:flex-nowrap">
      {task && (
        <div className="w-full lg:w-1/2 p-6 flex flex-col gap-4">
          <div className="flex flex-row align-middle gap-2 w-full justify-center md:justify-start">
            <div className="left-32 py-4">
              <TooltipHint text="Go Back To Tasks">
                <button
                  onClick={() => navigate(-1)} // update route if needed
                  className="text-blue-600 hover:text-blue-800 font-semibold underline"
                >
                  <CircleArrowLeft />
                </button>
              </TooltipHint>
            </div>
            <div className="flex flex-row">
              <div className="rounded-lg md:px-8 lg:px-8 px-4 py-4 items-center flex rounded-b-none align-middle gap-2">
                <h1 className="text-[24px] font-bold font-roboto">
                  {task.title}
                </h1>
              </div>
              {(userRole === "ADMIN" ||
                isProjectManager ||
                userRole === "GUEST") && (
                <div className="flex items-start p-4 gap-6">
                  <TooltipHint text="Update Task">
                    <button onClick={() => setIsModalOpen(true)}>
                      <SquarePen size={24} />
                    </button>
                  </TooltipHint>
                  <TooltipHint text="Delete Task">
                    <button onClick={() => setIsDeleteModalOpen(true)}>
                      <Trash2></Trash2>
                    </button>
                  </TooltipHint>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-row w-full justify-between align-middle flex-wrap">
            <div className="flex md:flex-col flex-row items-center md:items-start align-middle px-8 py-4 gap-6">
              <h2 className="text-lg font-roboto">Assignee:</h2>
              <span className="font-roboto font-bold">
                {task.assignee.name}
              </span>
            </div>
            <div className="flex md:flex-col flex-row items-center md:items-start align-middle px-8 py-4 gap-4">
              <h2 className="text-lg font-roboto">State:</h2>
              <Dropdown
                label="State"
                customButtonClass={`font-roboto font-bold p-2 rounded-md ${
                  stateColors[task.state] || ""
                }`}
                selectedOption={task.state}
                disabled={!canUpdateTodoState}
                onSelect={handleStateChange}
                options={[
                  "BACKLOG",
                  "IN_ANALYSIS",
                  "IN_DEVELOPMENT",
                  "CANCELLED",
                  "BLOCKED",
                  "COMPLETED",
                ]}
              ></Dropdown>
            </div>
            <div className="flex md:flex-col flex-row items-center md:items-start align-middle px-8 py-4 gap-4">
              <h2 className="text-lg font-roboto">Priority:</h2>
              <div
                className={`font-roboto font-bold p-2 rounded-md ${
                  taskPriorityColors[task.priority] || ""
                }`}
              >
                {task.priority}
              </div>
            </div>
          </div>

          <div className="flex md:justify-start lg:justify-start border-[1px] justify-center p-6 flex-wrap m-6 md:m-0">
            <h2 className="text-lg mb-4 font-roboto">{task.description}</h2>
          </div>
          <AccordionCard
            header="Attachments"
            defaultExpanded={processedFiles && processedFiles.length}
            content={
              <div className="flex flex-row p-4">
                <ul className="p-4 flex gap-2 flex-wrap overflow-auto">
                  <TooltipHint
                    text={
                      userRole === "GUEST"
                        ? "Guests are not able to upload file."
                        : "Upload new file"
                    }
                  >
                    <div
                      className={`w-fit flex items-center justify-center rounded mb-2 ${
                        userRole === "GUEST"
                          ? "bg-stone-600"
                          : "bg-blue-900 hover:bg-blue-600"
                      }`}
                    >
                      <FileUploader
                        taskId={id}
                        userId={userId}
                        label=" "
                        disabled={userRole === "GUEST"}
                        onUploadComplete={reloadAttachments}
                      />
                    </div>
                  </TooltipHint>

                  {processedFiles &&
                    processedFiles.map((file: any) => (
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
            defaultExpanded={comments.length > 0}
            content={
              <div className="flex flex-col p-8">
                <div className="h-fit overflow-auto mb-6">
                  <ul>
                    {comments.map((comment: any) => (
                      <div
                        className={`flex flex-col ${
                          currentUser === comment.commenter.id
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          key={comment.id}
                          className="border w-[400px] rounded-xl shadow-sm p-4 mb-4 bg-white"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-800 font-roboto">
                              {comment.commenter?.name || "Unknown User"}
                            </span>
                            <div className="flex flex-col gap-2">
                              <span className="text-sm text-gray-500 font-roboto">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm text-gray-500 font-roboto">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                          <div
                            className="prose prose-sm max-w-full flex items-start"
                            dangerouslySetInnerHTML={{ __html: comment.text }}
                          />
                        </div>
                      </div>
                    ))}
                  </ul>
                </div>
                <div className="h-[200px] w-full flex flex-col gap-4">
                  <div className="max-h-[120px] w-full">
                    <Editor
                      value={commentText}
                      onTextChange={(e: any) => setCommentText(e.htmlValue)}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-row w-full justify-end mt-2">
                    <TooltipHint
                      text={
                        userRole === "GUEST"
                          ? "Guests are not able to add comment."
                          : "Send Message"
                      }
                    >
                      <button
                        type="submit"
                        className={`mt-4 disabled:bg-zinc-300 bg-blue-700  text-white py-1 px-4 rounded font-roboto`}
                        disabled={
                          !commentText ||
                          commentText.length === 0 ||
                          userRole === "GUEST"
                        }
                        onClick={handleSendComment}
                      >
                        Send
                      </button>
                    </TooltipHint>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      )}
      <div className="w-full lg:w-1/2 p-6 flex flex-col gap-4">
        {id && <TodosPage taskId={id} hasAuth={canUpdateTodoState} />}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="UPDATE TASK"
      >
        {task && id && (
          <Form
            fields={modalFields}
            onSubmit={handleUpdateTask}
            loading={loading}
            initialValues={{
              title: task.title,
              description: task.description,
              priority: task.priority,
              assignee: task.assignee, // Ensure `assignee` exists in users list
            }}
          />
        )}
      </Modal>
      <Modal
        isOpen={isReasonModalOpen}
        onClose={() => {
          setIsReasonModalOpen(false);
          setReasonText("");
        }}
        title="Provide Reason"
      >
        <div className="flex flex-col gap-4">
          <textarea
            className="border rounded p-2 w-full"
            rows={4}
            placeholder="Please provide a reason..."
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
          />
          <button
            className="bg-blue-600 text-white rounded px-4 py-2 self-end"
            onClick={submitReasonAndUpdateState}
            disabled={!reasonText.trim()}
          >
            Submit
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="DELETE PROJECT"
      >
        <span>Are you sure you want to delete this task ?</span>
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
            onClick={handleDeleteTask}
          >
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};
