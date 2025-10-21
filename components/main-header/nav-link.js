import Link from "next/link";

export default function NavLink({ href, label }) {
  return (
    <li>
      <Link
        href={href}
        className="px-3 py-2 font-semibold text-black transition-colors duration-200 hover:border-b-2 hover:border-blue-600"
      >
        {label}
      </Link>
    </li>
  );
}
