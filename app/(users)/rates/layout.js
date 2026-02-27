export const metadata = {
  title: "Your Personalized Mortgage Rates",
  description:
    "View the best mortgage renewal and refinance rates customized to your profile. Lock in today's rate and protect against future increases for 120 days.",
};

export default function RenewLayout({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen px-2 pt-16 pb-8 sm:px-4 sm:pt-20 sm:pb-12 bg-blue-50">
      <div className="w-full max-w-7xl">{children}</div>
    </section>
  );
}
