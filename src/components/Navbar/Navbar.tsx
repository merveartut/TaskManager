import { LogOut, Menu } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { TooltipHint } from "../Tooltip/TooltipHint";
import { Avatar } from "@mui/material";
import { Modal } from "../Modal/Modal";

interface NavbarProps {
  items: any[];
  userInfo?: any;
}

export const Navbar: React.FC<NavbarProps> = ({ items, userInfo }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    if (!userInfo) {
      return null;
    }
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] || "";
    const second = parts[1]?.[0] || "";
    return (first + second).toLowerCase();
  };
  return (
    <div
      className={`h-screen bg-gray-900 text-white flex flex-col items-center p-4 transition-all duration-300 ${
        expanded ? "w-60" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center w-full justify-between mb-6">
        {expanded && <h2 className="text-xl font-bold">MOP</h2>}
        <Menu size={24} className="cursor-pointer" />
      </div>

      {/* Main nav items */}
      <nav className="flex flex-col space-y-4 w-full flex-1">
        {items.map(
          (item) =>
            item.display && (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center p-2 rounded-lg transition ${
                  location.pathname === item.path
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                }`}
              >
                {item.icon}
                {expanded && <span className="ml-3">{item.name}</span>}
              </Link>
            )
        )}
      </nav>

      {/* User info link pinned to bottom */}
      {userInfo && (
        <div
          className={`flex flex-col gap-4 w-full mt-auto ${
            expanded ? "" : "flex justify-center"
          }`}
        >
          <TooltipHint text={userInfo.userName}>
            <div
              className={`w-full mt-auto ${
                expanded ? "" : "flex justify-center"
              }`}
            >
              <Link
                to={userInfo.path}
                className={`flex items-center py-2 rounded-lg transition ${
                  location.pathname === userInfo.path
                    ? "bg-blue-600"
                    : "hover:bg-gray-700"
                } ${expanded ? "w-full" : ""}`}
              >
                <Avatar alt={userInfo.userName}>
                  {getInitials(userInfo.userName)}
                </Avatar>
                {expanded && <span className="ml-3">{userInfo.name}</span>}
              </Link>
            </div>
          </TooltipHint>
          <TooltipHint text="Logout">
            <button
              className={`flex items-center p-2 rounded-lg transition`}
              onClick={() => setIsModalOpen(true)}
            >
              <LogOut />
              {expanded && <span className="ml-3">Logout</span>}
            </button>
          </TooltipHint>
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <span className="text-black">Are you sure you want to log out ?</span>
        <div className="flex flex-row justify-end gap-6">
          <button
            type="submit"
            className="mt-4 bg-slate-500 text-white py-2 px-4 rounded"
            onClick={() => setIsModalOpen(false)}
          >
            No
          </button>
          <button
            type="submit"
            className="mt-4 bg-blue-700 text-white py-2 px-4 rounded"
            onClick={() => navigate("/")}
          >
            Yes
          </button>
        </div>
      </Modal>
    </div>
  );
};
