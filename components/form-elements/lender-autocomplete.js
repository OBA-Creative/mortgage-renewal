"use client";

import { useState, useRef, useEffect } from "react";
import { useMortgageStore } from "../../stores/useMortgageStore";

const LenderAutocomplete = ({
  id,
  label,
  lenders = [], // Can be array of strings (legacy) or array of lender objects
  lenderObjects = [], // Full lender objects with IDs for delete functionality
  value = "",
  onChange,
  onSelect,
  onLenderAdded, // Callback when a new lender is added
  onLenderDeleted, // Callback when a lender is deleted
  placeholder = "Search lenders...",
  required = false,
  error,
  disabled = false,
  className = "",
  dropdownWidth = "w-full", // Control dropdown width - can be "w-full", "w-64", "w-80", etc.
  alignDropdown = "left", // Control dropdown alignment - "left" or "right"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filteredLenders, setFilteredLenders] = useState(lenders);
  const [filteredLenderObjects, setFilteredLenderObjects] =
    useState(lenderObjects);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isAddingLender, setIsAddingLender] = useState(false);
  const [deletingLenders, setDeletingLenders] = useState(new Set());

  // Get store functions for cache management and data fetching
  const { clearLenderCache, fetchLenders } = useMortgageStore();

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter lenders based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLenders(lenders);
      setFilteredLenderObjects(lenderObjects);
    } else {
      const searchLower = searchTerm.toLowerCase();

      // Filter string lenders (legacy support)
      const filtered = lenders.filter((lender) =>
        lender.toLowerCase().includes(searchLower)
      );
      setFilteredLenders(filtered);

      // Filter lender objects
      const filteredObjects = lenderObjects.filter((lender) =>
        lender.lenderName.toLowerCase().includes(searchLower)
      );
      setFilteredLenderObjects(filteredObjects);
    }
    setHighlightedIndex(-1);
  }, [searchTerm, lenders, lenderObjects]);

  // Update search term when value prop changes
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Handle lender selection
  const handleSelectLender = (lender) => {
    setSearchTerm(lender);
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onSelect) {
      onSelect(lender);
    }
    if (onChange) {
      onChange(lender);
    }
  };

  // Handle adding a new lender
  const handleAddNewLender = async (lenderName) => {
    if (!lenderName.trim() || isAddingLender) return;

    setIsAddingLender(true);
    try {
      const response = await fetch("/api/admin/lenders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lenderName: lenderName.trim(),
          isActive: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("Lender added successfully to DB:", data.lender);

        // Force clear cache and fetch fresh data from DB
        console.log("Before cache clear - forcing fresh fetch...");
        clearLenderCache();

        // Add a small delay to ensure cache is cleared
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log("Cache cleared, fetching fresh data...");
        await fetchLenders();
        console.log("Fresh data fetched after add");

        // Select the newly added lender
        handleSelectLender(lenderName.trim());

        // Notify parent component if callback provided
        if (onLenderAdded) {
          onLenderAdded(data.lender);
        }

        console.log("Successfully added new lender:", lenderName);
      } else {
        console.error("Error adding lender:", data.message);
        alert("Error adding lender: " + data.message);
      }
    } catch (error) {
      console.error("Network error adding lender:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsAddingLender(false);
    }
  };

  // Handle deleting a lender
  const handleDeleteLender = async (lenderId, lenderName, e) => {
    e.stopPropagation(); // Prevent selecting the lender when clicking delete

    setDeletingLenders((prev) => new Set([...prev, lenderId]));

    try {
      const response = await fetch(`/api/admin/lenders?id=${lenderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        // Clear lender cache and fetch fresh data from DB
        clearLenderCache();
        await fetchLenders();

        // Notify parent component if callback provided
        if (onLenderDeleted) {
          onLenderDeleted(lenderId, lenderName);
        }

        console.log("Successfully deleted lender:", lenderName);
      } else {
        console.error("Error deleting lender:", data.message);
        alert("Error deleting lender: " + data.message);
      }
    } catch (error) {
      console.error("Network error deleting lender:", error);
      alert("Network error. Please try again.");
    } finally {
      setDeletingLenders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(lenderId);
        return newSet;
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      // Only allow ArrowDown to open dropdown, not Enter
      if (e.key === "ArrowDown") {
        setIsOpen(true);
        return;
      }
      // Prevent Enter from doing anything when dropdown is closed
      if (e.key === "Enter") {
        e.preventDefault();
        return;
      }
      return;
    }

    const hasAddOption =
      filteredLenders.length === 0 &&
      filteredLenderObjects.length === 0 &&
      searchTerm.trim();
    const totalOptions =
      Math.max(filteredLenders.length, filteredLenderObjects.length) +
      (hasAddOption ? 1 : 0);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
        break;
      case "Enter":
        e.preventDefault();
        e.stopPropagation();

        // Ensure we're only processing input-level keyboard events, not from buttons
        if (e.target !== inputRef.current) {
          return;
        }

        const hasLenders =
          filteredLenders.length > 0 || filteredLenderObjects.length > 0;

        // Only allow Enter key to select existing lenders, not add new ones or delete
        if (hasLenders) {
          if (highlightedIndex >= 0) {
            // Select the highlighted item - prefer lender objects if available
            if (filteredLenderObjects[highlightedIndex]) {
              handleSelectLender(
                filteredLenderObjects[highlightedIndex].lenderName
              );
            } else if (filteredLenders[highlightedIndex]) {
              handleSelectLender(filteredLenders[highlightedIndex]);
            }
          } else {
            // Select the first item if no item is highlighted
            if (filteredLenderObjects.length > 0) {
              handleSelectLender(filteredLenderObjects[0].lenderName);
            } else if (filteredLenders.length > 0) {
              handleSelectLender(filteredLenders[0]);
            }
          }
        }
        // Removed: Add new lender functionality with Enter key
        // Users must click to add new lenders
        // Note: Delete operations are completely blocked via button handlers
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
  };

  // Handle input blur
  const handleBlur = (e) => {
    // Delay to allow click on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }, 150);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block mb-1 text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        id={id}
        type="text"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
          error
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen &&
        (filteredLenders.length > 0 || filteredLenderObjects.length > 0) && (
          <div
            ref={dropdownRef}
            className={`absolute z-50 ${dropdownWidth} mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60 ${
              alignDropdown === "right" ? "right-0" : "left-0"
            }`}
          >
            {/* Show lender objects with delete buttons if available */}
            {filteredLenderObjects.length > 0
              ? filteredLenderObjects.map((lender, index) => (
                  <div
                    key={`${lender._id}-${index}`}
                    className={`px-3 py-2 cursor-pointer text-sm flex items-center justify-between ${
                      index === highlightedIndex
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={(e) => {
                      // Only select lender if clicking on the main area, not the delete button
                      if (e.target.closest("button")) return;
                      handleSelectLender(lender.lenderName);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span>{lender.lenderName}</span>
                    <button
                      onClick={(e) =>
                        handleDeleteLender(lender._id, lender.lenderName, e)
                      }
                      onKeyDown={(e) => {
                        // Prevent ALL keyboard events from triggering on delete button
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onFocus={(e) => {
                        // Prevent button from ever receiving focus
                        e.target.blur();
                      }}
                      disabled={deletingLenders.has(lender._id)}
                      className="p-1 ml-2 text-gray-300 transition-colors duration-200 rounded cursor-pointer hover:text-red-500 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete lender"
                      tabIndex="-1"
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
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
                ))
              : /* Fallback to string lenders for backward compatibility */
                filteredLenders.map((lender, index) => (
                  <div
                    key={`${lender}-${index}`}
                    className={`px-3 py-2 cursor-pointer text-sm ${
                      index === highlightedIndex
                        ? "bg-blue-100 text-blue-900"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectLender(lender)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {lender}
                  </div>
                ))}
          </div>
        )}

      {/* No results - Add new lender option */}
      {isOpen &&
        filteredLenders.length === 0 &&
        filteredLenderObjects.length === 0 &&
        searchTerm.trim() && (
          <div
            ref={dropdownRef}
            className={`absolute z-50 ${dropdownWidth} mt-1 bg-white border border-gray-300 rounded-md shadow-lg ${
              alignDropdown === "right" ? "right-0" : "left-0"
            }`}
          >
            <div
              className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 ${
                highlightedIndex === 0
                  ? "bg-blue-100 text-blue-900"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
              onClick={() => handleAddNewLender(searchTerm.trim())}
              onMouseEnter={() => setHighlightedIndex(0)}
            >
              {isAddingLender ? (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 animate-spin"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Adding lender...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-600"
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
                  Add &ldquo;{searchTerm}&ldquo;
                </div>
              )}
            </div>
          </div>
        )}

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default LenderAutocomplete;
