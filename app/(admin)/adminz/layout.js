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
      name: "Rentals",
      href: "/adminz/rentals",
      icon: <Building2Icon className="w-5 h-5" />,
    },
    {
      name: "Spreadsheet",
      href: "/adminz/horizontal",
      icon: <TableIcon className="w-5 h-5" />,
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
    <div className="relative flex min-h-screen bg-blue-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`sticky top-0 h-screen  left-0 z-50 w-64 bg-white border-r-1  border-gray-300 drop-shadow-2xl rounded-r-xl overflow-hidden `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-center p-4 bg-blue-600 border-b border-gray-300 shadow-md  h-18">
            <Image
              src="/images/mobile-logo-white.svg"
              alt="Logo"
              width={160}
              height={40}
              className="m-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isCurrentPage(item.href)
                    ? "bg-blue-50 text-blue-700 "
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 transition-colors rounded-lg cursor-pointer hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="w-full lg:pl-8">
        {/* Mobile header */}
        <div className="flex items-center justify-between h-16 px-4 bg-white shadow-sm lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
