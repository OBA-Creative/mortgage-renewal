"use client";

import { useRouter } from "next/navigation";
import { useMortgageStore } from "@/stores/useMortgageStore";

export default function Home() {
  const router = useRouter();
  const { formData, resetForm, setFormData } = useMortgageStore();

  const handlePathSelection = (path, url) => {
    // Only reset if user is switching to a different path
    if (formData.path && formData.path !== path) {
      resetForm();
      console.log(
        "Mortgage store cleared - switching from",
        formData.path,
        "to",
        path,
      );
    } else if (!formData.path) {
      console.log("Setting initial path:", path);
    } else {
      console.log("Continuing with same path:", path);
    }

    // Set the current path
    setFormData({ path });

    // Navigate to the selected path
    router.push(url);
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center min-h-screen bg-blue-1000">
      <div className="flex flex-col items-center justify-center w-full min-h-[50vh] py-12 lg:py-0 space-y-4 lg:space-y-8 transition-colors duration-200 bg-blue-100 hover:bg-blue-200">
        <p className="mb-2 lg:mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold">
          {"I'm renewing"}
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl font-light px-4 text-center">
          Find your personal renewal rates in under 2 minutes.
        </p>
        <button
          onClick={() => handlePathSelection("renew", "/questionnaire/renew")}
          className="px-10 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
        >
          Continue
        </button>
      </div>
      <div className="flex flex-col items-center justify-center w-full min-h-[50vh] py-12 lg:py-0 space-y-4 lg:space-y-8 transition-colors duration-200 bg-blue-50 hover:bg-blue-200">
        <p className="mb-2 lg:mb-6 text-3xl sm:text-4xl lg:text-5xl font-bold">
          {"I'm refinancing"}
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl font-light px-4 text-center">
          Get the best refinance rates in a few easy steps.
        </p>
        <button
          onClick={() =>
            handlePathSelection("refinance", "/questionnaire/refinance")
          }
          className="px-10 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
