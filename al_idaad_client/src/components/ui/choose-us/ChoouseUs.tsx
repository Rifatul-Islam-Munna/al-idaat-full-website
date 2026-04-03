"use client";

import delivery from "@/assets/delivery.png";
import rtn from "@/assets/return.png";
import hundred from "@/assets/hundred.png";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiLock,
  FiPackage,
  FiHeadphones,
  FiStar,
  FiUsers,
  FiBox,
  FiSmile,
} from "react-icons/fi";

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

const stats = [
  {
    icon: <FiUsers size={20} />,
    end: 1000,
    suffix: "+",
    label: "Happy Customers",
  },
  {
    icon: <FiBox size={20} />,
    end: 500,
    suffix: "+",
    label: "Premium Products",
  },
  {
    icon: <FiSmile size={20} />,
    end: 99,
    suffix: "%",
    label: "Satisfaction Rate",
  },
  {
    icon: <FiHeadphones size={20} />,
    static: "24/7",
    label: "Customer Support",
  },
];

const features = [
  {
    icon: <FiTruck size={22} />,
    title: "Fast Delivery",
    desc: "Quick delivery across Bangladesh with Pathao courier",
  },
  {
    icon: <FiShield size={22} />,
    title: "100% Authentic",
    desc: "Genuine products sourced from authorized distributors",
  },
  {
    icon: <FiRefreshCw size={22} />,
    title: "Easy Returns",
    desc: "Hassle-free 7-day return policy for your peace of mind",
  },
];

const badges = [
  { icon: <FiLock size={14} />, label: "Secure Checkout" },
  { icon: <FiPackage size={14} />, label: "Free Shipping" },
  { icon: <FiStar size={14} />, label: "Quality Guaranteed" },
  { icon: <FiHeadphones size={14} />, label: "24/7 Support" },
];

const ChooseUs = () => {
  return (
    <section className=" py-3 md:py-5 px-4 max-w-5xl mx-auto">
      {/* ── Header ── */}
      <div className="text-center mb-12">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-4">
          Why Choose Us
        </span>
        <h2 className="heading font-bold leading-tight">
          The <span className="text-brand">Al Idaad</span> Difference
        </h2>
        <p className="text-gray-400 mt-3 max-w-sm mx-auto text-sm leading-relaxed">
          Quality products & exceptional service trusted by thousands across
          Bangladesh
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {stats.map((s, i) => (
          <div
            key={i}
            className="relative flex flex-col items-center justify-center gap-2 py-7 px-3 rounded-2xl overflow-hidden
                                   bg-white border border-gray-100"
          >
            {/* subtle top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-brand rounded-b-full" />

            <span className="text-brand/60">{s.icon}</span>
            <span className="text-3xl font-bold text-gray-900 leading-none">
              {"static" in s ? (
                s.static
              ) : (
                <Counter end={s.end} suffix={s.suffix} />
              )}
            </span>
            <p className="text-[11px] text-gray-400 text-center leading-tight font-medium uppercase tracking-wide">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Feature Cards ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-14">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex-1 flex items-start gap-4 p-5 rounded-2xl
                                   border border-gray-100 bg-white
                                   hover:border-brand/20 hover:bg-brand/[0.02]
                                   transition-all duration-200"
          >
            <div
              className="shrink-0 mt-0.5 w-10 h-10 flex items-center justify-center
                                        rounded-xl bg-brand/8 text-brand"
            >
              {f.icon}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-[15px]">
                {f.title}
              </p>
              <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                {f.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Trust Badges ── */}
      <div className="flex flex-col items-center gap-5">
        <div className="flex items-center gap-3 w-full max-w-xs">
          <div className="flex-1 h-px bg-gray-100" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 whitespace-nowrap">
            Trusted Nationwide
          </p>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3 sm:gap-6 justify-center">
          {badges.map((b, i) => (
            <div
              key={i}
              className="flex items-center justify-center gap-2
                                       px-4 py-2.5 rounded-xl
                                       bg-gray-50 border border-gray-100
                                       text-gray-500 text-xs font-medium"
            >
              <span className="text-brand">{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ChooseUs;
