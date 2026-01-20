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
import { ZodSchema } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";

interface GenericFormPageProps<T> {
  resource: CrudResource<T>;
  schema: ZodSchema;
  fields: FieldConfig[];
  listPath: string;
  title?: { create: string; edit: string };
}

export function GenericFormPage<T>({ resource, schema, fields, listPath, title }: GenericFormPageProps<T>) {
  const params = useParams();
  const id = params?.id as string | undefined;
  const isEdit = Boolean(id);
  const router = useRouter();

  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const pageTitle = useMemo(() => (isEdit ? title?.edit || "Edit" : title?.create || "Create"), [isEdit, title]);

  // Initialize values
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

      // Validate with Zod
      const validationResult = schema.safeParse(values);
      if (!validationResult.success) {
        const zodErrors: ValidationErrors = {};
        validationResult.error.errors.forEach((err) => {
          const path = err.path.join(".");
          zodErrors[path] = err.message;
        });
        setErrors(zodErrors);
        toast.error("Validation failed", {
          description: "Please check the form for errors",
        });
        return;
      }

      let payload: any = { ...values };
      if (resource.transformOut) payload = resource.transformOut(payload);
      if (resource.beforeSubmit) payload = resource.beforeSubmit(payload);

      let savedId: CrudId | undefined;

      if (!isEdit) {
        if (!resource.api.create) return;
        const created = await resource.api.create(payload);
        savedId = (created as any)?.id;
        await resource.afterSubmit?.({ mode: "create", id: savedId, values: payload });
        toast.success("Item created successfully");
      } else {
        if (!resource.api.update) return;
        savedId = id as unknown as CrudId;
        await resource.api.update(savedId, payload);
        await resource.afterSubmit?.({ mode: "edit", id: savedId, values: payload });
        toast.success("Item updated successfully");
      }

      router.push(listPath);
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData?.errors) setErrors(errorData.errors);
      else if (errorData?.error) setErrors({ _error: [errorData.error] });
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
    // Clear field error when user types
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

    // Custom renderer
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

    // Built-in renderers
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
          />
        );

      default:
        return null;
    }
  };

  // Loading skeleton
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
            {fields.map((_, idx) => (
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
          {fields.map((field) => renderField(field))}

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
