import React, { useState } from "react";
import { Input } from "../Input/Input";
import { Select } from "../Select/Select";

interface Field {
  name: string;
  label: string;
  type: string;
  isSingleSelect?: boolean;
  options?: { value: string; label: string }[];
}

interface FormProps {
  fields: Field[];
  onSubmit: (formData: Record<string, string | string[]>) => void;
}

export const Form: React.FC<FormProps> = ({ fields, onSubmit }) => {
  const [formData, setFormData] = useState<Record<string, any>>(
    Object.fromEntries(
      fields.map((field) => [
        field.name,
        field.type === "picker" ? (field.isSingleSelect ? null : []) : "",
      ])
    )
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, selectedValues: any[] | any) => {
    setFormData({
      ...formData,
      [name]: selectedValues,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-md">
      {fields.map((field, index) =>
        field.type === "picker" && field.options ? (
          <Select
            key={index}
            label={field.label}
            options={field.options}
            customClass="mb-6"
            isSingleSelect={field.isSingleSelect || false}
            selectedValues={formData[field.name]}
            onChange={(selected) => handleSelectChange(field.name, selected)}
          />
        ) : (
          <div className="mb-10">
            <Input
              key={index}
              label={field.label}
              type={field.type}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
            />
          </div>
        )
      )}
      <button
        type="submit"
        className="mt-4 bg-blue-200 text-white py-2 px-4 rounded"
      >
        Submit
      </button>
    </form>
  );
};
