import { StarIcon } from "@heroicons/react/20/solid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function StarRating({ rating }) {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => (
        <StarIcon
          key={index}
          aria-hidden="true"
          className={classNames(
            index < rating ? "text-yellow-400" : "text-gray-200",
            "size-5 shrink-0"
          )}
        />
      ))}
    </div>
  );
}
