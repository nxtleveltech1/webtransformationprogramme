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
import {
  upsertReferenceMapping,
} from "@/server/actions/governance-reference";

export type GlossaryOption = { id: string; term: string };

export interface MappingFormValues {
  id?: string;
  conceptKey: string;
  label: string;
  description: string;
  glossaryTermId: string | null;
  entityType: string | null;
  fieldPath: string | null;
  processName: string | null;
}

const UNSET = "__unset__";

export function MappingFormDialog({
  open,
  onOpenChange,
  initial,
  glossaryTerms,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: MappingFormValues | null;
  glossaryTerms: GlossaryOption[];
  onSuccess?: (message: string) => void;
}) {
  const mode = initial?.id ? "edit" : "create";
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

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
      conceptKey: get("conceptKey"),
      label: get("label"),
      description: get("description"),
      glossaryTermId: get("glossaryTermId"),
      entityType: get("entityType"),
      fieldPath: get("fieldPath"),
      processName: get("processName"),
    };
    if (initial?.id) payload.id = initial.id;

    const result = await upsertReferenceMapping(payload);
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
          <DialogTitle>{mode === "create" ? "New reference mapping" : "Edit reference mapping"}</DialogTitle>
          <DialogDescription>
            Map a programme concept to a glossary term, schema field and/or operational process.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup className="gap-4">
            {errors._form && <FieldError>{errors._form[0]}</FieldError>}
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
              <Field data-invalid={Boolean(errors.conceptKey)}>
                <FieldLabel htmlFor="rm-concept">Concept key</FieldLabel>
                <Input
                  id="rm-concept"
                  name="conceptKey"
                  defaultValue={initial?.conceptKey}
                  placeholder="raid.risk.owner"
                  required
                  aria-invalid={Boolean(errors.conceptKey)}
                />
                {errors.conceptKey && <FieldError>{errors.conceptKey[0]}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(errors.label)}>
                <FieldLabel htmlFor="rm-label">Label</FieldLabel>
                <Input
                  id="rm-label"
                  name="label"
                  defaultValue={initial?.label}
                  required
                  aria-invalid={Boolean(errors.label)}
                />
                {errors.label && <FieldError>{errors.label[0]}</FieldError>}
              </Field>
            </div>

            <Field data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="rm-description">Description</FieldLabel>
              <Textarea
                id="rm-description"
                name="description"
                defaultValue={initial?.description}
                rows={3}
                required
                aria-invalid={Boolean(errors.description)}
              />
              {errors.description && <FieldError>{errors.description[0]}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="rm-glossary">Glossary term</FieldLabel>
              <Select name="glossaryTermId" defaultValue={initial?.glossaryTermId ?? UNSET}>
                <SelectTrigger id="rm-glossary" className="w-full">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNSET}>None</SelectItem>
                  {glossaryTerms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.term}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="rm-entity">Entity type</FieldLabel>
                <Input
                  id="rm-entity"
                  name="entityType"
                  defaultValue={initial?.entityType ?? ""}
                  placeholder="Risk"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="rm-field">Field path</FieldLabel>
                <Input
                  id="rm-field"
                  name="fieldPath"
                  defaultValue={initial?.fieldPath ?? ""}
                  placeholder="ownerPersonId"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="rm-process">Process name</FieldLabel>
              <Input
                id="rm-process"
                name="processName"
                defaultValue={initial?.processName ?? ""}
                placeholder="Risk review cadence"
              />
            </Field>

            <DialogFooter className="pt-1">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : mode === "create" ? "Create mapping" : "Save changes"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
