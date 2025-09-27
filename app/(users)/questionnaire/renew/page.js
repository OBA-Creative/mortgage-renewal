import LinkButton from "@/components/buttons/link-button";

export default function RenewPage() {
  return (
    <div className="">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        When is your mortgage renewal date?
      </h1>
      <div className="flex justify-center space-x-10 mt-20">
        <LinkButton
          label="Maturing within 4 months"
          link="/questionnaire/renew/within"
        />
        <LinkButton
          label="Maturing beyond 4 months"
          link="/questionnaire/renew/beyond"
        />
      </div>
    </div>
  );
}
