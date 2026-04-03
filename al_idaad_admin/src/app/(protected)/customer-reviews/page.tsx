"use client";

import AddCustomerReview from "@/components/ui/customer_review_page/AddCustomerReview";
import GetCustomerReviews from "@/components/ui/customer_review_page/GetCustomerReviews";
import { useState } from "react";

const CustomerReviewsPage = () => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleChanged = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="flex gap-2 w-full">
            <div className="flex-1 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pr-2">
                <AddCustomerReview onSaved={handleChanged} />
            </div>
            <div className="flex-1 h-[calc(100vh-132px)] overflow-y-auto custom-scrollbar pr-2">
                <GetCustomerReviews refreshKey={refreshKey} onChanged={handleChanged} />
            </div>
        </div>
    );
};

export default CustomerReviewsPage;
