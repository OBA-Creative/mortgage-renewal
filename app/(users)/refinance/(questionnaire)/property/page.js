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
    "Select how the property is currently used. This helps determine available mortgage rates and options.",
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

  // Update form values when formData changes (e.g., when navigating back).
  // Only set city/province when a stored value exists — if empty, the
  // PlacesAutocompleteInput's IP-geolocation init may have already set them
  // and overwriting with "" would break the auto-detected city.
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setValue("propertyUsage", formData.propertyUsage || "");
      if (formData.city) setValue("city", formData.city);
      if (formData.province) setValue("province", formData.province);
    }
  }, [formData, setValue]);

  const onSubmit = useCallback(
    (data) => {
      setFormData({ ...formData, ...data });
      router.push("/refinance/property/mortgage");
    },
    [formData, router, setFormData],
  );

  const usageOptions = [
    "Primary Residence",
    "Second Home",
    "Primary Residence w/ Rental Suite",
    "Rental / Investment",
  ];

  return (
    <div className="w-full">
      <h1 className="max-w-xl mb-8 text-4xl font-semibold text-center">
        Tell us about your property
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        {/* City & Province */}
        <PlacesAutocompleteInput
          label="Which city is your property located in?"
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
