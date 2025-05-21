import { FileUpload } from "primereact/fileupload";
import React from "react";

interface FileProps {
  taskId?: any;
  userId?: any;
  label?: string;
  onUploadComplete?: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL;
export const FileUploader: React.FC<FileProps> = ({
  taskId,
  userId,
  label = "Upload",
  onUploadComplete,
}) => {
  const handleUpload = async (event: any) => {
    const file = event.files[0];

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", taskId);
    formData.append("userId", userId);

    try {
      const response = await fetch(`${API_BASE}/api/attachments/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("File uploaded!");
        onUploadComplete?.();
      } else {
        alert("Failed to upload");
      }
    } catch (err) {
      console.error(err);
      alert("Upload error");
    }
  };
  return (
    <FileUpload
      name="file"
      customUpload
      uploadHandler={handleUpload}
      auto
      chooseLabel={label}
    />
  );
};
