import LinkButton from "@/components/buttons/link-button";

export default function RenewPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="my-8 text-4xl font-semibold text-center ">
        When is your mortgage renewal date?
      </h1>
      <div className="flex justify-center mt-20 space-x-10">
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
