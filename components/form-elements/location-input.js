export default function LocationInput({ register, errorCity, errorProvince }) {
  const provinceOptions = [
    "AB",
    "BC",
    "MB",
    "NB",
    "NL",
    "NS",
    "ON",
    "PE",
    "QC",
    "SK",
    "NT",
    "NU",
    "YT",
  ];
  return (
    <div className="space-y-4">
      <p htmlFor="city" className="text-xl font-semibold">
        What city and province is your property in?
      </p>
      <div className="flex space-x-4">
        <div className="flex flex-col w-3/4 space-y-2">
          <input
            id="city"
            type="text"
            placeholder="Enter city"
            {...register("city", { required: "City is required" })}
            className="w-full rounded-md border border-gray-300 bg-white py-4 px-4 text-lg"
          />
          {errorCity && (
            <p className="text-red-600 mt-1">{errorCity.message}</p>
          )}
        </div>
        <div className="flex flex-col w-1/4 space-y-2">
          <div className="relative border rounded-md border-gray-300 bg-white">
            <select
              id="province"
              {...register("province", {
                required: "Province is required",
              })}
              className="appearance-none w-full bg-transparent py-4 pl-4 pr-10 text-lg rounded-md"
            >
              <option value="" disabled>
                Select
              </option>
              {provinceOptions.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </span>
          </div>
          {errorProvince && (
            <p className="text-red-600 mt-1">{errorProvince.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
