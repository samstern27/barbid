import pintPour from "../../assets/images/pint-pour.jpg";
import cocktailBartender from "../../assets/images/cocktail-bartender.jpg";
import coffeeStaff from "../../assets/images/staff-holding-handle.jpg";
import waiterTable from "../../assets/images/waiter-at-table.jpg";
import "../../index.css";

// How It Works page explaining the platform's mission and industry context
// Features mission statement, image grid, and UK hospitality statistics
const HowItWorks = () => {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-6 lg:max-w-7xl lg:px-8">
        {/* Header section with title and description */}
        <div className="max-w-4xl">
          <p className="text-base/7 font-semibold text-indigo-600">
            How It Works
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
            Connecting talent with opportunity in hospitality
          </h1>
          <p className="mt-6 text-xl/8 text-balance text-gray-700">
            Whether you're looking to hire talented staff for your event, or
            you're a freelancer looking for flexible, paid event gigs, Barbid is
            built to make the whole process fast, reliable, and stress-free.
          </p>
        </div>
        
        {/* Main content section with mission and image grid */}
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:gap-y-16">
          {/* Mission statement and platform explanation */}
          <div className="lg:pr-8">
            <h2 className="text-2xl font-semibold tracking-tight text-pretty text-indigo-600">
              Our mission
            </h2>
            <p className="mt-6 text-base/7 text-gray-600">
              For organizers, we know how last-minute changes and unexpected
              staff shortages can throw a wrench into your plans. That's why
              Barbid lets you quickly post roles, review applications, and
              confirm bookings — all in one place. No more frantic group chats
              or unreliable no-shows.
            </p>
            <p className="mt-6 text-base/7 text-gray-600">
              For freelancers, whether you're a seasoned bartender, barback,
              service runner, or just someone looking to pick up extra shifts,
              Barbid helps you find paid work that suits your skills, schedule,
              and rate. You're in control — apply for the roles that match your
              vibe, and get booked directly by organizers who need you.
            </p>
            <p className="mt-8 text-base/7 text-gray-600">
              We've created a platform that's transparent, flexible, and
              community-driven. Every profile, every booking — it's all designed
              to help people work better together, with clarity and confidence
              from the start.
            </p>
          </div>
          
          {/* Image grid showcasing hospitality work */}
          <div className="pt-16 lg:row-span-2 lg:-mr-16 xl:mr-auto">
            <div className="-mx-8 grid grid-cols-2 gap-4 sm:-mx-16 sm:grid-cols-4 lg:mx-0 lg:grid-cols-2 lg:gap-4 xl:gap-8">
              {/* Pint pouring image */}
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
                <img
                  alt=""
                  src={pintPour}
                  className="block size-full object-cover"
                />
              </div>
              {/* Coffee staff image with negative margin for staggered effect */}
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40">
                <img
                  alt=""
                  src={coffeeStaff}
                  className="block size-full object-cover"
                />
              </div>
              {/* Cocktail bartender image */}
              <div className="aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10">
                <img
                  alt=""
                  src={cocktailBartender}
                  className="block size-full object-cover"
                />
              </div>
              {/* Waiter at table image with negative margin for staggered effect */}
              <div className="-mt-8 aspect-square overflow-hidden rounded-xl shadow-xl outline-1 -outline-offset-1 outline-black/10 lg:-mt-40">
                <img
                  alt=""
                  src={waiterTable}
                  className="block size-full object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Industry statistics section */}
          <div className="max-lg:mt-16 lg:col-span-1">
            <p className="text-base/7 font-semibold text-grey-500">
              UK Hospitality Industry
            </p>
            <hr className="mt-6 border-t border-indigo-600" />
            
            {/* Statistics grid with industry data */}
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              {/* Industry value statistic */}
              <div className="flex flex-col gap-y-2 border-b border-dotted border-indigo-600 pb-4">
                <dt className="text-sm/6 text-indigo-600">Industry Value</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight">
                  £<span>60</span>B
                </dd>
              </div>
              
              {/* Hospitality workers statistic */}
              <div className="flex flex-col gap-y-2 border-b border-dotted border-indigo-600 pb-4">
                <dt className="text-sm/6 text-indigo-600">
                  Hospitality Workers
                </dt>
                <dd className="order-first text-6xl font-semibold tracking-tight">
                  <span>3M</span>+
                </dd>
              </div>
              
              {/* Businesses statistic */}
              <div className="flex flex-col gap-y-2 max-sm:border-b max-sm:border-dotted max-sm:border-gray-200 max-sm:pb-4">
                <dt className="text-sm/6 text-indigo-600">Businesses</dt>
                <dd className="order-first text-6xl font-semibold tracking-tight">
                  <span>1.2</span>M
                </dd>
              </div>
              
              {/* Daily shifts statistic */}
              <div className="flex flex-col gap-y-2">
                <dt className="text-sm/6 text-indigo-600">
                  Shifts Filled Daily
                </dt>
                <dd className="order-first text-6xl font-semibold tracking-tight">
                  <span>100</span>K+
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorks;
