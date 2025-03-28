import { TextField } from "@mui/material";
import React from "react";

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  type,
  name,
  value,
  onChange,
}) => {
  return (
    <div className="mb-10">
      <TextField
        id="outlined-basic"
        label={label}
        variant="outlined"
        value={value}
        name={name}
        onChange={onChange}
        style={{ width: "300px" }}
      />
    </div>
  );
};
