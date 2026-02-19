import LinkButton from "@/components/buttons/link-button";

export default function WithinPage() {
  return (
    <div className="w-full">
      <h1 className="max-w-xl mb-8 text-4xl font-semibold text-center">
        Penalty notice
      </h1>
      <p className="text-xl font-light text-center">
        We can only guarantee a mortgage renewal for 120 days
      </p>
      <div className="flex justify-center mt-20 space-x-10">
        <LinkButton label="I understand" link="/questionnaire/property" />
      </div>
    </div>
  );
}
