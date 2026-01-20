"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValidationErrors, CrudId, CrudResource, FieldConfig } from "../types";
import { TextInput } from "./fields/TextInput";
import { NumberInput } from "./fields/NumberInput";
import { SelectInput } from "./fields/SelectInput";
import { WysiwygInput } from "./fields/TextareaInput";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

interface GenericFormPageProps<T> {
  resource: CrudResource<T>;
  fields: FieldConfig[];
  listPath: string;
  title?: { create: string; edit: string };
}

function normalizeValidationErrors(input: any): ValidationErrors | null {
  const data = input?.data ?? input?.response?.data ?? input;

  if (data?.errors && typeof data.errors === "object") {
    const out: ValidationErrors = {};
    for (const [key, val] of Object.entries<any>(data.errors)) {
      if (Array.isArray(val)) out[key] = val;
      else if (typeof val === "string") out[key] = [val];
      else out[key] = [String(val)];
    }
    return out;
  }

  if (typeof data?.error === "string") return { _error: [data.error] };
  if (typeof data?.message === "string") return { _error: [data.message] };

  return null;
}

function getStatus(err: any): number | undefined {
  return err?.status ?? err?.response?.status;
}

export function GenericFormPage<T>({ resource, fields, listPath, title }: GenericFormPageProps<T>) {
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = Boolean(id);
  const router = useRouter();

  // only fields meant for the form
  const formFields = useMemo(() => fields.filter((f) => f.showInForm !== false), [fields]);

  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const pageTitle = useMemo(() => (isEdit ? title?.edit || "Edit" : title?.create || "Create"), [isEdit, title]);

  useEffect(() => {
    if (!isEdit) {
      setValues(resource.getDefaultValues?.() ?? {});
      return;
    }

    (async () => {
      try {
        setPageLoading(true);
        if (!resource.api.detail) throw new Error("api.detail not implemented");

        const row = await resource.api.detail(id as CrudId);
        const formValues = resource.transformIn ? resource.transformIn(row as any) : (row as any);
        setValues(formValues ?? {});
      } catch (e: any) {
        setErrors({ _error: [e?.message ?? "Failed to load item"] });
        toast.error("Failed to load item", {
          description: e?.message ?? "An error occurred",
        });
      } finally {
        setPageLoading(false);
      }
    })();
  }, [isEdit, id, resource]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrors({});

      let payload: any = { ...values };
      if (resource.transformOut) payload = resource.transformOut(payload);
      if (resource.beforeSubmit) payload = resource.beforeSubmit(payload);

      let savedId: CrudId | undefined;

      if (!isEdit) {
        if (!resource.api.create) throw new Error("api.create not implemented");
        const created = await resource.api.create(payload);
        savedId = (created as any)?.id;
        await resource.afterSubmit?.({ mode: "create", id: savedId, values: payload });
        toast.success("Item created successfully");
      } else {
        if (!resource.api.update) throw new Error("api.update not implemented");
        savedId = id as unknown as CrudId;
        await resource.api.update(savedId, payload);
        await resource.afterSubmit?.({ mode: "edit", id: savedId, values: payload });
        toast.success("Item updated successfully");
      }

      router.push(listPath);
    } catch (err: any) {
      const status = getStatus(err);

      if (status === 422) {
        const ve = normalizeValidationErrors(err);
        if (ve) setErrors(ve);

        toast.error("Validation failed", {
          description: "Please check the highlighted fields",
        });
        return;
      }

      const ve = normalizeValidationErrors(err);
      if (ve) setErrors(ve);
      else setErrors({ _error: [err?.message ?? "Submit failed"] });

      toast.error("Failed to save", {
        description: err?.message ?? "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const renderField = (field: FieldConfig) => {
    const error = errors[field.name];
    const errorText = Array.isArray(error) ? error[0] : error;

    if (field.render) {
      return (
        <div key={field.name}>
          {field.render({
            value: values[field.name],
            onChange: (val) => handleFieldChange(field.name, val),
            error: errorText,
          })}
        </div>
      );
    }

    switch (field.type) {
      case "text":
        return (
          <TextInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={values[field.name]}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={errorText}
            placeholder={field.placeholder}
            disabled={(field as any).disabled}
          />
        );

      case "number":
        return (
          <NumberInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={values[field.name]}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={errorText}
            placeholder={field.placeholder}
            disabled={(field as any).disabled}
          />
        );

      case "select":
        return (
          <SelectInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={values[field.name]}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={errorText}
            options={field.options || []}
            disabled={(field as any).disabled}
          />
        );

      case "textarea":
        return (
          <WysiwygInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={String(values[field.name] ?? "")}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={errorText}
            placeholder={field.placeholder}
            disabled={(field as any).disabled}
          />
        );

      default:
        return null;
    }
  };

  if (pageLoading) {
    return (
      <div className="max-w-xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {formFields.map((_, idx) => (
              <div key={idx} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const rootError = (errors as any)?._error;
  const rootErrorText = Array.isArray(rootError) ? rootError[0] : rootError;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(listPath)} className="h-10 w-10 rounded-xl">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold">{pageTitle}</h1>
      </div>

      {rootErrorText ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{String(rootErrorText)}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {formFields.map((field) => renderField(field))}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push(listPath)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
