"use client";

import * as React from "react";
import {
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/shared/states";
import { titleCase } from "@/lib/utils";
import { getTablePreference, saveTablePreference } from "@/server/actions/table-preferences";
import { mappingColumnDefs, MAPPING_DEFAULT_HIDDEN } from "@/components/shared/mapping-columns";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchKey?: string;
  onRowClick?: (row: TData) => void;
  toolbar?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  pageSize?: number;
  /** Stable per-screen key. When set, the user's column visibility is loaded
   *  from and persisted to the server (per Clerk user). */
  tableKey?: string;
  /** Initial column visibility applied when the user has no saved preference. */
  defaultColumnVisibility?: VisibilityState;
  /** Append the shared cross-platform mapping columns (Channel/Domain/Area/
   *  Cluster/Market), hidden by default. */
  mappingColumns?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search...",
  onRowClick,
  toolbar,
  emptyTitle = "No records found",
  emptyDescription = "There are no items to display yet.",
  pageSize = 12,
  tableKey,
  defaultColumnVisibility,
  mappingColumns = false,
}: DataTableProps<TData, TValue>) {
  const allColumns = React.useMemo<ColumnDef<TData, TValue>[]>(
    () =>
      mappingColumns
        ? [...columns, ...(mappingColumnDefs<TData>() as ColumnDef<TData, TValue>[])]
        : columns,
    [columns, mappingColumns],
  );
  const effectiveDefault = React.useMemo<VisibilityState>(
    () => ({ ...(mappingColumns ? MAPPING_DEFAULT_HIDDEN : {}), ...(defaultColumnVisibility ?? {}) }),
    [mappingColumns, defaultColumnVisibility],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(effectiveDefault);
  // Whether we've loaded the saved preference yet — gates persistence so the
  // initial load doesn't immediately write back the default.
  const loadedRef = React.useRef(false);
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved preference once per tableKey.
  React.useEffect(() => {
    if (!tableKey) {
      loadedRef.current = true;
      return;
    }
    let cancelled = false;
    loadedRef.current = false;
    getTablePreference(tableKey)
      .then((saved) => {
        if (cancelled) return;
        if (saved && Object.keys(saved).length > 0) setColumnVisibility(saved);
        else setColumnVisibility(effectiveDefault);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) loadedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableKey]);

  // Debounced persistence on change.
  const persist = React.useCallback(
    (next: VisibilityState) => {
      if (!tableKey || !loadedRef.current) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveTablePreference({ tableKey, columnVisibility: next });
      }, 500);
    },
    [tableKey],
  );

  const handleVisibilityChange: React.Dispatch<React.SetStateAction<VisibilityState>> =
    React.useCallback(
      (updater) => {
        setColumnVisibility((prev) => {
          const next = typeof updater === "function" ? updater(prev) : updater;
          persist(next);
          return next;
        });
      },
      [persist],
    );

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, columnFilters, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: handleVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="surface-om-card flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="bg-card sm:max-w-sm">
          <InputGroupAddon>
            <Search className="size-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Search table"
          />
        </InputGroup>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="bg-card">
                <SlidersHorizontal className="size-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((c) => c.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(v) => column.toggleVisibility(!!v)}
                  >
                    {titleCase(column.id)}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="bg-muted/55 hover:bg-muted/55">
                {hg.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 text-xs font-semibold tracking-normal uppercase">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="hover:text-foreground inline-flex items-center gap-1"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <ArrowUpDown className="size-3 opacity-50" />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/40" : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="h-12">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={allColumns.length} className="p-0">
                  <EmptyState title={emptyTitle} description={emptyDescription} className="border-0" />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border bg-card px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          {table.getFilteredRowModel().rows.length} record(s)
        </Badge>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
