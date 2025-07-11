import RateCard from "@/components/cards/rate-card";

export default function RatesPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl mx-auto">
        {"Here are the best rates that match your profile"}
      </h1>
      <p className="text-xl text-center">
        {
          "If we lock in your rate today, you will be protected from future rate increases for 120 days."
        }
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2  gap-10 mt-8">
        <RateCard percentage="5.99%" monthyPayment="$5,500" term="3-yr fixed" />
        <RateCard percentage="4.67%" monthyPayment="$5,200" term="5-yr fixed" />
        <RateCard
          percentage="3.26%"
          monthyPayment="$4,930"
          term="3-yr variable"
        />
        <RateCard
          percentage="3.70%"
          monthyPayment="$5,000"
          term="5-yr variable"
        />
      </div>
    </div>
  );
}
