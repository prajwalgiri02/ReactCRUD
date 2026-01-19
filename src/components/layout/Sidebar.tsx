import React from "react"
import { NavLink } from "react-router-dom"
import {
    LayoutDashboard,
    BarChart3,
    Receipt,
    Users,
    FileText,
    PieChart,
    Table2,
    LineChart,
    ChevronDown,
    Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SidebarProps = {
    collapsed: boolean
    onToggle: () => void
}

type Item = {
    to: string
    label: string
    icon: React.ComponentType<{ size?: number; className?: string }>
    end?: boolean
    rightIcon?: React.ReactNode // for caret like Users ▼
}

const sections: Array<{ title: string; items: Item[] }> = [
    {
        title: "Dashboard",
        items: [
            { to: "/dashboard/default", label: "Default", icon: LayoutDashboard },
            { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
            { to: "/dashboard/invoice", label: "Invoice", icon: Receipt },
            { to: "/dashboard/crm", label: "CRM", icon: Users },
            { to: "/dashboard/blog", label: "Blog", icon: FileText },
        ],
    },
    {
        title: "Widget",
        items: [
            { to: "/widget/statistics", label: "Statistics", icon: PieChart },
            { to: "/widget/data", label: "Data", icon: Table2 },
            { to: "/widget/chart", label: "Chart", icon: LineChart },
        ],
    },
    {
        title: "Application",
        items: [
            { to: "/app/users", label: "Users", icon: Users, rightIcon: <ChevronDown className="h-4 w-4" /> },
        ],
    },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    return (
        <aside
            className={cn(
                "h-screen sticky top-0 border-r bg-card",
                "transition-all duration-200 ease-out",
                collapsed ? "w-[84px]" : "w-[300px]",
            )}
        >
            {/* Header (logo + toggle) */}
            <div className={cn("h-16 flex items-center justify-between px-5 border-b", collapsed && "px-3")}>
                <div className={cn("flex items-center gap-3", collapsed && "justify-center w-full")}>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary grid place-items-center font-bold">
                        B
                    </div>

                    {!collapsed && (
                        <div className="leading-tight">
                            <div className="font-extrabold tracking-wide text-foreground">PRAJWAL</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className={cn("px-4 py-5 space-y-6", collapsed && "px-2")}>
                {sections.map((section, i) => (
                    <div key={section.title} className="space-y-2">
                        {/* Section title */}
                        {!collapsed && <div className="px-2 text-sm font-semibold text-foreground">{section.title}</div>}

                        {/* Items */}
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <SidebarItem key={item.to} item={item} collapsed={collapsed} />
                            ))}
                        </div>

                        {/* Divider */}
                        {i !== sections.length - 1 && <div className={cn("pt-4", collapsed ? "px-2" : "px-2")}><Divider /></div>}
                    </div>
                ))}
            </div>
        </aside>
    )
}

function SidebarItem({ item, collapsed }: { item: Item; collapsed: boolean }) {
    const Icon = item.icon

    return (
        <NavLink
            to={item.to}
            end={item.end}
            title={collapsed ? item.label : undefined}
            className={({ isActive }) =>
                cn(
                    "group flex items-center gap-3 rounded-xl transition-colors",
                    collapsed ? "h-11 justify-center" : "h-11 px-3",
                    isActive
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/80 hover:bg-muted hover:text-foreground",
                )
            }
        >
            <Icon size={18} className="shrink-0" />

            {!collapsed && (
                <>
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                    {item.rightIcon ? <span className="text-muted-foreground group-hover:text-foreground">{item.rightIcon}</span> : null}
                </>
            )}
        </NavLink>
    )
}

function Divider() {
    return <div className="h-px w-full bg-border/70" />
}
