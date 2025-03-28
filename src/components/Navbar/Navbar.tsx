import { Menu } from "lucide-react";
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavbarProps {
  items: any[];
}

export const Navbar: React.FC<NavbarProps> = ({ items }) => {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`h-screen bg-gray-900 text-white flex flex-col items-center p-4 transition-all duration-300 ${
        expanded ? "w-60" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="flex items-center w-full justify-between mb-6">
        {expanded && <h2 className="text-xl font-bold">My App</h2>}
        <Menu size={24} className="cursor-pointer" />
      </div>

      <nav className="flex flex-col space-y-4 w-full">
        {items.map((item) => (
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
        ))}
      </nav>
    </div>
  );
};
