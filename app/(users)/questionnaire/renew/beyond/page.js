import LinkButton from "@/components/buttons/link-button";

export default function BeyondPage() {
  return (
    <div className="w-full">
      <h1 className="max-w-xl mb-8 text-4xl font-semibold text-center">
        Do you plan on renewing your mortgage within the next 4 months?
      </h1>
      <div className="flex flex-col items-center gap-4 mt-20">
        <LinkButton label="Yes, continue" link="/questionnaire/property" />
        <LinkButton
          label="No, I'll wait"
          link="/questionnaire/renew/beyond/contact"
        />
      </div>
    </div>
  );
}
