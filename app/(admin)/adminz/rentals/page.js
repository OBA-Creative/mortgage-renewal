"use client";

import { useState, useEffect } from "react";
import AdminProvinceCard from "@/components/cards/admin-province-card";
import PrimeRateCard from "@/components/cards/prime-rate-card";
import { useMortgageStore } from "@/stores/useMortgageStore";

export default function RentalsDashboard() {
  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(null);
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

  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      // Fetch rental rates and regular rates (for prime rate) in parallel
      const [rentalResponse, regularResponse] = await Promise.all([
        fetch("/api/admin/rental-rates"),
        fetch("/api/admin/rates"),
      ]);

      const rentalData = await rentalResponse.json();
      const regularData = await regularResponse.json();

      if (rentalData.success && regularData.success) {
        console.log("Fetched rental rates data:", rentalData.rates);
        console.log("Sample province ON:", rentalData.rates.ON);
        console.log("Prime rate from regular rates:", regularData.rates.prime);

        // Combine rental rates with prime rate from regular rates collection
        const combinedRates = {
          ...rentalData.rates,
          prime: regularData.rates.prime, // Use prime rate from Rates collection
        };

        setRates(combinedRates);
        setEffectiveDate(new Date(rentalData.effectiveDate));
      } else {
        console.error(
          "Failed to fetch rates:",
          rentalData.message || regularData.message
        );
      }
    } catch (error) {
      console.error("Error fetching rental rates:", error);
    } finally {
      setRatesLoading(false);
    }
  };

  const handlePrimeUpdate = async (newPrimeRate) => {
    setIsPrimeUpdating(true);

    try {
      const response = await fetch("/api/admin/prime/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prime: newPrimeRate,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setRates((prev) => ({
          ...prev,
          prime: data.prime,
        }));
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
      <div className="flex justify-between mb-8 space-24">
        <div className="w-full pt-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Rental Rates Management
          </h1>
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
        {/* Prime Rate Card */}
        {rates && (
          <PrimeRateCard
            primeRate={rates.prime}
            onPrimeUpdate={handlePrimeUpdate}
            isUpdating={isPrimeUpdating}
          />
        )}
      </div>

      {/* Loading State */}
      {ratesLoading && (
        <div className="py-12 text-center">
          <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600 bg-white rounded-md shadow">
            <svg
              className="w-5 h-5 mr-3 -ml-1 text-blue-600 animate-spin"
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

      {/* Province Navigation */}
      {rates && (
        <div className="sticky top-0 z-10 flex items-center p-2 mb-8 border border-gray-200 rounded-lg shadow-md bg-white/95 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2 mx-auto">
            {provinces.map((province) => (
              <button
                key={province.code}
                onClick={() => {
                  const element = document.getElementById(
                    `province-${province.code}`
                  );
                  if (element) {
                    const elementRect = element.getBoundingClientRect();
                    const offset = 80; // 100px + some extra padding
                    const targetPosition =
                      elementRect.top + window.pageYOffset - offset;

                    window.scrollTo({
                      top: targetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 border border-gray-200 rounded-md cursor-pointer bg-gray-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
              >
                {province.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Provincial Rates Grid */}
      {rates && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {provinces.map((province) => (
            <div key={province.code} id={`province-${province.code}`}>
              <AdminProvinceCard
                province={province}
                rates={rates[province.code]}
                primeRate={rates.prime}
                isRental={true}
              />
            </div>
          ))}
        </div>
      )}

      {/* No Rates Message */}
      {!ratesLoading && !rates && (
        <div className="py-12 text-center">
          <div className="p-4 rounded-md bg-yellow-50">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  No rates available
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    No rental mortgage rates found in the database. Please run
                    the rental rate insertion script to populate rates data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
