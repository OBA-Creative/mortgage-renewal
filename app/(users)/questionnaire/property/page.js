"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import DollarInput from "@/components/form-elements/dollar-input";
import PlacesAutocompleteInput from "@/components/form-elements/places-autocomplete-input";
import { useMortgageStore } from "@/stores/useMortgageStore";
import { useState } from "react";
import NextButton from "@/components/form-elements/next-button";

export default function PropertyPage() {
  const { formData, setFormData } = useMortgageStore();
  const [activeHelp, setActiveHelp] = useState(null);

  const helpTexts = {
    city: "Enter the city where your property is located.",
    usage:
      "Select how you currently use your property. This affects the mortgage rates and terms available to you.",
    downpaymentOption:
      "Tell us about your original downpayment. This helps us understand your current loan-to-value ratio and determines available refinancing options.",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      city: formData.city || "",
      province: formData.province || "",
      usage: formData.propertyUsage || "",
      downpaymentOption: formData.downpaymentValue || "",
    },
  });

  const router = useRouter();

  // Watch province and usage
  const province = watch("province");
  const usage = watch("usage");

  const onSubmit = (data) => {
    console.log("Form data:", data);

    // Validate that we have both city and province
    if (!data.city || !data.province) {
      if (!data.city) {
        setError("city", {
          type: "manual",
          message: "Please select a city from the suggestions",
        });
      }
      if (!data.province) {
        setError("city", {
          type: "manual",
          message:
            "Province information is required. Please select a city from the suggestions.",
        });
      }
      return;
    }

    // Save to store
    setFormData({
      city: data.city,
      province: data.province,
      propertyUsage: data.usage,
      downpaymentValue: data.downpaymentOption,
    });

    router.push("/questionnaire/mortgage");
  };

  const usageOptions = [
    "Primary Residence",
    "Second Home",
    "Primary Residence + Rental Suite",
    "Rental / Investment ",
  ];

  const downpaymentOptions = ["20% or more", "Less than 20%"];

  return (
    <div className="">
      <h1 className="mb-8 text-4xl font-semibold text-center ">
        {"Let's learn about your property"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* City Question */}
        <PlacesAutocompleteInput
          id="city"
          label="Which city is your property located in?"
          register={register}
          requiredText="City is required"
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
          error={errors.city}
          helpTexts={helpTexts.city}
          provinceFieldId="province"
          defaultValue={formData.city}
          onCityProvince={(data) => {
            // This callback is triggered when a city is selected
            // The province is automatically set by the component
            console.log("Selected city/province:", data);
          }}
        />

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

        {/* Down Payment Option - only show for Primary Residence or Second home */}
        {(usage === "Primary Residence" || usage === "Second home") && (
          <MapRadio
            id="downpaymentOption"
            register={register}
            requiredText="Select down payment option"
            label="How much was your downpayment?"
            options={downpaymentOptions}
            helpTexts={helpTexts.downpaymentOption}
            error={errors.downpaymentOption}
          />
        )}

        {/* Submit Button */}

        <NextButton label="Continue" />
      </form>
    </div>
  );
}
