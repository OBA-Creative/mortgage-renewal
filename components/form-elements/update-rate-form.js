"use client";

import React, { useState, useEffect } from "react";
import { useMortgageStore } from "../../stores/useMortgageStore";

export default function UpdateRateForm({
  province,
  term,
  type,
  rateValue,
  lender,
  onClose,
  onUpdate,
}) {
  const [rate, setRate] = useState(rateValue || "");
  const [selectedLender, setSelectedLender] = useState(lender || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get lenders from store using the same method as UpdateRatesForm
  const { getLenders } = useMortgageStore();
  const availableLenders = getLenders(type === "rental") || [];

  // Reset form when props change
  useEffect(() => {
    setRate(rateValue || "");
    setSelectedLender(lender || "");
    setError("");
  }, [rateValue, lender]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate rate input
      const numericRate = parseFloat(rate);
      if (isNaN(numericRate)) {
        throw new Error("Please enter a valid rate");
      }

      // Call the onUpdate callback with the new values
      await onUpdate({
        province,
        term,
        type,
        rate: numericRate,
        lender: selectedLender,
      });

      // Close the modal on success
      onClose();
    } catch (error) {
      console.error("Error updating rate:", error);
      setError(error.message || "Failed to update rate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTypeLabel = () => {
    if (type?.includes("refinance-")) {
      const refType = type.replace("refinance-", "");
      return refType === "under25" ? "Refinance ≤25yr" : "Refinance >25yr";
    }
    if (type === "rental") return "Rental";

    // LTV types
    const ltvLabels = {
      under65: "≤65%",
      under70: "≤70%",
      under75: "≤75%",
      under80: "≤80%",
      over80: "Insured",
    };
    return ltvLabels[type] || type;
  };

  const getTermLabel = () => {
    const termLabels = {
      threeYrFixed: "3-Year Fixed",
      fourYrFixed: "4-Year Fixed",
      fiveYrFixed: "5-Year Fixed",
      threeYrVariable: "3-Year Variable",
      fiveYrVariable: "5-Year Variable",
    };
    return termLabels[term] || term;
  };

  const isFixedTerm = term?.includes("Fixed");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="z-50 flex items-center justify-between py-2 pl-6 pr-4 text-white bg-blue-600 shadow-md">
            <h2 className="text-lg font-medium ">Update Rate</h2>
            <button
              onClick={onClose}
              className="p-2 text-white rounded-md cursor-pointer hover:text-red-500 hover:bg-white focus:outline-none"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Rate Details */}
          <div className="px-6 py-4 space-y-1 text-sm text-gray-700 bg-blue-50">
            <div>
              <strong>Province:</strong> {province?.name} ({province?.code})
            </div>
            <div>
              <strong>Term:</strong> {getTermLabel()}
            </div>
            <div>
              <strong>Type:</strong>{" "}
              <span
                className={`font-medium ${
                  type === "rental"
                    ? "text-purple-600"
                    : type?.includes("refinance-")
                      ? "text-green-600"
                      : "text-blue-600"
                }`}
              >
                {getTypeLabel()}
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {/* Rate Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              {isFixedTerm ? "Rate (%)" : "Adjustment to Prime"}
            </label>
            <input
              type="number"
              step="0.01"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder={isFixedTerm ? "e.g., 5.25" : "e.g., -0.80"}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {isFixedTerm
                ? "Enter the fixed rate percentage"
                : "Enter adjustment to prime rate (can be negative)"}
            </p>
          </div>

          {/* Lender Selection */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Lender
            </label>
            <select
              value={selectedLender}
              onChange={(e) => setSelectedLender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="" disabled>
                Select lender
              </option>
              {availableLenders.map((lenderName, index) => (
                <option key={index} value={lenderName}>
                  {lenderName}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end pt-4 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-full cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed "
            >
              {isLoading ? "Updating..." : "Update Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
