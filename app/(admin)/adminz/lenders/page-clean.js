"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LendersPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lenders, setLenders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLenderName, setNewLenderName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const router = useRouter();

  // Check authentication on mount
  useEffect(() => {
    const adminSession = localStorage.getItem("adminSession");
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        const sessionTime = new Date(session.timestamp);
        const now = new Date();
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminSession");
          router.push("/adminz");
        }
      } catch (error) {
        localStorage.removeItem("adminSession");
        router.push("/adminz");
      }
    } else {
      router.push("/adminz");
    }
  }, [router]);

  // Fetch lenders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLenders();
    }
  }, [isAuthenticated]);

  const fetchLenders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/lenders");
      const data = await response.json();

      if (data.success) {
        setLenders(data.lenders || []);
      } else {
        setError(data.message || "Failed to fetch lenders");
      }
    } catch (error) {
      console.error("Error fetching lenders:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLender = async (e) => {
    e.preventDefault();
    if (!newLenderName.trim()) return;

    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/lenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderName: newLenderName.trim(),
          isActive: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLenders((prev) =>
          [...prev, data.lender].sort((a, b) =>
            a.lenderName.localeCompare(b.lenderName)
          )
        );
        setNewLenderName("");
        setIsAddModalOpen(false);
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error adding lender:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/adminz");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/adminz")}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
          <div className="mt-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Lenders Management
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage mortgage lenders in the system
            </p>
          </div>
        </div>

        {/* Add Lender Button */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Lender
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
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
              Loading lenders...
            </div>
          </div>
        )}

        {/* Lenders List */}
        {!isLoading && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {lenders.length === 0 ? (
              <div className="text-center py-12">
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        No lenders found
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          No lenders found in the database. Run the setup script
                          to add initial lenders:
                        </p>
                        <code className="mt-2 block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
                          npm run setup-lenders
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {lenders.map((lender, index) => (
                  <li key={lender._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg
                              className="h-5 w-5 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2-14h10m-5 2v6m3-3H9"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">
                              {lender.lenderName}
                            </div>
                            {lender.isActive ? (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Added:{" "}
                            {new Date(lender.createdAt).toLocaleDateString()}
                            {lender.updatedAt !== lender.createdAt && (
                              <>
                                {" "}
                                • Updated:{" "}
                                {new Date(
                                  lender.updatedAt
                                ).toLocaleDateString()}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">
                          #{index + 1}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {lenders.length > 0 && (
              <div className="bg-gray-50 px-6 py-3">
                <div className="text-sm text-gray-500">
                  Total: {lenders.length} lender
                  {lenders.length !== 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Lender Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Add New Lender
                </h3>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewLenderName("");
                  }}
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
              <form onSubmit={handleAddLender}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lender Name
                  </label>
                  <input
                    type="text"
                    value={newLenderName}
                    onChange={(e) => setNewLenderName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter lender name"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the full name of the mortgage lender
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setNewLenderName("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding || !newLenderName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
                  >
                    {isAdding ? "Adding..." : "Add Lender"}
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
