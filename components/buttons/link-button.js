import Link from "next/link";

export default function LinkButton({ label, link }) {
  return (
    <Link
      href={link}
      className="px-10 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg "
    >
      {label}
    </Link>
  );
}
