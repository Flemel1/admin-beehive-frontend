"use client";

import { useEffect, useState } from "react";
import { Edit, Trash, Plus } from "lucide-react";
import Swal from "sweetalert2";
import AddProductModal from "./addproductmodal";
import EditProductModal from "./editproductmodal";

export interface PackageOption {
    name: string;
    price: number;
    description: string;
}

export interface Product {
    id: number;
    title: string;
    subtitle: string;
    images: string[];
    description: string;
    type: string;
    wingspan: string;
    flightEndurance: string;
    flightRange: string;
    flightHeight: string;
    otherDetails: string;
    include: string[];
    packageOptions: PackageOption[];
    financing: string[];
    basePrice: number;
}

interface ApiPackageOption {
    name: string;
    price: number;
    description: string | null;
}

interface ApiProduct {
    id: number;
    title: string;
    subtitle: string | null;
    images: string[] | null;
    description: string | null;
    type: string | null;
    wingspan: string | null;
    flight_endurance: string | null;
    flight_range: string | null;
    flight_height: string | null;
    other_details: string | null;
    include_items: string[] | null;
    package_options: ApiPackageOption[] | null;
    financing: string[] | null;
    base_price: number | null;
}

interface ApiResponse {
    data: ApiProduct[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const mapApiToProduct = (api: ApiProduct): Product => ({
    id: api.id,
    title: api.title,
    subtitle: api.subtitle ?? "",
    images: api.images ?? [],
    description: api.description ?? "",
    type: api.type ?? "",
    wingspan: api.wingspan ?? "",
    flightEndurance: api.flight_endurance ?? "",
    flightRange: api.flight_range ?? "",
    flightHeight: api.flight_height ?? "",
    otherDetails: api.other_details ?? "",
    include: api.include_items ?? [],
    packageOptions: (api.package_options ?? []).map((p) => ({
        name: p.name,
        price: p.price,
        description: p.description ?? "",
    })),
    financing: api.financing ?? ["Cash", "Installment"],
    basePrice: api.base_price ?? 0,
});

export default function ProductTable() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Unauthorized", "Please log in first.", "warning");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_BASE}/api/products`, {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Failed to load products");

            const json: ApiResponse = await res.json();
            const mapped = json.data.map(mapApiToProduct);
            setProducts(mapped);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load products", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This product will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#134280",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API_BASE}/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Delete failed");

            setProducts((prev) => prev.filter((p) => p.id !== id));
            Swal.fire("Deleted!", "Product has been deleted.", "success");
        } catch {
            Swal.fire("Error", "Failed to delete product", "error");
        }
    };

    return (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
            {/* Header + Add Button */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Product List</h2>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#134280] text-white rounded-lg hover:bg-[#0f2e5c] transition font-medium text-sm shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="p-12 text-center text-gray-500 italic">
                    Loading products...
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-left text-gray-700 font-medium">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Subtitle</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Base Price</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500 italic">
                                        No products available
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {product.title}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {product.subtitle || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {product.type || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            Rp{product.basePrice.toLocaleString("id-ID")}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-3">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => setEditingProduct(product)}
                                                    className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition group"
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-5 h-5 group-hover:scale-110 transition" />
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 rounded-full hover:bg-red-100 text-red-600 transition group"
                                                    title="Delete Product"
                                                >
                                                    <Trash className="w-5 h-5 group-hover:scale-110 transition" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modals */}
            {isAdding && (
                <AddProductModal
                    onClose={() => setIsAdding(false)}
                    onSave={() => {
                        setIsAdding(false);
                        fetchProducts();
                    }}
                />
            )}

            {editingProduct && (
                <EditProductModal
                    product={editingProduct}
                    onClose={() => setEditingProduct(null)}
                    onSuccess={() => {
                        setEditingProduct(null);
                        fetchProducts();
                    }}
                />
            )}
        </div>
    );
}