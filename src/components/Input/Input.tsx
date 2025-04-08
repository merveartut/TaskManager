import { TextField } from "@mui/material";
import React from "react";

interface InputProps {
  label: string;
  type: string;
  name: string;
  value: string;
  variant?: "filled" | "outlined" | "standard";
  customClass?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  type,
  name,
  value,
  customClass,
  variant = "outlined",
  onChange,
}) => {
  return (
    <div>
      <TextField
        id="outlined-basic"
        label={label}
        type={type}
        variant={variant}
        className={customClass}
        value={value}
        name={name}
        onChange={onChange}
        style={{ width: "300px" }}
      />
    </div>
  );
};
