import {
  ClockIcon,
  CurrencyPoundIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";

import barDaytime from "../../assets/images/bar-daytime.jpg";

const features = [
  {
    name: "Instant shift ads.",
    description:
      "Create a new shift listing in under 2 minutes. Choose the role, hours, and date — we'll notify nearby workers automatically.",
    icon: ClockIcon,
  },
  {
    name: "Set your budget.",
    description:
      "Set your budget and let workers bid on the shifts they want. You'll see offers and choose the best fit — no more haggling.",
    icon: CurrencyPoundIcon,
  },
  {
    name: "Local staff, on demand.",
    description:
      "Tap into a pool of rated bar staff near your venue — experienced people who are available now, not next week.",
    icon: UserGroupIcon,
  },
];

const Feature2 = () => {
  return (
    <div className="overflow-hidden bg-indigo-600 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pt-4 lg:pl-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base/7 font-semibold text-white">
                Hire faster
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-white sm:text-5xl">
                A smarter way to fill your rota gaps
              </p>
              <p className="mt-6 text-lg/8 text-white">
                Stop stressing over last-minute cancellations or patchy
                staffing. Barbid makes it easy to find reliable bar staff who
                are ready to jump in — fast.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-white lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon
                        aria-hidden="true"
                        className="absolute top-1 left-1 size-5 text-white"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex items-start justify-end lg:order-first">
            <img
              alt="Product screenshot"
              src={barDaytime}
              width={2432}
              height={1442}
              className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature2;
