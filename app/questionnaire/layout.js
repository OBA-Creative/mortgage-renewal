export default function RenewLayout({ children }) {
  return (
    <section className="flex flex-col items-center  min-h-screen bg-blue-50 pt-10">
      <div className="max-w-7xl w-full flex flex-col items-center">
        {children}
      </div>
    </section>
  );
}
