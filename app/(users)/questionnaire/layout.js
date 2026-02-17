export const metadata = {
  title: "Mortgage Questionnaire — Tell Us About Your Mortgage",
  description:
    "Answer a few quick questions about your property and mortgage to get personalized renewal and refinance rates tailored to your situation.",
};

export default function RenewLayout({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen pt-32 pb-12 bg-blue-50">
      <div className="max-w-xl ">{children}</div>
    </section>
  );
}
