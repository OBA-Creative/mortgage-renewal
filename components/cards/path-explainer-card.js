import { Dot } from "lucide-react";
import Link from "next/link";

export default function PathExplainerCard({
  link,
  btnLabel = "Continue",
  title,
  item1,
  item2,
  item3,
}) {
  return (
    <div className="max-w-md px-10 py-4 mx-auto text-center text-gray-700 bg-white border border-blue-200 rounded-lg shadow-xl">
      <div className="flex flex-col items-start space-y-2 text-left">
        <p className="text-xl font-semibold">{title}</p>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center ">
            <Dot
              size={10}
              strokeWidth={10}
              className="inline-block mr-2 text-blue-600"
            />
            <p>{item1}</p>
          </div>
          <div className="flex items-center ">
            <Dot
              size={10}
              strokeWidth={10}
              className="inline-block mr-2 text-blue-600"
            />
            <p>{item2}</p>
          </div>
          <div className="flex items-center ">
            <Dot
              size={10}
              strokeWidth={10}
              className="inline-block mr-2 text-blue-600"
            />
            <p>{item3}</p>
          </div>
        </div>
      </div>

      <Link
        href={link}
        className="inline-block px-10 py-3 mt-6 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
      >
        {btnLabel}
      </Link>

      <p className="mt-6 text-gray-400 ">
        Not sure? No worries - you can explore both paths and see which one fits
        your needs best.
      </p>
    </div>
  );
}
