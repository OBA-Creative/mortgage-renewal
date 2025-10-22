"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Building2Icon,
  ChartAreaIcon,
  LandmarkIcon,
  LogOut,
  TableIcon,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication on mount
  useEffect(() => {
    // If we're on the login page, don't check authentication
    if (pathname === "/adminz/login") {
      setIsLoading(false);
      return;
    }

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
          router.push("/adminz/login");
        }
      } catch (error) {
        localStorage.removeItem("adminSession");
        router.push("/adminz/login");
      }
    } else {
      router.push("/adminz/login");
    }
    setIsLoading(false);
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    router.push("/adminz/login");
  };

  // If we're on the login page, render children directly (no sidebar)
  if (pathname === "/adminz/login") {
    return children;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (redirect is happening)
  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    {
      name: "Rates",
      href: "/adminz",
      icon: <ChartAreaIcon className="w-5 h-5" />,
    },

    {
      name: "Lenders",
      href: "/adminz/lenders",
      icon: <LandmarkIcon className="w-5 h-5" />,
    },
  ];

  const isCurrentPage = (href) => {
    if (href === "/adminz") {
      return pathname === "/adminz";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Horizontal Navigation Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between ">
            {/* Logo */}
            <div className="flex items-end space-x-2 w-86">
              <div>
                <Image
                  src="/images/logo-blue-600.svg"
                  alt="Logo"
                  width={180}
                  height={45}
                  className="w-auto h-6 pb-1"
                />
              </div>
              <p className="font-semibold ">dashboard</p>
            </div>

            {/* Navigation Menu */}
            <nav className="items-center hidden space-x-8 md:flex">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isCurrentPage(item.href)
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 transition-colors border border-red-200 rounded-lg cursor-pointer hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="ml-2">Logout</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className="mt-4 md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Navigation
              </h2>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100"
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
                    d={
                      sidebarOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Items */}
            {sidebarOpen && (
              <div className="pt-4 pb-4 space-y-2 border-t border-gray-200">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isCurrentPage(item.href)
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
