"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS, RAG_OPTIONS } from "@/lib/enums";
import { titleCase } from "@/lib/utils";
import { createProject, updateProject } from "@/server/actions/projects";

export type Option = { id: string; name: string };
export type WsOption = { id: string; code: string; name: string };

const UNSET = "__unset__";

export interface ProjectFormValues {
  id?: string;
  code: string | null;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  rag: string | null;
  ownerPersonId: string | null;
  ownerText: string | null;
  sponsor: string | null;
  startDate: string | null;
  endDate: string | null;
  budgetNote: string | null;
  workstreamId: string | null;
  programmeId: string | null;
}

export function ProjectFormDialog({
  mode,
  open,
  onOpenChange,
  initial,
  people,
  workstreams,
  programmes,
  onSuccess,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: ProjectFormValues;
  people: Option[];
  workstreams: WsOption[];
  programmes: Option[];
  onSuccess?: (message: string) => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  const defaultProgramme = initial?.programmeId ?? programmes[0]?.id ?? "";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = String(fd.get(k) ?? "");
      return v === UNSET ? "" : v;
    };

    const payload: Record<string, unknown> = {
      name: get("name"),
      code: get("code"),
      description: get("description"),
      status: get("status"),
      priority: get("priority"),
      rag: get("rag"),
      ownerPersonId: get("ownerPersonId"),
      ownerText: get("ownerText"),
      sponsor: get("sponsor"),
      startDate: get("startDate"),
      endDate: get("endDate"),
      budgetNote: get("budgetNote"),
      workstreamId: get("workstreamId"),
      programmeId: get("programmeId"),
    };
    if (mode === "edit" && initial?.id) payload.id = initial.id;

    const result = mode === "create" ? await createProject(payload) : await updateProject(payload);
    setPending(false);

    if (result.ok) {
      onOpenChange(false);
      onSuccess?.(result.message ?? "Saved");
    } else {
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
      if ("error" in result) setErrors((p) => ({ ...p, _form: [result.error] }));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="surface-om-card sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New project" : "Edit project"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a project under the programme."
              : "Update project details, ownership and RAG."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <ScrollArea className="max-h-[60vh] pr-3">
            <FieldGroup className="gap-4 px-0.5">
              <Err errors={errors._form} />
              <Row>
                <FieldText name="name" label="Name" defaultValue={initial?.name} required error={errors.name} />
                <FieldText name="code" label="Code" defaultValue={initial?.code ?? ""} placeholder="e.g. PRJ-01" />
              </Row>

              <FieldArea name="description" label="Description" defaultValue={initial?.description ?? ""} />

              <Row>
                <FieldSelect name="status" label="Status" defaultValue={initial?.status ?? "ACTIVE"} options={PROJECT_STATUS_OPTIONS} />
                <FieldSelect name="priority" label="Priority" defaultValue={initial?.priority ?? "MEDIUM"} options={PRIORITY_OPTIONS} />
              </Row>

              <Row>
                <FieldSelect name="rag" label="RAG" defaultValue={initial?.rag ?? UNSET} options={RAG_OPTIONS} allowUnset />
                <FieldSelectOptions
                  name="workstreamId"
                  label="Workstream"
                  defaultValue={initial?.workstreamId ?? UNSET}
                  options={workstreams.map((w) => ({ value: w.id, label: `${w.code} · ${w.name}` }))}
                  allowUnset
                />
              </Row>

              <Row>
                <FieldSelectOptions
                  name="ownerPersonId"
                  label="Owner"
                  defaultValue={initial?.ownerPersonId ?? UNSET}
                  options={people.map((p) => ({ value: p.id, label: p.name }))}
                  allowUnset
                />
                <FieldText name="sponsor" label="Sponsor" defaultValue={initial?.sponsor ?? ""} />
              </Row>

              <Row>
                <FieldText name="startDate" label="Start date" defaultValue={initial?.startDate ?? ""} placeholder="e.g. 2026-07-01" />
                <FieldText name="endDate" label="End date" defaultValue={initial?.endDate ?? ""} placeholder="e.g. 2026-12-15" />
              </Row>

              <FieldText name="ownerText" label="Owner (free text)" defaultValue={initial?.ownerText ?? ""} placeholder="If owner not in people list" />
              <FieldText name="budgetNote" label="Budget note" defaultValue={initial?.budgetNote ?? ""} />

              {programmes.length > 0 && (
                <input type="hidden" name="programmeId" value={defaultProgramme} />
              )}
            </FieldGroup>
          </ScrollArea>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create project" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Err({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <FieldError>{errors[0]}</FieldError>;
}

function FieldText({
  name,
  label,
  defaultValue,
  placeholder,
  required,
  error,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  error?: string[];
}) {
  return (
    <Field data-invalid={Boolean(error?.length)}>
      <FieldLabel htmlFor={`f-${name}`}>{label}</FieldLabel>
      <Input
        id={`f-${name}`}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error?.length)}
      />
      <Err errors={error} />
    </Field>
  );
}

function FieldArea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`f-${name}`}>{label}</FieldLabel>
      <Textarea id={`f-${name}`} name={name} defaultValue={defaultValue} rows={3} />
    </Field>
  );
}

function FieldSelect({
  name,
  label,
  defaultValue,
  options,
  allowUnset,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: readonly string[];
  allowUnset?: boolean;
}) {
  return (
    <FieldSelectOptions
      name={name}
      label={label}
      defaultValue={defaultValue}
      allowUnset={allowUnset}
      options={options.map((o) => ({ value: o, label: titleCase(o) }))}
    />
  );
}

function FieldSelectOptions({
  name,
  label,
  defaultValue,
  options,
  allowUnset,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  allowUnset?: boolean;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`f-${name}`}>{label}</FieldLabel>
      <Select name={name} defaultValue={defaultValue}>
        <SelectTrigger id={`f-${name}`} className="w-full">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          {allowUnset && <SelectItem value={UNSET}>Not set</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}
