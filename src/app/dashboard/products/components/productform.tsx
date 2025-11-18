"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Product } from "./producttable";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const resolveImageUrl = (img: string) => {
  if (!img) return "";
  if (img.startsWith("data:image/")) return img;
  if (img.startsWith("http")) return img;
  return `${API_URL}${img.startsWith("/") ? "" : "/"}${img}`;
};

interface Props {
  product: Product;
  onChange: (updated: Product) => void;
}

export default function ProductForm({ product, onChange }: Props) {
  const [packageName, setPackageName] = useState("");
  const [packagePrice, setPackagePrice] = useState<number>(0);
  const [packageDesc, setPackageDesc] = useState("");

  const [includeText, setIncludeText] = useState<string>(
    (product.include || []).join("\n")
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "basePrice") {
      onChange({ ...product, basePrice: Number(value) || 0 });
      return;
    }
    onChange({ ...product, [name]: value });
  };

  return (
    <div className="space-y-7">
      {/* Title & Subtitle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={product.title}
            onChange={handleChange}
            placeholder="e.g., Beehive X1 Pro"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280] focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subtitle
          </label>
          <input
            type="text"
            name="subtitle"
            value={product.subtitle}
            onChange={handleChange}
            placeholder="e.g., Long-Range Surveillance Drone"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280] focus:border-transparent"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          rows={5}
          placeholder="Provide a detailed description of the product..."
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280] focus:border-transparent"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Images <span className="text-gray-500">(max 4 images)</span>
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = Array.from(e.target.files || []).slice(0, 4);
            const readers = files.map((file) =>
              new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.readAsDataURL(file);
              })
            );
            Promise.all(readers).then((base64Images) => {
              onChange({ ...product, images: base64Images });
            });
          }}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#134280] file:text-white hover:file:bg-[#0f2e5c]"
        />
        {product.images && product.images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {product.images.map((img, i) => (
              <div key={i} className="relative group">
                <img
                  src={resolveImageUrl(img)}
                  alt={`Preview ${i + 1}`}
                  className="w-28 h-28 object-cover rounded-lg border shadow-sm"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...product,
                      images: product.images.filter((_, index) => index !== i),
                    })
                  }
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Specifications Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Specifications
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="type"
            value={product.type}
            onChange={handleChange}
            placeholder="Type"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
          />
          <input
            type="text"
            name="wingspan"
            value={product.wingspan}
            onChange={handleChange}
            placeholder="Wingspan"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
          />
          <input
            type="text"
            name="flightEndurance"
            value={product.flightEndurance}
            onChange={handleChange}
            placeholder="Flight Endurance"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
          />
          <input
            type="text"
            name="flightRange"
            value={product.flightRange}
            onChange={handleChange}
            placeholder="Flight Range"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
          />
          <input
            type="text"
            name="flightHeight"
            value={product.flightHeight}
            onChange={handleChange}
            placeholder="Flight Height"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
          />
          <input
            type="text"
            name="otherDetails"
            value={product.otherDetails}
            onChange={handleChange}
            placeholder="Other Details"
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280] col-span-2 md:col-span-3"
          />
        </div>
      </div>

      {/* Included Items */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Included Items (Markdown)
        </label>
        <div className="border rounded-md p-2" data-color-mode="light">
          <MDEditor
            value={includeText}
            onChange={(val) => {
              const v = val || "";
              setIncludeText(v);
              const lines = v.split("\n").map((s) => s.trim()).filter(Boolean);
              onChange({ ...product, include: lines });
            }}
            height={220}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {product.include?.length || 0} items • separate with new lines
        </p>
      </div>

      {/* Package Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Package Options
        </label>
        <div className="p-5 border rounded-lg bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Package Name"
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
            />
            <input
              type="number"
              value={packagePrice || ""}
              onChange={(e) => setPackagePrice(Number(e.target.value) || 0)}
              placeholder="Additional Price"
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
            />
            <input
              type="text"
              value={packageDesc}
              onChange={(e) => setPackageDesc(e.target.value)}
              placeholder="Description (optional)"
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280]"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              if (!packageName.trim()) return;
              onChange({
                ...product,
                packageOptions: [
                  ...(product.packageOptions || []),
                  { name: packageName.trim(), price: packagePrice, description: packageDesc.trim() || "" },
                ],
              });
              setPackageName("");
              setPackagePrice(0);
              setPackageDesc("");
            }}
            className="px-5 py-2 bg-[#134280] text-white rounded-md hover:bg-[#0f2e5c] text-sm font-medium transition"
          >
            + Add Package
          </button>

          {product.packageOptions && product.packageOptions.length > 0 && (
            <ul className="mt-4 space-y-2">
              {product.packageOptions.map((pkg, i) => (
                <li key={i} className="flex justify-between items-center text-sm bg-white p-3 rounded border">
                  <span>
                    <strong>{pkg.name}</strong> — Rp{pkg.price.toLocaleString("en-US")}
                    {pkg.description && ` (${pkg.description})`}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...product,
                        packageOptions: product.packageOptions.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Base Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Base Price (IDR)
        </label>
        <input
          type="number"
          name="basePrice"
          value={product.basePrice}
          onChange={handleChange}
          placeholder="0"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#134280] focus:border-transparent"
        />
      </div>
    </div>
  );
}