"use client";

import { useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

const faqs = [
  {
    id: 1,
    question: "How do I place an order?",
    answer:
      "Browse our products, add items to your cart, and proceed to checkout. You can shop as a guest or create an account for faster checkout and order tracking.\n\nAt checkout, enter your shipping details, choose your preferred payment method, and confirm your order.",
  },
  {
    id: 2,
    question: "What payment methods do you accept?",
    answer:
      "We accept Cash on Delivery (COD), bKash, Nagad, Rocket, and major credit/debit cards. All online transactions are secured with industry-standard encryption.",
  },
  {
    id: 3,
    question: "How long does delivery take?",
    answer:
      "Dhaka city: 1–3 business days. Outside Dhaka: 3–5 business days. You'll receive tracking information once your order is shipped.",
  },
  {
    id: 4,
    question: "What is your return policy?",
    answer:
      "7-day return policy for most products. Items must be unused with tags attached. Refunds processed within 5–7 business days.",
  },
  {
    id: 5,
    question: "How can I track my order?",
    answer:
      "Check 'My Orders' in your account or use the tracking number sent via email/SMS. Real-time updates available.",
  },
  {
    id: 6,
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes. Cash on Delivery is available nationwide. Select COD at checkout and pay when your order is delivered.",
  },
  {
    id: 7,
    question: "Are products authentic?",
    answer:
      "All products are sourced from authorized distributors. If any quality issue is found, we offer an appropriate resolution based on the case.",
  },
  {
    id: 8,
    question: "Can I cancel my order?",
    answer:
      "Yes, before shipping. Contact support with your order number. After shipping, use our return policy.",
  },
  {
    id: 9,
    question: "What if I receive a wrong or damaged product?",
    answer:
      "Contact support within 24 hours with photos of the item. We will review the issue and arrange a replacement or refund where applicable.",
  },
  {
    id: 10,
    question: "How do I contact customer support?",
    answer:
      "You can contact us by email, phone, live chat, or social media. We usually respond within 24 hours.",
  },
];

function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 hover:bg-gray-50 md:px-7 md:py-6"
      >
        <div className="flex min-w-0 items-start gap-4">
          <span className="mt-0.5 w-8 shrink-0 text-sm font-semibold text-brand/80">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <h3
              className={`text-[15px] font-semibold leading-6 transition-colors md:text-base ${
                isOpen ? "text-brand" : "text-gray-900"
              }`}
            >
              {faq.question}
            </h3>
          </div>
        </div>

        <span
          className={`mt-0.5 shrink-0 text-gray-400 transition-all duration-300 ${
            isOpen ? "rotate-180 text-brand" : "rotate-0"
          }`}
        >
          <HiChevronDown size={18} />
        </span>
      </button>

      <div
        className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-6 pb-5 pt-4 md:px-7 md:pb-6">
            <div className="ml-12 max-w-[68ch]">
              {faq.answer.split("\n\n").map((para, i) => (
                <p
                  key={i}
                  className={`text-sm leading-7 text-gray-600 md:text-[15px] ${
                    i > 0 ? "mt-3" : ""
                  }`}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openId, setOpenId] = useState<number | null>(1);

  const toggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="bg-bg_main py-20">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            FAQ
          </span>
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto max-w-lg text-sm text-gray-500 md:text-base">
            Everything you need to know about shopping with us. Can&apos;t find
            an answer?{" "}
            <a
              href="mailto:alidaadshop@gmail.com"
              className="font-semibold text-brand hover:underline"
            >
              Contact us
            </a>
            .
          </p>
        </div>

        <div className="overflow-hidden border border-gray-200 bg-white">
          {faqs.map((faq, index) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              index={index}
              isOpen={openId === faq.id}
              onToggle={() => toggle(faq.id)}
            />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          Still need help? Email us at{" "}
          <a
            href="mailto:alidaadshop@gmail.com"
            className="font-semibold text-brand hover:underline"
          >
            alidaadshop@gmail.com
          </a>
        </p>
      </div>
    </section>
  );
}
