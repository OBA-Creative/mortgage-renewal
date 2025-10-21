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
      <div className="relative flex items-end justify-between w-64 h-16 p-2 pb-1 bg-white border border-gray-300 rounded-lg shadow-lg">
        <button
          onClick={openPrimeModal}
          className="absolute p-1 text-gray-400 rounded cursor-pointer top-1 right-1 hover:text-blue-600 hover:bg-blue-50"
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
        <div className="flex justify-between w-full space-x-4 items-baseline-last ">
          <div className="flex space-x-2">
            <div className="w-8 h-5 overflow-hidden border border-gray-200 rounded-md shadow-md">
              <Image
                src={"/images/canadian_flag.svg"}
                alt={"Canadian flag"}
                width={48}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="pl-2 border-l border-gray-200">
              <p className="text-xs text-gray-500">Canada</p>
              <h2 className="">Prime Rate</h2>
            </div>
          </div>
          <p className="text-lg font-bold text-blue-600">
            {formatRate(primeRate)}%
          </p>
        </div>
      </div>

      {/* Prime Rate Update Modal */}
      {isPrimeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-opacity-50 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalTitle}
                </h3>
                <button
                  onClick={() => setIsPrimeModalOpen(false)}
                  className="p-2 text-gray-400 rounded-md cursor-pointer hover:text-gray-600 hover:bg-gray-100"
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
                  <label className="block mb-2 text-sm font-medium text-gray-700">
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
