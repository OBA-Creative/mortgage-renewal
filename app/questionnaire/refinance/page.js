"use client";

import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import MapRadio from "@/components/form-elements/map-radio";
import NextButton from "@/components/form-elements/next-button";
import { useMortgageStore } from "@/stores/useMortgageStore";
import { useCallback, useState } from "react";
import DollarInput from "@/components/form-elements/dollar-input";

const helpTexts = {
  helocBalance:
    "Enter your current HELOC balance. This is the amount you currently owe on your HELOC.",
};

export default function PropertyPage() {
  const router = useRouter();
  const { formData, setFormData } = useMortgageStore();

  const [helocBalanceInput, setHelocBalanceInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      city: "",
      propertyUsage: "",
      purchasePrice: "",
      heloc: "",
      helocBalance: "",
    },
  });

  // Watch HELOC selection
  const heloc = watch("heloc");
  const helocBalance = useWatch({ control, name: "helocBalance" });

  const onSubmit = useCallback(
    (data) => {
      setFormData({ ...formData, ...data });
      console.log("Mortgage data:", data);
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
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
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
            />
          )}
        </div>
        {/* Submit Button */}
        <NextButton label="Continue" />
      </form>
    </div>
  );
}
