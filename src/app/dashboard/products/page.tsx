"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/dashboardlayouts";
import ProductForm from "./components/productform";
import ProductTable, { Product } from "./components/producttable";

const makeEmptyProduct = (): Product => ({
  id: 0,
  title: "",
  subtitle: "",
  images: [],
  description: "",
  type: "",
  wingspan: "",
  flightEndurance: "",
  flightRange: "",
  flightHeight: "",
  otherDetails: "",
  include: [],
  packageOptions: [],
  financing: ["Cash", "Installment"],
  basePrice: 0,
});

export default function ProductsPage() {
  const [form, setForm] = useState<Product>(makeEmptyProduct());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Product Title is required!",
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }

    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "Unauthorized",
        text: "Please log in again.",
        icon: "warning",
        confirmButtonColor: "#134280",
      });
      setIsSubmitting(false);
      return;
    }

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
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data.message ||
          Object.values(data.errors || {}).flat().join(", ") ||
          "Failed to save product";
        throw new Error(msg);
      }

      Swal.fire({
        title: "Success!",
        text: "Product has been successfully added.",
        icon: "success",
        confirmButtonColor: "#134280",
      });

      setForm(makeEmptyProduct());
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      Swal.fire({
        title: "Failed!",
        text: err.message || "An error occurred while saving the product.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manage Products</h1>
          <p className="text-gray-600 mt-1">
            Add new products or manage existing ones.
          </p>
        </div>

        {/* Add Product Form Card */}
        <div className="bg-white shadow-md rounded-xl p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Add New Product
          </h2>

          <form onSubmit={handleSubmit} className="space-y-7">
            <ProductForm product={form} onChange={setForm} />

            {/* Submit Button - Identical to Projects & Articles */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#134280] text-white px-8 py-3 rounded-md hover:bg-[#0f2e5c] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Products Table Card */}
        <div className="mt-10 bg-white shadow-md rounded-xl overflow-hidden">
          <ProductTable key={refreshKey} />
        </div>
      </div>
    </DashboardLayout>
  );
}