"use client";
import delivery from "@/assets/delivery.png";
import rtn from "@/assets/return.png";
import hundred from "@/assets/hundred.png";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type CounterProps = {
    end: number;
    duration?: number;
    suffix?: string;
};

const Counter = ({ end, duration = 2000, suffix = "" }: CounterProps) => {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement | null>(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;

                    let start = 0;
                    const increment = end / (duration / 16);

                    const updateCount = () => {
                        start += increment;

                        if (start < end) {
                            setCount(Math.floor(start));
                            requestAnimationFrame(updateCount);
                        } else {
                            setCount(end);
                        }
                    };

                    updateCount();
                }
            },
            { threshold: 0.5 },
        );

        const currentRef = ref.current;

        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [end, duration]);

    return (
        <span ref={ref}>
            {count}
            {suffix}
        </span>
    );
};

const ChooseUs = () => {
    return (
        <section>
            <h2 className="heading text-center font-bold">
                Why Choose <span className="text-brand">Al Idaad</span>
            </h2>

            <p className="text-center">Your trusted partner for quality products and exceptional service across Bangladesh</p>

            <p className="text-center mt-4 mb-12">TRUSTED BY THOUSANDS OF CUSTOMERS ACROSS BANGLADESH</p>

            <div className="flex flex-col gap-4 sm:gap-0 sm:flex-row w-full text-center divide-x divide-gray-200">
                <div className="flex-1 px-2 sm:px-3 md:px-4 xl:px-6 py-2 sm:py-3 md:py-4">
                    <div className="text-4xl sm:text-3xl md:text-4xl xl:text-5xl font-bold">
                        <Counter end={1000} suffix="+" />
                    </div>
                    <p className="text-xl sm:text-sm md:text-[16px] mt-1 sm:mt-2 font-light text-text_normal">Happy Customers Nationwide</p>
                </div>

                <div className="flex-1 px-2 sm:px-3 md:px-4 xl:px-6 py-2 sm:py-3 md:py-4">
                    <div className="text-4xl sm:text-3xl md:text-4xl xl:text-5xl font-bold">
                        <Counter end={500} suffix="+" />
                    </div>
                    <p className="text-xl sm:text-sm md:text-[16px] mt-1 sm:mt-2 font-light text-text_normal">Premium Products Available</p>
                </div>

                <div className="flex-1 px-2 sm:px-3 md:px-4 xl:px-6 py-2 sm:py-3 md:py-4">
                    <div className="text-4xl sm:text-3xl md:text-4xl xl:text-5xl font-bold">
                        <Counter end={99} suffix="%" />
                    </div>
                    <p className="text-xl sm:text-sm md:text-[16px] mt-1 sm:mt-2 font-light text-text_normal">Customer Satisfaction Rate</p>
                </div>

                <div className="flex-1 px-2 sm:px-3 md:px-4 xl:px-6 py-2 sm:py-3 md:py-4">
                    <div className="text-4xl sm:text-3xl md:text-4xl xl:text-5xl font-bold">24/7</div>
                    <p className="text-xl sm:text-sm md:text-[16px] mt-1 sm:mt-2 font-light text-text_normal">Customer Support Available</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-5 mt-20">
                <div className="flex flex-col items-center gap-3 p-6 lg:p-8 rounded-xl shadow hover:shadow-xl transition duration-150 flex-1 border-border border">
                    <Image src={delivery} width={50} height={50} alt="al idaad delivery"></Image>

                    <p className="text-center font-bold text-2xl sm:text-xl">Fast Delivery</p>
                    <p className="text-center text-text_normal sm:text-sm xl:text-[16px]">Quick delivery across Bangladesh with Pathao courier</p>
                </div>

                <div className="flex flex-col items-center gap-3 p-6 lg:p-8 rounded-xl shadow hover:shadow-xl transition duration-150 flex-1 border-border border">
                    <Image src={hundred} width={50} height={50} alt="al idaad delivery"></Image>

                    <p className="text-center font-bold text-xl">100% Authentic</p>
                    <p className="text-center text-text_normal text-sm xl:text-[16px]">
                        All products are genuine and sourced from authorized distributors
                    </p>
                </div>

                <div className="flex flex-col items-center gap-3 p-6 lg:p-8 rounded-xl shadow hover:shadow-xl transition duration-150 flex-1 border-border border">
                    <Image src={rtn} width={50} height={50} alt="al idaad delivery"></Image>

                    <p className="text-center font-bold text-xl">Easy Returns</p>
                    <p className="text-center text-text_normal text-sm xl:text-[16px]">Hassle-free 7-day return policy for your peace of mind</p>
                </div>
            </div>

            <div>
                <p className="text-center my-10 text-text_normal">Trusted by customers nationwide</p>

                <div className="grid grid-cols-2 w-fit mx-auto md:flex md:justify-center gap-6">
                    <div className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check-icon lucide-check"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <p>Secure Checkout</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check-icon lucide-check"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <p>Free Shipping</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check-icon lucide-check"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <p>Quality Guaranteed</p>
                    </div>

                    <div className="flex items-center gap-1">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide lucide-check-icon lucide-check"
                        >
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                        <p>24/7 Support</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ChooseUs;
