"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

export default function RateCardAlt({
  percentage,
  monthlyPayment,
  term,
  lender,
  onInquire,
}) {
  const [frequency, setFrequency] = useState("monthly");

  const displayPayment = useMemo(() => {
    const raw =
      typeof monthlyPayment === "string"
        ? parseFloat(monthlyPayment.replace(/[$,]/g, ""))
        : Number(monthlyPayment);
    if (isNaN(raw)) return monthlyPayment;

    let amount = raw;
    if (frequency === "bi-weekly") amount = raw / 2;
    if (frequency === "weekly") amount = raw / 4;

    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [monthlyPayment, frequency]);

  return (
    <div className="flex items-center px-2 space-x-4 sm:px-4 sm:space-x-10">
      <div className="flex flex-col items-center grow min-w-0">
        <div className="relative inline-flex items-center justify-center">
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="w-full py-1 pl-2 pr-5 text-xs text-center bg-transparent border-none appearance-none cursor-pointer sm:text-base focus:outline-none"
          >
            <option value="monthly">monthly payment</option>
            <option value="bi-weekly">bi-weekly payment</option>
            <option value="weekly">weekly payment</option>
          </select>
          <span className="absolute right-0 pointer-events-none">
            <ChevronDown size={14} />
          </span>
        </div>
        <p className="text-3xl font-bold sm:text-4xl lg:text-6xl">
          {displayPayment}
        </p>
      </div>
      <div className="flex flex-col space-y-2 text-center shrink-0">
        <div>
          <p className="text-xs sm:text-sm">{term}</p>
          <p className="text-base font-semibold sm:text-lg">{percentage}</p>
        </div>
        <button
          onClick={() =>
            onInquire({ term, percentage, monthlyPayment, lender })
          }
          className="flex items-center justify-center h-10 px-4 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer sm:px-6 min-w-28 sm:min-w-34 text-sm sm:text-base hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
        >
          inquire
        </button>
      </div>
    </div>
  );
}
