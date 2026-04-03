"use client";

import { api } from "@/libs/axios";
import axios from "axios";
import { useState } from "react";
import Swal from "sweetalert2";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdCheckCircle, MdOutlineRateReview } from "react-icons/md";

const getErrorMessage = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const details = error.response?.data?.errors;

        if (Array.isArray(details) && details.length > 0) {
            return details.map((item: { message?: string }) => item.message).filter(Boolean).join(", ");
        }

        return message || error.message;
    }

    return "Failed to save customer review. Please try again.";
};

const AddCustomerReview = ({ onSaved }: { onSaved: () => void }) => {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        review: "",
        rating: 5,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSaving(true);

        try {
            const result = await api.post("/customer-reviews", {
                ...formData,
                location: formData.location.trim(),
                review: formData.review.trim(),
                name: formData.name.trim(),
            });

            if (result.data.success) {
                await Swal.fire({
                    icon: "success",
                    title: "Review Saved!",
                    text: "Customer review created successfully.",
                    confirmButtonColor: "#10b981",
                    timer: 1800,
                    showConfirmButton: false,
                });

                setFormData({
                    name: "",
                    location: "",
                    review: "",
                    rating: 5,
                });
                onSaved();
            }
        } catch (error) {
            console.error("Error saving customer review:", error);
            Swal.fire({
                icon: "error",
                title: "Save Failed",
                text: getErrorMessage(error),
                confirmButtonColor: "#ef4444",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Customer Reviews</h2>
                <p className="text-gray-600">Create homepage testimonials that will appear in the customer review slider on the frontend.</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                            placeholder="Enter customer name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))}
                            placeholder="Optional city or district"
                            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                        value={formData.rating}
                        onChange={(event) => setFormData((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                    >
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <option key={rating} value={rating}>
                                {rating} Star{rating > 1 ? "s" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Review Text</label>
                    <textarea
                        value={formData.review}
                        onChange={(event) => setFormData((prev) => ({ ...prev, review: event.target.value }))}
                        placeholder="Write the customer testimonial that should show on the homepage"
                        rows={6}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 resize-y"
                        required
                    />
                </div>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                    <MdOutlineRateReview className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-amber-800">
                        <p className="font-medium">Homepage review card</p>
                        <p className="mt-1">Keep reviews concise and natural. The homepage slider shows one testimonial at a time, so shorter quotes read best.</p>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSaving || !formData.name.trim() || !formData.review.trim()}
                    className="w-full py-3 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 text-lg"
                >
                    {isSaving ? (
                        <>
                            <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <MdCheckCircle className="h-5 w-5" />
                            Save Customer Review
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AddCustomerReview;
