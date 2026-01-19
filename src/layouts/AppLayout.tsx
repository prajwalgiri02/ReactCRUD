import React from "react"
import Sidebar from "@/components/layout/Sidebar"
import Topbar from "@/components/layout/Topbar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = React.useState(false)

    return (
        <div className="min-h-screen bg-muted/30 flex">
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />

            <div className="flex-1 min-w-0 flex flex-col">
                <Topbar onToggleSidebar={() => setCollapsed((v) => !v)} />
                <main className="flex-1 p-6">
                    <div className="mx-auto max-w-7xl">{children}</div>
                </main>
            </div>
        </div>
    )
}
