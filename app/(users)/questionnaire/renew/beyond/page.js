import LinkButton from "@/components/buttons/link-button";

export default function BeyondPage() {
  return (
    <div className="pt-24">
      <h1 className="max-w-2xl my-8 text-4xl font-semibold text-center">
        Do you plan on renewing your mortgage within the next 4 months?
      </h1>
      <div className="flex justify-center mt-20 space-x-10">
        <LinkButton label="Yes, continue" link="/questionnaire/property" />
        <LinkButton
          label="No, I'll wait"
          link="/questionnaire/renew/beyond/contact"
        />
      </div>
    </div>
  );
}
