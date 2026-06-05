"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRIORITY_OPTIONS, RAG_OPTIONS } from "@/lib/enums";
import { titleCase } from "@/lib/utils";

export interface Filters {
  search: string;
  workstream: string;
  status: string;
  priority: string;
  rag: string;
  from: string;
  to: string;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  workstream: "all",
  status: "all",
  priority: "all",
  rag: "all",
  from: "",
  to: "",
};

export type FilterControl =
  | "workstream"
  | "status"
  | "priority"
  | "rag"
  | "date";

function isActive(filters: Filters): boolean {
  return (
    filters.search !== "" ||
    filters.workstream !== "all" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.rag !== "all" ||
    filters.from !== "" ||
    filters.to !== ""
  );
}

export function FilterBar({
  filters,
  onChange,
  controls,
  statusOptions,
  workstreamOptions,
  searchPlaceholder = "Search…",
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  controls: FilterControl[];
  statusOptions?: string[];
  workstreamOptions?: string[];
  searchPlaceholder?: string;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const has = (c: FilterControl) => controls.includes(c);

  return (
    <div className="bg-muted/30 flex flex-wrap items-end gap-3 rounded-xl border p-3">
      <div className="min-w-[200px] flex-1 space-y-1.5">
        <Label htmlFor="report-search" className="text-xs">
          Search
        </Label>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            id="report-search"
            value={filters.search}
            onChange={(e) => set({ search: e.target.value })}
            placeholder={searchPlaceholder}
            className="pl-8"
          />
        </div>
      </div>

      {has("workstream") && (workstreamOptions?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Workstream</Label>
          <Select
            value={filters.workstream}
            onValueChange={(v) => set({ workstream: v })}
          >
            <SelectTrigger className="w-[180px]" aria-label="Filter by workstream">
              <SelectValue placeholder="All workstreams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All workstreams</SelectItem>
              {workstreamOptions?.map((w) => (
                <SelectItem key={w} value={w}>
                  {w}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {has("status") && (statusOptions?.length ?? 0) > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={filters.status} onValueChange={(v) => set({ status: v })}>
            <SelectTrigger className="w-[160px]" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions?.map((s) => (
                <SelectItem key={s} value={s}>
                  {titleCase(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {has("priority") && (
        <div className="space-y-1.5">
          <Label className="text-xs">Priority</Label>
          <Select
            value={filters.priority}
            onValueChange={(v) => set({ priority: v })}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by priority">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {titleCase(p)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {has("rag") && (
        <div className="space-y-1.5">
          <Label className="text-xs">RAG</Label>
          <Select value={filters.rag} onValueChange={(v) => set({ rag: v })}>
            <SelectTrigger className="w-[120px]" aria-label="Filter by RAG">
              <SelectValue placeholder="All RAG" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All RAG</SelectItem>
              {RAG_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {titleCase(r)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {has("date") && (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="report-from" className="text-xs">
              Created from
            </Label>
            <Input
              id="report-from"
              type="date"
              value={filters.from}
              onChange={(e) => set({ from: e.target.value })}
              className="w-[150px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="report-to" className="text-xs">
              Created to
            </Label>
            <Input
              id="report-to"
              type="date"
              value={filters.to}
              onChange={(e) => set({ to: e.target.value })}
              className="w-[150px]"
            />
          </div>
        </>
      )}

      {isActive(filters) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-muted-foreground"
        >
          <X className="size-4" />
          Reset
        </Button>
      )}
    </div>
  );
}

export interface FilterAccessors<T> {
  search?: (row: T) => string;
  workstream?: (row: T) => string;
  status?: (row: T) => string;
  priority?: (row: T) => string;
  rag?: (row: T) => string | null;
  date?: (row: T) => string;
}

/** Applies the active filters to a dataset using the supplied field accessors. */
export function applyFilters<T>(
  rows: T[],
  filters: Filters,
  accessors: FilterAccessors<T>,
): T[] {
  const search = filters.search.trim().toLowerCase();
  return rows.filter((row) => {
    if (search && accessors.search) {
      if (!accessors.search(row).toLowerCase().includes(search)) return false;
    }
    if (filters.workstream !== "all" && accessors.workstream) {
      if (accessors.workstream(row) !== filters.workstream) return false;
    }
    if (filters.status !== "all" && accessors.status) {
      if (accessors.status(row) !== filters.status) return false;
    }
    if (filters.priority !== "all" && accessors.priority) {
      if (accessors.priority(row) !== filters.priority) return false;
    }
    if (filters.rag !== "all" && accessors.rag) {
      if ((accessors.rag(row) ?? "") !== filters.rag) return false;
    }
    if ((filters.from || filters.to) && accessors.date) {
      const date = accessors.date(row).slice(0, 10);
      if (filters.from && date < filters.from) return false;
      if (filters.to && date > filters.to) return false;
    }
    return true;
  });
}
