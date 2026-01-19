import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { ValidationErrors, CrudId, CrudResource, FieldConfig } from "../types";
import { TextInput } from "./fields/TextInput";
import { NumberInput } from "./fields/NumberInput";
import { SelectInput } from "./fields/SelectInput";
import { TextareaInput } from "./fields/TextareaInput";
import { ZodSchema } from "zod";

interface GenericFormPageProps<T> {
  resource: CrudResource<T>;
  schema: ZodSchema;
  fields: FieldConfig[];
  listPath: string;
  title?: { create: string; edit: string };
}

export function GenericFormPage<T>({ resource, schema, fields, listPath, title }: GenericFormPageProps<T>) {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

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
      } else {
        if (!resource.api.update) return;
        savedId = id as unknown as CrudId;
        await resource.api.update(savedId, payload);
        await resource.afterSubmit?.({ mode: "edit", id: savedId, values: payload });
      }

      navigate(listPath);
    } catch (err: any) {
      const errorData = err?.response?.data;
      if (errorData?.errors) setErrors(errorData.errors);
      else if (errorData?.error) setErrors({ _error: [errorData.error] });
      else setErrors({ _error: [err?.message ?? "Submit failed"] });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
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
          <TextareaInput
            key={field.name}
            name={field.name}
            label={field.label}
            value={values[field.name]}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={errorText}
            placeholder={field.placeholder}
          />
        );

      default:
        return null;
    }
  };

  if (pageLoading) return <div className="p-6 text-muted-foreground">Loading...</div>;

  const rootError = (errors as any)?._error;
  const rootErrorText = Array.isArray(rootError) ? rootError[0] : rootError;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>

      {rootErrorText ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">{String(rootErrorText)}</div>
      ) : null}

      <div className="space-y-4 rounded-2xl border bg-card p-6">
        {fields.map((field) => renderField(field))}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => navigate(listPath)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
