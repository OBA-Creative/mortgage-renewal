import QuestionnaireWrapper from "@/components/layout/questionnaire-wrapper";

export const metadata = {
  title: "Mortgage Questionnaire — Tell Us About Your Mortgage",
  description:
    "Answer a few quick questions about your property and mortgage to get personalized renewal and refinance rates tailored to your situation.",
};

export default function RenewLayout({ children }) {
  return <QuestionnaireWrapper>{children}</QuestionnaireWrapper>;
}
