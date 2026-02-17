"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import NextButton from "@/components/form-elements/next-button";
import { useMortgageStore } from "@/stores/useMortgageStore";
import { useCallback, useEffect } from "react";
import PlacesAutocompleteInput from "@/components/form-elements/places-autocomplete-input";

const helpTexts = {
  propertyUsage:
    "Select how you currently use your property. This affects the rates and terms available to you.",
  city: "Enter your city to help us provide accurate local mortgage rates and connect you with lenders in your area. We'll auto-detect your location, but you can change it as needed.",
};

export default function PropertyPage() {
  const router = useRouter();
  const { formData, setFormData } = useMortgageStore();

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      propertyUsage: formData.propertyUsage || "",
      city: formData?.city || "",
      province: formData?.province || "",
    },
  });

  // Update form values when formData changes (e.g., when navigating back)
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setValue("propertyUsage", formData.propertyUsage || "");
      setValue("city", formData.city || "");
      setValue("province", formData.province || "");
    }
  }, [formData, setValue]);

  const onSubmit = useCallback(
    (data) => {
      setFormData({ ...formData, ...data });
      router.push("/questionnaire/refinance/mortgage");
    },
    [formData, router, setFormData],
  );

  const usageOptions = [
    "Primary Residence",
    "Second Home",
    "Primary Residence + Rental Suite",
    "Rental / Investment",
  ];

  return (
    <div className="">
      <h1 className="max-w-2xl mb-8 text-4xl font-semibold text-center">
        {"Let's learn about your property"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* City & Province */}
        <PlacesAutocompleteInput
          label="What city is your property in?"
          id="city"
          register={register}
          requiredText="City is required"
          error={errors.city}
          setValue={setValue}
          setError={setError}
          clearErrors={clearErrors}
          provinceFieldId="province"
          defaultValue={formData?.city || ""}
          helpTexts={helpTexts.city}
        />

        {/* Usage Radio Select as selectable cards */}
        <MapRadio
          id="propertyUsage"
          label="How do you use your property?"
          options={usageOptions}
          register={register}
          requiredText="Select how you use your property"
          helpTexts={helpTexts.propertyUsage}
          error={errors.propertyUsage}
        />

        {/* Submit Button */}
        <NextButton label="Continue" />
      </form>
    </div>
  );
}
