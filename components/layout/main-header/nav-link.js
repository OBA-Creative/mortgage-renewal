import Link from "next/link";

export default function NavLink({ href, label }) {
  return (
    <li>
      <Link
        href={href}
        className="px-3 py-2 font-semibold transition-colors duration-200 hover:border-b-2 hover:border-blue-500 hover:text-blue-500"
      >
        {label}
      </Link>
    </li>
  );
}
