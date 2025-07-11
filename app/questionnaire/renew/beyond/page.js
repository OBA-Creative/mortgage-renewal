import LinkButton from "@/components/buttons/link-button";

export default function BeyondPage() {
  return (
    <div className="">
      <h1 className="text-4xl font-semibold text-center my-8 max-w-2xl">
        Do you plan on renewing your mortgage within the next 4 months?
      </h1>
      <div className="flex justify-center space-x-10 mt-20">
        <LinkButton label="Yes, continue" link="/questionnaire/property" />
        <LinkButton
          label="No, I'll wait"
          link="/questionnaire/renew/beyond/contact"
        />
      </div>
    </div>
  );
}
