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
import { RAG_OPTIONS } from "@/lib/enums";
import { titleCase } from "@/lib/utils";
import { createWorkstream, updateWorkstream } from "@/server/actions/workstreams";

export type Option = { id: string; name: string };

const UNSET = "__unset__";

export interface WorkstreamFormValues {
  id?: string;
  code: string;
  name: string;
  oneLineStatus: string | null;
  rag: string | null;
  leadPersonId: string | null;
  programmeId: string | null;
}

export function WorkstreamFormDialog({
  mode,
  open,
  onOpenChange,
  initial,
  people,
  programmes,
  onSuccess,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: WorkstreamFormValues;
  people: Option[];
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
      code: get("code"),
      name: get("name"),
      oneLineStatus: get("oneLineStatus"),
      rag: get("rag"),
      leadPersonId: get("leadPersonId"),
      programmeId: get("programmeId"),
    };
    if (mode === "edit" && initial?.id) payload.id = initial.id;

    const result =
      mode === "create" ? await createWorkstream(payload) : await updateWorkstream(payload);
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
      <DialogContent className="surface-om-card sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New workstream" : "Edit workstream"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a delivery workstream in the programme."
              : "Update workstream details, lead and RAG."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
          {errors._form && <FieldError>{errors._form[0]}</FieldError>}
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <Field data-invalid={Boolean(errors.code)}>
              <FieldLabel htmlFor="ws-code">Code</FieldLabel>
              <Input id="ws-code" name="code" defaultValue={initial?.code} placeholder="WS-01" required aria-invalid={Boolean(errors.code)} />
              {errors.code && <FieldError>{errors.code[0]}</FieldError>}
            </Field>
            <Field data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="ws-name">Name</FieldLabel>
              <Input id="ws-name" name="name" defaultValue={initial?.name} required aria-invalid={Boolean(errors.name)} />
              {errors.name && <FieldError>{errors.name[0]}</FieldError>}
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="ws-status">One-line status</FieldLabel>
            <Textarea
              id="ws-status"
              name="oneLineStatus"
              defaultValue={initial?.oneLineStatus ?? ""}
              rows={2}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="ws-rag">RAG</FieldLabel>
              <Select name="rag" defaultValue={initial?.rag ?? UNSET}>
                <SelectTrigger id="ws-rag" className="w-full">
                  <SelectValue placeholder="Not set" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Not set</SelectItem>
                  {RAG_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {titleCase(r)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="ws-lead">Lead</FieldLabel>
              <Select name="leadPersonId" defaultValue={initial?.leadPersonId ?? UNSET}>
                <SelectTrigger id="ws-lead" className="w-full">
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>Unassigned</SelectItem>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <input type="hidden" name="programmeId" value={defaultProgramme} />

          <DialogFooter className="pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : mode === "create" ? "Create workstream" : "Save changes"}
            </Button>
          </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
