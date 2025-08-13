import {
  MagnifyingGlassIcon,
  CurrencyPoundIcon,
  StarIcon,
} from "@heroicons/react/20/solid";
import barGlow from "../../assets/images/bar-glow.jpg";

const features = [
  {
    name: "Browse live shift ads.",
    description:
      "See open shifts near you in real time. Apply in seconds and get notified if you’re picked.",
    icon: MagnifyingGlassIcon,
  },
  {
    name: "Set your own rate.",
    description:
      "You choose how much you want to earn per hour. Bars will see your rate before hiring — no awkward negotiations.",
    icon: CurrencyPoundIcon,
  },
  {
    name: "Build your rep.",
    description:
      "Get reviewed after each shift, and build a profile that helps you stand out. The better your reviews, the more shifts you'll land.",
    icon: StarIcon,
  },
];

const Feature = () => {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-indigo-600">
                Work on your terms
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                Pick up shifts when it suits you
              </p>
              <p className="mt-6 text-lg/8 text-gray-600">
                BarBid connects you with pubs and bars that need extra hands —
                no commitment, no stress. You decide when and where you work.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-indigo-600"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <img
            alt="Product screenshot"
            src={barGlow}
            width={2432}
            height={1442}
            className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Feature;
