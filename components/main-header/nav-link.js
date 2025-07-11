import Link from "next/link";

export default function NavLink({ href, label }) {
  return (
    <li>
      <Link
        href={href}
        className="text-black text-base font-semibold px-2 py-2 hover:border-b-2 hover:border-blue-600 transition-colors duration-200"
      >
        {label}
      </Link>
    </li>
  );
}
