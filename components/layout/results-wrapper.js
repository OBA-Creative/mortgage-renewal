export default function ResultsWrapper({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-dvh px-2 pt-16 pb-8 sm:px-4 sm:pt-20 sm:pb-12 bg-blue-50">
      <div className="w-full max-w-7xl">{children}</div>
    </section>
  );
}
