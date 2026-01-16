import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { ValidationErrors } from "../types"

type FieldConfig = {
  name: string
  label: string
  type: "text" | "email" | "select"
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

interface CrudFormModalProps {
  open: boolean
  mode: "create" | "edit"
  initialValues: Record<string, unknown>
  loading: boolean
  errors: ValidationErrors
  onClose: () => void
  onSubmit: (values: Record<string, unknown>) => void
  extraFormActions?: React.ReactNode
  fields: FieldConfig[] // make required so it’s truly generic
}

function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {}

  for (const f of fields) {
    if (f.type === "select") {
      const values = (f.options ?? []).map((o) => o.value)
      // if no options provided, allow any string to avoid crashing
      const base = values.length ? z.enum(values as [string, ...string[]]) : z.string()
      shape[f.name] = f.required ? base : base.optional()
      continue
    }

    // text/email
    let base = z.string()
    if (f.type === "email") base = base.email("Invalid email")

    if (f.required) base = base.min(1, `${f.label} is required`)
    else base = base.optional()

    shape[f.name] = base
  }

  return z.object(shape)
}

export const CrudFormModal = React.forwardRef<HTMLDivElement, CrudFormModalProps>(
  ({ open, mode, initialValues, loading, errors, onClose, onSubmit, extraFormActions, fields }, ref) => {
    const schema = React.useMemo(() => buildSchema(fields), [fields])

    const form = useForm<Record<string, unknown>>({
      resolver: zodResolver(schema),
      defaultValues: initialValues,
      values: initialValues, // keep form synced when editing different rows
    })

    const rootError = (errors as any)?._error
    const rootErrorText = Array.isArray(rootError) ? rootError[0] : rootError

    React.useEffect(() => {
      if (!open) {
        form.reset()
        form.clearErrors()
      }
    }, [open, form])

    React.useEffect(() => {
      // set server field errors, but skip _error
      Object.entries(errors || {}).forEach(([fieldName, messages]) => {
        if (fieldName === "_error") return
        const message = Array.isArray(messages) ? messages[0] : messages
        if (!message) return
        form.setError(fieldName as any, { type: "server", message })
      })
    }, [errors, form])

    const handleSubmit = (values: Record<string, unknown>) => onSubmit(values)

    return (
      <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
        <DialogContent ref={ref}>
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create New" : "Edit"}</DialogTitle>
          </DialogHeader>

          {rootErrorText ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {String(rootErrorText)}
            </div>
          ) : null}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {fields.map((f) => (
                <FormField
                  key={f.name}
                  control={form.control}
                  name={f.name as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{f.label}</FormLabel>
                      <FormControl>
                        {f.type === "select" ? (
                          <Select value={(field.value as string) ?? ""} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={`Select ${f.label}`} />
                            </SelectTrigger>
                            <SelectContent>
                              {(f.options ?? []).map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            type={f.type}
                            placeholder={`Enter ${f.label.toLowerCase()}`}
                            value={(field.value as any) ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <div className="flex gap-2 justify-end pt-4">
                {extraFormActions}
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    )
  }
)

CrudFormModal.displayName = "CrudFormModal"
