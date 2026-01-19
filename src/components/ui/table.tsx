import * as React from "react"
import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
      <div data-slot="table-container" className="relative w-full overflow-x-auto">
        <table
            data-slot="table"
            className={cn("w-full text-sm border-separate border-spacing-0", className)}
            {...props}
        />
      </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
      <thead
          data-slot="table-header"
          className={cn("bg-card sticky top-0 z-[1]", className)}
          {...props}
      />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("", className)} {...props} />
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
      <tr
          data-slot="table-row"
          className={cn("border-b hover:bg-muted/30 transition-colors", className)}
          {...props}
      />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
      <th
          data-slot="table-head"
          className={cn(
              "h-14 px-5 text-left align-middle font-semibold text-foreground whitespace-nowrap",
              "border-b bg-card",
              "[&:has([role=checkbox])]:w-[48px] [&:has([role=checkbox])]:px-4",
              className,
          )}
          {...props}
      />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
      <td
          data-slot="table-cell"
          className={cn(
              "h-16 px-5 align-middle whitespace-nowrap",
              "[&:has([role=checkbox])]:w-[48px] [&:has([role=checkbox])]:px-4",
              className,
          )}
          {...props}
      />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
}

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, TableCaption }
