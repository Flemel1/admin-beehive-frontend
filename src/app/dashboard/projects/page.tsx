"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import DashboardLayout from "@/components/dashboardlayouts";
import ProjectForm from "./components/projectform";
import ProjectTable from "./components/projecttable";

export default function ProjectsPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Manage Projects</h1>
                    <p className="text-gray-600 text-sm">
                        Add a new project or view the list of existing projects.
                    </p>
                </div>

                {/* Add project form */}
                <ProjectForm onSuccess={() => console.log("Project added!")} />

                {/* Project list table */}
                <ProjectTable />
            </div>
        </DashboardLayout>
    );
}
