"use client";

import { useState, useEffect } from "react";
import { Project } from "./projecttable";
import dynamic from "next/dynamic";

interface Dropdown {
    product_services: { id: number; name: string }[];
    industries: { id: number; name: string }[];
}

interface Props {
    project: Project;
    onClose: () => void;
    onSave: (updated: Project) => void;
}

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditProjectModal({ project, onClose, onSave }: Props) {

    const [form, setForm] = useState({
        id: String(project.id),
        title: project.title || "",
        description: project.description || "",
        location: project.location || "",
        goal: project.goal || "",
        product_service_id: String(project.product_service_id || ""),
        industry_id: String(project.industry_id || ""),
        image: null as File | null,
        current_image: project.image || "",
    });

    const [dropdowns, setDropdowns] = useState<Dropdown>({ product_services: [], industries: [] });
    const [loading, setLoading] = useState(false);
    const apiBase = "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchDropdowns = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch(`${apiBase}/api/projects/dropdowns`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                });
                if (!res.ok) throw new Error("Failed to load dropdowns");
                const data = await res.json();
                setDropdowns(data);
            } catch (err) {
                console.error("Failed to fetch dropdowns:", err);
            }
        };
        fetchDropdowns();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first.");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("location", form.location);
        formData.append("goal", form.goal);
        formData.append("product_service_id", form.product_service_id);
        formData.append("industry_id", form.industry_id);
        if (form.image) formData.append("image", form.image);

        try {
            const res = await fetch(`${apiBase}/api/projects/${form.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                alert("Failed to update project: " + (data.message || "Validation error"));
                return;
            }

            onSave(data.project || data);
            onClose();
        } catch (err) {
            console.error("Error updating project:", err);
            alert("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            >
                <h3 className="mb-5 text-2xl font-bold text-gray-800">Edit Project</h3>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <div data-color-mode="light">
                            <MDEditor
                                value={form.description}
                                onChange={(v) => setForm(prev => ({ ...prev, description: v || "" }))}
                                height={250}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Goal</label>
                            <input
                                type="text"
                                name="goal"
                                value={form.goal}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product / Service</label>
                            <select
                                name="product_service_id"
                                value={form.product_service_id}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                                required
                            >
                                <option value="">-- Select --</option>
                                {dropdowns.product_services.map((ps) => (
                                    <option key={ps.id} value={ps.id}>
                                        {ps.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                            <select
                                name="industry_id"
                                value={form.industry_id}
                                onChange={handleChange}
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#134280] focus:ring-2 focus:ring-[#134280]/20 transition"
                                required
                            >
                                <option value="">-- Select --</option>
                                {dropdowns.industries.map((ind) => (
                                    <option key={ind.id} value={ind.id}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {form.current_image && !form.image && (
                        <div className="flex items-center gap-3">
                            <div className="group relative">
                                <img
                                    src={`${apiBase}/storage/${form.current_image}`}
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Project Image (optional)</label>
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
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
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
            </form>
        </div>
    );
}