"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import PrimeRateCard from "../../../components/cards/prime-rate-card";
import UpdateRatesForm from "../../../components/form-elements/update-rates-form";
import { useMortgageStore } from "../../../stores/useMortgageStore";

const provinces = [
  { code: "BC", name: "British Columbia" },
  { code: "AB", name: "Alberta" },
  { code: "ON", name: "Ontario" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NB", name: "New Brunswick" },
  { code: "SK", name: "Saskatchewan" },
  { code: "MB", name: "Manitoba" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "QC", name: "Quebec" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "YT", name: "Yukon" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
];

const rateCategories = [
  { id: "threeYrFixed", label: "3-Year Fixed", type: "fixed" },
  { id: "fourYrFixed", label: "4-Year Fixed", type: "fixed" },
  { id: "fiveYrFixed", label: "5-Year Fixed", type: "fixed" },
  { id: "threeYrVariable", label: "3-Year Variable", type: "variable" },
  { id: "fiveYrVariable", label: "5-Year Variable", type: "variable" },
];

const ltvCategories = [
  { id: "under65", label: "≤65%" },
  { id: "under70", label: "≤70%" },
  { id: "under75", label: "≤75%" },
  { id: "under80", label: "≤80%" },
  { id: "over80", label: "Insured" },
];

const refinanceCategories = [
  { id: "under25", label: "≤25 yr" },
  { id: "over25", label: ">25 yr" },
];

const rentalCategory = { id: "rental", label: "Rental" };

export default function AdminDashboard() {
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prime, setPrime] = useState(0);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(null);
  const [lastUpdatedDate, setLastUpdatedDate] = useState(null);
  const [isPrimeUpdating, setIsPrimeUpdating] = useState(false);

  // Get lender fetching function from store
  const { fetchLenders } = useMortgageStore();

  // Fetch rates and lenders when component mounts
  useEffect(() => {
    const initializeData = async () => {
      // Fetch both rates and lenders in parallel
      await Promise.all([fetchRates(), fetchLenders()]);
    };

    initializeData();
  }, [fetchLenders]);

  // Fetch rates data
  const fetchRates = async () => {
    try {
      setLoading(true);

      // Fetch standard rates and prime
      const [ratesResponse, primeResponse] = await Promise.all([
        fetch("/api/rates"),
        fetch("/api/admin/prime"),
      ]);

      if (ratesResponse.ok) {
        const ratesData = await ratesResponse.json();
        console.log("Rates data received:", ratesData); // Debug log
        setRates(ratesData.rates || {});
        setEffectiveDate(new Date(ratesData.effectiveDate));
        // Set last updated date from the database
        if (ratesData.updatedAt) {
          console.log("Setting lastUpdatedDate to:", ratesData.updatedAt); // Debug log
          setLastUpdatedDate(new Date(ratesData.updatedAt));
        } else {
          console.log("No updatedAt field found in response"); // Debug log
        }
      }

      if (primeResponse.ok) {
        const primeData = await primeResponse.json();
        setPrime(primeData.prime || 0);
      }
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update prime rate
  const handlePrimeUpdate = async (newPrimeRate) => {
    setIsPrimeUpdating(true);

    try {
      const response = await fetch("/api/admin/prime/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prime: newPrimeRate }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrime(data.prime);
        alert("Prime rate updated successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update prime rate");
      }
    } catch (error) {
      console.error("Error updating prime rate:", error);
      alert("Error updating prime rate: " + error.message);
    } finally {
      setIsPrimeUpdating(false);
    }
  };

  // Initialize empty rate structure for a province
  const initializeProvinceRates = () => {
    const structure = {};
    rateCategories.forEach((category) => {
      structure[category.id] = {};

      // Regular LTV rates
      ltvCategories.forEach((ltv) => {
        if (category.type === "fixed") {
          structure[category.id][ltv.id] = { rate: 0, lender: "" };
        } else {
          structure[category.id][ltv.id] = { adjustment: 0, lender: "" };
        }
      });

      // Refinance rates
      structure[category.id].refinance = {};
      refinanceCategories.forEach((refCat) => {
        if (category.type === "fixed") {
          structure[category.id].refinance[refCat.id] = { rate: 0, lender: "" };
        } else {
          structure[category.id].refinance[refCat.id] = {
            adjustment: 0,
            lender: "",
          };
        }
      });

      // Rental rates
      if (category.type === "fixed") {
        structure[category.id][rentalCategory.id] = { rate: 0, lender: "" };
      } else {
        structure[category.id][rentalCategory.id] = {
          adjustment: 0,
          lender: "",
        };
      }
    });
    return structure;
  };

  // Get current rates data
  const getCurrentRates = () => rates;
  const setCurrentRates = (newRates) => {
    setRates(newRates);
  };

  // Handle input changes
  const handleRateChange = (provinceCode, categoryId, ltv, field, value) => {
    const currentRates = getCurrentRates();
    const newRates = { ...currentRates };

    // Initialize province if it doesn't exist
    if (!newRates[provinceCode]) {
      newRates[provinceCode] = {};
    }

    if (!newRates[provinceCode][categoryId]) {
      newRates[provinceCode][categoryId] = {};
    }

    if (ltv.includes("refinance-")) {
      const refType = ltv.replace("refinance-", "");
      if (!newRates[provinceCode][categoryId].refinance) {
        newRates[provinceCode][categoryId].refinance = {};
      }
      if (!newRates[provinceCode][categoryId].refinance[refType]) {
        newRates[provinceCode][categoryId].refinance[refType] = {};
      }

      // Convert value to number for rate/adjustment fields
      const finalValue =
        field === "rate" || field === "adjustment"
          ? parseFloat(value) || 0
          : value;
      newRates[provinceCode][categoryId].refinance[refType][field] = finalValue;
    } else if (ltv === "rental") {
      // Handle rental category with new flat structure
      if (!newRates[provinceCode][categoryId].rental) {
        newRates[provinceCode][categoryId].rental = {};
      }

      // New flat structure: rental is directly { rate: 4.15, lender: "..." } or { adjustment: -0.26, lender: "..." }
      const finalValue =
        field === "rate" || field === "adjustment"
          ? parseFloat(value) || 0
          : value;
      newRates[provinceCode][categoryId].rental[field] = finalValue;
    } else {
      if (!newRates[provinceCode][categoryId][ltv]) {
        newRates[provinceCode][categoryId][ltv] = {};
      }

      // Convert value to number for rate/adjustment fields
      const finalValue =
        field === "rate" || field === "adjustment"
          ? parseFloat(value) || 0
          : value;
      newRates[provinceCode][categoryId][ltv][field] = finalValue;
    }

    setCurrentRates(newRates);
  };

  // Get value for input
  const getValue = (provinceCode, categoryId, ltv, field) => {
    const currentRates = getCurrentRates();
    const provinceRates = currentRates[provinceCode];

    if (!provinceRates || !provinceRates[categoryId]) return "";

    if (ltv.includes("refinance-")) {
      const refType = ltv.replace("refinance-", "");
      const value = provinceRates[categoryId]?.refinance?.[refType]?.[field];
      return value !== undefined && value !== null ? value : "";
    }

    // Handle rental category with new flat structure
    if (ltv === "rental") {
      const rentalData = provinceRates[categoryId]?.rental;
      if (!rentalData) return "";

      // New flat structure: rental is directly { rate: 4.15, lender: "..." } or { adjustment: -0.26, lender: "..." }
      const value = rentalData[field];
      return value !== undefined && value !== null ? value : "";
    }

    const value = provinceRates[categoryId]?.[ltv]?.[field];
    return value !== undefined && value !== null ? value : "";
  };

  // Save all rates
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const currentRates = getCurrentRates();

      // Transform data to the expected API format
      const formattedRates = {};
      rateCategories.forEach((category) => {
        formattedRates[category.id] = {};

        // Format LTV categories
        ltvCategories.forEach((ltv) => {
          formattedRates[category.id][ltv.id] = {};
          provinces.forEach((province) => {
            const provinceData = currentRates[province.code];
            if (
              provinceData &&
              provinceData[category.id] &&
              provinceData[category.id][ltv.id]
            ) {
              formattedRates[category.id][ltv.id] =
                provinceData[category.id][ltv.id];
            }
          });
        });

        // Format refinance categories
        formattedRates[category.id].refinance = {};
        refinanceCategories.forEach((refCat) => {
          formattedRates[category.id].refinance[refCat.id] = {};
          provinces.forEach((province) => {
            const provinceData = currentRates[province.code];
            if (
              provinceData &&
              provinceData[category.id] &&
              provinceData[category.id].refinance &&
              provinceData[category.id].refinance[refCat.id]
            ) {
              formattedRates[category.id].refinance[refCat.id] =
                provinceData[category.id].refinance[refCat.id];
            }
          });
        });

        // Format rental category
        formattedRates[category.id][rentalCategory.id] = {};
        provinces.forEach((province) => {
          const provinceData = currentRates[province.code];
          if (
            provinceData &&
            provinceData[category.id] &&
            provinceData[category.id][rentalCategory.id]
          ) {
            formattedRates[category.id][rentalCategory.id] =
              provinceData[category.id][rentalCategory.id];
          }
        });
      });

      const response = await fetch("/api/admin/rates/update-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates: formattedRates }),
      });

      if (response.ok) {
        alert("Rates saved successfully!");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save rates");
      }
    } catch (error) {
      console.error("Error saving rates:", error);
      alert("Error saving rates: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Reset all changes
  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all changes? This will reload the original data."
      )
    ) {
      window.location.reload();
    }
  };

  // Handle province click to open modal
  const handleProvinceClick = (province) => {
    setSelectedProvince(province);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProvince(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading rates data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 ">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-end w-full pt-4 space-x-2">
            <h1 className="pr-2 text-4xl font-bold text-gray-900 border-r border-gray-400">
              Rates Management
            </h1>
            <p className="text-gray-600 ">
              Last updated on{" "}
              {lastUpdatedDate
                ? lastUpdatedDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Loading..."}
            </p>
          </div>
          <div className="flex items-center mt-3 space-x-3">
            <PrimeRateCard
              primeRate={prime}
              onPrimeUpdate={handlePrimeUpdate}
              isUpdating={isPrimeUpdating}
              modalTitle="Update Prime Rate"
              buttonText="Update Prime Rate"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div
        className="mt-5 overflow-x-auto bg-white border border-gray-200 rounded-lg"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#bfdbfe #ffffff",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
            height: 8px;
          }
          div::-webkit-scrollbar-track {
            background: #ffffff;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb {
            background: #bfdbfe;
            border-radius: 4px;
          }
          div::-webkit-scrollbar-thumb:hover {
            background: #e5e7eb;
          }
        `}</style>
        <table className="divide-y divide-gray-200 w-fit">
          <thead className="bg-gray-50">
            {/* Main Category Headers */}
            <tr>
              <th
                rowSpan={2}
                className="sticky left-0 z-10 px-1 py-1 text-xs font-medium tracking-wider text-left text-gray-500 uppercase border-r border-gray-200 bg-gray-50"
              ></th>
              {rateCategories.map((category) => (
                <th
                  key={category.id}
                  colSpan={
                    ltvCategories.length + refinanceCategories.length + 1
                  }
                  className="px-1 py-2 text-xs font-semibold tracking-wider text-center text-gray-700 uppercase bg-gray-100 border-r-2 border-gray-200"
                >
                  {category.label}
                </th>
              ))}
            </tr>

            {/* Sub-category Headers */}
            <tr>
              {rateCategories.map((category) => (
                <React.Fragment key={`header-${category.id}`}>
                  {/* LTV Categories */}
                  {ltvCategories.map((ltv) => (
                    <th
                      key={`${category.id}-${ltv.id}`}
                      className="px-1 py-1 text-xs font-medium text-center text-blue-600 border-r border-gray-200 max-w-12"
                    >
                      {ltv.label}
                    </th>
                  ))}

                  {/* Refinance Categories */}
                  {refinanceCategories.map((refCat) => (
                    <th
                      key={`${category.id}-refinance-${refCat.id}`}
                      className="px-1 py-1 text-xs font-medium text-center text-green-600 border-r border-gray-200 max-w-12 bg-green-50"
                    >
                      <div>{refCat.label}</div>
                    </th>
                  ))}

                  {/* Rental Category */}
                  <th
                    key={`${category.id}-${rentalCategory.id}`}
                    className="px-1 py-1 text-xs font-medium text-center text-purple-600 border-r-2 border-gray-200 max-w-12 bg-purple-50"
                  >
                    {rentalCategory.label}
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {provinces.map((province) => (
              <tr key={province.code} className="hover:bg-blue-50 group">
                <td className="sticky left-0 z-10 flex items-center justify-center bg-white border-r border-gray-200 group-hover:bg-blue-50">
                  <div
                    className="flex flex-col items-center px-3 py-1 transition-colors cursor-pointer hover:bg-blue-200"
                    onClick={() => handleProvinceClick(province)}
                    title={`Edit rates for ${province.name}`}
                  >
                    <Image
                      src={`/images/${province.code.toLowerCase()}.jpg`}
                      alt={province.code}
                      width={32}
                      height={24}
                      className="object-cover w-6 h-4 rounded-sm"
                    />

                    <div className="mt-3 mb-2 text-xs font-semibold text-gray-700 leading-0">
                      {province.code}
                    </div>
                  </div>
                </td>

                {rateCategories.map((category) => (
                  <React.Fragment key={`body-${category.id}`}>
                    {/* LTV Categories */}
                    {ltvCategories.map((ltv) => (
                      <td
                        key={`${province.code}-${category.id}-${ltv.id}`}
                        className="px-1 py-1 align-top border-r border-gray-200 max-w-12 group-hover:bg-blue-50"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-center text-gray-900">
                            {(() => {
                              const value = getValue(
                                province.code,
                                category.id,
                                ltv.id,
                                category.type === "fixed"
                                  ? "rate"
                                  : "adjustment"
                              );
                              if (!value && value !== 0) return "-";
                              const numValue = parseFloat(value);
                              return isNaN(numValue)
                                ? "-"
                                : numValue.toFixed(2) +
                                    (category.type === "fixed" ? "%" : "");
                            })()}
                          </div>
                          <div className="text-[8px] text-center text-gray-500 truncate">
                            {getValue(
                              province.code,
                              category.id,
                              ltv.id,
                              "lender"
                            ) || "-"}
                          </div>
                        </div>
                      </td>
                    ))}

                    {/* Refinance Categories */}
                    {refinanceCategories.map((refCat) => (
                      <td
                        key={`${province.code}-${category.id}-refinance-${refCat.id}`}
                        className="px-1 py-1 align-top border-r border-gray-200 max-w-12 bg-green-50 group-hover:bg-blue-50"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-center text-gray-900">
                            {(() => {
                              const value = getValue(
                                province.code,
                                category.id,
                                `refinance-${refCat.id}`,
                                category.type === "fixed"
                                  ? "rate"
                                  : "adjustment"
                              );
                              if (!value && value !== 0) return "-";
                              const numValue = parseFloat(value);
                              return isNaN(numValue)
                                ? "-"
                                : numValue.toFixed(2) +
                                    (category.type === "fixed" ? "%" : "");
                            })()}
                          </div>
                          <div className="text-[8px] text-center text-gray-500 truncate">
                            {getValue(
                              province.code,
                              category.id,
                              `refinance-${refCat.id}`,
                              "lender"
                            ) || "-"}
                          </div>
                        </div>
                      </td>
                    ))}

                    {/* Rental Category */}
                    <td
                      key={`${province.code}-${category.id}-${rentalCategory.id}`}
                      className="px-1 py-1 align-top border-r-2 border-gray-200 max-w-12 bg-purple-50 group-hover:bg-blue-50"
                    >
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-center text-gray-900">
                          {(() => {
                            const value = getValue(
                              province.code,
                              category.id,
                              rentalCategory.id,
                              category.type === "fixed" ? "rate" : "adjustment"
                            );
                            if (!value && value !== 0) return "-";
                            const numValue = parseFloat(value);
                            return isNaN(numValue)
                              ? "-"
                              : numValue.toFixed(2) +
                                  (category.type === "fixed" ? "%" : "");
                          })()}
                        </div>
                        <div className="text-[8px] text-center text-gray-500 truncate">
                          {getValue(
                            province.code,
                            category.id,
                            rentalCategory.id,
                            "lender"
                          ) || "-"}
                        </div>
                      </div>
                    </td>
                  </React.Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-1 text-xs text-gray-600">
        <div>
          <strong>Legend:</strong>
        </div>
        <div>• Fixed rates: Enter rate percentage (e.g., 5.25)</div>
        <div>
          • Variable rates: Enter adjustment to prime (e.g., -0.8 for Prime -
          0.8%)
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 bg-blue-100 border border-blue-200 rounded"></div>
            <span>
              LTV Categories: ≤65%, ≤70%, ≤75%, ≤80%, Insured (&gt;80%)
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 border border-green-200 rounded bg-green-50"></div>
            <span>Refinance: ≤25yr, &gt;25yr amortization</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 mr-1 border border-purple-200 rounded bg-purple-50"></div>
            <span>Rental/Investment properties</span>
          </div>
        </div>
      </div>

      {/* Update Rates Modal */}
      {isModalOpen && selectedProvince && (
        <UpdateRatesForm
          province={selectedProvince}
          rates={rates[selectedProvince.code] || {}}
          onClose={handleModalClose}
          isRental={false}
        />
      )}
    </div>
  );
}
