"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import EditArticleModal from "./editarticlemodal";
import { Edit, Trash } from "lucide-react";

export interface Article {
    id: number;
    title: string;
    content: string;
    author: string;
    image: string | null;
    image_url?: string;
    categories: { id: number; name: string }[];
    created_at?: string;
    updated_at?: string;
}

export default function ArticleTable() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingArticle, setEditingArticle] = useState<Article | null>(null);

    const apiBase = "http://127.0.0.1:8000";

    useEffect(() => {
        const fetchArticles = async () => {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                Swal.fire("Unauthorized", "Please login first.", "warning");
                window.location.href = "/login";
                return;
            }


            try {
                const res = await fetch(`${apiBase}/api/articles`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);

                const data: Article[] = await res.json();
                setArticles(
                    data.map(a => ({
                        ...a,
                        categories: a.categories || [],
                        images: a.image || [],
                    }))
                );
            } catch (err) {
                console.error("Fetch articles error:", err);
                setError("Gagal memuat artikel");
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const handleDelete = async (id: number) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This article will be permanently deleted.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#134280",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${apiBase}/api/articles/${id}`, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error("Gagal menghapus artikel");

                    setArticles(prev => prev.filter(a => a.id !== id));
                    Swal.fire("Deleted!", "The article has been deleted.", "success");
                } catch (err) {
                    Swal.fire("Error!", "Gagal menghapus artikel.", "error");
                    console.error(err);
                }
            }
        });
    };

    const handleSaveArticle = (updated: Article) => {
        setArticles(prev => prev.map(a => (a.id === updated.id ? { ...a, ...updated } : a)));
        setEditingArticle(null);
        Swal.fire("Success!", "Article updated successfully.", "success");
    };

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;

    return (
        <div className="bg-white shadow-md rounded-lg p-6 mt-6 relative">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Articles List</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="bg-gray-100 text-left text-gray-700">
                            <th className="p-3">Title</th>
                            <th className="p-3">Author</th>
                            <th className="p-3">Categories</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-6 text-center text-gray-500 italic">
                                    No articles available
                                </td>
                            </tr>
                        )}
                        {articles.map(a => (
                            <tr key={a.id} className="border-b hover:bg-gray-50 transition">
                                <td className="p-3 font-medium">{a.title}</td>
                                <td className="p-3">{a.author}</td>
                                <td className="p-3">
                                    {a.categories.length > 0
                                        ? a.categories.map(cat => cat.name).join(", ")
                                        : <span className="text-gray-400 italic">No categories</span>}
                                </td>
                                <td className="p-3 text-center">
                                    <div className="flex justify-center gap-3">
                                        {/* Edit Button */}
                                        <button
                                            onClick={() => setEditingArticle(a)}
                                            className="p-2 rounded-full hover:bg-blue-100 text-blue-600 transition group"
                                            title="Edit Article"
                                        >
                                            <Edit className="w-5 h-5 group-hover:scale-110 transition" />
                                        </button>

                                        {/* Delete Button */}
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            className="p-2 rounded-full hover:bg-red-100 text-red-600 transition group"
                                            title="Delete Article"
                                        >
                                            <Trash className="w-5 h-5 group-hover:scale-110 transition" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editingArticle && (
                <EditArticleModal
                    article={editingArticle}
                    onClose={() => setEditingArticle(null)}
                    onSave={handleSaveArticle}
                />
            )}
        </div>
    );
}