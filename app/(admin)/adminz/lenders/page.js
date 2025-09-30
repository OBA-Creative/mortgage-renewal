"use client";

import { LandmarkIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useMortgageStore } from "../../../../stores/useMortgageStore";

export default function LendersPage() {
  const [lenders, setLenders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLenderName, setNewLenderName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [togglingLenders, setTogglingLenders] = useState(new Set());
  const [deletingLenders, setDeletingLenders] = useState(new Set());

  // Get cache clearing function from store
  const { clearLenderCache } = useMortgageStore();

  // Fetch lenders when component mounts
  useEffect(() => {
    fetchLenders();
  }, []);

  const fetchLenders = async () => {
    setIsLoading(true);
    setError("");
    try {
      // Get both active and inactive lenders for management page
      const response = await fetch("/api/admin/lenders?activeOnly=false");
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
        // Clear lender cache so dropdowns get updated data
        clearLenderCache();
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

  const handleToggleActive = async (lenderId, currentStatus) => {
    setTogglingLenders((prev) => new Set([...prev, lenderId]));

    try {
      const response = await fetch("/api/admin/lenders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: lenderId,
          isActive: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLenders((prev) =>
          prev.map((lender) =>
            lender._id === lenderId
              ? {
                  ...lender,
                  isActive: data.lender.isActive,
                  updatedAt: data.lender.updatedAt,
                }
              : lender
          )
        );
        // Clear lender cache so dropdowns get updated data
        clearLenderCache();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error toggling lender status:", error);
      alert("Network error. Please try again.");
    } finally {
      setTogglingLenders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lenderId);
        return newSet;
      });
    }
  };

  const handleDeleteLender = async (lenderId, lenderName) => {
    if (
      !confirm(
        `Are you sure you want to delete "${lenderName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingLenders((prev) => new Set([...prev, lenderId]));

    try {
      const response = await fetch(`/api/admin/lenders?id=${lenderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setLenders((prev) => prev.filter((lender) => lender._id !== lenderId));
        // Clear lender cache so dropdowns get updated data
        clearLenderCache();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting lender:", error);
      alert("Network error. Please try again.");
    } finally {
      setDeletingLenders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lenderId);
        return newSet;
      });
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Lenders Management</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage mortgage lenders in the system
        </p>
      </div>
      {/* Summary Stats */}
      {/*
      {!isLoading && lenders.length > 0 && (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <LandmarkIcon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Lenders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {lenders.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {lenders.filter((l) => l.isActive).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Inactive
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {lenders.filter((l) => !l.isActive).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      */}
      {/* Add Lender Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
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
                          <LandmarkIcon className="h-6 w-6 text-blue-600" />
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
                          {lender.createdAt
                            ? new Date(lender.createdAt).toLocaleDateString()
                            : "Unknown"}
                          {lender.updatedAt &&
                            lender.updatedAt !== lender.createdAt && (
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
                    <div className="flex items-center space-x-3">
                      {/* Toggle Switch */}
                      <div className="flex items-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={lender.isActive}
                            onChange={() =>
                              handleToggleActive(lender._id, lender.isActive)
                            }
                            disabled={togglingLenders.has(lender._id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          {togglingLenders.has(lender._id) && (
                            <svg
                              className="ml-2 w-4 h-4 animate-spin text-gray-500"
                              fill="none"
                              stroke="currentColor"
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
                          )}
                        </label>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() =>
                          handleDeleteLender(lender._id, lender.lenderName)
                        }
                        disabled={deletingLenders.has(lender._id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete lender"
                      >
                        {deletingLenders.has(lender._id) ? (
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
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
                        ) : (
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        )}
                      </button>
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
      {/* Add Lender Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
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
