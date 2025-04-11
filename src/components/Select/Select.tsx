import { ChevronDown } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface SelectProps {
  label: string;
  options: any[];
  isSingleSelect?: boolean;
  selectedValues: any[] | any;
  customClass?: string;
  displayLabel?: boolean;
  onChange: (selected: string[] | string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  customClass,
  displayLabel = false,
  isSingleSelect = false,
  selectedValues,
  onChange,
}) => {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
  const filteredOptions = options.filter((option) => {
    if (option.name) {
      return (
        option?.name?.toLowerCase().includes(search.toLowerCase()) &&
        (isSingleSelect
          ? selectedValues !== option
          : !selectedValues.includes(option))
      );
    } else {
      return (
        option.toLowerCase().includes(search.toLocaleLowerCase()) &&
        (isSingleSelect
          ? selectedValues !== option
          : !selectedValues.includes(option))
      );
    }
  });

  const handleSelect = (value: string) => {
    if (!isSingleSelect && selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      if (isSingleSelect) {
        onChange(value);
      } else {
        onChange([...selectedValues, value]);
      }
    }
    setIsOpen(false);
  };

  const removeSelected = (e: any, value: any) => {
    console.log("kfjgnhdfjkgjdfbj", e);
    e.preventDefault();
    onChange(selectedValues.filter((v) => v !== value));
  };
  return (
    <div className={`relative ${customClass}`} ref={dropdownRef}>
      {displayLabel && (
        <label className="flex items-start text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Input Field (Searchable) */}
      <div
        className={`border border-gray-300 rounded-md shadow-sm p-2 flex flex-wrap flex-row items-center justify-between cursor-pointer h-[55px]`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-2 items-center">
          {selectedValues ? (
            isSingleSelect ? (
              <span>{selectedValues.name || selectedValues}</span>
            ) : (
              selectedValues.length &&
              selectedValues.map((value, index) => (
                <span
                  key={index}
                  onClick={(e) => removeSelected(e, value)}
                  className="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
                >
                  {typeof value === "string"
                    ? value
                    : options.find(
                        (opt) =>
                          (typeof opt === "object" &&
                            opt?.name === value?.name) ||
                          opt === value
                      )?.name ||
                      (typeof value === "object" ? value?.name : value)}{" "}
                  ✖
                </span>
              ))
            )
          ) : (
            <span className="text-gray-400">{label}</span>
          )}
        </div>
        <ChevronDown
          className={`ml-auto text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute w-full bg-white border border-gray-300 rounded-md shadow-md mt-1 max-h-48 overflow-auto z-10">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-2 border-b border-gray-200 outline-none"
          />
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                onClick={() => handleSelect(option)}
                className={`p-2 cursor-pointer hover:bg-blue-100 flex items-start pl-4 `}
              >
                {option.name || option}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No data found</div>
          )}
        </div>
      )}
    </div>
  );
};
