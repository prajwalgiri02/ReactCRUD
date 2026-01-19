import React from "react"
import {Bell, Languages, Maximize2, Menu, Settings2, SlidersHorizontal} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover"

import {cn} from "@/lib/utils"

type TopbarProps = {
    onToggleSidebar?: () => void
    searchValue?: string
    onSearchChange?: (v: string) => void
}

type NotificationItem = {
    id: string
    title: string
    message: string
    time: string
    status?: "Unread" | "New"
    color?: "yellow" | "green" | "blue" | "purple"
}

const demoNotifications: NotificationItem[] = [
    {
        id: "1",
        title: "John Doe",
        message: "It is a long established fact that a reader will be distracted",
        time: "2 min ago",
        status: "Unread",
        color: "yellow",
    },
    {
        id: "2",
        title: "Store Verification Done",
        message: "We have successfully received your request.",
        time: "2 min ago",
        status: "Unread",
        color: "green",
    },
    {
        id: "3",
        title: "Check Your Mail.",
        message: "All done! Now check your inbox as you're in for a sweet treat!",
        time: "2 min ago",
        status: "New",
        color: "blue",
    },
]

export default function Topbar({onToggleSidebar, searchValue = "", onSearchChange}: TopbarProps) {
    const unreadCount = demoNotifications.filter((n) => n.status === "Unread" || n.status === "New").length

    const onToggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) await document.documentElement.requestFullscreen()
            else await document.exitFullscreen()
        } catch {
            // ignore
        }
    }

    return (
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 sm:px-6 gap-3">
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                        type="button"
                        onClick={onToggleSidebar}
                        className="h-10 w-10 rounded-xl bg-muted hover:bg-accent hover:text-accent-foreground transition-colors grid place-items-center"
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                {/* Search */}
                <div className="hidden sm:flex items-center gap-2 min-w-0 w-[520px] max-w-[56vw]">
                    <div className="relative w-full">
                        <Input
                            value={searchValue}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            placeholder="Search"
                            className={cn(
                                "h-11 rounded-2xl pl-10 pr-12",
                                "bg-background border border-border shadow-sm focus-visible:ring-2 focus-visible:ring-ring",
                            )}
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {/* simple magnifier shape via emoji-free icon style */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="opacity-70">
                <path
                    d="M21 21l-4.3-4.3m1.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
              </svg>
            </span>

                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl"
                            title="Filters"
                        >
                            <SlidersHorizontal className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">

                {/* Notifications */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className="relative h-10 w-10 rounded-2xl bg-muted hover:bg-accent hover:text-accent-foreground transition-colors grid place-items-center"
                            title="Notifications"
                        >
                            <Bell className="h-5 w-5"/>
                            {unreadCount > 0 ? (
                                <span
                                    className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] grid place-items-center">
                  {unreadCount}
                </span>
                            ) : null}
                        </button>
                    </PopoverTrigger>

                    <PopoverContent
                        align="end"
                        sideOffset={10}
                        className="w-[360px] p-0 rounded-2xl overflow-hidden shadow-xl"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="text-sm font-semibold">All Notification</div>
                                <span className="rounded-full bg-yellow-400/20 text-yellow-700 px-2 py-0.5 text-[11px] font-semibold">
        {String(unreadCount).padStart(2, "0")}
      </span>
                            </div>
                            <button className="text-xs text-primary hover:underline">Mark as all read</button>
                        </div>


                        {/* List */}
                        <div className="max-h-[420px] overflow-auto">
                            {demoNotifications.map((n) => (
                                <div key={n.id} className="px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors">
                                    <div className="flex items-start gap-3">
                                        {/* Smaller avatar */}
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-full grid place-items-center text-sm font-semibold shrink-0",
                                                n.color === "yellow" && "bg-yellow-400/20 text-yellow-700",
                                                n.color === "green" && "bg-green-500/15 text-green-700",
                                                n.color === "blue" && "bg-blue-500/15 text-blue-700",
                                                n.color === "purple" && "bg-primary/15 text-primary",
                                            )}
                                        >
                                            {n.title.slice(0, 1).toUpperCase()}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm font-semibold truncate">{n.title}</div>
                                                <div className="text-[11px] text-muted-foreground shrink-0">{n.time}</div>
                                            </div>

                                            <div className="text-[13px] text-muted-foreground mt-1 line-clamp-2">{n.message}</div>

                                            {/* Chips row */}
                                            {(n.status === "Unread" || n.status === "New") && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    {n.status === "Unread" && (
                                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-600">
                    Unread
                  </span>
                                                    )}
                                                    {n.status === "New" && (
                                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-700">
                    New
                  </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t text-center">
                            <button className="text-sm text-primary hover:underline">View All</button>
                        </div>
                    </PopoverContent>

                </Popover>

                <IconButton title="Fullscreen" onClick={onToggleFullscreen}>
                    <Maximize2 className="h-5 w-5"/>
                </IconButton>

                {/* Profile */}
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-2 py-1">
                    <div
                        className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
                        A
                    </div>
                </div>

            </div>
        </header>
    )
}

function IconButton({
                        children,
                        title,
                        onClick,
                    }: {
    children: React.ReactNode
    title: string
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="h-10 w-10 rounded-2xl bg-muted hover:bg-accent hover:text-accent-foreground transition-colors grid place-items-center"
        >
            {children}
        </button>
    )
}
