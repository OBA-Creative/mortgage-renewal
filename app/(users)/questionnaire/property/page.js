"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import DollarInput from "@/components/form-elements/dollar-input";
import { useState } from "react";

export default function PropertyPage() {
  const [activeHelp, setActiveHelp] = useState(null);
  const [propertyValue, setPropertyValue] = useState("");
  const [helocBalance, setHelocBalance] = useState("");

  const helpTexts = {
    city: "Enter the city where your property is located.",
    usage:
      "Select how you currently use your property. This affects the mortgage rates and terms available to you. Primary residence typically offers the best rates.",
    downpaymentOption:
      "Tell us about your original downpayment. This helps us understand your current loan-to-value ratio and determines available refinancing options.",
    purchasePrice:
      "Enter the current market value of your property based on recent assessments or comparable sales in your area.",
    heloc:
      "A Home Equity Line of Credit (HELOC) is a revolving credit line secured by your home's equity. Let us know if you currently have one.",
    helocBalance:
      "Enter the current outstanding balance on your HELOC. This will be included in your total debt calculations.",
    propertyValue: "Enter the current estimated market value of your property.",
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
          helpTexts={helpTexts.usage}
          error={errors.usage}
        />

        {/* Down Payment Option */}
        <MapRadio
          id="downpaymentOption"
          register={register}
          requiredText="Select down payment option"
          label="How much was your downpayment?"
          options={downpaymentOptions}
          helpTexts={helpTexts.downpaymentOption}
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
            helpTexts={helpTexts.heloc}
            error={errors.heloc}
          />

          {heloc === "yes" && (
            <DollarInput
              id="helocBalance"
              label="What is your current HELOC balance?"
              setValue={setValue}
              valueState={helocBalance}
              setValueState={setHelocBalance}
              register={register}
              requiredText="HELOC balance is required"
              helpTexts={helpTexts.helocBalance}
              error={errors.helocBalance}
              placeholder="e.g. 75,000"
            />
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
          placeholder="e.g. 850,000"
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
