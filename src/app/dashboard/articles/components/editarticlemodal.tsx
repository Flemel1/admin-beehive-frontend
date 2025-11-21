"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Article } from "./articletable";
import dynamic from "next/dynamic";

interface Category {
    id: number;
    name: string;
}

interface Props {
    article: Article;
    onClose: () => void;
    onSave: (updated: Article) => void;
}

export default function EditArticleModal({ article, onClose, onSave }: Props) {
    const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

    const [form, setForm] = useState({
        title: article.title || "",
        content: article.content || "",
        author: article.author || "",
        categories: article.categories?.map((c) => c.id) || [],
        image: null as File | null,
        current_image: article.image || "",
        image_url: article.image_url || "",
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const apiBase = "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch(`${apiBase}/api/articles/categories`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("Failed to load categories");
                const data: Category[] = await res.json();
                setCategories(data);
            } catch {
                Swal.fire("Error", "Failed to load categories", "error");
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (catId: number) => {
        setForm((prev) => {
            const exists = prev.categories.includes(catId);
            let newCats = exists
                ? prev.categories.filter((id) => id !== catId)
                : [...prev.categories, catId];
            if (newCats.length > 2) newCats = newCats.slice(0, 2);
            return { ...prev, categories: newCats };
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setForm((prev) => ({ ...prev, image: file }));
    };

    const handleRemoveImage = () => {
        setForm((prev) => ({ ...prev, image: null }));
        const input = document.getElementById("image-upload-edit") as HTMLInputElement;
        if (input) input.value = "";
    };

    const handleSave = async () => {
        if (!form.title || !form.content || !form.author || form.categories.length === 0) {
            Swal.fire("Error", "Please fill all fields and select at least 1 category", "error");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
            Swal.fire("Error", "Authentication token not found. Please login again.", "error");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("title", form.title);
        formData.append("content", form.content);
        formData.append("author", form.author);
        form.categories.forEach((cat, index) => {
            formData.append(`categories[${index}]`, cat.toString());
        });
        if (form.image) formData.append("image", form.image);

        try {
            const res = await fetch(`${apiBase}/api/articles/${article.id}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to update article");

            onSave({
                ...article,
                ...data.article,
                categories: data.article.categories || [],
                image_url: data.article.image_url || "",
                image: data.article.image || article.image,
            });

            onClose();
            Swal.fire({ title: "Success!", text: "Article updated successfully.", icon: "success", timer: 1500, showConfirmButton: false });
        } catch (err: any) {
            Swal.fire("Error!", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
                <h3 className="mb-5 text-2xl font-bold text-gray-800">Edit Article</h3>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                            placeholder="Enter article title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <div data-color-mode="light">
                            <MDEditor
                                value={form.content}
                                onChange={(value) => setForm((prev) => ({ ...prev, content: value || "" }))}
                                height={300}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                        <input
                            type="text"
                            name="author"
                            value={form.author}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                            placeholder="Author name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Categories <span className="text-gray-500">(max 2)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.length === 0 ? (
                                <p className="text-sm text-gray-500">Loading categories...</p>
                            ) : (
                                categories.map((cat) => {
                                    const isActive = form.categories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategoryChange(cat.id)}
                                            className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${isActive
                                                ? "bg-[#134280] text-white border-[#134280] shadow-sm"
                                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            {cat.name}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {form.current_image && !form.image && (
                        <div className="flex items-center gap-3">
                            <div className="group relative">
                                <img
                                    src={form.image_url || `${apiBase}/storage/${form.current_image}`}
                                    alt="Current"
                                    className="h-24 w-24 rounded-lg border object-cover shadow-sm"
                                />
                                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 opacity-0 transition group-hover:opacity-100">
                                    <span className="text-xs font-medium text-white">Current</span>
                                </div>
                            </div>
                            <span className="text-xs text-gray-600">Current image</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Image (optional)</label>
                        <label
                            htmlFor="image-upload-edit"
                            className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-[#134280] hover:bg-gray-100"
                        >
                            <svg className="mb-2 h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-xs text-gray-500">Click to upload image</p>
                            <p className="mt-1 text-xs text-gray-400">PNG, JPG up to 2MB</p>
                        </label>
                        <input id="image-upload-edit" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </div>

                    {form.image && (
                        <div className="flex items-center gap-3">
                            <img
                                src={URL.createObjectURL(form.image)}
                                alt="Preview"
                                className="h-24 w-24 rounded-lg border object-cover shadow-sm"
                            />
                            <div className="flex flex-col">
                                <p className="text-xs font-medium text-gray-700">{form.image.name}</p>
                                <button
                                    type="button"
                                    onClick={handleRemoveImage}
                                    className="mt-1 text-xs font-medium text-red-600 hover:text-red-700"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-lg bg-[#134280] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#0f2e5c] disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}