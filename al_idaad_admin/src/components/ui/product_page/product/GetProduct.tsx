import { useAuth } from "@/components/shared/AuthContext";
import { api } from "@/libs/axios";
import { AxiosError } from "axios";
import Image from "next/image";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import Swal from "sweetalert2";

const GetProduct = () => {
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { products, productsLoading, changeProductKey, changeUploedFilesKey } = useAuth();

    const handleDelete = async (id: string) => {
        Swal.fire({
            title: "Are you sure?",
            text: `Delete this item? This cannot be undone.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                setDeletingId(id);
                try {
                    await api.delete(`/products/${id}`);
                    Swal.fire("Deleted!", "Product has been deleted.", "success");

                    changeProductKey();
                    changeUploedFilesKey();
                } catch (err) {
                    const error = err as AxiosError<{ message?: string }>;
                    Swal.fire("Error!", error.response?.data?.message || "Failed to delete Product.", "error");
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };
    return (
        <div className="">
            <p className="text-3xl font-semibold text-center text-main mb-4">Product List</p>
            {productsLoading ? (
                <p>Loading...</p>
            ) : (
                <div className="space-y-2 h-[calc(100vh-254px)] overflow-y-auto pr-2 custom-scrollbar">
                    {products?.data.length ? (
                        products.data.map((ele) => {
                            return (
                                <div key={ele._id} className="p-4 bg-bg_secondary rounded flex justify-between gap-2 items-center">
                                    <p>{ele.name}</p>
                                    <button
                                        disabled={deletingId === ele._id}
                                        onClick={() => handleDelete(ele._id)}
                                        className="text-red-400 hover:text-red-800 transition"
                                    >
                                        {deletingId === ele._id ? (
                                            <span className="animate-spin border-2 border-red-500 border-t-transparent rounded-full w-4 h-4 inline-block"></span>
                                        ) : (
                                            <LuTrash2></LuTrash2>
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex flex-col items-center h-[calc(100vh-254px)] justify-center gap-4">
                            <Image src="/empty.png" width={100} height={100} alt="empty"></Image>
                            <p className="text-xl font-medium text-soft">No product found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default GetProduct;
