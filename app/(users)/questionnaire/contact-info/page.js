"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import TextInput from "@/components/form-elements/text-input";
import NextButton from "@/components/form-elements/next-button";
import { useMortgageStore } from "@/stores/useMortgageStore";

export default function ContactInfoPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  const formData = useMortgageStore((state) => state.formData);
  const setFormData = useMortgageStore((state) => state.setFormData);
  const [saving, setSaving] = useState(false);

  const helpTexts = {
    name: "Enter your full legal name as it appears on your identification and mortgage documents.",
    phone:
      "Provide a phone number where we can reach you to discuss your mortgage renewal options.",
    email:
      "Enter your primary email address where we can send you rate information and updates about your renewal.",
  };

  const router = useRouter();

  const onSubmit = async (data) => {
    // Merge contact info into store
    setFormData(data);

    // Combine existing store data with the contact info just entered
    const userData = { ...formData, ...data };

    try {
      setSaving(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await res.json();

      if (!result.success) {
        // Silently handle — user still proceeds
      }
    } catch (err) {
      // Silently handle — user still proceeds
    } finally {
      setSaving(false);
      router.push("/questionnaire/rates");
    }
  };

  return (
    <div className="">
      <h1 className="max-w-2xl my-8 text-4xl font-semibold text-center">
        {"Your rates are ready! Tell us how to reach you"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* First Name */}
        <TextInput
          type="text"
          label="First name"
          id="firstName"
          register={register}
          requiredText="First name is required"
          helpTexts={helpTexts.name}
          error={errors.firstName}
        />

        {/* Last Name */}
        <TextInput
          type="text"
          label="Last name"
          id="lastName"
          register={register}
          requiredText="Last name is required"
          helpTexts={helpTexts.name}
          error={errors.lastName}
        />

        {/* Phone Number */}
        <TextInput
          type="tel"
          label="Phone number"
          id="phone"
          register={register}
          requiredText="Phone number is required"
          helpTexts={helpTexts.phone}
          error={errors.phone}
        />

        {/* Email */}
        <TextInput
          type="email"
          label="Email address"
          id="email"
          register={register}
          requiredText="Email is required"
          helpTexts={helpTexts.email}
          error={errors.email}
        />

        {/* Submit */}
        <div className="flex justify-end">
          <NextButton label={saving ? "Saving..." : "Show me rates"} />
        </div>
      </form>
    </div>
  );
}
