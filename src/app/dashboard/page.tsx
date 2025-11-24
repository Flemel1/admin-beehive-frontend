"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    FolderKanban,
    FileText,
    Package,
    Users,
    PlusCircle,
    Calendar,
} from "lucide-react";
import DashboardLayout from "@/components/dashboardlayouts";
import Link from "next/link";

interface Stats {
    totalProjects: number;
    totalArticles: number;
    totalProducts: number;
    openCareers: number;
}

interface RecentItem {
    id: number;
    title: string;
    subtitle?: string;
    date?: string;
    price?: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<Stats>({
        totalProjects: 0,
        totalArticles: 0,
        totalProducts: 0,
        openCareers: 0,
    });

    const [recentProjects, setRecentProjects] = useState<RecentItem[]>([]);
    const [recentArticles, setRecentArticles] = useState<RecentItem[]>([]);
    const [recentProducts, setRecentProducts] = useState<RecentItem[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://127.0.0.1:8000";
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const [projRes, artRes, prodRes, careerRes] = await Promise.all([
                    fetch(`${API_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/articles`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/products`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/careers`, { headers: { Authorization: `Bearer ${token}` } }),
                ]);

                const projJson = await projRes.json();
                const artJson = await artRes.json();
                const prodJson = await prodRes.json();
                const careerJson = await careerRes.json();

                const getDataArray = (json: any) => {
                    if (Array.isArray(json)) return json;
                    if (json?.data && Array.isArray(json.data)) return json.data;
                    return [];
                };

                const projects = getDataArray(projJson);
                const articles = getDataArray(artJson);
                const products = getDataArray(prodJson);
                const careers = getDataArray(careerJson);

                setStats({
                    totalProjects: projects.length,
                    totalArticles: articles.length,
                    totalProducts: products.length,
                    openCareers: careers.length,
                });

                setRecentProjects(projects.slice(0, 5).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    subtitle: p.location || "No location",
                })));

                setRecentArticles(articles.slice(0, 5).map((a: any) => ({
                    id: a.id,
                    title: a.title,
                    subtitle: a.author || "Admin",
                    date: a.created_at
                        ? new Date(a.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })
                        : "No date",
                })));

                setRecentProducts(products.slice(0, 5).map((p: any) => ({
                    id: p.id,
                    title: p.title,
                    subtitle: p.subtitle || p.type || "Drone System",
                    price: p.base_price,
                })));

            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <DashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                {/* Hero Greeting */}
                <div className="bg-gradient-to-r from-[#134280] to-[#0f2e5c] rounded-2xl p-8 text-white shadow-xl">
                    <h1 className="text-4xl font-bold mb-2">Welcome back, Admin! 👋</h1>
                    <p className="text-xl opacity-90">Beehive Drones Admin Dashboard</p>
                    <div className="mt-6 flex items-center gap-3 text-lg">
                        <Calendar className="w-6 h-6" />
                        <span>{today}</span>
                    </div>
                </div>

                {/* Stat Cards - Clean & Minimal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { title: "Total Projects", value: stats.totalProjects, icon: FolderKanban, color: "from-blue-500 to-cyan-600", link: "/dashboard/projects" },
                        { title: "Blog Articles", value: stats.totalArticles, icon: FileText, color: "from-emerald-500 to-teal-600", link: "/dashboard/articles" },
                        { title: "Products", value: stats.totalProducts, icon: Package, color: "from-purple-500 to-indigo-600", link: "/dashboard/products" },
                        { title: "Open Careers", value: stats.openCareers, icon: Users, color: "from-orange-500 to-red-600", link: "/dashboard/careers" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link href={stat.link}>
                                <div className={`bg-gradient-to-br ${stat.color} p-6 rounded-2xl shadow-lg text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                                            <stat.icon className="w-8 h-8" />
                                        </div>
                                        <PlusCircle className="w-6 h-6 opacity-70" />
                                    </div>
                                    <h3 className="text-4xl font-bold">{stat.value}</h3>
                                    <p className="text-sm opacity-90 mt-1">{stat.title}</p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Activity - 3 Columns */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Projects */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <FolderKanban className="w-6 h-6 text-[#134280]" />
                                Recent Projects
                            </h3>
                            <Link href="/dashboard/projects" className="text-sm text-[#134280] hover:underline font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentProjects.length === 0 ? (
                                <p className="text-center text-gray-500 italic py-8">No projects yet</p>
                            ) : (
                                recentProjects.map((p) => (
                                    <div key={p.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <p className="font-medium text-gray-800">{p.title}</p>
                                        <p className="text-sm text-gray-600 mt-1">{p.subtitle}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Articles */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <FileText className="w-6 h-6 text-emerald-600" />
                                Latest Articles
                            </h3>
                            <Link href="/dashboard/articles" className="text-sm text-emerald-600 hover:underline font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentArticles.length === 0 ? (
                                <p className="text-center text-gray-500 italic py-8">No articles yet</p>
                            ) : (
                                recentArticles.map((a) => (
                                    <div key={a.id} className="p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition">
                                        <p className="font-medium text-gray-800">{a.title}</p>
                                        <p className="text-xs text-gray-600 mt-1">{a.subtitle} • {a.date}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Products */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                                <Package className="w-6 h-6 text-purple-600" />
                                Latest Products
                            </h3>
                            <Link href="/dashboard/products" className="text-sm text-purple-600 hover:underline font-medium">
                                View all →
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {recentProducts.length === 0 ? (
                                <p className="text-center text-gray-500 italic py-8">No products yet</p>
                            ) : (
                                recentProducts.map((p) => (
                                    <div key={p.id} className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition">
                                        <p className="font-medium text-gray-800">{p.title}</p>
                                        <div className="flex justify-between items-center mt-2">
                                            <p className="text-sm text-gray-600">{p.subtitle}</p>
                                            {p.price && (
                                                <span className="font-bold text-purple-700">
                                                    Rp{p.price.toLocaleString("id-ID")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Footer */}
                <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Beehive Drones • Leading Innovation in Aerial Technology</p>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}