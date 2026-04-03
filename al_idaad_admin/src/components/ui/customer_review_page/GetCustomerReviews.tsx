"use client";

import { api } from "@/libs/axios";
import { CustomerReviewType, GetCustomerReviewsResponseType } from "@/libs/types";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { LuTrash2 } from "react-icons/lu";
import { FaStar, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1 text-amber-500">
        {[1, 2, 3, 4, 5].map((star) => (star <= rating ? <FaStar key={star} size={14} /> : <FaRegStar key={star} size={14} />))}
    </div>
);

const GetCustomerReviews = ({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) => {
    const [reviews, setReviews] = useState<CustomerReviewType[]>([]);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);

        axios
            .get<GetCustomerReviewsResponseType>(`${process.env.NEXT_PUBLIC_API_URL}/customer-reviews`)
            .then((res) => {
                setReviews(res.data.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching customer reviews:", error);
                setLoading(false);
            });
    }, [refreshKey]);

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id);

            const result = await api.delete(`/customer-reviews/${id}`);

            if (result.status === 204) {
                await Swal.fire({
                    icon: "success",
                    title: "Review deleted",
                    showConfirmButton: false,
                    timer: 1500,
                });

                onChanged();
            }
        } catch (error) {
            console.error("Error deleting customer review:", error);
            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: "Something went wrong",
                timer: 1500,
                showConfirmButton: false,
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-white p-6 text-center text-gray-500">
                Loading customer reviews...
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-gray-500">
                No customer reviews added yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => {
                const isDeleting = deletingId === review._id;

                return (
                    <div key={review._id} className="group relative rounded-xl border border-border bg-white p-5 overflow-hidden">
                        <div className={`space-y-4 transition-opacity duration-200 ${isDeleting ? "opacity-50" : "opacity-100"}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-lg font-semibold text-text_normal">{review.name}</p>
                                    {review.location ? <p className="text-sm text-gray-400 mt-1">{review.location}</p> : null}
                                </div>
                                <StarRating rating={review.rating} />
                            </div>

                            <p className="text-sm leading-6 text-gray-700">&quot;{review.review}&quot;</p>
                        </div>

                        <button
                            onClick={() => handleDelete(review._id)}
                            disabled={isDeleting}
                            className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 hover:bg-red-600 disabled:cursor-not-allowed"
                            aria-label={`Delete review from ${review.name}`}
                        >
                            {isDeleting ? (
                                <span className="block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <LuTrash2 className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default GetCustomerReviews;
