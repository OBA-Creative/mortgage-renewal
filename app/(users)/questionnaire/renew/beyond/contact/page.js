"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

export default function ContactPage() {
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
    <div className="">
      <h1 className="max-w-2xl mb-8 text-4xl font-semibold text-center">
        {"Share your info so we can send you the best rates"}
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
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
          />
          {errors.name && (
            <p className="mt-1 text-red-600">{errors.name.message}</p>
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
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
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
            {...register("email", { required: "Email is required" })}
            className="w-full px-4 py-4 text-lg bg-white border border-gray-300 rounded-md"
          />
          {errors.email && (
            <p className="mt-1 text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-12 py-3 font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
