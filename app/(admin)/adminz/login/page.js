"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

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
        router.push("/adminz");
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center min-h-screen py-12 bg-blue-50 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center w-20 h-20 mx-auto bg-blue-600 rounded-full">
            <svg
              className="w-10 h-10 text-white"
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
        <h2 className="mt-2 text-3xl font-bold text-center text-gray-900">
          Admin Access Required
        </h2>
        <p className="mt-2 text-sm text-center text-gray-600">
          Please sign in with your administrator credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="px-10 py-8 bg-white rounded-lg shadow-md ">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="relative px-4 py-3 text-red-700 border border-red-200 rounded bg-red-50">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block font-semibold text-gray-700"
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
                  className="block w-full h-12 px-3 py-2 text-lg placeholder-gray-400 border border-gray-300 rounded-sm shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block font-semibold text-gray-700"
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
                  className="block w-full h-12 px-3 py-2 text-lg placeholder-gray-400 border border-gray-300 rounded-sm shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 "
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex justify-center w-48 px-4 py-2 mx-auto mt-6 font-semibold text-white transition-all bg-blue-600 border border-transparent rounded-full shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 "
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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
        </div>
      </div>
    </div>
  );
}
