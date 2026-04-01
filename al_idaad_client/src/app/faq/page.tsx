"use client";

import { useState } from "react";

const faqs = [
    {
        id: 1,
        question: "How do I place an order?",
        answer: "Placing an order is simple! Browse our products, add items to your cart, and proceed to checkout. You can shop as a guest or create an account for faster checkout and order tracking.\n\nAt checkout, enter your shipping details, choose your preferred payment method (Cash on Delivery, bKash, Nagad, or Card), and confirm your order. You'll receive an order confirmation email immediately.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
    {
        id: 2,
        question: "What payment methods do you accept?",
        answer: "We accept multiple payment methods for your convenience: Cash on Delivery (COD), bKash, Nagad, Rocket, and major credit/debit cards.\n\nAll online transactions are secured with industry-standard encryption. For COD orders, you can pay when your order is delivered to your doorstep.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
        ),
    },
    {
        id: 3,
        question: "How long does delivery take?",
        answer: "Delivery time depends on your location. For Dhaka city, we typically deliver within 1–3 business days. For areas outside Dhaka, delivery takes 3–5 business days.\n\nWe work with trusted courier partners including Pathao to ensure safe and timely delivery. You'll receive tracking information once your order is shipped, allowing you to monitor its progress in real-time.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
        ),
    },
    {
        id: 4,
        question: "What is your return and refund policy?",
        answer: "We offer a 7-day return policy for most products. If you're not satisfied with your purchase, you can return it within 7 days of delivery for a full refund or exchange.\n\nItems must be unused, in original packaging, and with all tags attached. Certain products like intimate wear, beauty products, and customized items are non-returnable for hygiene reasons. Refunds are processed within 5–7 business days after we receive the returned item.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.5" />
            </svg>
        ),
    },
    {
        id: 5,
        question: "How can I track my order?",
        answer: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can use this number to track your shipment on our website or the courier partner's tracking portal.\n\nYou can also log into your Al-Idaat account and visit the 'My Orders' section to view real-time updates on all your orders, including order status, shipping details, and delivery estimates.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
    },
    {
        id: 6,
        question: "Do you offer Cash on Delivery (COD)?",
        answer: "Yes! Cash on Delivery is available for all orders across Bangladesh. Simply select 'Cash on Delivery' as your payment method at checkout.\n\nPlease ensure someone is available to receive the package and make payment when our delivery partner arrives. Make sure to have the exact amount ready for a smooth transaction.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        ),
    },
    {
        id: 7,
        question: "Are the products authentic and original?",
        answer: "Absolutely! We guarantee 100% authentic products. All items are sourced directly from authorized distributors and brands. We never sell counterfeit or replica products.\n\nEach product comes with authenticity certificates where applicable. If you receive any product that doesn't meet our quality standards, we offer a full refund with no questions asked.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
            </svg>
        ),
    },
    {
        id: 8,
        question: "Can I cancel or modify my order?",
        answer: "Yes, you can cancel or modify your order before it's shipped. Contact our customer support team immediately via phone, email, or live chat with your order number.\n\nOnce an order is shipped, it cannot be cancelled, but you can refuse delivery or return it within our 7-day return window. For order modifications, we'll do our best to accommodate changes if the order hasn't been processed yet.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
        ),
    },
    {
        id: 9,
        question: "What if I receive a damaged or wrong product?",
        answer: "We sincerely apologize if this happens. Please contact our customer support within 24 hours of delivery with photos of the damaged or wrong product. We'll arrange for an immediate replacement or full refund at no extra cost.\n\nOur quality control team inspects all orders before shipping, but if any issues occur during transit, we take full responsibility and ensure it's resolved quickly.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
        ),
    },
    {
        id: 10,
        question: "How do I contact customer support?",
        answer: "We're here to help! You can reach us through multiple channels: use our live chat feature on the website (bottom right corner), email us at alidaadshop@gmail.com, or call our hotline during business hours (10 AM – 8 PM, 7 days a week).\n\nYou can also reach us through our social media pages on Facebook and Instagram. We typically respond to all inquiries within 24 hours, but usually much faster during business hours.",
        icon: (
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        ),
    },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: (typeof faqs)[0]; isOpen: boolean; onToggle: () => void }) {
    return (
        <div
            className={`group border border-stone-200 rounded-2xl overflow-hidden transition-all duration-300 ${
                isOpen ? "border-amber-400 shadow-md shadow-amber-100" : "hover:border-stone-300 hover:shadow-sm"
            }`}
        >
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 px-6 py-5 text-left bg-white hover:bg-stone-50 transition-colors duration-200"
                aria-expanded={isOpen}
            >
                {/* Icon bubble */}
                <span
                    className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                        isOpen ? "bg-amber-400 text-white" : "bg-stone-100 text-stone-500 group-hover:bg-amber-50 group-hover:text-amber-500"
                    }`}
                >
                    {faq.icon}
                </span>

                {/* Question */}
                <span
                    className={`flex-1 font-semibold text-[15px] leading-snug transition-colors duration-200 ${
                        isOpen ? "text-amber-600" : "text-stone-800"
                    }`}
                >
                    {faq.question}
                </span>

                {/* Chevron */}
                <span
                    className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                        isOpen ? "bg-amber-100 rotate-180" : "bg-stone-100 rotate-0"
                    }`}
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isOpen ? "#d97706" : "#78716c"}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </span>
            </button>

            {/* Answer — CSS grid trick for smooth height animation */}
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-5 pt-1 bg-white">
                        <div className="pl-14">
                            {faq.answer.split("\n\n").map((para, i) => (
                                <p key={i} className={`text-stone-500 text-sm leading-relaxed ${i > 0 ? "mt-3" : ""}`}>
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
    const [openId, setOpenId] = useState<number | null>(null);

    const toggle = (id: number) => {
        setOpenId((prev: number | null) => (prev === id ? null : id));
    };

    return (
        <>
            <section className="min-h-screen bg-stone-50 py-20 px-4">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-semibold tracking-widest uppercase text-amber-500 mb-4">Support Center</span>
                        <h1 className="text-4xl font-bold text-stone-900 mb-4">
                            Frequently Asked
                            <br />
                            <span className="text-amber-500">Questions</span>
                        </h1>
                        <p className="text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
                            Everything you need to know about shopping with Al-Idaat. Can&apos;t find what you&apos;re looking for?{" "}
                            <a href="mailto:alidaadshop@gmail.com" className="text-amber-500 hover:underline">
                                Contact us.
                            </a>
                        </p>
                    </div>

                    {/* FAQ List */}
                    <div className="flex flex-col gap-3">
                        {faqs.map((faq) => (
                            <FAQItem key={faq.id} faq={faq} isOpen={openId === faq.id} onToggle={() => toggle(faq.id)} />
                        ))}
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-stone-400 text-xs mt-10">
                        Still have questions? Email us at{" "}
                        <a href="mailto:alidaadshop@gmail.com" className="text-amber-500 hover:underline">
                            alidaadshop@gmail.com
                        </a>
                    </p>
                </div>
            </section>
        </>
    );
}
