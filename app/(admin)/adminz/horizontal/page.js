"use client";

import { useState, useEffect } from "react";
import { Save, RotateCcw, Download, Upload } from "lucide-react";
import Image from "next/image";

const provinces = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

const rateCategories = [
  { id: "threeYrFixed", label: "3-Year Fixed", type: "fixed" },
  { id: "fourYrFixed", label: "4-Year Fixed", type: "fixed" },
  { id: "fiveYrFixed", label: "5-Year Fixed", type: "fixed" },
  { id: "threeYrVariable", label: "3-Year Variable", type: "variable" },
  { id: "fiveYrVariable", label: "5-Year Variable", type: "variable" },
];

const ltvCategories = ["under65", "under70", "under75", "under80", "over80"];
const refinanceCategories = ["under25", "over25"];

export default function HorizontalPage() {
  const [rates, setRates] = useState({});
  const [rentalRates, setRentalRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("standard");
  const [prime, setPrime] = useState(0);

  // Fetch rates data
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);

        // Fetch both standard and rental rates
        const [ratesResponse, rentalRatesResponse, primeResponse] =
          await Promise.all([
            fetch("/api/rates"),
            fetch("/api/rates?type=rental"),
            fetch("/api/admin/prime"),
          ]);

        if (ratesResponse.ok) {
          const ratesData = await ratesResponse.json();
          setRates(ratesData.rates || {});
        }

        if (rentalRatesResponse.ok) {
          const rentalRatesData = await rentalRatesResponse.json();
          setRentalRates(rentalRatesData.rates || {});
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

    fetchRates();
  }, []);

  // Initialize empty rate structure for a province
  const initializeProvinceRates = () => {
    const structure = {};
    rateCategories.forEach((category) => {
      structure[category.id] = {};

      // Regular LTV rates
      ltvCategories.forEach((ltv) => {
        if (category.type === "fixed") {
          structure[category.id][ltv] = { rate: 0, lender: "" };
        } else {
          structure[category.id][ltv] = { adjustment: 0, lender: "" };
        }
      });

      // Refinance rates
      structure[category.id].refinance = {};
      refinanceCategories.forEach((refCat) => {
        if (category.type === "fixed") {
          structure[category.id].refinance[refCat] = { rate: 0, lender: "" };
        } else {
          structure[category.id].refinance[refCat] = {
            adjustment: 0,
            lender: "",
          };
        }
      });
    });
    return structure;
  };

  // Get current rates data based on active tab
  const getCurrentRates = () =>
    activeTab === "standard" ? rates : rentalRates;
  const setCurrentRates = (newRates) => {
    if (activeTab === "standard") {
      setRates(newRates);
    } else {
      setRentalRates(newRates);
    }
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
          formattedRates[category.id][ltv] = {};
          provinces.forEach((province) => {
            const provinceData = currentRates[province.code];
            if (
              provinceData &&
              provinceData[category.id] &&
              provinceData[category.id][ltv]
            ) {
              formattedRates[category.id][ltv] = provinceData[category.id][ltv];
            }
          });
        });

        // Format refinance categories
        formattedRates[category.id].refinance = {};
        refinanceCategories.forEach((refCat) => {
          formattedRates[category.id].refinance[refCat] = {};
          provinces.forEach((province) => {
            const provinceData = currentRates[province.code];
            if (
              provinceData &&
              provinceData[category.id] &&
              provinceData[category.id].refinance &&
              provinceData[category.id].refinance[refCat]
            ) {
              formattedRates[category.id].refinance[refCat] =
                provinceData[category.id].refinance[refCat];
            }
          });
        });
      });

      const endpoint =
        activeTab === "standard"
          ? "/api/admin/rates/update-all"
          : "/api/admin/rental-rates/update-all";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rates: formattedRates }),
      });

      if (response.ok) {
        alert(
          `${activeTab === "standard" ? "Standard" : "Rental"} rates saved successfully!`
        );
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rates data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Rates Spreadsheet
          </h1>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600">
              Prime Rate: <span className="font-semibold">{prime}%</span>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("standard")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "standard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Standard Rates
            </button>
            <button
              onClick={() => setActiveTab("rental")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "rental"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Rental Rates
            </button>
          </nav>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-10 px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                Province
              </th>
              {rateCategories.map((category) => (
                <th
                  key={category.id}
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200"
                >
                  <div className="space-y-1">
                    <div>{category.label}</div>
                    <div className="grid grid-cols-5 gap-1 text-[10px]">
                      <div>≤65%</div>
                      <div>≤70%</div>
                      <div>≤75%</div>
                      <div>≤80%</div>
                      <div>&gt;80%</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] border-t pt-1">
                      <div>≤25yr</div>
                      <div>&gt;25yr</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {provinces.map((province) => (
              <tr key={province.code} className="hover:bg-gray-50">
                <td className="sticky left-0 z-10 px-4 py-3 bg-white border-r border-gray-200">
                  <div className="flex items-center">
                    <Image
                      src={`/images/${province.code.toLowerCase()}.jpg`}
                      alt={province.code}
                      width={24}
                      height={16}
                      className="w-6 h-4 rounded-sm mr-2 object-cover"
                    />
                    <div className="text-sm font-medium text-gray-900">
                      {province.code}
                    </div>
                  </div>
                </td>
                {rateCategories.map((category) => (
                  <td
                    key={`${province.code}-${category.id}`}
                    className="px-2 py-2 border-r border-gray-200"
                  >
                    <div className="space-y-2">
                      {/* Regular LTV rates */}
                      <div className="grid grid-cols-5 gap-1">
                        {ltvCategories.map((ltv) => (
                          <div key={ltv} className="space-y-1">
                            <input
                              type="number"
                              step="0.01"
                              className="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={
                                category.type === "fixed" ? "Rate" : "Adj"
                              }
                              value={getValue(
                                province.code,
                                category.id,
                                ltv,
                                category.type === "fixed"
                                  ? "rate"
                                  : "adjustment"
                              )}
                              onChange={(e) =>
                                handleRateChange(
                                  province.code,
                                  category.id,
                                  ltv,
                                  category.type === "fixed"
                                    ? "rate"
                                    : "adjustment",
                                  e.target.value
                                )
                              }
                            />
                            <select
                              className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              value={getValue(
                                province.code,
                                category.id,
                                ltv,
                                "lender"
                              )}
                              onChange={(e) =>
                                handleRateChange(
                                  province.code,
                                  category.id,
                                  ltv,
                                  "lender",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Lender</option>
                              <option value="TD Bank">TD</option>
                              <option value="RBC">RBC</option>
                              <option value="BMO">BMO</option>
                              <option value="Scotia">Scotia</option>
                              <option value="CIBC">CIBC</option>
                              <option value="National Bank">National</option>
                            </select>
                          </div>
                        ))}
                      </div>

                      {/* Refinance rates */}
                      <div className="grid grid-cols-2 gap-1 border-t border-gray-100 pt-1">
                        {refinanceCategories.map((refCat) => (
                          <div key={refCat} className="space-y-1">
                            <input
                              type="number"
                              step="0.01"
                              className="w-full px-1 py-1 text-xs border border-gray-200 rounded text-center focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              placeholder={
                                category.type === "fixed" ? "Rate" : "Adj"
                              }
                              value={getValue(
                                province.code,
                                category.id,
                                `refinance-${refCat}`,
                                category.type === "fixed"
                                  ? "rate"
                                  : "adjustment"
                              )}
                              onChange={(e) =>
                                handleRateChange(
                                  province.code,
                                  category.id,
                                  `refinance-${refCat}`,
                                  category.type === "fixed"
                                    ? "rate"
                                    : "adjustment",
                                  e.target.value
                                )
                              }
                            />
                            <select
                              className="w-full px-1 py-1 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              value={getValue(
                                province.code,
                                category.id,
                                `refinance-${refCat}`,
                                "lender"
                              )}
                              onChange={(e) =>
                                handleRateChange(
                                  province.code,
                                  category.id,
                                  `refinance-${refCat}`,
                                  "lender",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Lender</option>
                              <option value="TD Bank">TD</option>
                              <option value="RBC">RBC</option>
                              <option value="BMO">BMO</option>
                              <option value="Scotia">Scotia</option>
                              <option value="CIBC">CIBC</option>
                              <option value="National Bank">National</option>
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <div>
          <strong>Legend:</strong>
        </div>
        <div>• Fixed rates: Enter rate percentage (e.g., 5.25)</div>
        <div>
          • Variable rates: Enter adjustment to prime (e.g., -0.8 for Prime -
          0.8%)
        </div>
        <div>• LTV Categories: ≤65%, ≤70%, ≤75%, ≤80%, &gt;80%</div>
        <div>
          • Refinance: ≤25yr (≤25 years amortization), &gt;25yr (&gt;25 years
          amortization)
        </div>
      </div>
    </div>
  );
}
