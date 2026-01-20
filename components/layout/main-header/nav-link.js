import Link from "next/link";

export default function NavLink({ href, label, onClick }) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="block px-3 py-2 font-semibold text-center transition-colors duration-200 hover:border-b-2 hover:border-blue-500 hover:text-blue-500 lg:inline lg:text-left"
      >
        {label}
      </Link>
    </li>
  );
}
