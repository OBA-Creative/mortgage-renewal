export default function RenewLayout({ children }) {
  return (
    <section className="flex flex-col items-center justify-start min-h-screen pt-32 pb-12 bg-blue-50">
      <div className="max-w-xl ">{children}</div>
    </section>
  );
}
