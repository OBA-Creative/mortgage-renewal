import Link from "next/link";
import Image from "next/image";
import logo from "@/public/images/logo-blue-600.svg";
import NavLink from "./nav-link";

export default function MainHeader() {
  return (
    <header className="px-32 ">
      <div className="flex items-center justify-between max-w-6xl py-6 mx-auto text-white">
        <Link href="/">
          <Image
            src={logo}
            alt="Mortgage Renewals Logo"
            width={420}
            height={40}
          />
        </Link>
        <nav>
          <ul className="flex space-x-[6px] ">
            <NavLink href="/" label="Home" />
            <NavLink href="/faqs" label="FAQs" />
            <NavLink href="/contact" label="Contact" />
          </ul>
        </nav>
      </div>
    </header>
  );
}
