"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = (props: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
    duration={1500} 
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      offset={16}
      closeButton={false}
      richColors={false}
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-600" />,
        info: <InfoIcon className="size-4 text-sky-600" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
     toastOptions={{
  classNames: {
    toast:
      "rounded-xl border border-border/70 bg-popover text-popover-foreground shadow-2xl shadow-black/15 ring-1 ring-black/5",
    description: "text-muted-foreground",



    success: "border-l-4 border-l-emerald-600",
    info: "border-l-4 border-l-sky-600",
    warning: "border-l-4 border-l-amber-600",
    error:
      "border-l-4 border-l-red-600 bg-red-50 text-red-950 border-red-200 ring-red-200/40",
  },
}}

      style={
        {
          // Your tokens are OKLCH colors already -> use them directly
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
