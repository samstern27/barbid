import { Link } from "react-router-dom";
import barGlow from "../../assets/images/bar-glow.jpg";

const Hero = () => {
  return (
    <div className="relative isolate overflow-hidden bg-red-400">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
            Want to pick up shifts on your terms?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg/8 text-pretty text-white">
            Sign up, set your hourly rate, and apply to shifts at pubs and bars
            near you. Get paid to work where and when you want.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/signup"
              className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Find shifts
            </Link>
            <Link
              to="/how-it-works"
              className="text-sm/6 font-semibold text-white"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
      <svg
        viewBox="0 0 1024 1024"
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -z-10 size-256 -translate-x-1/4 mask-[radial-gradient(closest-side,white,transparent)]"
      >
        <circle
          r={512}
          cx={512}
          cy={512}
          fill="url(#8d958450-c69f-4251-94bc-4e091a323369)"
          fillOpacity="0.9"
        />
        <defs>
          <radialGradient id="8d958450-c69f-4251-94bc-4e091a323369">
            <stop stopColor="#FFEB3B" />
            <stop offset={1} stopColor="#FFE082" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
};

export default Hero;
