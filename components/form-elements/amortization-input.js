"use client";

import { useState } from "react";
import LabelWithHelper from "./label-with-helper";

export default function AmortizationInput({
  id,
  label,
  register,
  error,
  helpTexts,
  isBC = false,
  defaultValue = "",
  placeholder = "Enter years",
}) {
  const [activeHelp, setActiveHelp] = useState(null);
  const [currentValue, setCurrentValue] = useState(
    defaultValue !== null && defaultValue !== undefined
      ? String(defaultValue)
      : "",
  );
  const [realtimeError, setRealtimeError] = useState("");

  const maxYears = isBC ? 40 : 30;

  const toggleHelp = () => setActiveHelp((prev) => (prev === id ? null : id));

  const handleChange = (e) => {
    const value = e.target.value;
    setCurrentValue(value);

    if (value === "") {
      setRealtimeError("");
      return;
    }

    if (!/^\d+$/.test(value)) {
      setRealtimeError("Please round it to the closest number of years");
      return;
    }

    const num = parseInt(value, 10);

    if (num < 1) {
      setRealtimeError("Minimum number of amortization years is 1");
      return;
    }

    if (num > maxYears) {
      setRealtimeError(`Maximum number of amortization years is ${maxYears}`);
      return;
    }

    setRealtimeError("");
  };

  const rules = {
    required: "Please enter remaining amortization",
    min: { value: 1, message: "Amortization must be at least 1 year" },
    max: {
      value: maxYears,
      message: isBC
        ? "Amortization cannot exceed 40 years"
        : "Amortization cannot exceed 30 years",
    },
    pattern: {
      value: /^\d+$/,
      message: "Please enter a whole number only",
    },
  };

  const showBCWarning =
    isBC && parseInt(currentValue, 10) > 30 && !realtimeError;

  return (
    <div className="flex flex-col space-y-2">
      <LabelWithHelper
        htmlFor={id}
        label={label}
        onHelpClick={helpTexts ? toggleHelp : undefined}
      />

      {activeHelp === id && helpTexts && (
        <div className="p-3 mt-2 bg-blue-100 border border-gray-300 rounded-md">
          {helpTexts}
        </div>
      )}

      <input
        id={id}
        type="number"
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={1}
        max={maxYears}
        step="1"
        inputMode="numeric"
        onWheel={(e) => e.target.blur()}
        {...register(id, rules)}
        onChange={handleChange}
        className={`w-full rounded-md border py-4 px-4 text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
          realtimeError
            ? "border-red-500 bg-red-50"
            : error
              ? "border-red-500 bg-white"
              : "border-gray-300 bg-white"
        }`}
      />

      {realtimeError ? (
        <p className="mt-1 font-medium text-red-600">{realtimeError}</p>
      ) : error ? (
        <p className="mt-1 text-red-600">{error.message}</p>
      ) : showBCWarning ? (
        <p className="mt-1 text-sm text-gray-400">
          Not all properties in BC are eligible for amortizations beyond 30
          years. We&apos;ll confirm your eligibility before locking in your
          rate.
        </p>
      ) : null}
    </div>
  );
}
