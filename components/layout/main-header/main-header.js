import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo-blue-600.svg";
import NavLink from "./nav-link";

export default function MainHeader() {
  return (
    <header className="px-32">
      <div className="flex items-center justify-between pt-4 pb-6 mx-auto text-black max-w-7xl">
        <Link href="https://mortgage-renewals.webflow.io/">
          <Image
            src={logo}
            alt="Mortgage Renewals Logo"
            width={420}
            height={24}
          />
        </Link>
        <nav>
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
      </div>
    </header>
  );
}
