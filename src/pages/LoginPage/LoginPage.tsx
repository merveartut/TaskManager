import React from "react";
import { Form } from "../../components/Form/Form";
import image from "../../assets/task_image.jpg";
import { useNavigate } from "react-router-dom";

const loginFields = [
  { name: "username", label: "Username", type: "username" },
  { name: "password", label: "Password", type: "password" },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const handleSubmit = async (formData: any) => {
    try {
      const response = await fetch("http://localhost:8080/auth/login", {
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
