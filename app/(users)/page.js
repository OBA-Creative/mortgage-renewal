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
        path
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
    <div className="flex flex-row justify-center min-h-screen bg-blue-1000">
      <div className="flex flex-col space-y-8 items-center justify-center w-full bg-blue-100  hover:bg-blue-200 transition-colors duration-200">
        <p className="text-5xl mb-6 font-bold">{"I'm renewing"}</p>
        <p className="text-2xl font-light">
          Find your personal renewal rates in under 2 minutes.
        </p>
        <button
          onClick={() => handlePathSelection("renew", "/questionnaire/renew")}
          className="px-10 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold duration-200 transition-colors cursor-pointer hover:scale-110"
        >
          Continue
        </button>
      </div>
      <div className="flex flex-col space-y-8 items-center justify-center w-full bg-blue-50  hover:bg-blue-200 transition-colors duration-200">
        <p className="text-5xl mb-6 font-bold">{"I'm refinancing"}</p>
        <p className="text-2xl font-light">
          Get the best refinance rates in a few easy steps.
        </p>
        <button
          onClick={() =>
            handlePathSelection("refinance", "/questionnaire/refinance")
          }
          className="px-10 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold duration-200 transition-colors cursor-pointer hover:scale-110"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
