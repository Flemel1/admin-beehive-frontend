"use client";

import { useState, FormEvent } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/;

    const openModal = () => {
        setError(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (!loading) {
            setIsModalOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setError(null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Semua field wajib diisi.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Konfirmasi password baru tidak sama.");
            return;
        }

        if (!passwordRegex.test(newPassword)) {
            setError(
                "Password harus minimal 12 karakter, dan mengandung huruf besar, huruf kecil, angka, dan simbol."
            );
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Token tidak ditemukan. Silakan login ulang.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Gagal mengubah password.");
                return;
            }

            closeModal();
            setShowSuccessModal(true);

        } catch (err) {
            setError("Terjadi kesalahan server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <header className="w-full h-16 bg-white shadow-sm flex items-center justify-between px-6">
                <h1 className="text-lg font-semibold text-[#134280]">Admin Dashboard</h1>

                <button
                    onClick={openModal}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#134280] text-white text-sm font-medium hover:bg-[#0f2e5c] shadow transition"
                >
                    <Lock className="w-4 h-4" />
                    Update Password
                </button>
            </header>

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 relative"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-[#134280]/10">
                                        <Lock className="w-5 h-5 text-[#134280]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Update Password
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Minimal 12 karakter + huruf besar, kecil, angka, simbol.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                                >
                                    ×
                                </button>
                            </div>

                            {error && (
                                <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Password Lama
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#134280]"
                                        placeholder="Masukkan password lama"
                                        autoComplete="current-password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#134280]"
                                        placeholder="Minimal 12 karakter + kombinasi"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#134280]"
                                        placeholder="Ulangi password baru"
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-xs font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50"
                                        disabled={loading}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#134280] text-white hover:bg-[#0f2e5c] disabled:opacity-50"
                                    >
                                        {loading ? "Menyimpan..." : "Simpan Password"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSuccessModal && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center"
                        >
                            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-gray-800">
                                Password Berhasil Diubah!
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Password Anda telah diperbarui dengan aman.
                            </p>

                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="mt-5 px-4 py-2 bg-[#134280] text-white rounded-lg text-sm hover:bg-[#0f2e5c]"
                            >
                                Tutup
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
