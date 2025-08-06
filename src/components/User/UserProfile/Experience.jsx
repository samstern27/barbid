import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";

const projects = [
  {
    id: 1,
    name: "The Better Half Pub",
    role: "Bartender",
    startDate: "2023-03-17",
    endDate: "2025-03-17",
    position: "Full-time",
  },
  {
    id: 2,
    name: "The Better Half Pub",
    role: "Bartender",
    startDate: "2023-03-17",
    endDate: "2025-03-17",
    position: "Full-time",
  },
  {
    id: 3,
    name: "The Better Half Pub",
    role: "Bartender",
    startDate: "2023-03-17",
    endDate: "2025-03-17",
    position: "Full-time",
  },
  {
    id: 4,
    name: "The Better Half Pub",
    role: "Bartender",
    startDate: "2023-03-17",
    endDate: "2025-03-17",
    position: "Full-time",
  },
  {
    id: 5,
    name: "The Better Half Pub",
    role: "Bartender",
    startDate: "2023-03-17",
    endDate: "2025-03-17",
    position: "Full-time",
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Experience({ profile }) {
  return (
    <div className="rounded-lg  m-10 px-10 pt-10 pb-0">
      <div className="border-b border-gray-200 pb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Experience</h3>
        <div className="mt-3 sm:mt-0 sm:ml-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add experience
          </button>
        </div>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0 m">
              <div className="flex items-start gap-x-3">
                <p className="text-sm/6 font-semibold text-white">
                  {project.name}
                </p>
                <p
                  className={classNames(
                    "text-white bg-transparent ring-white/20",
                    "mt-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset"
                  )}
                >
                  {project.role}
                </p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-white">
                <p className="whitespace-nowrap">
                  {project.startDate} - {project.endDate}
                </p>
                <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                  <circle r={1} cx={1} cy={1} />
                </svg>
                <p className="truncate">{project.position}</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Menu as="div" className="relative flex-none">
                <MenuButton className="relative block text-gray-500 hover:text-gray-900">
                  <span className="absolute -inset-2.5" />
                  <span className="sr-only">Open options</span>
                  <EllipsisVerticalIcon aria-hidden="true" className="size-5" />
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden"
                    >
                      Edit<span className="sr-only">, {project.name}</span>
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden"
                    >
                      Move<span className="sr-only">, {project.name}</span>
                    </a>
                  </MenuItem>
                  <MenuItem>
                    <a
                      href="#"
                      className="block px-3 py-1 text-sm/6 text-gray-900 data-focus:bg-gray-50 data-focus:outline-hidden"
                    >
                      Delete<span className="sr-only">, {project.name}</span>
                    </a>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
