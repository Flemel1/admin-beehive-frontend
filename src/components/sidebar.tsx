"use client";

import { LayoutDashboard, FolderKanban, FileText, Users, Store, LogOut } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ name: string } | null>(null);

    const menus = [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Projects", icon: FolderKanban, path: "/dashboard/projects" },
        { name: "Articles", icon: FileText, path: "/dashboard/articles" },
        { name: "Careers", icon: Users, path: "/dashboard/careers" },
        { name: "Products", icon: Store, path: "/dashboard/products" },
    ];

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Accept": "application/json",
                },
            });

            if (!response.ok) {
                console.warn("Logout API failed (token mungkin sudah invalid).");
            }
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            alert("Logout berhasil!");
            router.replace("/login");
        }
    };

    return (
        <aside className="w-64 h-screen bg-white shadow-md flex flex-col justify-between border-r border-gray-100">
            {/* Logo Section */}
            <div className="flex items-center justify-center py-6 border-b border-gray-100">
                <Image
                    src="/logo.png"
                    alt="Logo Beehive"
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                    priority
                />
            </div>

            {/* Menu List */}
            <nav className="flex-1 mt-4 px-3 space-y-1">
                {menus.map((menu) => {
                    const isActive = pathname === menu.path;
                    return (
                        <Link
                            key={menu.path}
                            href={menu.path}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition font-medium
                                ${isActive
                                    ? "bg-[#134280] text-white shadow-sm"
                                    : "text-gray-700 hover:bg-[#134280]/10 hover:text-[#134280]"}
                            `}
                        >
                            <menu.icon className="w-5 h-5" />
                            <span>{menu.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="bg-[#134280] text-white px-5 py-4 border-t border-[#0f3465]">
                <div className="flex items-center gap-3">
                    <Image
                        src="/user.png"
                        alt="User"
                        width={40}
                        height={40}
                        className="rounded-full border border-white/40 object-cover"
                    />
                    <div className="flex-1">
                        <p className="text-xs text-white/80">Welcome back 👋</p>
                        <p className="font-semibold text-sm">
                            {user ? user.name : "Admin"}
                        </p>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 mt-1 text-xs text-red-200 hover:text-red-400 transition"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
