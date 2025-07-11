"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

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
        <div className="flex flex-col space-y-2">
          <label htmlFor="name" className="text-2xl">
            Full name
          </label>
          <input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
          />
          {errors.name && (
            <p className="text-red-600 mt-1">{errors.name.message}</p>
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
            {...register("phone", { required: "Phone number is required" })}
            className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
          />
          {errors.phone && (
            <p className="text-red-600 mt-1">{errors.phone.message}</p>
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
            {...register("email", { required: "Email is required" })}
            className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
          />
          {errors.email && (
            <p className="text-red-600 mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-full hover:bg-blue-500 font-semibold py-3 px-12"
          >
            Show me rates
          </button>
        </div>
      </form>
    </div>
  );
}
