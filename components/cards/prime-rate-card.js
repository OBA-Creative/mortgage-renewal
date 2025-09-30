"use client";

import { useState } from "react";
import Image from "next/image";

// Helper function to format rates to always show 2 decimal places
const formatRate = (rate) => {
  if (rate == null || rate === undefined) return "";
  return parseFloat(rate).toFixed(2);
};

export default function PrimeRateCard({
  primeRate,
  onPrimeUpdate,
  isUpdating = false,
  modalTitle = "Update Prime Rate",
  buttonText = "Update Prime Rate",
}) {
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [newPrimeRate, setNewPrimeRate] = useState("");

  const handlePrimeUpdate = async (e) => {
    e.preventDefault();

    if (onPrimeUpdate) {
      await onPrimeUpdate(parseFloat(newPrimeRate));
    }

    setIsPrimeModalOpen(false);
    setNewPrimeRate("");
  };

  const openPrimeModal = () => {
    setNewPrimeRate(primeRate?.toString() || "");
    setIsPrimeModalOpen(true);
  };

  return (
    <>
      {/* Prime Rate Card */}
      <div className="bg-white border-gray-300 border rounded-lg shadow-lg p-4 flex justify-between h-full items-end relative w-112 pt-6">
        <button
          onClick={openPrimeModal}
          className="text-gray-400 cursor-pointer absolute top-2 right-2 p-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <div className="flex space-x-4 pb-2 items-end justify-between w-full">
          <div className="flex space-x-2">
            <div className="w-12 h-8 rounded-md overflow-hidden shadow-md border border-gray-200">
              <Image
                src={"/images/canadian_flag.svg"}
                alt={"Canadian flag"}
                width={48}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="border-l pl-2 border-gray-200">
              <p className="text-sm text-gray-500">Canada</p>
              <h2 className="text-xl">Prime Rate</h2>
            </div>
          </div>
          <p className="text-xl font-bold text-blue-600">
            {formatRate(primeRate)}%
          </p>
        </div>
      </div>

      {/* Prime Rate Update Modal */}
      {isPrimeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalTitle}
                </h3>
                <button
                  onClick={() => setIsPrimeModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
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
            </div>

            <div className="px-6 py-4">
              <form onSubmit={handlePrimeUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prime Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    value={newPrimeRate}
                    onChange={(e) => setNewPrimeRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter prime rate"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter a value between 0.00% and 20.00%
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsPrimeModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                  >
                    {isUpdating ? "Updating..." : buttonText}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
