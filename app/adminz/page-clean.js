"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rates, setRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [effectiveDate, setEffectiveDate] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Check if already authenticated
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        // Check if session is still valid (less than 24 hours old)
        const sessionTime = new Date(session.timestamp);
        const now = new Date();
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminSession");
        }
      } catch (error) {
        localStorage.removeItem("adminSession");
      }
    }
  }, []);

  // Fetch rates when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchRates();
    }
  }, [isAuthenticated]);

  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const response = await fetch("/api/admin/rates");
      const data = await response.json();

      if (data.success) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        // Store session in localStorage
        const sessionData = {
          admin: data.admin,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem("adminSession", JSON.stringify(sessionData));
        setIsAuthenticated(true);
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    setIsAuthenticated(false);
    setCredentials({ email: "", password: "" });
  };

  if (isAuthenticated) {
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Z&apos;s Dashboard
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
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Loading State */}
          {ratesLoading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-blue-600 bg-white">
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
            <div className="mb-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-blue-800">
                      Prime Rate
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p className="text-3xl font-bold">{rates.prime}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Provincial Rates Grid */}
          {rates && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provinces.map((province) => {
                const provinceRates = rates[province.code];
                if (!provinceRates) return null;

                return (
                  <div
                    key={province.code}
                    className="bg-white overflow-hidden shadow rounded-lg"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-8 rounded-md overflow-hidden shadow-md border border-gray-200">
                            <Image
                              src={province.flagImage}
                              alt={`${province.name} flag`}
                              width={48}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="ml-4 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              {province.name}
                            </dt>
                            <dd className="text-xs text-gray-400 font-mono">
                              {province.code}
                            </dd>
                          </dl>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {/* Rate Display with LTV Categories */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">
                              3-Year Fixed:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900 block">
                                {provinceRates.threeYrFixed?.under80}%
                              </span>
                              <span className="text-xs text-gray-500">
                                (≤80% LTV)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">
                              4-Year Fixed:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-gray-900 block">
                                {provinceRates.fourYrFixed?.under80}%
                              </span>
                              <span className="text-xs text-gray-500">
                                (≤80% LTV)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">
                              5-Year Fixed:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-green-600 block">
                                {provinceRates.fiveYrFixed?.under80}%
                              </span>
                              <span className="text-xs text-gray-500">
                                (≤80% LTV)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">
                              3-Year Variable:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-blue-600 block">
                                {provinceRates.threeYrVariable?.under80}%
                              </span>
                              <span className="text-xs text-gray-500">
                                (≤80% LTV)
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 font-medium">
                              5-Year Variable:
                            </span>
                            <div className="text-right">
                              <span className="font-semibold text-blue-600 block">
                                {provinceRates.fiveYrVariable?.under80}%
                              </span>
                              <span className="text-xs text-gray-500">
                                (≤80% LTV)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* LTV Range Indicator */}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex justify-between">
                              <span>Range:</span>
                              <span>
                                {provinceRates.fiveYrFixed?.under65}% -{" "}
                                {provinceRates.fiveYrFixed?.over80}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Refinance:</span>
                              <span>
                                {provinceRates.fiveYrFixed?.refinance}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                        No mortgage rates found in the database. Please run the
                        rate insertion script to populate rates data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Access Required
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please sign in with your administrator credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({ ...credentials, email: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure admin authentication
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
