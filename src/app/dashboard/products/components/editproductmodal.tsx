"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { Product } from "./producttable";
import ProductForm from "./productform";

interface Props {
    product: Product;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditProductModal({ product, onClose, onSuccess }: Props) {
    const [form, setForm] = useState<Product>(product);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.title.trim()) {
            Swal.fire("Error", "Product Title is required!", "error");
            return;
        }

        setIsSubmitting(true);

        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Unauthorized", "Please log in again.", "warning");
            setIsSubmitting(false);
            return;
        }

        // Payload yang persis sesuai validasi Laravel
        const payload = {
            title: form.title.trim(),
            subtitle: form.subtitle || null,
            description: form.description || null,
            type: form.type || null,
            wingspan: form.wingspan || null,
            flightEndurance: form.flightEndurance || null,
            flightRange: form.flightRange || null,
            flightHeight: form.flightHeight || null,
            otherDetails: form.otherDetails || null,
            basePrice: Number(form.basePrice) || 0,
            images: form.images.filter(Boolean),
            include: form.include.filter(Boolean),
            packageOptions: (form.packageOptions || [])
                .map((pkg) => ({
                    name: pkg.name?.trim(),
                    price: Number(pkg.price) || 0,
                    description: pkg.description?.trim() || null,
                }))
                .filter((pkg) => pkg.name),
            financing: form.financing,
        };

        try {
            const res = await fetch(`${API_URL}/api/products/${form.id}`, {
                method: "PUT", // atau PATCH kalau kamu pakai Route::patch
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                const msg =
                    err.message ||
                    Object.values(err.errors || {}).flat().join(", ") ||
                    "Failed to update product";
                throw new Error(msg);
            }

            Swal.fire({
                title: "Success!",
                text: "Product updated successfully.",
                icon: "success",
                confirmButtonColor: "#134280",
            });

            onSuccess(); // refresh table di parent
            onClose();
        } catch (err: any) {
            Swal.fire({
                title: "Failed!",
                text: err.message || "An error occurred while updating the product.",
                icon: "error",
                confirmButtonColor: "#d33",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
            {/* Backdrop click to close */}
            <div
                className="absolute inset-0 -z-10"
                onClick={onClose}
                aria-hidden="true"
            />

            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-full">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit}>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        <ProductForm product={form} onChange={setForm} />
                    </div>

                    {/* Fixed Footer Buttons */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-2.5 bg-[#134280] text-white rounded-lg hover:bg-[#0f2e5c] transition font-medium flex items-center gap-3 disabled:opacity-50 shadow-md"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                "Update Product"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}