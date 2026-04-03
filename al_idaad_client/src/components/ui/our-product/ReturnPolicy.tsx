"use client";

import { useState } from "react";
import { FiChevronDown, FiCheckCircle } from "react-icons/fi";

const ReturnPolicy = () => {
  const [open, setOpen] = useState(false);

  return (
    <section className="border-t border-gray-100 pt-4 mb-2.5">
      <div className="overflow-hidden rounded-2xl border border-gray-100/80 bg-white">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
          aria-expanded={open}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="shrink-0 text-green-600" size={17} />
              <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                Easy Returns & Exchange
              </h3>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-green-600" size={13} />
                7-day return window
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-green-600" size={13} />
                Free return shipping
              </span>
              <span className="flex items-center gap-1.5">
                <FiCheckCircle className="text-green-600" size={13} />
                Fast refund process
              </span>
            </div>
          </div>

          <FiChevronDown
            className={`shrink-0 text-gray-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
            size={18}
          />
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="border-t border-gray-100 px-4 py-4 sm:px-5 text-sm leading-6 text-gray-600">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Return Window</h4>
                  <p>
                    Request a return within <strong>7 days</strong> of receiving
                    your order.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Eligibility</h4>
                  <p>
                    Items must be unused, unwashed, and kept with original tags
                    and packaging.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Refunds</h4>
                  <p>
                    Once approved, refunds are processed within{" "}
                    <strong>1 business day</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReturnPolicy;
