"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";

interface Career {
    id: number;
    title: string;
    qualifications: string;
    benefits: string | null;
    responsibilities: string | null;
    location: string;
    work_type: "WFH" | "WFO" | "Hybrid";
    deadline: string;
}

interface Props {
    career: Career;
    onClose: () => void;
    onSave: (updated: Career) => void;
}

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditCareerModal({ career, onClose, onSave }: Props) {


    const formatDateForInput = (dateStr: Date) => {
        const day = String(dateStr.getUTCDate()).padStart(2, '0');
        const month = String(dateStr.getUTCMonth() + 1).padStart(2, '0');
        const year = dateStr.getUTCFullYear();

        return `${year}-${month}-${day}`;
    };

    const [form, setForm] = useState({
        id: career.id,
        title: career.title,
        qualifications: career.qualifications,
        benefits: career.benefits ?? "",
        responsibilities: career.responsibilities ?? "",
        location: career.location,
        work_type: career.work_type,
        deadline: formatDateForInput(new Date(career.deadline)),
    });

    const [loading, setLoading] = useState(false);
    const apiBase = "http://127.0.0.1:8000";

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const original = {
            title: career.title,
            qualifications: career.qualifications,
            benefits: career.benefits ?? "",
            responsibilities: career.responsibilities ?? "",
            location: career.location,
            work_type: career.work_type,
            deadline: career.deadline,
        };

        const payload: any = {};

        (Object.keys(form) as Array<keyof typeof form>).forEach((key) => {
            if (key === "id") return;

            const newVal = form[key];
            const oldVal = original[key];

            if (newVal !== oldVal) {
                if (["benefits", "responsibilities"].includes(key) && newVal === "") {
                    payload[key] = null;
                } else if (newVal !== "") {
                    payload[key] = newVal;
                }
            }
        });

        const required = ["title", "qualifications", "location", "work_type", "deadline"] as const;
        required.forEach((field) => {
            if (!(field in payload)) {
                payload[field] = form[field];
            }
        });

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token tidak ditemukan.");

            const res = await fetch(`${apiBase}/api/careers/${career.id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(payload),
            });

            let data;
            const contentType = res.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                data = await res.json();
            } else {
                const text = await res.text();
                console.error("Non-JSON:", text);
                throw new Error("Server error.");
            }

            if (!res.ok) {
                const errMsg = data.errors
                    ? Object.values(data.errors).flat().join(", ")
                    : data.message || "Gagal update";
                throw new Error(errMsg);
            }

            const updatedCareer = {
                ...data.career,
                deadline: formatDateForInput(new Date(data.career.deadline)),
            };

            onSave(updatedCareer);
            onClose();
            Swal.fire("Sukses!", "Lowongan diperbarui.", "success");
        } catch (err: any) {
            console.error("Error:", err);
            Swal.fire("Error!", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 overflow-y-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 my-8">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Career</h3>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Career Title</label>
                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                        <div data-color-mode="light">
                            <MDEditor
                                value={form.qualifications}
                                onChange={(v) => setForm({ ...form, qualifications: v || "" })}
                                height={200}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (Opsional)</label>
                        <div data-color-mode="light">
                            <MDEditor
                                value={form.benefits}
                                onChange={(v) => setForm({ ...form, benefits: v || "" })}
                                height={180}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities (Opsional)</label>
                        <div data-color-mode="light">
                            <MDEditor
                                value={form.responsibilities}
                                onChange={(v) => setForm({ ...form, responsibilities: v || "" })}
                                height={180}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={form.location}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
                            <select
                                name="work_type"
                                value={form.work_type}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 text-sm"
                                required
                            >
                                <option value="WFO">WFO</option>
                                <option value="WFH">WFH</option>
                                <option value="Hybrid">Hybrid</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formatDateForInput(new Date(form.deadline))}
                            onChange={handleChange}
                            className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm bg-[#134280] text-white rounded-md hover:bg-[#0f2e5c] disabled:opacity-50 transition"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}