import React, { useEffect, useRef, useState } from "react";

interface SelectProps {
  label: string;
  options: any[];
  selectedValues: any[];
  onChange: (selected: string[]) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log(selectedValues);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search input
  const filteredOptions = options.filter((option) =>
    option?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };
  return (
    <div className="relative mt-4" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Input Field (Searchable) */}
      <div
        className="mt-2 border border-gray-300 rounded-md shadow-sm p-2 flex flex-wrap gap-2 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValues.length > 0 ? (
          selectedValues.map((value, index) => (
            <span
              key={index}
              className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
            >
              {options.find((opt) => opt.name === value.name)?.name} ✖
            </span>
          ))
        ) : (
          <span className="text-gray-400">Select team members...</span>
        )}
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-48 overflow-auto z-10">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border-b border-gray-200 outline-none"
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={option.id}
                onClick={() => handleSelect(option)}
                className={`p-2 cursor-pointer hover:bg-blue-100 ${
                  selectedValues.includes(option.value) ? "bg-blue-200" : ""
                }`}
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No users found</div>
          )}
        </div>
      )}
    </div>
  );
};
