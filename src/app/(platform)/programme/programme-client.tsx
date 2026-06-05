"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Can } from "@/components/shared/can";
import { RAG_OPTIONS } from "@/lib/enums";
import { titleCase } from "@/lib/utils";
import { updateProgramme } from "@/server/actions/programme";

const UNSET = "__unset__";

export interface ProgrammeEditValues {
  id: string;
  name: string;
  purpose: string | null;
  scopeTension: string | null;
  hardDeadline: string | null;
  mvpSummary: string | null;
  rag: string | null;
}

export function ProgrammeEditButton({ programme }: { programme: ProgrammeEditValues }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Can action="edit" entity="programme">
      <Button onClick={() => setOpen(true)}>
        <Pencil className="size-4" />
        Edit programme
      </Button>
      <ProgrammeEditDialog open={open} onOpenChange={setOpen} programme={programme} />
    </Can>
  );
}

function ProgrammeEditDialog({
  open,
  onOpenChange,
  programme,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programme: ProgrammeEditValues;
}) {
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string[]>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const rag = String(fd.get("rag") ?? "");
    const payload = {
      id: programme.id,
      name: String(fd.get("name") ?? ""),
      purpose: String(fd.get("purpose") ?? ""),
      scopeTension: String(fd.get("scopeTension") ?? ""),
      hardDeadline: String(fd.get("hardDeadline") ?? ""),
      mvpSummary: String(fd.get("mvpSummary") ?? ""),
      rag: rag === UNSET ? "" : rag,
    };

    const result = await updateProgramme(payload);
    setPending(false);

    if (result.ok) {
      toast.success(result.message ?? "Programme updated");
      onOpenChange(false);
    } else {
      if ("fieldErrors" in result && result.fieldErrors) setErrors(result.fieldErrors);
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit programme overview</DialogTitle>
          <DialogDescription>
            Update the programme framing, hard deadline and overall RAG.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prog-name">Name</Label>
            <Input id="prog-name" name="name" defaultValue={programme.name} required />
            {errors.name && <p className="text-rag-red text-xs">{errors.name[0]}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prog-deadline">Hard deadline</Label>
              <Input
                id="prog-deadline"
                name="hardDeadline"
                defaultValue={programme.hardDeadline ?? ""}
                placeholder="e.g. Q4 2026"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prog-rag">Overall RAG</Label>
              <Select name="rag" defaultValue={programme.rag ?? UNSET}>
                <SelectTrigger id="prog-rag" className="w-full">
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
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prog-purpose">Purpose</Label>
            <Textarea
              id="prog-purpose"
              name="purpose"
              defaultValue={programme.purpose ?? ""}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-scope">Scope tension</Label>
            <Textarea
              id="prog-scope"
              name="scopeTension"
              defaultValue={programme.scopeTension ?? ""}
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="prog-mvp">MVP summary</Label>
            <Textarea
              id="prog-mvp"
              name="mvpSummary"
              defaultValue={programme.mvpSummary ?? ""}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
