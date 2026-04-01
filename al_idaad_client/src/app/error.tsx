"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENV === "development") {
            console.error(error);
        }
    }, [error]);

    return (
        <div className="p-4 bg-red-100 rounded min-h-screen fixed top-0 bottom-0 w-screen z-50 flex justify-center items-center flex-col">
            <h2 className="text-4xl font-semibold">Error</h2>

            <p className="mt-2 text-center">Something went wrong. Please try again.</p>

            {process.env.NEXT_PUBLIC_ENV === "development" && <p className="mt-2 text-sm text-gray-600 text-center">{error.message}</p>}

            <button onClick={() => reset()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Try again
            </button>
        </div>
    );
}
