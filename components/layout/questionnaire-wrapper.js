export default function QuestionnaireWrapper({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-dvh px-4 pt-32 pb-12 bg-blue-50">
      <div className="w-full max-w-xl">{children}</div>
    </section>
  );
}
