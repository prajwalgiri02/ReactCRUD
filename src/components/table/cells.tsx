import React from "react"
import { cn } from "@/lib/utils"
import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AvatarNameCell({
                                   name,
                                   subtitle,
                                   src,
                               }: {
    name: string
    subtitle?: string
    src?: string
}) {
    return (
        <div className="flex items-center gap-3 min-w-[240px]">
            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden grid place-items-center">
                {src ? (
                    <img src={src} alt={name} className="h-full w-full object-cover" />
                ) : (
                    <span className="text-xs font-semibold text-muted-foreground">{name.slice(0, 1).toUpperCase()}</span>
                )}
            </div>
            <div className="min-w-0">
                <div className="font-semibold leading-5 truncate">{name}</div>
                {subtitle ? <div className="text-xs text-muted-foreground truncate">{subtitle}</div> : null}
            </div>
        </div>
    )
}

export function StatusPill({ value }: { value: string }) {
    const v = String(value).toLowerCase()

    const cls =
        v === "paid" || v === "active"
            ? "bg-green-500/15 text-green-700"
            : v === "unpaid" || v === "pending"
                ? "bg-yellow-400/20 text-yellow-800"
                : v === "cancelled" || v === "inactive"
                    ? "bg-red-500/10 text-red-600"
                    : "bg-muted text-foreground"

    return <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold", cls)}>{value}</span>
}

export function MoneyCell({ value, currency = "$" }: { value: number | string; currency?: string }) {
    const num = typeof value === "string" ? Number(value) : value
    const formatted = Number.isFinite(num) ? `${currency}${num.toLocaleString()}` : String(value)
    return <span className="font-medium">{formatted}</span>
}

export function RowActions({
                               onView,
                               onEdit,
                               onDelete,
                           }: {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
}) {
    return (
        <div className="flex items-center gap-2 justify-end">
            <IconAction title="View" onClick={onView}>
                <Eye className="h-4 w-4" />
            </IconAction>
            <IconAction title="Edit" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
            </IconAction>
            <IconAction title="Delete" onClick={onDelete} danger>
                <Trash2 className="h-4 w-4" />
            </IconAction>
        </div>
    )
}

function IconAction({
                        children,
                        title,
                        onClick,
                        danger,
                    }: {
    children: React.ReactNode
    title: string
    onClick?: () => void
    danger?: boolean
}) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            title={title}
            onClick={onClick}
            className={cn("h-9 w-9 rounded-xl", danger && "text-red-600 hover:text-red-700")}
        >
            {children}
        </Button>
    )
}
