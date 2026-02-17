export const metadata = {
  title: "Your Personalized Mortgage Rates",
  description:
    "View the best mortgage renewal and refinance rates customized to your profile. Lock in today's rate and protect against future increases for 120 days.",
};

export default function RenewLayout({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen pt-20 pb-12 bg-blue-50">
      <div className="">{children}</div>
    </section>
  );
}
