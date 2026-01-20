import LinkButton from "@/components/buttons/link-button";

export default function WithinPage() {
  return (
    <div className="pt-24">
      <h1 className="max-w-2xl my-8 text-4xl font-semibold text-center">
        Penalty notice
      </h1>
      <p className="text-xl font-light">
        We can only guarantee a mortgage renewal for 120 days
      </p>
      <div className="flex justify-center mt-20 space-x-10">
        <LinkButton label="I understand" link="/questionnaire/property" />
      </div>
    </div>
  );
}
