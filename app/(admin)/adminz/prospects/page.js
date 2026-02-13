"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HighlighterIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";

const USERS_PER_PAGE = 25;

export default function ProspectsPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(users.length / USERS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * USERS_PER_PAGE;
    return users.slice(start, start + USERS_PER_PAGE);
  }, [users, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (data.success) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Failed to fetch prospects");
      }
    } catch (err) {
      console.error("Error fetching prospects:", err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    if (!value) return "—";
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const capitalize = (str) => {
    if (!str) return "—";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    const pageIds = paginatedUsers.map((u) => u._id);
    const allPageSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleHighlight = async () => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    try {
      const ids = [...selectedIds];
      // Toggle: if all selected are already highlighted, unhighlight them; otherwise highlight
      const allHighlighted = ids.every(
        (id) => users.find((u) => u._id === id)?.isHighlighted,
      );
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isHighlighted: !allHighlighted }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            ids.includes(u._id) ? { ...u, isHighlighted: !allHighlighted } : u,
          ),
        );
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error("Error highlighting users:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (
      !confirm(
        `Are you sure you want to delete ${count} ${count === 1 ? "prospect" : "prospects"}? This cannot be undone.`,
      )
    ) {
      return;
    }
    setActionLoading(true);
    try {
      const ids = [...selectedIds];
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => !ids.includes(u._id)));
        setSelectedIds(new Set());
        setCurrentPage((p) =>
          Math.min(
            p,
            Math.max(
              1,
              Math.ceil((users.length - ids.length) / USERS_PER_PAGE),
            ),
          ),
        );
      }
    } catch (err) {
      console.error("Error deleting users:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
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
          Loading prospects...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <UsersIcon className="text-blue-600 w-7 h-7" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
            <p className="text-sm text-gray-500">
              {users.length} {users.length === 1 ? "prospect" : "prospects"}{" "}
              total
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons — visible only when users are selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 mb-4 border border-blue-200 rounded-lg bg-blue-50">
          <span className="text-sm font-medium text-blue-700">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleHighlight}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
          >
            <HighlighterIcon className="w-4 h-4" />
            Highlight
          </button>
          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2Icon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      {/* Table */}
      {users.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-lg">
          <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900">
            No prospects yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Prospects will appear here when users submit their information.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        paginatedUsers.length > 0 &&
                        paginatedUsers.every((u) => selectedIds.has(u._id))
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Province
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Property Value
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Mortgage Balance
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Lender
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Maturity Date
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Rate Term
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Rate %
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Monthly Payment
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Rate Lender
                  </th>
                  <th className="px-4 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Submitted
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={`transition-colors ${
                      user.isHighlighted
                        ? "bg-amber-50 hover:bg-amber-100"
                        : "hover:bg-gray-50"
                    } ${selectedIds.has(user._id) ? "bg-blue-50" : ""}`}
                  >
                    <td className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user._id)}
                        onChange={() => toggleSelect(user._id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <a
                        href={`mailto:${user.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {user.path ? (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.path === "refinance"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {capitalize(user.path)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.province || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatCurrency(user.propertyValue)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatCurrency(user.mortgageBalance)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.lender === "Other"
                        ? user.otherLender || "Other"
                        : user.lender || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.maturityDate || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.selectedRate?.term || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {user.selectedRate?.percentage
                        ? `${user.selectedRate.percentage}%`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.selectedRate?.monthlyPayment
                        ? formatCurrency(user.selectedRate.monthlyPayment)
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {user.selectedRate?.lender || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * USERS_PER_PAGE + 1}
                </span>
                –
                <span className="font-medium">
                  {Math.min(currentPage * USERS_PER_PAGE, users.length)}
                </span>{" "}
                of <span className="font-medium">{users.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    setSelectedIds(new Set());
                  }}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    setSelectedIds(new Set());
                  }}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
