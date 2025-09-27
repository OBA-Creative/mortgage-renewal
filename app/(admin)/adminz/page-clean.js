"use client";

import { useState, useEffect } from "react";
import AdminProvinceCard from "../../../components/cards/admin-province-card";

// Helper function to format rates to always show 2 decimal places
const formatRate = (rate) => {
  if (rate == null || rate === undefined) return "";
  return parseFloat(rate).toFixed(2);
};

export default function AdminDashboard() {
  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [isPrimeModalOpen, setIsPrimeModalOpen] = useState(false);
  const [newPrimeRate, setNewPrimeRate] = useState("");
  const [isPrimeUpdating, setIsPrimeUpdating] = useState(false);

  // Fetch rates when component mounts
  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const response = await fetch("/api/admin/rates");
      const data = await response.json();

      if (data.success) {
        console.log("Fetched rates data:", data.rates);
        console.log("Sample province ON:", data.rates.ON);
        setRates(data.rates);
        setEffectiveDate(new Date(data.effectiveDate));
      } else {
        console.error("Failed to fetch rates:", data.message);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setRatesLoading(false);
    }
  };

  const handlePrimeUpdate = async (e) => {
    e.preventDefault();
    setIsPrimeUpdating(true);

    try {
      const response = await fetch("/api/admin/prime/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prime: parseFloat(newPrimeRate),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setRates((prev) => ({
          ...prev,
          prime: data.prime,
        }));
        setIsPrimeModalOpen(false);
        setNewPrimeRate("");
        alert("Prime rate updated successfully!");
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Error updating prime rate: " + error.message);
    } finally {
      setIsPrimeUpdating(false);
    }
  };

  const openPrimeModal = () => {
    setNewPrimeRate(rates?.prime?.toString() || "");
    setIsPrimeModalOpen(true);
  };

  const provinces = [
    { code: "AB", name: "Alberta", flagImage: "/images/ab.jpg" },
    { code: "BC", name: "British Columbia", flagImage: "/images/bc.jpg" },
    { code: "MB", name: "Manitoba", flagImage: "/images/mb.jpg" },
    { code: "NB", name: "New Brunswick", flagImage: "/images/nb.jpg" },
    {
      code: "NL",
      name: "Newfoundland and Labrador",
      flagImage: "/images/nl.jpg",
    },
    { code: "NS", name: "Nova Scotia", flagImage: "/images/ns.jpg" },
    {
      code: "NT",
      name: "Northwest Territories",
      flagImage: "/images/nt.jpg",
    },
    { code: "NU", name: "Nunavut", flagImage: "/images/nu.jpg" },
    { code: "ON", name: "Ontario", flagImage: "/images/on.jpg" },
    { code: "PE", name: "Prince Edward Island", flagImage: "/images/pe.jpg" },
    { code: "QC", name: "Quebec", flagImage: "/images/qc.jpg" },
    { code: "SK", name: "Saskatchewan", flagImage: "/images/sk.jpg" },
    { code: "YT", name: "Yukon", flagImage: "/images/yt.jpg" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Rates Management</h1>
          <p className="mt-2 text-lg text-gray-600">
            Rates on{" "}
            {effectiveDate
              ? effectiveDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Loading..."}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {ratesLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 shadow rounded-md text-blue-600 bg-white">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading rates...
          </div>
        </div>
      )}

      {/* Prime Rate Card */}
      {rates && (
        <div className="mb-8">
          <div className="bg-white border-gray-300 border rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-2xl font-bold">Prime Rate</h2>
                  <p>National benchmark rate for variable mortgages</p>
                </div>
              </div>
              <div className="text-right">
                <button
                  onClick={openPrimeModal}
                  className="text-gray-400 cursor-pointer"
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
                <div className="flex items-center justify-end mb-2">
                  <div className="text-4xl font-bold">
                    {formatRate(rates.prime)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provincial Rates Grid */}
      {rates && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {provinces.map((province) => (
            <AdminProvinceCard
              key={province.code}
              province={province}
              rates={rates[province.code]}
              primeRate={rates.prime}
            />
          ))}
        </div>
      )}

      {/* No Rates Message */}
      {!ratesLoading && !rates && (
        <div className="text-center py-12">
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No rates available
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    No mortgage rates found in the database. Please run the rate
                    insertion script to populate rates data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prime Rate Update Modal */}
      {isPrimeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Update Prime Rate
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
                    disabled={isPrimeUpdating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                  >
                    {isPrimeUpdating ? "Updating..." : "Update Prime Rate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
