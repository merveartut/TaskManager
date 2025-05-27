import React from "react";
import { Form } from "../../components/Form/Form";
import image from "../../assets/task_image.jpg";
import { useNavigate } from "react-router-dom";

const loginFields = [
  { name: "username", label: "Username", type: "username", visible: true },
  { name: "password", label: "Password", type: "password", visible: true },
];
const API_BASE = import.meta.env.VITE_API_URL;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  console.log("API_BASE", API_BASE);
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });
      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();
      console.log("Login successful", data);

      // Save the token
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("userName", formData.username);
      navigate("/projects");
    } catch (error: any) {
      console.error("Login failed", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div className="w-full h-full flex">
      <div className="w-1/2">
        <img src={image} className="object-cover w-full h-[1000px]"></img>
      </div>
      <div className="w-1/2 flex items-center flex flex-col justify-center gap-4">
        <h1 className="text-2xl font-bol">Login</h1>
        <h1 className="text-xl font-bol italic">I'll help</h1>
        <Form fields={loginFields} onSubmit={handleSubmit} />
      </div>
    </div>
  );
};
