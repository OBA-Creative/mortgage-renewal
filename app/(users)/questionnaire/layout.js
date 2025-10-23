export default function RenewLayout({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen pt-2 pb-12 bg-blue-50">
      <div className="flex flex-col items-center w-full max-w-7xl">
        {children}
      </div>
    </section>
  );
}
