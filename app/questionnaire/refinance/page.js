"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function PropertyPage() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      city: "",
      usage: "",
      purchasePrice: "",
      heloc: "",
      helocBalance: "",
    },
  });

  const router = useRouter();

  // Watch HELOC selection
  const heloc = watch("heloc");

  const onSubmit = (data) => {
    console.log("Form data:", data);
    router.push("/questionnaire/refinance/mortgage");
  };

  const usageOptions = [
    "Primary Residence",
    "Second Home",
    "Owner-occupied and Rental",
    "Rental / Investment",
  ];

  const helocOptions = ["yes", "no"];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        {"Let's learn about your property"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Usage Radio Select as selectable cards */}
        <div className="flex flex-col space-y-4">
          <p className="text-2xl">How do you use your property?</p>
          <div className="grid grid-cols-2 gap-4">
            {usageOptions.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  value={option}
                  {...register("usage", { required: "Select usage" })}
                  className="sr-only peer"
                />
                <div className="cursor-pointer rounded-md border bg-white border-gray-300 p-4 peer-checked:border-blue-600 peer-checked:ring ring-blue-600 peer-checked:bg-blue-100 hover:bg-blue-100 text-center">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </div>
              </label>
            ))}
          </div>
          {errors.usage && (
            <p className="text-red-600 mt-1">{errors.usage.message}</p>
          )}
        </div>

        {/* HELOC Question */}
        <div className="flex flex-col space-y-4">
          <p className="text-2xl">Do you have a HELOC?</p>
          <div className="grid grid-cols-2 gap-4">
            {helocOptions.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  value={option}
                  {...register("heloc", { required: "Select an option" })}
                  className="sr-only peer"
                />
                <div className="cursor-pointer rounded-md border bg-white border-gray-300 p-4 peer-checked:border-blue-600 peer-checked:ring ring-blue-600 peer-checked:bg-blue-100 hover:bg-blue-100 text-center">
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </div>
              </label>
            ))}
          </div>
          {errors.heloc && (
            <p className="text-red-600 mt-1">{errors.heloc.message}</p>
          )}

          {heloc === "yes" && (
            <div className="flex flex-col space-y-2">
              <label htmlFor="helocBalance" className="text-2xl block">
                What is your current HELOC balance?
              </label>
              <div className="relative border rounded-md border-gray-300 bg-white">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
                  $
                </span>
                <input
                  id="helocBalance"
                  {...register("helocBalance", {
                    required: "HELOC balance is required",
                    valueAsNumber: true,
                  })}
                  className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
                />
              </div>
              {errors.helocBalance && (
                <p className="text-red-600 mt-1">
                  {errors.helocBalance.message}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Property Value */}
        <div className="flex flex-col space-y-4">
          <label htmlFor="purchasePrice" className="text-2xl">
            Property value?
          </label>
          <div className="relative border rounded-md border-gray-300 bg-white">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-lg text-gray-400">
              $
            </span>
            <input
              id="purchasePrice"
              {...register("purchasePrice", {
                required: "Purchase price is required",
                valueAsNumber: true,
              })}
              className="w-full rounded-md pl-7 pr-5 py-4 text-lg"
            />
          </div>
          {errors.purchasePrice && (
            <p className="text-red-600 mt-1">{errors.purchasePrice.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold py-3 px-12"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
