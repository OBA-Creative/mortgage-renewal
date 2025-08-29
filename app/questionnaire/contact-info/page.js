"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import TextInput from "@/components/form-elements/text-input";
import NextButton from "@/components/form-elements/next-button";

export default function ContactInfoPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
    },
  });

  const router = useRouter();

  const onSubmit = (data) => {
    console.log("Contact info:", data);
    router.push("/questionnaire/rates");
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        {"Your rates are ready! Tell us how to reach you"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Name */}
        <TextInput
          type="text"
          label="Full name"
          id="name"
          register={register}
          requiredText="Name is required"
          error={errors.name}
        />

        {/* Phone Number */}
        <TextInput
          type="tel"
          label="Phone number"
          id="phone"
          register={register}
          requiredText="Phone number is required"
          error={errors.phone}
        />

        {/* Email */}
        <TextInput
          type="email"
          label="Email address"
          id="email"
          register={register}
          requiredText="Email is required"
          error={errors.email}
        />

        {/* Submit */}
        <div className="flex justify-end">
          <NextButton label="Show me rates" />
        </div>
      </form>
    </div>
  );
}
