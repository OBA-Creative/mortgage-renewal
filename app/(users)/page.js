import LinkButton from "@/components/buttons/link-button";

export default function Home() {
  return (
    <div className="flex flex-row justify-center min-h-screen bg-blue-1000">
      <div className="flex flex-col space-y-8 items-center justify-center w-full bg-blue-100  hover:bg-blue-200 transition-colors duration-200">
        <p className="text-5xl mb-6 font-bold">{"I'm renewing"}</p>
        <p className="text-2xl font-light">
          Find your personal renewal rates in under 2 minutes.
        </p>
        <LinkButton label="Continue" link="/questionnaire/renew" />
      </div>
      <div className="flex flex-col space-y-8 items-center justify-center w-full bg-blue-50  hover:bg-blue-200 transition-colors duration-200">
        <p className="text-5xl mb-6 font-bold">{"I'm refinancing"}</p>
        <p className="text-2xl font-light">
          Get the best refinance rates in a few easy steps.
        </p>
        <LinkButton label="Continue" link="/questionnaire/refinance" />
      </div>
    </div>
  );
}
