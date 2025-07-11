import LinkButton from "@/components/buttons/link-button";

export default function WithinPage() {
  return (
    <div className="">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        Penalty notice
      </h1>
      <p className="font-light text-xl">
        We can only guarantee a mortgage renewal for 120 days
      </p>
      <div className="flex justify-center space-x-10 mt-20">
        <LinkButton label="I understand" link="/questionnaire/property" />
      </div>
    </div>
  );
}
