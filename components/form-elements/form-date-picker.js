import { Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
        render={({ field }) => (
          <div className="react-datepicker-wrapper">
            <DatePicker
              id={id}
              placeholderText="MM‑DD‑YYYY"
              selected={field.value}
              onChange={(date) => field.onChange(date)}
              dateFormat="MM-dd-yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              yearDropdownItemNumber={15}
              scrollableYearDropdown
              showPopperArrow={false}
              previousMonthButtonLabel=""
              nextMonthButtonLabel=""
              disabledKeyboardNavigation
              className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
            />
          </div>
        )}
      />
      {error && <p className="text-red-600 mt-1">{error.message}</p>}
    </div>
  );
}
