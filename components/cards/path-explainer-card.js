import { Dot } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMortgageStore } from "../../stores/useMortgageStore";

export default function PathExplainerCard({
  link,
  btnLabel = "Continue",
  title,
  item1,
  item2,
  item3,
}) {
  const router = useRouter();
  const { formData, resetForm, setPath } = useMortgageStore();

  // Derive the target path from the link ("renew" or "refinance")
  const getTargetPath = (href) => {
    if (href.includes("refinance")) return "refinance";
    if (href.includes("renew")) return "renew";
    return "";
  };

  const handleClick = (e) => {
    e.preventDefault();
    const targetPath = getTargetPath(link);

    if (formData.path && formData.path !== targetPath) {
      // Switching paths — reset the store first
      resetForm();
    }

    setPath(targetPath);
    router.push(link);
  };

  return (
    <div className="max-w-md px-5 py-4 mx-auto text-center text-gray-700 bg-white border border-blue-200 rounded-lg shadow-xl sm:px-10">
      <div className="flex flex-col items-start space-y-2 text-left">
        <p className="text-lg font-semibold sm:text-xl">{title}</p>
        <div className="flex flex-col space-y-1">
          <div className="flex items-center ">
            <Dot
              size={10}
              strokeWidth={10}
              className="inline-block mr-2 text-blue-600 shrink-0"
            />
            <p className="text-sm sm:text-base">{item1}</p>
          </div>
          <div className="flex items-center ">
            <Dot
              size={10}
              strokeWidth={10}
              className="inline-block mr-2 text-blue-600 shrink-0"
            />
            <p className="text-sm sm:text-base">{item2}</p>
          </div>
          <div className="flex items-center ">
            <Dot
              size={10}
              strokeWidth={10}
              className="inline-block mr-2 text-blue-600 shrink-0"
            />
            <p className="text-sm sm:text-base">{item3}</p>
          </div>
        </div>
      </div>

      <Link
        href={link}
        onClick={handleClick}
        className="inline-block px-6 py-2.5 mt-5 text-sm font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer sm:px-10 sm:py-3 sm:mt-6 sm:text-base hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
      >
        {btnLabel}
      </Link>

      <p className="hidden mt-4 text-xs text-gray-400 lg:block sm:mt-6 sm:text-base">
        Not sure? No worries - you can explore both paths and see which one fits
        your needs best.
      </p>
    </div>
  );
}
