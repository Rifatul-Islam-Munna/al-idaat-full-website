"use client";

import { CustomerReviewType } from "@/utils/types";
import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaStar, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1 text-brand">
      {[1, 2, 3, 4, 5].map((item) =>
        item <= rating ? (
          <FaStar key={item} size={14} />
        ) : (
          <FaRegStar key={item} size={14} />
        ),
      )}
    </div>
  );
};

const CustomerReviewSlider = ({ reviews }: { reviews: CustomerReviewType[] }) => {
  const [current, setCurrent] = useState(0);

  if (reviews.length === 0) {
    return null;
  }

  const activeIndex = current >= reviews.length ? 0 : current;
  const activeReview = reviews[activeIndex];

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="py-3 lg:py-5">
      <div className="text-center mb-8">
        <span className="inline-block text-xs font-semibold tracking-[0.18em] uppercase text-brand bg-brand/5 px-4 py-1.5 rounded-full mb-3">
          Testimonials
        </span>
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 leading-tight">
          What Our Customers Say
        </h2>
        <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Trusted by customers across Bangladesh for quality, comfort, and
          service
        </p>
      </div>

      <div className="relative max-w-3xl mx-auto">
        <div className="rounded-3xl border border-gray-100 bg-white p-5 sm:p-8">
          <StarRating rating={activeReview.rating} />

          <p className="mt-4 text-base sm:text-lg leading-7 text-gray-700">
            &ldquo;{activeReview.review}&rdquo;
          </p>

          <div className="mt-6">
            <p className="text-sm font-semibold text-gray-900">
              {activeReview.name}
            </p>
            {activeReview.location && (
              <p className="text-xs text-gray-400 mt-1">
                {activeReview.location}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            onClick={prevSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-brand hover:text-brand"
            aria-label="Previous review"
          >
            <FiChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                aria-label={`Go to review ${index + 1}`}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  activeIndex === index ? "w-6 bg-brand" : "w-2.5 bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-brand hover:text-brand"
            aria-label="Next review"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default CustomerReviewSlider;
