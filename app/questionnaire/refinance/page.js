"use client";

import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import NextButton from "@/components/form-elements/next-button";
import { useMortgageStore } from "@/stores/useMortgageStore";
import { useCallback, useState, useEffect } from "react";
import DollarInput from "@/components/form-elements/dollar-input";

const helpTexts = {
  helocBalance:
    "Enter your current HELOC balance. This is the amount you currently owe on your HELOC.",
};

// Safe number formatting that handles both strings and numbers
const formatNumber = (value) => {
  if (!value && value !== 0) return "";

  // Convert to string and remove all non-digits
  const raw = String(value).replace(/\D/g, "");
  if (!raw) return "";

  // Add commas for thousands separator
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const parseNumber = (formattedValue) => {
  // Remove commas and convert to number
  const raw = String(formattedValue).replace(/,/g, "");
  const parsed = parseFloat(raw);
  // Return 0 for invalid numbers instead of empty string, or the parsed number
  return isNaN(parsed) ? 0 : parsed;
};

export default function PropertyPage() {
  const router = useRouter();
  const { formData, setFormData } = useMortgageStore();

  const [helocBalanceInput, setHelocBalanceInput] = useState("");

  // Initialize input state with store values when component mounts or formData changes
  useEffect(() => {
    if (formData.helocBalance) {
      setHelocBalanceInput(formatNumber(formData.helocBalance.toString()));
    }
  }, [formData.helocBalance]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      propertyUsage: formData.propertyUsage || "",
      heloc: formData.heloc || "",
      helocBalance: formData.helocBalance || 0,
    },
  });

  // Update form values when formData changes (e.g., when navigating back)
  useEffect(() => {
    if (formData && Object.keys(formData).length > 0) {
      setValue("propertyUsage", formData.propertyUsage || "");
      setValue("heloc", formData.heloc || "");
      setValue("helocBalance", formData.helocBalance || 0);
    }
  }, [formData, setValue]);

  // Watch HELOC selection
  const heloc = watch("heloc");

  const onSubmit = useCallback(
    (data) => {
      const payload = {
        ...data,
        helocBalance: parseNumber(data.helocBalance),
      };
      setFormData({ ...formData, ...payload });
      console.log("Mortgage data:", payload);
      router.push("/questionnaire/refinance/mortgage");
    },
    [formData, router, setFormData]
  );

  const usageOptions = [
    "Primary Residence",
    "Second Home",
    "Primary Residence With Suite",
    "Rental / Investment",
  ];

  const helocOptions = ["yes", "no"];

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center mb-8 max-w-2xl">
        {"Let's learn about your property"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Usage Radio Select as selectable cards */}
        <MapRadio
          id="propertyUsage"
          label="How do you use your property?"
          options={usageOptions}
          register={register}
          requiredText="Select how you use your property"
          error={errors.propertyUsage}
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
            <DollarInput
              id="helocBalance"
              setValue={setValue}
              label="What is your current HELOC balance?"
              valueState={helocBalanceInput}
              setValueState={setHelocBalanceInput}
              register={register}
              helpTexts={helpTexts.helocBalance}
              requiredText="Current HELOC balance is required"
              error={errors.helocBalance}
              defaultValue={formData?.helocBalance}
            />
          )}
        </div>
        {/* Submit Button */}
        <NextButton label="Continue" />
      </form>
    </div>
  );
}
