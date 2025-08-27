import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { MinusSmallIcon, PlusSmallIcon } from "@heroicons/react/24/outline";

// FAQ data array containing common questions and answers
// Structured for easy maintenance and updates
const faqs = [
  {
    question: "What is Barbid?",
    answer:
      "Barbid is a platform that connects bars, pubs, and venues with freelance hospitality workers to fill last-minute or short-term shifts quickly and easily.",
  },
  {
    question: "How do I sign up as a worker?",
    answer:
      "Click 'Sign Up' and choose the worker option. You'll create a profile with your experience, availability, and preferred hourly rate. Once you're set up, you can apply to available shifts right away.",
  },
  {
    question: "How do I create a shift as an employer?",
    answer:
      "After signing up for a bar/employer account, you can post a shift ad in minutes. Just include the role, time, date, pay rate (if applicable), and any extra info. Workers can then apply directly.",
  },
  {
    question: "Do I need previous bar experience to join as a worker?",
    answer:
      "Not always. Some shifts may require experience (like cocktail bartending), but others may just need a good attitude and reliability — think glass collecting or floor staff. Requirements will be listed in each ad.",
  },
  {
    question: "Is Barbid free to use?",
    answer:
      "Yes! It's free for both workers and bars to sign up and post/apply for shifts. We may introduce optional premium features later, but the core platform is totally free.",
  },
  {
    question: "Can I cancel a shift after applying or posting?",
    answer:
      "Yes, but we ask that both sides give as much notice as possible. Repeated last-minute cancellations might affect your account standing.",
  },
  {
    question: "What if no one applies to my shift?",
    answer:
      "We'll notify you if your shift hasn't had any applicants, and you can increase the hourly rate or share the ad again to attract more workers.",
  },
  {
    question: "Is Barbid just for pubs?",
    answer:
      "Nope — while it's designed with pubs and bars in mind, any venue that needs short-term hospitality staff (like coffee shops, restaurants, clubs, or events) can use it too.",
  },
];

// FAQ page component using Headless UI for accessible accordion functionality
// Features responsive design and smooth expand/collapse animations
const FAQ = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl">
          {/* Page header with styled title */}
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Your questions, <span className="text-indigo-600">answered</span>
          </h2>
          
          {/* FAQ accordion list using Headless UI Disclosure components */}
          <dl className="mt-16 divide-y divide-gray-400">
            {faqs.map((faq) => (
              <Disclosure
                key={faq.question}
                as="div"
                className="py-6 first:pt-0 last:pb-0"
              >
                {/* Question header with expand/collapse button */}
                <dt>
                  <DisclosureButton className="group flex w-full items-start justify-between text-left text-gray-900">
                    <span className="text-base/7 font-semibold">
                      {faq.question}
                    </span>
                    {/* Dynamic icon that changes based on open/closed state */}
                    <span className="ml-6 flex h-7 items-center text-indigo-600">
                      <PlusSmallIcon
                        aria-hidden="true"
                        className="size-6 group-data-open:hidden"
                      />
                      <MinusSmallIcon
                        aria-hidden="true"
                        className="size-6 group-not-data-open:hidden"
                      />
                    </span>
                  </DisclosureButton>
                </dt>
                
                {/* Answer content that expands/collapses */}
                <DisclosurePanel as="dd" className="mt-2 pr-12">
                  <p className="text-base/7 text-gray-600">{faq.answer}</p>
                </DisclosurePanel>
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
