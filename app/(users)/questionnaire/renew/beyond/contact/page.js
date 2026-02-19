"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  });

  const router = useRouter();

  // Phone formatting logic
  const phoneValue = watch("phone") || "";

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "+1 ";
    const countryCode = digits.charAt(0) === "1" ? digits.slice(1) : digits;
    if (countryCode.length === 0) return "+1 ";
    if (countryCode.length <= 3) return `+1 (${countryCode}`;
    if (countryCode.length <= 6)
      return `+1 (${countryCode.slice(0, 3)}) ${countryCode.slice(3)}`;
    return `+1 (${countryCode.slice(0, 3)}) ${countryCode.slice(3, 6)} ${countryCode.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    if (input.length < 3) {
      setValue("phone", "+1 ", { shouldValidate: true });
      return;
    }
    setValue("phone", formatPhoneNumber(input), { shouldValidate: true });
  };

  const handlePhoneKeyDown = (e) => {
    if (
      (e.key === "Backspace" || e.key === "Delete") &&
      phoneValue.length <= 4
    ) {
      e.preventDefault();
      setValue("phone", "+1 ");
    }
  };

  const handlePhoneFocus = () => {
    if (!phoneValue || phoneValue.length < 3) {
      setValue("phone", "+1 ");
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          email: data.email.trim(),
          path: "renew",
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setSubmitError(result.message || "Failed to save. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact info:", error);
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center py-10 space-y-6 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900">
            You're all set!
          </h3>
          <p className="max-w-md text-gray-600">
            Your information has been submitted successfully. We'll be in touch
            with the best rates for you!
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-10 py-3 font-semibold text-white transition-all duration-200 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 hover:scale-110 hover:shadow-lg"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="max-w-xl mb-8 text-4xl font-semibold text-center">
        {"Share your info so we can send you the best rates"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-8">
        {/* First Name */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="firstName" className="text-2xl">
            First name
          </label>
          <input
            id="firstName"
            type="text"
            placeholder="Enter first name"
            {...register("firstName", { required: "First name is required" })}
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
          />
          {errors.firstName && (
            <p className="mt-1 text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="lastName" className="text-2xl">
            Last name
          </label>
          <input
            id="lastName"
            type="text"
            placeholder="Enter last name"
            {...register("lastName", { required: "Last name is required" })}
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
          />
          {errors.lastName && (
            <p className="mt-1 text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="phone" className="text-2xl">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneValue}
            onChange={handlePhoneChange}
            onKeyDown={handlePhoneKeyDown}
            onFocus={handlePhoneFocus}
            placeholder="Enter phone number"
            inputMode="tel"
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
          />
          <input
            type="hidden"
            {...register("phone", { required: "Phone number is required" })}
          />
          {errors.phone && (
            <p className="mt-1 text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-2xl">
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter email address"
            {...register("email", { required: "Email is required" })}
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
          />
          {errors.email && (
            <p className="mt-1 text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Error Message */}
        {submitError && <p className="text-red-600">{submitError}</p>}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-12 py-3 font-semibold text-white bg-blue-600 rounded-full cursor-pointer hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}
