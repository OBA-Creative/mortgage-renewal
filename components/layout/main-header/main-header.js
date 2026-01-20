"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo-blue-600.svg";
import mobileLogo from "@/public/images/mobile_logo-blue-600.svg";
import NavLink from "./nav-link";

export default function MainHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-4 bg-white md:px-8 lg:px-32">
      <div className="flex items-center justify-between pt-4 pb-6 mx-auto text-black max-w-7xl">
        <Link href="https://mortgage-renewals.webflow.io/">
          <Image
            src={logo}
            alt="Mortgage Renewals Logo"
            width={420}
            height={24}
            className="hidden md:w-[340px] md:block lg:w-[420px]"
          />
          <Image
            src={mobileLogo}
            alt="Mortgage Renewals Logo"
            width={420}
            height={24}
            className="block h-auto w-50 md:hidden"
          />
        </Link>

        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="z-50 flex flex-col items-center justify-center w-10 h-10 space-y-1.5 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span
            className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${
              isMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${
              isMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-blue-600 transition-all duration-300 ${
              isMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block">
          <ul className="flex space-x-[12px] items-center">
            <NavLink
              href="https://mortgage-renewals.webflow.io/"
              label="Home"
            />
            <NavLink
              href="https://mortgage-renewals.webflow.io/frequently-asked-question"
              label="FAQs"
            />
            <NavLink
              href="https://mortgage-renewals.webflow.io/contact"
              label="Contact"
            />
            <Link
              href="/"
              className="px-5 py-2 ml-1 font-semibold text-blue-600 transition-colors duration-200 border-2 border-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:border-blue-500 hover:text-white"
            >
              Renew Now
            </Link>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <nav
          className={`fixed top-0 left-0 right-0 w-full bg-white/50 backdrop-blur-md shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden z-20 ${
            isMenuOpen ? "translate-y-20" : "-translate-y-full"
          }`}
        >
          <ul className="flex flex-col items-center pt-20 pb-8 space-y-4">
            <NavLink
              href="https://mortgage-renewals.webflow.io/"
              label="Home"
              onClick={() => setIsMenuOpen(false)}
            />
            <NavLink
              href="https://mortgage-renewals.webflow.io/frequently-asked-question"
              label="FAQs"
              onClick={() => setIsMenuOpen(false)}
            />
            <NavLink
              href="https://mortgage-renewals.webflow.io/contact"
              label="Contact"
              onClick={() => setIsMenuOpen(false)}
            />
            <li className="px-4 py-2">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-5 py-2 font-semibold text-center text-blue-600 transition-colors duration-200 border-2 border-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:border-blue-500 hover:text-white"
              >
                Renew Now
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
