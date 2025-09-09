import Image from "next/image";

const RateSection = ({
  title,
  rates,
  titleStyle = "text-gray-700",
  rateStyle = "font-semibold",
}) => (
  <div className="border-b border-gray-100 pb-3">
    <h4 className={`font-semibold mb-2 text-blue-600`}>{title}</h4>
    <div className="grid grid-cols-3 gap-2 text-xs">
      <div className="text-center">
        <div className="text-gray-500">≤65%</div>
        <div className={rateStyle}>{rates?.under65}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">≤70%</div>
        <div className={rateStyle}>{rates?.under70}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">≤75%</div>
        <div className={rateStyle}>{rates?.under75}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">≤80%</div>
        <div className={rateStyle}>{rates?.under80}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">&gt;80%</div>
        <div className={rateStyle}>{rates?.over80}%</div>
      </div>
      <div className="text-center">
        <div className="text-gray-500">Refi</div>
        <div className={rateStyle}>{rates?.refinance}%</div>
      </div>
    </div>
  </div>
);

const AdminProvinceCard = ({ province, rates }) => {
  if (!rates) return null;

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        {/* Province Header */}
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-8 rounded-md overflow-hidden shadow-md border border-gray-200">
              <Image
                src={province.flagImage}
                alt={`${province.name} flag`}
                width={48}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {province.name}
              </dt>
              <dd className="text-xs text-gray-400 font-mono">
                {province.code}
              </dd>
            </dl>
          </div>
        </div>

        {/* Rate Sections */}
        <div className="mt-4 space-y-4">
          <RateSection title="3-Year Fixed" rates={rates.threeYrFixed} />

          <RateSection title="4-Year Fixed" rates={rates.fourYrFixed} />

          <RateSection
            title="5-Year Fixed (Popular)"
            rates={rates.fiveYrFixed}
          />

          <RateSection title="3-Year Variable" rates={rates.threeYrVariable} />

          {/* Last section without border */}
          <div>
            <h4 className=" font-semibold text-blue-600 mb-2">
              5-Year Variable
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="text-gray-500">≤65%</div>
                <div className="font-semibold ">
                  {rates.fiveYrVariable?.under65}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">≤70%</div>
                <div className="font-semibold ">
                  {rates.fiveYrVariable?.under70}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">≤75%</div>
                <div className="font-semibold ">
                  {rates.fiveYrVariable?.under75}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">≤80%</div>
                <div className="font-semibold ">
                  {rates.fiveYrVariable?.under80}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">&gt;80%</div>
                <div className="font-semibold">
                  {rates.fiveYrVariable?.over80}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Refi</div>
                <div className="font-semibold">
                  {rates.fiveYrVariable?.refinance}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProvinceCard;
