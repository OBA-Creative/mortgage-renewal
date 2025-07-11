import Link from "next/link";

export default function LinkButton({ label, link }) {
  return (
    <Link
      href={link}
      className="px-10 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold duration-200 transition-colors cursor-pointer hover:scale-110"
    >
      {label}
    </Link>
  );
}
