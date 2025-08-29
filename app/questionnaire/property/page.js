"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import DollarInput from "@/components/form-elements/dollar-input";
import { useState } from "react";

export default function PropertyPage() {
  const [activeHelp, setActiveHelp] = useState(null);
  const [propertyValue, setPropertyValue] = useState("");

  const helpTexts = {
    city: "Enter the city where your property is located.",
    usage: "Select the current use case for your property.",
    purchasePrice: "Enter the purchase price of your property.",
    heloc: "Do you have a HELOC?",
    helocBalance: "Enter your current HELOC balance.",
    propertyValue: "Enter the current value of your property.",
  };

  const {
    register,
    handleSubmit,
    setValue,
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
    router.push("/questionnaire/mortgage");
  };

  const usageOptions = [
    "Primary Residence",
    "Second home",
    "Owner-occupied and Rental",
    "Rental / Investment ",
  ];

  const downpaymentOptions = ["20% or more", "Less than 20%"];
  const helocOptions = ["yes", "no"];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        {"Let's learn about your property"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Usage Radio Select as selectable cards */}
        <MapRadio
          id="usage"
          register={register}
          requiredText="Select usage"
          label="How do you use your property?"
          options={usageOptions}
          error={errors.usage}
        />

        {/* Down Payment Option */}
        <MapRadio
          id="downpaymentOption"
          register={register}
          requiredText="Select down payment option"
          label="How much was your downpayment?"
          options={downpaymentOptions}
          error={errors.downpaymentOption}
        />
        {/* HELOC Question */}
        <div className="flex flex-col space-y-4">
          <MapRadio
            id="heloc"
            register={register}
            requiredText="Select an option"
            label="Do you have a HELOC?"
            options={helocOptions}
            error={errors.heloc}
          />

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

        <DollarInput
          id="purchasePrice"
          label="Property value?"
          setValue={setValue}
          valueState={propertyValue}
          setValueState={setPropertyValue}
          register={register}
          requiredText="Property value is required"
          helpTexts={helpTexts.propertyValue}
          error={errors.purchasePrice}
        />

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
