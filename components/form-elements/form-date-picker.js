"use client";

import { Controller } from "react-hook-form";
import { HelpCircle } from "lucide-react";
import { useCallback, useState } from "react";

export default function FormDatePicker({
  id,
  label,
  requiredText,
  control,
  helpTexts,
  error,
}) {
  const [activeHelp, setActiveHelp] = useState(null);

  const toggleHelp = useCallback(
    (key) => setActiveHelp((prev) => (prev === key ? null : key)),
    []
  );

  const rules = requiredText ? { required: requiredText } : undefined;

  // Convert Date object to YYYY-MM-DD format for HTML date input
  const formatDateForInput = (date) => {
    if (!date) return "";
    if (typeof date === "string") return date;
    return date.toISOString().split("T")[0];
  };

  // Convert YYYY-MM-DD string to Date object
  const parseDateFromInput = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xl font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => toggleHelp(id)}
          className="p-1 rounded-full hover:bg-blue-600 cursor-pointer hover:text-white text-gray-500"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      </div>
      {activeHelp === id && (
        <div className="mt-2 p-3 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}

      <Controller
        control={control}
        name={id}
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => (
          <input
            id={id}
            type="date"
            value={formatDateForInput(value)}
            onChange={(e) => onChange(parseDateFromInput(e.target.value))}
            onBlur={onBlur}
            min={new Date().toISOString().split("T")[0]}
            max={(() => {
              const maxDate = new Date();
              maxDate.setFullYear(maxDate.getFullYear() + 30);
              return maxDate.toISOString().split("T")[0];
            })()}
            className={`w-full rounded-md border py-4 px-4 text-lg cursor-pointer placeholder-gray-400 ${
              error ? "border-red-500 bg-white" : "border-gray-300 bg-white"
            }`}
          />
        )}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
